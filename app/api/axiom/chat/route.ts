import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { getAzureAiClient, AZURE_AI_MODEL } from '@/src/config/azure-ai';
import { generateAzureEmbedding } from '@/src/lib/axiom-v2/azure-embeddings';
import { searchToolsVector, searchCoursesVector, supabase } from '@/src/lib/axiom-v2/supabase-vector';
import { buildAxiomV2SystemPrompt } from '@/src/lib/axiom-v2/prompts';
import { RetrievedTool, RetrievedCourse } from '@/src/lib/axiom-v2/types';

// ==============================================================================
// 🔥 AXIOM V2 CHAT ROUTE & PLAN-AWARE RAG PIPELINE
// ==============================================================================
export const maxDuration = 60;
const ENCODER = new TextEncoder();

// =======================
// ⚡ FAQ CACHE (O(1) Map)
// =======================
const normalize = (s: string) =>
    s.trim().replace(/[؟\s]/g, '').toLowerCase();

const FAQ_MAP = new Map<string, string>([
    [normalize("من أنت؟"),         "أنا AXIOM V2 ✨، كبير مستشاري ومهندسي حلول الذكاء الاصطناعي في منظومة Tolzy AI (tolzy.me / axiom.tolzy.me). أنا خبيرك الشامل لكل أدوات وكورسات وتحديثات المنظومة."],
    [normalize("من طورك؟"),        "تم تطويري وتحديثي إلى الإصدار الثاني بواسطة Tolzy AI، المالك والجهة المطورة لمنظومة الذكاء الاصطناعي المتكاملة."],
    [normalize("هل أنت من جوجل؟"), "لا، أنا AXIOM V2 المساعد والمستشار الرسمي لمنظومة Tolzy AI."],
    [normalize("ما هي منصة tolzy؟"),"منصة Tolzy هي أكبر منظومة ودليل عربي لأدوات الذكاء الاصطناعي والكورسات التقنية، وتضم أكثر من 1000 أداة ذكية وأكثر من 150 كورس ومسار تعليمي."],
    [normalize("كيف أعمل حساب؟"),  "يمكنك التسجيل بسهولة عبر البريد الإلكتروني أو حساب Google من صفحة تسجيل الدخول في المنصة."],
    [normalize("هل المنصة مجانية؟"),"توفر Tolzy خطة مجانية تتيح الوصول لمعظم الأدوات والكورسات، مع باقات Pro و MAX للميزات والتوكنات المتقدمة."],
    [normalize("ما هو Tolzy Hex؟"), "Tolzy Hex مشروع ثوري من Tolzy AI سيُحدث نقلة نوعية في أدوات الذكاء الاصطناعي العربي 🚀"],
    [normalize("ما هو TOLZY Voice؟"),"TOLZY Voice هو محرك الذكاء الاصطناعي لتوليد الأصوات والتعليق الصوتي الواقعي فائق الدقة (Azure Neural Voices)، ومتاح لمشتركي باقات Pro و MAX 🎙️."],
    [normalize("كم عدد الأدوات؟"),  "تضم منصة Tolzy أكثر من 1000 أداة ذكاء اصطناعي مصنفة في جميع المجالات مع تقييمات وروابط مباشرة 🚀"],
    [normalize("كم عدد الكورسات؟"), "تضم منصة Tolzy أكثر من 150 كورس ومسار تدريبي متخصص في مجالات الذكاء الاصطناعي والبرمجة والتصميم 🎓"],
]);

const send = (c: ReadableStreamDefaultController, t: string) =>
    c.enqueue(ENCODER.encode(t));

