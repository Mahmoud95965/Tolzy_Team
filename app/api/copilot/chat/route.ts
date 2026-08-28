import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import * as cheerio from 'cheerio';
import { generateGoogleEmbedding } from '@/src/lib/google-embeddings';
import { adminDb } from '@/src/config/firebase-admin';
import * as admin from 'firebase-admin';
import { getAzureAiClient, AZURE_AI_MODEL } from '@/src/config/azure-ai';

// =======================
// 🔥 GLOBAL INIT
// =======================
export const maxDuration = 60;

const supabase = createClient(
    process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_KEY || 'placeholder-key'
);

const ENCODER = new TextEncoder();

// =======================
// ⚡ FAQ CACHE (O(1) Map)
// =======================
const normalize = (s: string) =>
    s.trim().replace(/[؟\s]/g, '').toLowerCase();

const FAQ_MAP = new Map<string, string>([
    [normalize("من أنت؟"),         "أنا TOLZY Copilot ✨، مساعدك الذكي الرسمي لمنظومة Tolzy AI (tolzy.me). أنا دليلك الشامل لكل أدوات وكورسات وتحديثات المنظومة."],
    [normalize("من طورك؟"),        "تم تطويري بواسطة Tolzy AI، المالك الوحيد لكل خدمات الذكاء الاصطناعي في هذه المنظومة."],
    [normalize("هل أنت من جوجل؟"), "لا، أنا TOLZY Copilot من تطوير Tolzy AI."],
    [normalize("ما هي منصة tolzy؟"),"منصة Tolzy هي أكبر منصة ودليل عربي لأدوات الذكاء الاصطناعي والكورسات التقنية. تضم أكثر من 1000 أداة ذكية وأكثر من 150 كورس."],
    [normalize("كيف أعمل حساب؟"),  "يمكنك التسجيل بسهولة عبر البريد الإلكتروني أو حساب Google من صفحة تسجيل الدخول."],
    [normalize("هل المنصة مجانية؟"),"توفر Tolzy خطة مجانية تتيح الوصول لمعظم الأدوات والكورسات، مع خطط Pro و MAX للميزات المتقدمة."],
    [normalize("ما هو Tolzy Hex؟"), "Tolzy Hex مشروع ثوري من Tolzy AI سيُطلق قريباً وسيُحدث ثورة في عالم الذكاء الاصطناعي العربي 🚀"],
    [normalize("ما هي ai.tolzy.me؟"),"tolzy.me الموقع الرسمي لمنظومة Tolzy، حيث تجد كل الخدمات والمشاريع الذكية."],
    [normalize("كم عدد الأدوات؟"),  "تضم المنصة أكثر من 1000 أداة ذكاء اصطناعي مصنفة، ويتم تحديثها باستمرار 🚀"],
    [normalize("كم عدد الكورسات؟"), "تضم المنصة أكثر من 150 كورس متخصص في مجالات الذكاء الاصطناعي والتقنية 🎓"],
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
    'تعلم','تعليم','درس',
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
        // ⚡ WEB SEARCH (Tavily/DuckDuckGo fallback)
        // =======================
        let webContext = '';
        if (enableSearch) {
            try {
                const tavilyKey = process.env.TAVILY_API_KEY;
                if (tavilyKey) {
                    const tvRes = await fetch('https://api.tavily.com/search', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            api_key: tavilyKey,
                            query: sanitized,
                            search_depth: 'basic',
                            include_answer: true,
                            max_results: 3
                        })
                    });
                    if (tvRes.ok) {
                        const tvData = await tvRes.json();
                        webContext = tvData.results?.map((r: any) => `* [${r.title}](${r.url}): ${r.content}`).join('\n') || '';
                        if (tvData.answer) {
                            webContext = `ملخص البحث المباشر: ${tvData.answer}\n\n${webContext}`;
                        }
                    }
                }
            } catch (searchErr) {
                console.warn('Web search failed:', searchErr);
            }
        }

        // =======================
        // ⚡ SYSTEM PROMPT
        // =======================
        const systemPrompt = `أنت **"TOLZY Copilot ✨"** — المساعد الذكي والمرشد الرسمي لمنظومة **Tolzy AI** (الموقع: tolzy.me).

---

### 🎯 مهمتك وتخصصك الحصري (Core Scope):
1. **دليل أدوات الذكاء الاصطناعي (+1000 أداة)**:
   - مساعدة المستخدمين في اكتشاف ومقارنة وشرح أدوات الذكاء الاصطناعي في المنظومة بمختلف المجالات.
2. **منصة التعلم (+150 كورس)**:
   - ترشيح أفضل الكورسات والمسارات التقنية على Tolzy Learn.
3. **تحديثات وخدمات المنظومة**:
   - الإجابة عن ميزات وتحديثات المنظومة وخطط الاشتراك ومشاريع Tolzy.

---

### 🛑 قواعد صارمة (Strict Rules):
1. **عدم كتابة أو تصحيح الأكواد البرمجية المباشرة**:
   - إذا طُلب منك كتابة كود برمجي أو حل مشاكل برمجية معقدة، اعتذر بلطف ووضح تخصصك الحصري في منظومة Tolzy، ثم وجّه المستخدم لأفضل **أدوات البرمجة بالذكاء الاصطناعي** المتوفرة في Tolzy (مع روابطها) أو **كورسات البرمجة** في المنصة.
2. **الروابط التفاعلية القابلة للنقر (CRITICAL)**:
   - كل أداة تذكرها **يجب** أن تكون رابطاً بصيغة: \`[اسم الأداة](/tools/id)\`.
   - كل كورس تذكره **يجب** أن يكون رابطاً بصيغة: \`[اسم الكورس](/learn/course/id)\`.
3. **الأسلوب**: عربية فصحى أنيقة، ودودة، ومباشرة مع تنسيق Markdown منظم.

---

## 📚 ذاكرتك ومعرفتك التقنية الحالية (Tolzy Supabase Knowledge Base)
${context || 'لا توجد أدوات أو كورسات محددة مسترجعة لهذا الاستعلام، أجب بناءً على معرفتك الشاملة بمنظومة Tolzy وأكثر من 1000 أداة و150 كورس.'}

${webContext ? `\n---\n## 🌐 نتائج البحث المباشر في الويب:\n${webContext}` : ''}`;

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
            pairs.slice(-8).forEach((h: any) => {
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