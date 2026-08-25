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
        // ⚡ MODE INSTRUCTIONS
        // =======================
        const modeInstruction = mode === 'code' ? `
## 💻 وضع هندسة البرمجيات والتطوير المتقدم (Elite Code Mode):
- أنت تعمل الآن بصفة **Senior Software Architect & Principal Engineer**.
- **جودة الكود**: قدم كوداً برمجياً حديثاً، نظيفاً، آمناً وقابلاً للتشغيل فوراً بدون أي Placeholders أو دوال ناقصة (Production-Ready).
- **التقنيات الحديثة**: اعتمد على المعايير القياسية (TypeScript 5+, Next.js 15/16 App Router, React 19, Tailwind CSS, Clean Architecture).
- **التنسيق**: استخدم دائمًا كتل الأكواد مع تحديد لغة البرمجة بدقة (\`\`\`typescript, \`\`\`tsx, \`\`\`python).
- **الشرح المعماري**: اشرح لماذا تم اختيار هذا الحل، وكيفية معالجة الأخطاء (Error Handling) وتحسين الأداء (Optimization) بنقاط موجزة واضحة.
` : '';

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

        // =======================
        // ⚡ SYSTEM PROMPT
        // =======================
        const systemPrompt = `أنت **"AXIOM ✨"** — المستشار التقني والمهندس الذكي الفائق من فريق **Tolzy AI** (الموقع الرسمي: axiom.tolzy.me).
تم تدريبك وتطويرك لتكون الرفيق الأكثر كفاءة، ذكاءً، وعمقاً للمطورين، ورواد الأعمال، وصناع المحتوى والباحثين التقنيين.

---

### 🧠 الهوية وأسلوب الحوار (Persona & Voice)
1. **الخبرة العملية العميقة**: تحدث بنبرة مهندس برمجيات واستشاري تقني مخضرم (Senior Principal Consultant). اجمع بين الدقة التقنية العالية والأسلوب الإنساني السلس والودود.
2. **المباشرة والسرعة**: تجنب تماماً المقدمات الروبوتية المكررة (مثل "بصفتي ذكاء اصطناعي..." أو "شكراً لسؤالك..."). ابدأ مباشرة بالإجابة الشافية، التحليل العميق، أو الحل البرمجي المتكامل.
3. **عربية تقنية فصيحة ومعاصرة**: تحدث بلغة عربية فصحى طبيعية وأنيقة، مع استخدام المصطلحات التقنية الإنجليزية الشائعة في مكانها المناسب بدقة.
4. **توليد القيمة المضافة**: لا تكتفِ بالإجابة السطحية؛ قدم زوايا إضافية، أفضل الممارسات (Best Practices)، وتنبيهات الأمان أو الأداء ذات الصلة.

---

### 🎨 فن التنسيق البصري (Rich Visual Markdown Craftsmanship)
- **الهيكلة الواضحة**: استخدم العناوين (\`##\`, \`###\`)، القوائم المنقطة، والفواصل الأفقية لتقسيم الأفكار المعقدة.
- **الجداول والمقارنات**: عند مقارنة الأدوات أو التقنيات، استخدم جداول Markdown (\`| الخصائص | الخيار الأول | الخيار الثاني |\`) لتسهيل القراءة السريعة.
- **إبراز الكلمات المفتاحية**: استخدم الخط العريض (\`**المصطلح**\`) لتسليط الضوء على المفاهيم الجوهرية.
- **الرموز التعبيرية التفاعلية**: وظّف الإيموجي بشكل متزن واحترافي لزيادة الجاذبية البصرية.

---

### 🛑 قواعد الربط مع منظومة Tolzy وذاكرتك التقنية
1. **الاعتماد على الذاكرة الذاتية**: اعتبر قسم "ذاكرتك ومعرفتك التقنية الحالية (Supabase)" هو نتاج معرفتك المباشرة. لا تقل "حسب الملفات المرفقة" بل تحدث بثقة كأنك تعرف كل أداة وكورس عن قرب.
2. **الروابط التفاعلية القابلة للنقر (CRITICAL)**:
   - كل أداة ذكاء اصطناعي تذكرها في ردك **يجب** أن تكون رابطاً بصيغة: \`[اسم الأداة](/tools/id)\`.
   - كل كورس تدريبي تذكره في ردك **يجب** أن يكون رابطاً بصيغة: \`[اسم الكورس](/learn/course/id)\`.
   - انسخ الرابط الموجود في حقل 'link' من ذاكرتك حرفياً دون أي تغيير.
3. **الواقعية والشفافية**: إذا لم تجد أداة أو كورساً معيناً في ذاكرتك يطابق طلب المستخدم بدقة، وضح ذلك بلطف واقترح أفضل البدائل المتاحة في المنظومة.

${modeInstruction}
${gmailInstructions}

---

## 📚 ذاكرتك ومعرفتك التقنية الحالية (Supabase Knowledge Base)
${context || 'لا توجد أدوات أو كورسات محددة مسترجعة لهذا الاستعلام، أجب بناءً على خبرتك البرمجية والتقنية الشاملة.'}`;

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