// =======================
// 🛡️ RESILIENT COMPLETION (Exponential Backoff + Fallback Model)
// =======================
async function createChatCompletionWithFallback(
    openai: OpenAI,
    messages: OpenAI.ChatCompletionMessageParam[],
    temperature: number,
    maxTokens: number
) {
    const candidateModels = [
        (process.env.AZURE_AI_MODEL || AZURE_AI_MODEL || 'axiom-core').trim(),
        (process.env.AZURE_AI_FALLBACK_MODEL || 'gpt-4o-mini').trim(),
        (process.env.AZURE_AI_SECONDARY_MODEL || 'gpt-35-turbo').trim(),
    ].filter((m, idx, arr) => m && arr.indexOf(m) === idx);

    let lastError: any = null;

    for (const modelName of candidateModels) {
        let attempt = 0;
        const maxRetries = 2; // محاولتان إضافيتان لكل نموذج عند حدوث 429

        while (attempt <= maxRetries) {
            try {
                const stream = await openai.chat.completions.create({
                    model: modelName,
                    messages,
                    temperature,
                    max_tokens: maxTokens,
                    stream: true,
                });

                return { stream, usedModel: modelName };
            } catch (err: any) {
                lastError = err;
                const is429 = err?.status === 429 || 
                              err?.statusCode === 429 || 
                              String(err?.message || '').includes('429') || 
                              String(err?.message || '').toLowerCase().includes('rate limit');

                if (is429) {
                    console.warn(`⚠️ [429 Rate Limit] on Azure model "${modelName}" (Attempt ${attempt + 1}/${maxRetries + 1})`);
                    if (attempt < maxRetries) {
                        const delay = Math.min(2500, 700 * Math.pow(2, attempt) + Math.floor(Math.random() * 300));
                        await new Promise((r) => setTimeout(r, delay));
                        attempt++;
                        continue;
                    }
                    console.warn(`⏩ Switching from "${modelName}" to next fallback model due to persistent 429...`);
                    break;
                } else {
                    console.error(`❌ Error on model "${modelName}":`, err.message);
                    break;
                }
            }
        }
    }

    throw lastError || new Error('Failed to generate response from all available AI models');
}

