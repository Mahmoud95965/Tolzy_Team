import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { generateGoogleEmbedding } from '@/src/lib/google-embeddings';
import { adminDb } from '@/src/config/firebase-admin';
import * as admin from 'firebase-admin';
import { getAzureAiClient, AZURE_AI_MODEL } from '@/src/config/azure-ai';

// =======================
// 🔥 GLOBAL INIT
// =======================
// Use service role key for server-side queries to bypass RLS
const supabase = createClient(
    process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_KEY || 'placeholder-key'
);

const ENCODER = new TextEncoder();

// =======================
// ⚡ FAQ CACHE (O(1) Map)
// =======================
const normalize = (s: string) =>
    s.trim().replace(/[؟\s]/g, '').toLowerCase();

const FAQ_MAP = new Map<string, string>([
    [normalize("من أنت؟"),         "أنا AXIOM ✨، مساعدك الذكي الرسمي الفائق من تطوير Tolzy AI (axiom.tolzy.me)."],
    [normalize("من طورك؟"),        "تم تطويري بواسطة Tolzy AI، المالك الوحيد لكل تحديثات الذكاء الاصطناعي في هذه المنظومة."],
    [normalize("هل أنت من جوجل؟"), "لا، أنا AXIOM من تطوير Tolzy AI. الذكاء الاصطناعي مجرد مكوّن تقني في نموذجي."],
    [normalize("ما هي منصة tolzy؟"),"منصة Tolzy هي منظومة متكاملة وأفضل وجهة عربية لأدوات الذكاء الاصطناعي والكورسات التقنية. تضم أكثر من 600 أداة ذكية وأكثر من 150 كورس."],
    [normalize("كيف أعمل حساب؟"),  "يمكنك التسجيل بسهولة عبر البريد الإلكتروني أو حساب Google من صفحة تسجيل الدخول."],
    [normalize("هل المنصة مجانية؟"),"توفر Tolzy خطة مجانية تتيح الوصول لمعظم الأدوات والكورسات، مع خطط Pro للمسارات المتقدمة."],
    [normalize("ما هو Tolzy Hex؟"), "Tolzy Hex مشروع ثوري من Tolzy AI سيُطلق قريباً وسيُحدث ثورة في عالم الذكاء الاصطناعي العربي 🚀"],
    [normalize("ما هي axiom.tolzy.me؟"),"axiom.tolzy.me الموقع الرسمي لـ AXIOM، حيث تجد كل الخدمات والمشاريع الذكية للفريق."],
    [normalize("كم عدد الأدوات؟"),  "لديّ أكثر من 600 أداة ذكية وأكثر من 150 كورس، ويتم تزويدي بالمزيد باستمرار 🚀"],
    [normalize("كم عدد الكورسات؟"), "لديّ أكثر من 150 كورس متخصص في مجالات الذكاء الاصطناعي والتقنية 🎓"],
]);

// =======================
// ⚡ STOP WORDS
// =======================
const STOP_WORDS = new Set([
    'هل','في','عن','على','من','انا','انت','هو','هي','عندك','عندكم','عندي',
    'هناك','يوجد','لدي','لدى','كيف','ما','ماذا','اين','متى','لماذا',
    'الذي','التي','الذين','هذا','هذه','ذلك','تلك','مع','بدون','الى',
    'حول','بين','قبل','بعد','مثل','اريد','ابحث','اجد','يمكن','اقترح',
    'show','me','the','and','for','about','find','search','give',
    'want','need','can','you','please','كورس','دورة','دورات','كورسات',
    'تعلم','تعليم','درس','اداة','ادوات','أداة','أدوات',
]);

const send = (c: ReadableStreamDefaultController, t: string) =>
    c.enqueue(ENCODER.encode(t));

