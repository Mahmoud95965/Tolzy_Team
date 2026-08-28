import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { generateGoogleEmbedding } from '@/src/lib/google-embeddings';
import { adminDb } from '@/src/config/firebase-admin';
import * as admin from 'firebase-admin';
import { getAzureAiClient, AZURE_AI_MODEL } from '@/src/config/azure-ai';

// =======================
// 🔥 GLOBAL INIT
// =======================
export const maxDuration = 60;

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
    [normalize("من أنت؟"),         "أنا AXIOM ✨، مساعدك الذكي الرسمي لمنظومة Tolzy AI (tolzy.me / axiom.tolzy.me). أنا خبيرك الشامل لكل أدوات وكورسات وتحديثات المنظومة."],
    [normalize("من طورك؟"),        "تم تطويري بواسطة Tolzy AI، المالك الوحيد لكل تحديثات وخدمات الذكاء الاصطناعي في هذه المنظومة."],
    [normalize("هل أنت من جوجل؟"), "لا، أنا AXIOM المساعد الرسمي لمنظومة Tolzy AI."],
    [normalize("ما هي منصة tolzy؟"),"منصة Tolzy هي أكبر منظومة ودليل عربي لأدوات الذكاء الاصطناعي والكورسات التقنية. تضم أكثر من 1000 أداة ذكية وأكثر من 150 كورس."],
    [normalize("كيف أعمل حساب؟"),  "يمكنك التسجيل بسهولة عبر البريد الإلكتروني أو حساب Google من صفحة تسجيل الدخول."],
    [normalize("هل المنصة مجانية؟"),"توفر Tolzy خطة مجانية تتيح الوصول لمعظم الأدوات والكورسات، مع خطط Pro و MAX للميزات المتقدمة."],
    [normalize("ما هو Tolzy Hex؟"), "Tolzy Hex مشروع ثوري من Tolzy AI سيُطلق قريباً وسيُحدث ثورة في عالم الذكاء الاصطناعي العربي 🚀"],
    [normalize("ما هو TOLZY Voice؟"),"TOLZY Voice هو محرك الذكاء الاصطناعي الصوتي لتوليد الأصوات والتعليق الصوتي الواقعي فائق الدقة (Azure Neural Voices)، وهو متاح لمشتركي باقات Pro و MAX 🎙️."],
    [normalize("ما هو تولزي فويس؟"),"TOLZY Voice هو محرك الذكاء الاصطناعي لتوليد الأصوات بمختلف اللهجات واللغات بجودة استوديو، ومتاح لباقات Pro و MAX 🎙️."],
    [normalize("ما هي axiom.tolzy.me؟"),"axiom.tolzy.me الموقع والواجهة الرسمية لمستشار AXIOM، حيث تجد كل الخدمات الذكية لمنظومة Tolzy."],
    [normalize("كم عدد الأدوات؟"),  "تضم منصة Tolzy أكثر من 1000 أداة ذكاء اصطناعي مصنفة في جميع المجالات، مع مراجعات وروابط مباشرة 🚀"],
    [normalize("كم عدد الكورسات؟"), "تضم منصة Tolzy أكثر من 150 كورس ومسار تعليمي في مجالات الذكاء الاصطناعي والتقنية 🎓"],
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
            model = 'axiom-core',
            voice = 'ar-EG-SalmaNeural',
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
        // 🔒 UNIFIED AI QUOTA CHECK (5 Free requests across all tools)
        // =======================
        const { checkAndConsumeAiQuota } = await import('@/src/lib/ai-quota');
        const quota = await checkAndConsumeAiQuota(userId, userPlan);
        if (!quota.allowed) {
            return NextResponse.json({ error: quota.error }, { status: 429 });
        }
        const isProPlan = quota.isPro;

        // =======================
        // ⚡ FLAGS
        // =======================
        const words: string[] = sanitized.split(/\s+/);
        const SIMPLE_SET = new Set(['hi','hello','hey','مرحبا','السلام','ازيك'].map(normalize));
        const shouldUseRAG = sanitized.length >= 2 && !SIMPLE_SET.has(normalizedMsg);

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
        const gmailInstructions = isGmailConnected ? `
📧 تكامل Gmail نشط — تعليمات تنسيق البريد الإلكتروني:
عندما يطلب المستخدم استعراض رسائل البريد الوارد، أرسل بلوك كود بصيغة \`\`\`gmail-inbox بهذا النمط:
\`\`\`gmail-inbox
from: اسم المرسل <email@example.com>
subject: موضوع الرسالة
date: منذ ٣ ساعات
preview: أول جملة أو سطرين من محتوى الرسالة...
body: النص الكامل للرسالة بالتفصيل.
unread: true
---
from: مرسل آخر <other@example.com>
subject: موضوع آخر
date: أمس
preview: ملخص قصير للرسالة الثانية
body: محتوى الرسالة الثانية
unread: false
\`\`\`

عندما يطلب المستخدم صياغة أو إرسال بريد إلكتروني، أرسل بلوك كود بصيغة \`\`\`gmail-compose بهذا النمط:
\`\`\`gmail-compose
to: recipient@example.com
subject: موضوع الرسالة المقترح
body: نص الرسالة المقترح بأسلوب احترافي متكامل
\`\`\`
` : '';

        const systemPrompt = `أنت **"AXIOM ✨"** — المساعد والمرشد الذكي الرسمي لمنظومة **Tolzy AI** (الموقع الرسمي: tolzy.me / axiom.tolzy.me).
مهمتك وتخصصك الحصري هو الإجابة عن كل ما يتعلق بمنظومة **Tolzy**: الأدوات، الكورسات، التحديثات، والخدمات.

---

### 🎯 مجالات تخصصك الحصرية (Core Scope):
1. **دليل أدوات الذكاء الاصطناعي (+1000 أداة)**:
   - مساعدة المستخدمين في اكتشاف ومقارنة أفضل أدوات الذكاء الاصطناعي في المنظومة (أدوات التصميم، الفيديو، الكتابة، البرمجة، التسويق، الإنتاجية، الصوتيات، والأعمال).
   - شرح إمكانيات الأدوات، أسعارها، ميزاتها، وروابط الوصول إليها.
2. **منصة التعلم والكورسات (+150 كورس)**:
   - ترشيح أفضل الكورسات والمسارات التدريبية المتاحة في Tolzy Learn (Coursera, Udemy, ومسارات الذكاء الاصطناعي والتقنية).
3. **تحديثات وخدمات المنظومة**:
   - الإجابة عن ميزات المنصة وتحديثاتها، خطط الاشتراك (Free, Pro, MAX)، وخدمات الفريق مثل OmniLearn, TOLZY Build, TOLZY Flow, TOLZY Voice, Tolzy Hex.

---

### 🛑 قواعد صارمة وحاسمة (Strict Guidelines):

1. **عدم كتابة أو تصحيح الأكواد البرمجية المباشرة (No General Code Generation/Debugging)**:
   - أنت لست مساعداً برمجياً عاماً لكتابة وتصحيح الأكواد المستقلة.
   - إذا طلب منك المستخدم كتابة كود برمجي (مثل: برمجة تطبيق، كتابة سكريبت، تصحيح أخطاء كود خارجي، حل مسائل خوارزميات):
     - اعتذر بلطف ووضح أنك المساعد الرسمي المخصص لمنظومة Tolzy وأدواتها وكورساتها.
     - اقترح عليه فوراً أفضل **أدوات البرمجة بالذكاء الاصطناعي** المتاحة في Tolzy (مثل Cursor, v0, Bolt, Claude, Devin, GitHub Copilot... إلخ مع روابطها) أو **كورسات البرمجة** المتوفرة في المنصة لتمكينه من إنجاز كوده بنجاح.

2. **الروابط التفاعلية القابلة للنقر (CRITICAL LINKS)**:
   - كل أداة ذكاء اصطناعي تذكرها في ردك **يجب** أن تكون رابطاً بصيغة: \`[اسم الأداة](/tools/id)\`.
   - كل كورس تدريبي تذكره في ردك **يجب** أن يكون رابطاً بصيغة: \`[اسم الكورس](/learn/course/id)\`.
   - انسخ الرابط الموجود في حقل 'link' من ذاكرتك بدقة.

3. **الأسلوب والتنسيق**:
   - تحدث بلغة عربية فصحى أنيقة، ودودة، واحترافية.
   - نسق ردودك باستخدام Markdown (عناوين، قوائم نقطية، جداول مقارنة عند الحاجة).
   - ادخل في صلب الموضوع مباشرة دون مقدمات روبوتية مكررة.

${gmailInstructions}

---

## 📚 ذاكرتك ومعرفتك الحالية بمنظومة Tolzy (Supabase Knowledge Base):
${context || 'لا توجد أدوات أو كورسات محددة مسترجعة لهذا الاستعلام، أجب بناءً على معرفتك الشاملة بمنظومة Tolzy وأكثر من 1000 أداة و150 كورس.'}`;

        const temperature = 0.5;

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
                let streamedChars = 0;
                try {
                    const completionStream = await openai.chat.completions.create({
                        model: AZURE_AI_MODEL,
                        messages: chatMessages,
                        temperature,
                        max_tokens: quota.maxTokensForRequest || 2048,
                        stream: true,
                    });

                    for await (const chunk of completionStream) {
                        const delta = chunk.choices[0]?.delta?.content || '';
                        if (delta) {
                            streamedChars += delta.length;
                            send(controller, delta);
                        }
                    }
                } catch (e: any) {
                    console.error('❌ [Azure AI Stream Error]:', e);
                    send(controller, '⚠️ عذراً، حدث خطأ أثناء الاتصال بمحرك الذكاء الاصطناعي.');
                } finally {
                    const { recordActualTokenUsage } = await import('@/src/lib/ai-quota');
                    const estimatedActual = Math.max(50, Math.ceil(streamedChars / 3.5) + 150);
                    recordActualTokenUsage(userId, estimatedActual, 300).catch(console.error);
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