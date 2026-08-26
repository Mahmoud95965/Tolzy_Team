import { NextRequest, NextResponse } from 'next/server';
import { canAccessTolzyImage, checkAndConsumeAiQuota, parsePlan } from '@/src/lib/ai-quota';
import { BlobServiceClient } from '@azure/storage-blob';
import { supabaseAdmin, hasSupabaseAdminConfig } from '@/src/config/supabase-admin';

/**
 * ☁️ دالة رفع الصورة إلى Azure Blob Storage
 */
async function uploadToAzureBlob(base64Data: string, userId?: string): Promise<string> {
    const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
    const containerName = process.env.AZURE_STORAGE_CONTAINER_NAME || 'user-images';

    if (!connectionString) {
        throw new Error('AZURE_STORAGE_CONNECTION_STRING غير مهيأ في متغيرات البيئة.');
    }

    const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
    const containerClient = blobServiceClient.getContainerClient(containerName);

    // إنشاء الحاوية تلقائياً إذا لم تكن موجودة وجعلها متاحة للصور
    await containerClient.createIfNotExists({ access: 'blob' });

    // مسار مميز لكل مستخدم: userId/timestamp-random.png
    const sanitizedUserId = (userId || 'anonymous').replace(/[^a-zA-Z0-9_-]/g, '_');
    const imageId = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    const blobName = `${sanitizedUserId}/${imageId}.png`;

    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    const buffer = Buffer.from(base64Data, 'base64');

    await blockBlobClient.uploadData(buffer, {
        blobHTTPHeaders: {
            blobContentType: 'image/png',
            blobCacheControl: 'public, max-age=31536000'
        }
    });

    return blockBlobClient.url;
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const {
            prompt,
            model = 'AXOIM_Image',
            width = 1024,
            height = 1024,
            userId,
            userPlan = 'free',
            aspectRatio = '1:1'
        } = body;

        if (!prompt || typeof prompt !== 'string' || prompt.trim().length < 2) {
            return NextResponse.json(
                { error: 'يرجى إدخال وصف واضح للصورة (Prompt).' },
                { status: 400 }
            );
        }

        // 🔒 التحقق من صلاحية الباقة (Pro و MAX فقط)
        const parsedPlan = parsePlan(userPlan);
        if (!canAccessTolzyImage(parsedPlan) && parsedPlan === 'free') {
            return NextResponse.json(
                {
                    error: 'نموذج TOLZY Image متاح حصرياً لمشتركي باقات Pro و MAX. يرجى ترقية حسابك للوصول إلى توليد الصور.',
                    code: 'UPGRADE_REQUIRED',
                    isProRequired: true
                },
                { status: 403 }
            );
        }

        // 🔒 استهلاك التوكن والحصة
        const quota = await checkAndConsumeAiQuota(userId, userPlan);
        if (!quota.allowed) {
            return NextResponse.json(
                { error: quota.error, code: 'QUOTA_EXCEEDED' },
                { status: 429 }
            );
        }

        // 🔑 مفاتيح ورابط Azure AI Flux Service
        const azureApiKey = process.env.AZURE_API_KEY || process.env.AZURE_SPEECH_KEY || process.env.AZURE_AI_KEY;
        const azureEndpoint = process.env.AZURE_IMAGE_ENDPOINT || 
            'https://mahmoudmuhammad212024-6-resource.services.ai.azure.com/providers/blackforestlabs/v1/flux-2-pro?api-version=preview';

        if (!azureApiKey) {
            return NextResponse.json(
                { error: 'مفتاح Azure API غير مهيأ في متغيرات البيئة (AZURE_API_KEY).' },
                { status: 500 }
            );
        }

        // حساب الأبعاد بناءً على النسبة المحددة
        let finalWidth = Number(width) || 1024;
        let finalHeight = Number(height) || 1024;
        if (aspectRatio === '16:9') {
            finalWidth = 1344;
            finalHeight = 768;
        } else if (aspectRatio === '9:16') {
            finalWidth = 768;
            finalHeight = 1344;
        } else if (aspectRatio === '4:3') {
            finalWidth = 1152;
            finalHeight = 864;
        } else if (aspectRatio === '3:4') {
            finalWidth = 864;
            finalHeight = 1152;
        }

        // استدعاء Azure Black Forest Labs Flux-2-pro
        const response = await fetch(azureEndpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${azureApiKey}`,
                'api-key': azureApiKey
            },
            body: JSON.stringify({
                prompt: prompt.trim(),
                model: model,
                width: finalWidth,
                height: finalHeight,
                n: 1
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ Azure Image Generation Error:', response.status, errorText);
            return NextResponse.json(
                { error: `فشل استجابة Azure Image: ${response.statusText}` },
                { status: response.status }
            );
        }

        const data = await response.json();
        const imageResult = data?.data?.[0];

        if (!imageResult?.b64_json && !imageResult?.url) {
            return NextResponse.json(
                { error: 'لم يتم استلام بيانات الصورة من محرك Azure' },
                { status: 502 }
            );
        }

        let finalImageUrl = '';

        // ☁️ 1. رفع الصورة إلى Azure Blob Storage
        if (imageResult.b64_json) {
            try {
                if (process.env.AZURE_STORAGE_CONNECTION_STRING) {
                    finalImageUrl = await uploadToAzureBlob(imageResult.b64_json, userId);
                } else {
                    finalImageUrl = `data:image/png;base64,${imageResult.b64_json}`;
                }
            } catch (blobErr: any) {
                console.warn('⚠️ Azure Blob Upload skipped/failed, using base64:', blobErr.message);
                finalImageUrl = `data:image/png;base64,${imageResult.b64_json}`;
            }
        } else {
            finalImageUrl = imageResult.url;
        }

        // 💾 2. حفظ سجل الصورة في Supabase
        try {
            if (hasSupabaseAdminConfig) {
                await supabaseAdmin.from('user_images').insert({
                    user_id: userId || null,
                    image_url: finalImageUrl,
                    prompt: prompt.trim(),
                    aspect_ratio: aspectRatio,
                    model: 'flux-2-pro',
                    created_at: new Date().toISOString()
                });
            }
        } catch (dbErr: any) {
            console.warn('⚠️ Supabase log error (non-fatal):', dbErr.message);
        }

        return NextResponse.json({
            success: true,
            imageUrl: finalImageUrl,
            prompt,
            width: finalWidth,
            height: finalHeight,
            aspectRatio
        });

    } catch (error: any) {
        console.error('❌ Image route handler error:', error);
        return NextResponse.json(
            { error: error?.message || 'حدث خطأ غير متوقع أثناء توليد الصورة' },
            { status: 500 }
        );
    }
}