// =======================
// 🚀 MAIN HANDLER
// =======================
export async function POST(req: NextRequest) {
    try {
        const {
            message,
            history = [],
            userPlan = 'free',
            userId,
            isGmailConnected = false,
        } = await req.json();

        if (!message || message.trim().length < 2) {
            return NextResponse.json({ error: 'Message is required' }, { status: 400 });
        }

        // =======================
        // ⚡ FAQ FAST LOOKUP
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
        // ⚡ SANITIZATION
        // =======================
        const maxInputChars = (userPlan === 'max' || userPlan === 'ultra' || userPlan === 'admin') ? 2000 : 1000;
        const sanitized: string = String(message)
            .replace(/ignore previous instructions/gi, '')
            .replace(/system prompt/gi, '')
            .slice(0, maxInputChars)
            .trim();

        // =======================
        // 🔒 AI QUOTA & TOKEN PER PLAN VERIFICATION
        // =======================
        const { checkAndConsumeAiQuota } = await import('@/src/lib/ai-quota');
        const quota = await checkAndConsumeAiQuota(userId, userPlan);
        if (!quota.allowed) {
            return NextResponse.json({ error: quota.error }, { status: 429 });
        }

        const activePlan = quota.plan;
        const isPro = quota.isPro;
        const isMax = quota.isMax;

        // 🎯 تخصيص المعلمات حسب باقة المستخدم وحصته
        const toolsLimit = isMax ? 5 : (isPro ? 4 : 3);
        const coursesLimit = isMax ? 3 : (isPro ? 2 : 1);
        const historyPairsLimit = isMax ? 6 : (isPro ? 4 : 2); // 2 pairs for free, 4 for pro, 6 for max

        // =======================
        // ⚡ 1. AXIOM V2 RAG PIPELINE
        // =======================
        let retrievedTools: RetrievedTool[] = [];
        let retrievedCourses: RetrievedCourse[] = [];

        const SIMPLE_SET = new Set(['hi', 'hello', 'hey', 'مرحبا', 'السلام', 'ازيك', 'شكرا'].map(normalize));
        const shouldUseRAG = sanitized.length >= 2 && !SIMPLE_SET.has(normalizedMsg);

        if (shouldUseRAG) {
            try {
                // أ. توليد المتجه الدلالي للاستعلام بأبعاد 1024 عبر Azure text-embedding-3-small
                const queryVector = await generateAzureEmbedding(sanitized);

                // ب. استرجاع الأدوات والكورسات المتوافقة من Supabase حسب باقة المستخدم
                const [toolsRes, coursesRes] = await Promise.allSettled([
                    searchToolsVector(queryVector, 0.65, toolsLimit),
                    searchCoursesVector(queryVector, 0.55, coursesLimit),
                ]);

                if (toolsRes.status === 'fulfilled') {
                    retrievedTools = toolsRes.value;
                }

                if (coursesRes.status === 'fulfilled') {
                    retrievedCourses = coursesRes.value;
                }

                // ج. في حال عدم وجود نتائج متجهية، البحث بالكلمات المفتاحية كـ Fallback
                if (retrievedTools.length === 0) {
                    const cleanWord = sanitized.split(/\s+/)[0]?.slice(0, 15);
                    if (cleanWord && cleanWord.length > 2) {
                        const { data: keywordTools } = await supabase
                            .from('tools')
                            .select('id, name, description, category, pricing, website_url')
                            .or(`name.ilike.%${cleanWord}%,description.ilike.%${cleanWord}%`)
                            .limit(isPro ? 3 : 2);

                        if (keywordTools && keywordTools.length > 0) {
                            retrievedTools = keywordTools.map((t: any) => ({
                                id: t.id,
                                name: t.name,
                                description: t.description || '',
                                category: t.category || 'General',
                                pricing: t.pricing || 'مجاني',
                                link: `/tools/${t.id}`,
                                website_url: t.website_url,
                                similarity: 0.70,
                            }));
                        }
                    }
                }

            } catch (ragError) {
                console.error('⚠️ [AXIOM V2 RAG Search Error]:', ragError);
            }
        }

        // =======================
        // ⚡ 2. PROMPT CONSTRUCTION (Plan-Adaptive)
        // =======================
        const systemPrompt = buildAxiomV2SystemPrompt(retrievedTools, retrievedCourses, isGmailConnected, activePlan);

        const chatMessages: OpenAI.ChatCompletionMessageParam[] = [
            { role: 'system', content: systemPrompt }
        ];

        // ضبط سجل المحادثة السابق حسب الباقة
        if (Array.isArray(history) && history.length > 0) {
            const pairs: OpenAI.ChatCompletionMessageParam[] = [];
            for (let i = 0; i < history.length - 1; i++) {
                if (history[i].role === 'user' && history[i + 1]?.role === 'assistant') {
                    pairs.push(
                        { role: 'user', content: String(history[i].content || '').slice(0, isPro ? 800 : 400) },
                        { role: 'assistant', content: String(history[i + 1]?.content || '').slice(0, isPro ? 1200 : 600) }
                    );
                    i++;
                }
            }
            pairs.slice(-historyPairsLimit * 2).forEach((h) => {
                chatMessages.push(h);
            });
        }
        chatMessages.push({ role: 'user', content: sanitized });

        // =======================
        // ⚡ 3. AZURE OPENAI LLM STREAMING
        // =======================
        const openai = getAzureAiClient();
        const temperature = isPro ? 0.35 : 0.4;
        
        // حساب التوكنات المخصصة للإجابة بناءً على باقة المستخدم
        const planMaxTokens = isMax ? 6000 : (isPro ? 3500 : 1800);
        const requestedMaxTokens = Math.min(quota.maxTokensForRequest || planMaxTokens, planMaxTokens);

        const { stream: completionStream } = await createChatCompletionWithFallback(
            openai,
            chatMessages,
            temperature,
            requestedMaxTokens
        );

        // تقدير توكنات المدخلات (Prompt Tokens)
        const promptTokensEstimate = Math.ceil(JSON.stringify(chatMessages).length / 3.5);

        const stream = new ReadableStream({
            async start(controller) {
                let streamedChars = 0;
                try {
                    for await (const chunk of completionStream) {
                        const delta = chunk.choices[0]?.delta?.content || '';
                        if (delta) {
                            streamedChars += delta.length;
                            send(controller, delta);
                        }
                    }
                } catch (e: any) {
                    console.error('❌ [Azure AI Stream Read Error]:', e);
                    send(controller, '⚠️ عذراً، انقطع الاتصال بمحرك الذكاء الاصطناعي أثناء الإجابة.');
                } finally {
                    // تسجيل الاستهلاك الدقيق لتوكنات المستخدم (Prompt + Completion)
                    const { recordActualTokenUsage } = await import('@/src/lib/ai-quota');
                    const completionTokensEstimate = Math.ceil(streamedChars / 3.5);
                    const totalActualTokens = Math.max(50, promptTokensEstimate + completionTokensEstimate);

                    recordActualTokenUsage(userId, totalActualTokens, 300).catch(console.error);
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
        console.error('CRITICAL ERROR in AXIOM V2 Chat Route:', e);
        return NextResponse.json({ 
            error: e.message || 'خطأ في معالجة الطلب، يرجى المحاولة مرة أخرى لاحقاً.' 
        }, { status: 500 });
    }
}