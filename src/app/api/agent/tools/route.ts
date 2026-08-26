import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/src/config/firebase-admin';
import { db } from '@/src/config/firebase';
import { collection, getDocs, doc, setDoc, serverTimestamp as clientServerTimestamp } from 'firebase/firestore';
import * as admin from 'firebase-admin';

// Helper function to slugify names if slug is missing
function slugify(text: string): string {
    return text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^\w\u0621-\u064A-]+/g, '')
        .replace(/--+/g, '-')
        .replace(/^-+/, '')
        .replace(/-+$/, '');
}

/**
 * 🔒 Verify secret header (x-agent-secret) with AGENT_SECRET_KEY
 */
function isAuthorized(req: NextRequest): boolean {
    const secretKey = process.env.AGENT_SECRET_KEY;
    if (!secretKey) {
        // If not configured in env, allow access
        return true;
    }

    const clientSecret = 
        req.headers.get('x-agent-secret') || 
        req.headers.get('authorization')?.replace(/^Bearer\s+/i, '');

    return clientSecret === secretKey;
}

// 🌐 Add CORS headers
const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-agent-secret',
};

export async function OPTIONS() {
    return NextResponse.json({}, { headers: corsHeaders });
}

/**
 * 📥 GET /api/agent/tools
 * يجلب قائمة بأسماء الأدوات فقط دون أي تفاصيل أخرى لتقليل استهلاك التوكنز والـ Payload إلى أدنى حد ممكن
 * يدعم query parameters:
 *  - ?limit=150 (الافتراضي 150) أو ?limit=all
 */
export async function GET(req: NextRequest) {
    try {
        if (!isAuthorized(req)) {
            return NextResponse.json(
                { error: 'غير مصرح لك بالوصول. يرجى توفير x-agent-secret الصحيح.', code: 'UNAUTHORIZED' },
                { status: 401, headers: corsHeaders }
            );
        }

        const url = new URL(req.url);
        const limitParam = url.searchParams.get('limit')?.toLowerCase();
        const isAll = limitParam === 'all';
        const limitVal = isAll ? 0 : Math.max(1, parseInt(limitParam || '150', 10) || 150);

        const toolNames: string[] = [];

        // 1. محاولة الجلب باستخدام Firebase Admin SDK مع سحب حقل الاسم فقط (name, title)
        if (adminDb) {
            try {
                const queryRef = limitVal > 0 
                    ? adminDb.collection('tools').limit(limitVal).select('name', 'title')
                    : adminDb.collection('tools').select('name', 'title');

                const snapshot = await queryRef.get();
                if (!snapshot.empty) {
                    snapshot.forEach((docSnap: any) => {
                        const data = docSnap.data();
                        const name = (data.name || data.title || docSnap.id || '').trim();
                        if (name) {
                            toolNames.push(name);
                        }
                    });
                }
            } catch (adminErr) {
                console.warn('⚠️ [GET /api/agent/tools] AdminDb select failed, falling back:', adminErr);
            }
        }

        // 2. Fallback إلى Firebase Client SDK
        if (toolNames.length === 0 && db) {
            try {
                const toolsCol = collection(db, 'tools');
                const snapshot = await getDocs(toolsCol);
                if (!snapshot.empty) {
                    let count = 0;
                    snapshot.forEach((docSnap: any) => {
                        if (limitVal > 0 && count >= limitVal) return;
                        const data = docSnap.data();
                        const name = (data.name || data.title || docSnap.id || '').trim();
                        if (name) {
                            toolNames.push(name);
                            count++;
                        }
                    });
                }
            } catch (clientErr) {
                console.warn('⚠️ [GET /api/agent/tools] Client SDK fetch note:', clientErr);
            }
        }

        return NextResponse.json({
            count: toolNames.length,
            tools: toolNames
        }, { headers: corsHeaders });

    } catch (error: any) {
        console.error('❌ [GET /api/agent/tools] Error:', error);
        return NextResponse.json(
            { count: 0, tools: [], error: error?.message || 'حدث خطأ أثناء جلب قائمة الأدوات.' },
            { status: 500, headers: corsHeaders }
        );
    }
}