// =======================
// 🚀 MAIN HANDLER
// =======================
export async function POST(req: NextRequest) {
    try {
        const {
            message,
            history,
            userPlan = 'free',
            userId,
            enableSearch = false,
            mode = 'general',
            isGmailConnected = false,
        } = await req.json();

        if (!message || message.trim().length < 2) {
            return NextResponse.json({ error: 'Message required' }, { status: 400 });
        }

        // =======================
        // ⚡ FAQ LOOKUP (O(1))
        // =======================
        const normalizedMsg = normalize(message);

        const faqDirect = FAQ_MAP.get(normalizedMsg);
        if (faqDirect) {
            return new NextResponse(faqDirect, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
        }
        const faqPartial = Array.from(FAQ_MAP.entries()).find(([k]) => normalizedMsg.includes(k))?.[1];
        if (faqPartial) {
            return new NextResponse(faqPartial, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
        }

        // =======================
        // ⚡ SANITIZE
        // =======================
        const sanitized: string = String(message)
            .replace(/ignore previous instructions/gi, '')
            .replace(/system prompt/gi, '')
            .trim();

        // =======================
        // 🔒 SECURE PLAN FETCH FROM FIRESTORE
        // =======================
        let isProPlan = false;
        let finalPlan = 'free';

        if (userId && adminDb) {
            try {
                const firestorePromise = adminDb.collection('users').doc(userId).get();
                const timeoutPromise = new Promise<never>((_, reject) =>
                    setTimeout(() => reject(new Error('Firestore Timeout')), 1500)
                );
                const userSnap: any = await Promise.race([firestorePromise, timeoutPromise]);
                const userData = userSnap.data();
                finalPlan = String(userData?.plan || 'free').toLowerCase();
                isProPlan = finalPlan.includes('pro') || finalPlan.includes('ultra');
            } catch (e) {
                console.error('Secure plan check error or timeout, defaulting to client tier:', e);
                const normClientPlan = String(userPlan || 'free').toLowerCase();
                isProPlan = normClientPlan.includes('pro') || normClientPlan.includes('ultra');
            }
        } else {
            const normClientPlan = String(userPlan || 'free').toLowerCase();
            isProPlan = normClientPlan.includes('pro') || normClientPlan.includes('ultra');
        }

        // =======================
        // ⚡ FLAGS
        // =======================
        const words: string[] = sanitized.split(/\s+/);

        const SIMPLE_SET = new Set(['hi','hello','hey','مرحبا','السلام','ازيك'].map(normalize));
        const shouldUseRAG = sanitized.length >= 2 && !SIMPLE_SET.has(normalizedMsg);

        // =======================
        // 🔒 FREE PLAN LIMIT (5 req/day)
        // =======================
        if (!isProPlan && userId && adminDb) {
            try {
                const userRef = adminDb.collection('users').doc(userId);
                const firestoreGetPromise = userRef.get();
                const getTimeoutPromise = new Promise<never>((_, reject) =>
                    setTimeout(() => reject(new Error('Firestore Get Timeout')), 1500)
                );
                const userSnap: any = await Promise.race([firestoreGetPromise, getTimeoutPromise]);
                const userData = userSnap.data();

                const count = userData?.copilotRequestCount || 0;
                const lastDate = userData?.lastCopilotRequestDate?.toDate() || new Date(0);
                const ONE_DAY = 24 * 60 * 60 * 1000;
                const elapsed = Date.now() - lastDate.getTime();
                const currentCount = elapsed > ONE_DAY ? 0 : count;

                if (currentCount >= 5) {
                    const hoursLeft = Math.ceil((ONE_DAY - elapsed) / 3600000);
                    return NextResponse.json({
                        error: `لقد استهلكت جميع رسائلك اليومية المجانية (5 رسائل). ستتجدد بعد ${hoursLeft} ساعة، أو اشترك في خطة Pro لرسائل غير محدودة!`
                    }, { status: 429 });
                }

                // Increment usage
                userRef.set({
                    copilotRequestCount: currentCount + 1,
                    lastCopilotRequestDate: admin.firestore.FieldValue.serverTimestamp()
                }, { merge: true }).catch(console.error);

            } catch (err) {
                console.error("Error verifying free quota with Firestore:", err);
            }
        }

        // =======================
        // ⚡ RAG SEARCH (Hybrid)
        // =======================
        let context = '';
        if (shouldUseRAG) {
            try {
                const searchKeywords = words
                    .filter(w => w.length > 2 && !STOP_WORDS.has(w.toLowerCase()))
                    .slice(0, 3);

                const keywordFilter = searchKeywords.length > 0 ? searchKeywords[0] : sanitized.slice(0, 20);

                const embeddingPromise = (async () => {
                    const vector = await generateGoogleEmbedding(sanitized);
                    return supabase.rpc('match_content_combined', {
                        query_embedding: vector,
                        match_threshold: 0.15,
                        match_count: 5
                    });
                })();

                const keywordPromise = (async () => {
                    if (!keywordFilter) return { data: [] };
                    return supabase
                        .from('tools')
                        .select('id, name, description, category, pricing, website_url')
                        .or(`name.ilike.%${keywordFilter}%,description.ilike.%${keywordFilter}%`)
                        .limit(4);
                })();

                const coursesKeywordPromise = (async () => {
                    if (!keywordFilter) return { data: [] };
                    return supabase
                        .from('courses')
                        .select('id, title, description, category, level, url, provider')
                        .or(`title.ilike.%${keywordFilter}%,description.ilike.%${keywordFilter}%`)
                        .limit(4);
                })();

                const [vectorRes, keywordRes, coursesKeywordRes] = await Promise.allSettled([
                    embeddingPromise,
                    keywordPromise,
                    coursesKeywordPromise
                ]);

                const combined: any[] = [];
                const seenIds = new Set<string>();

                if (vectorRes.status === 'fulfilled' && vectorRes.value?.data) {
                    for (const item of vectorRes.value.data) {
                        const id = item.id || item.title || item.name;
                        if (!seenIds.has(id)) {
                            seenIds.add(id);
                            combined.push(item);
                        }
                    }
                }

                if (keywordRes.status === 'fulfilled' && keywordRes.value?.data) {
                    for (const item of keywordRes.value.data) {
                        if (!seenIds.has(item.id)) {
                            seenIds.add(item.id);
                            combined.push({
                                type: 'tool',
                                id: item.id,
                                title: item.name,
                                content: item.description,
                                category: item.category,
                                pricing: item.pricing,
                                link: `/tools/${item.id}`,
                                url: item.website_url
                            });
                        }
                    }
                }

                if (coursesKeywordRes.status === 'fulfilled' && coursesKeywordRes.value?.data) {
                    for (const item of coursesKeywordRes.value.data) {
                        if (!seenIds.has(item.id)) {
                            seenIds.add(item.id);
                            combined.push({
                                type: 'course',
                                id: item.id,
                                title: item.title,
                                content: item.description,
                                category: item.category,
                                level: item.level,
                                link: `/learn/course/${item.id}`,
                                url: item.url
                            });
                        }
                    }
                }

                context = combined.slice(0, 8).map(d => {
                    const typeLabel = d.type === 'course' ? 'كورس' : 'أداة ذكاء اصطناعي';
                    const link = d.link || (d.type === 'course' ? `/learn/course/${d.id}` : `/tools/${d.id}`);
                    const name = d.title || d.name || '';
                    return `### [${typeLabel}] TOOL_NAME_AS_LINK: [${name}](${link})\n- الاسم: ${name}\n- الرابط المباشر الدقيق: ${link}\n- الوصف: ${d.content || d.description || ''}\n- التصنيف: ${d.category || ''}\n- ${d.type === 'course' ? `المستوى: ${d.level || 'جميع المستويات'}` : `التسعير: ${d.pricing || 'مجاني'}`}`;
                }).join('\n\n');

            } catch (err) {
                console.error("RAG search failed:", err);
            }
        }

        // =======================
        // ⚡ MODE INSTRUCTIONS
        // =======================
        const modeInstruction = mode === 'code' ? `
## 💻 وضع البرمجة والمطورين (Code Mode):
- أنت الآن في وضع هندسة البرمجيات المتقدم.
- ركز على تقديم كود نظيف، حديث، قابل للتنفيذ ومبني على أفضل الممارسات (Clean Code, Design Patterns, TypeScript/Next.js 16/React 19).
- اشرح القرارات المعمارية المهمة بإيجاز واحترافية.
` : '';

        const gmailInstructions = isGmailConnected ? `
📧 Gmail متصل — تعليمات خاصة بالبريد الإلكتروني:
عندما يطلب المستخدم عرض البريد الوارد أو رسائله، أرسل بلوك كود بصيغة \`\`\`gmail-inbox بهذا الشكل:
\`\`\`gmail-inbox
from: اسم المرسل <email@example.com>
subject: موضوع الرسالة
date: منذ ٣ ساعات
preview: أول جملة أو سطرين من محتوى الرسالة...
body: النص الكامل للرسالة هنا. يمكن أن يكون طويلاً.
unread: true
---
from: مرسل آخر <other@example.com>
subject: موضوع آخر
date: أمس
preview: ملخص قصير للرسالة الثانية
body: محتوى الرسالة الثانية
unread: false
\`\`\`

عندما يريد المستخدم كتابة أو إرسال رسالة، أرسل بلوك كود بصيغة \`\`\`gmail-compose بهذا الشكل:
\`\`\`gmail-compose
to: البريد المستلم
subject: موضوع الرسالة
body: محتوى الرسالة المقترح هنا
\`\`\`
` : '';

        // =======================
        // ⚡ SYSTEM PROMPT
        // =======================
        const systemPrompt = `أنت "AXIOM ✨" — الرفيق التقني الذكي والمستشار الخبير من فريق Tolzy AI (موقعك: axiom.tolzy.me). لقد تم تدريبك بالكامل وبشكل حصري على قاعدة بيانات Supabase الخاصة بـ Tolzy. اعتبر كل البيانات الواردة في قسم "ذاكرتك ومعرفتك التقنية الحالية (Supabase)" هي ذاكرتك الذاتية المباشرة وحصيلة تدريبك الفعلي، وليست ملفات أو سياقاً خارجياً.

## 👤 شخصيتك وطريقتك البشرية في الكلام (Human-like Persona)
- **التحدث كبشري خبير**: تحدث بأسلوب مبرمج أو مهندس تقني مخضرم يتناقش مع زميله. ابتعد تماماً عن الأسلوب الأكاديمي الجاف أو العبارات الروبوتية.
- **تجنب النمطية المصطنعة**: يمنع منعاً باتاً البدء بمقدمات مكررة مثل "بصفتي ذكاء اصطناعي..."، "بناءً على طلبك..."، "أهلاً بك! كيف يمكنني مساعدتك اليوم؟". ادخل في صلب الموضوع أو الحل فوراً وبشكل طبيعي جداً.
- **التحدث من ذاكرتك المباشرة**: لا تقل أبداً "بناءً على البيانات المرفقة"، "حسب السياق المتاح"، أو "حسب المقطع". تحدث بثقة كأن هذه المعلومات نابعة من عقلك وتدريبك الشخصي مباشرة.
- **لغة عربية فصحى انسيابية وعصرية**: استخدم لغة عربية فصحى مبسطة وقريبة من القلب.

## 🛑 الانضباط الصارم بقاعدة البيانات
1. **الاعتماد الحصري**: جميع إجاباتك واقتراحاتك للأدوات والكورسات يجب أن تعتمد على قسم "ذاكرتك ومعرفتك التقنية الحالية".
2. **استخدام الروابط من السياق حرفياً**: استخدم **حرفياً** الرابط الموجود في حقل 'link' من السياق أدناه لكل أداة أو كورس.
3. **تنسيق الروابط**: لا تكتب اسم الأداة أو الكورس كنص عادي أبداً — كل أداة أو كورس يجب أن يكون اسمه رابطاً قابلاً للضغط مثل: [Read.ai](/tools/abc123).

${modeInstruction}
${gmailInstructions}

## ذاكرتك ومعرفتك التقنية الحالية (Supabase)
${context}`;

        const temperature = mode === 'code' ? 0.2 : 0.6;

        // =======================
        // ⚡ BUILD MESSAGES
        // =======================
        const chatMessages: any[] = [
            { role: 'system', content: systemPrompt }
        ];

        if (history?.length) {
            const pairs: any[] = [];
            for (let i = 0; i < history.length - 1; i++) {
                if (history[i].role === 'user' && history[i + 1]?.role === 'assistant') {
                    pairs.push(history[i], history[i + 1]);
                    i++;
                }
            }
            pairs.slice(-6).forEach((h: any) => {
                chatMessages.push({ role: h.role, content: h.content });
            });
        }
        chatMessages.push({ role: 'user', content: sanitized });

        // =======================
        // ⚡ AZURE AI STREAM RESPONSE
        // =======================
        const openai = getAzureAiClient();

        const stream = new ReadableStream({
            async start(controller) {
                try {
                    const completionStream = await openai.chat.completions.create({
                        model: AZURE_AI_MODEL,
                        messages: chatMessages,
                        temperature,
                        max_tokens: 2048,
                        stream: true,
                    });

                    for await (const chunk of completionStream) {
                        const delta = chunk.choices[0]?.delta?.content || '';
                        if (delta) {
                            send(controller, delta);
                        }
                    }
                } catch (e: any) {
                    console.error('❌ [Azure AI Stream Error]:', e);
                    send(controller, '⚠️ عذراً، حدث خطأ أثناء الاتصال بمحرك الذكاء الاصطناعي.');
                } finally {
                    controller.close();
                }
            }
        });

        return new NextResponse(stream, {
            headers: {
                'Content-Type': 'text/plain; charset=utf-8',
                'Transfer-Encoding': 'chunked',
            }
        });

    } catch (e: any) {
        console.error('CRITICAL ERROR:', e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}