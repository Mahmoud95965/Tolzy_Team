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
        // If not configured in env, allow with log warning
        return true;
    }

    const clientSecret = 
        req.headers.get('x-agent-secret') || 
        req.headers.get('authorization')?.replace(/^Bearer\s+/i, '');

    return clientSecret === secretKey;
}

/**
 * 📥 GET /api/agent/tools
 * يجلب قائمة بجميع الأدوات الموجودة حالياً في collection tools
 */
export async function GET(req: NextRequest) {
    try {
        if (!isAuthorized(req)) {
            return NextResponse.json(
                { error: 'غير مصرح لك بالوصول. يرجى توفير x-agent-secret الصحيح.', code: 'UNAUTHORIZED' },
                { status: 401 }
            );
        }

        const toolsList: any[] = [];

        // 1. محاولة الجلب باستخدام Firebase Admin SDK
        if (adminDb) {
            const snapshot = await adminDb.collection('tools').get();
            snapshot.forEach((docSnap: any) => {
                const data = docSnap.data();
                toolsList.push({
                    id: docSnap.id,
                    slug: data.slug || docSnap.id,
                    name: data.name || data.title || '',
                    official_url: data.official_url || data.link || data.website || data.url || '',
                    category: data.category || '',
                    description: data.description || data.short_desc || '',
                    pricing: data.pricing || data.price || 'free',
                    imageUrl: data.imageUrl || data.image || data.logo || data.icon || '',
                    tags: data.tags || [],
                    isFeatured: data.isFeatured || false,
                    updated_at: data.updated_at ? (data.updated_at.toDate ? data.updated_at.toDate().toISOString() : data.updated_at) : null,
                    created_at: data.created_at ? (data.created_at.toDate ? data.created_at.toDate().toISOString() : data.created_at) : null
                });
            });
        } 
        // 2. Fallback إلى Firebase Client SDK
        else if (db) {
            const toolsCol = collection(db, 'tools');
            const snapshot = await getDocs(toolsCol);
            snapshot.forEach((docSnap: any) => {
                const data = docSnap.data();
                toolsList.push({
                    id: docSnap.id,
                    slug: data.slug || docSnap.id,
                    name: data.name || data.title || '',
                    official_url: data.official_url || data.link || data.website || data.url || '',
                    category: data.category || '',
                    description: data.description || data.short_desc || '',
                    pricing: data.pricing || data.price || 'free',
                    imageUrl: data.imageUrl || data.image || data.logo || data.icon || '',
                    tags: data.tags || [],
                    isFeatured: data.isFeatured || false,
                    updated_at: data.updated_at ? (data.updated_at.toDate ? data.updated_at.toDate().toISOString() : data.updated_at) : null,
                    created_at: data.created_at ? (data.created_at.toDate ? data.created_at.toDate().toISOString() : data.created_at) : null
                });
            });
        } else {
            return NextResponse.json(
                { error: 'تعذر الاتصال بقاعدة بيانات Firestore (Firebase not initialized).' },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            count: toolsList.length,
            tools: toolsList
        });

    } catch (error: any) {
        console.error('❌ [GET /api/agent/tools] Error:', error);
        return NextResponse.json(
            { error: error?.message || 'حدث خطأ أثناء جلب قائمة الأدوات.' },
            { status: 500 }
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
                { status: 401 }
            );
        }

        const body = await req.json();
        
        // دعم استقبال كائن فردي أو مصفوفة من الأدوات
        const items = Array.isArray(body) ? body : Array.isArray(body.tools) ? body.tools : [body];

        if (!items.length || !items[0] || typeof items[0] !== 'object') {
            return NextResponse.json(
                { error: 'يرجى إرسال بيانات أداة صحيحة في body الطلب.' },
                { status: 400 }
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
        });

    } catch (error: any) {
        console.error('❌ [POST /api/agent/tools] Error:', error);
        return NextResponse.json(
            { error: error?.message || 'حدث خطأ أثناء حفظ الأداة.' },
            { status: 500 }
        );
    }
}