/**
 * 📤 POST /api/agent/tools
 * يستقبل أداة أو مصفوفة أدوات ويحفظها في Firestore باستخدام الـ slug كـ Document ID مع merge: true
 */
export async function POST(req: NextRequest) {
    try {
        if (!isAuthorized(req)) {
            return NextResponse.json(
                { error: 'غير مصرح لك بالوصول. يرجى توفير x-agent-secret الصحيح.', code: 'UNAUTHORIZED' },
                { status: 401, headers: corsHeaders }
            );
        }

        const body = await req.json();
        
        // دعم استقبال كائن فردي أو مصفوفة من الأدوات
        const items = Array.isArray(body) ? body : Array.isArray(body.tools) ? body.tools : [body];

        if (!items.length || !items[0] || typeof items[0] !== 'object') {
            return NextResponse.json(
                { error: 'يرجى إرسال بيانات أداة صحيحة في body الطلب.' },
                { status: 400, headers: corsHeaders }
            );
        }

        const results: { slug: string; status: 'created' | 'updated' | 'failed'; error?: string }[] = [];

        for (const item of items) {
            const rawName = item.name || item.title || '';
            const rawSlug = item.slug || item.id || slugify(rawName);

            if (!rawSlug) {
                results.push({
                    slug: 'unknown',
                    status: 'failed',
                    error: 'اسم الأداة (name) أو الـ slug مطلوب.'
                });
                continue;
            }

            const cleanSlug = rawSlug.trim().toLowerCase();
            const nowIso = new Date().toISOString();

            // تجهيز البيانات للحفظ
            const toolData: Record<string, any> = {
                ...item,
                slug: cleanSlug,
                name: rawName || cleanSlug,
                official_url: item.official_url || item.link || item.website || item.url || '',
                category: item.category || 'عام',
                description: item.description || item.short_desc || '',
                updated_at: adminDb ? admin.firestore.FieldValue.serverTimestamp() : (nowIso as any),
            };

            // الحفاظ على created_at إن وجد أو تعيينه
            if (!toolData.created_at) {
                toolData.created_at = adminDb ? admin.firestore.FieldValue.serverTimestamp() : nowIso;
            }

            try {
                if (adminDb) {
                    const docRef = adminDb.collection('tools').doc(cleanSlug);
                    await docRef.set(toolData, { merge: true });
                    results.push({ slug: cleanSlug, status: 'updated' });
                } else if (db) {
                    const docRef = doc(db, 'tools', cleanSlug);
                    await setDoc(docRef, {
                        ...toolData,
                        updated_at: clientServerTimestamp()
                    }, { merge: true });
                    results.push({ slug: cleanSlug, status: 'updated' });
                } else {
                    throw new Error('Firestore Database is not initialized.');
                }
            } catch (err: any) {
                console.error(`❌ Failed to save tool [${cleanSlug}]:`, err);
                results.push({
                    slug: cleanSlug,
                    status: 'failed',
                    error: err?.message || 'فشل الحفظ في قاعدة البيانات'
                });
            }
        }

        const successCount = results.filter(r => r.status === 'updated' || r.status === 'created').length;
        const failedCount = results.filter(r => r.status === 'failed').length;

        return NextResponse.json({
            success: failedCount === 0,
            message: `تم معالجة ${items.length} أداة بنجاح (${successCount} تم حفظها/تحديثها).`,
            processed: items.length,
            successCount,
            failedCount,
            results
        }, { headers: corsHeaders });

    } catch (error: any) {
        console.error('❌ [POST /api/agent/tools] Error:', error);
        return NextResponse.json(
            { error: error?.message || 'حدث خطأ أثناء حفظ الأداة.' },
            { status: 500, headers: corsHeaders }
        );
    }
}
