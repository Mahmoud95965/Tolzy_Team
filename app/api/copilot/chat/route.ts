import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import * as cheerio from 'cheerio';
import { generateGoogleEmbedding } from '@/src/lib/google-embeddings';
import { adminDb } from '@/src/config/firebase-admin';
import * as admin from 'firebase-admin';

// Initialize Supabase Client
const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

// --- SIMPLE FAQ CACHE (Zero Token Usage) ---
const FAQ_CACHE: Record<string, string> = {
    "من أنت؟": "أنا Tolzy Copilot ✨، مساعدك الذكي الرسمي من تطوير Tolzy AI (ai.tolzy.me)، العقل المدبر والمتخصص في استخدام الذكاء الاصطناعي لمنظومة Tolzy.",
    "من طورك؟": "تم تطويري بواسطة Tolzy AI، العقل المدبر والمالك الوحيد لكل تحديثات الذكاء الاصطناعي في هذه المنظومة. أنا أحد منتجاتهم ضمن تكامل منصة Tolzy الشاملة.",
    "هل أنت من جوجل؟": "لا، أنا Tolzy Copilot، تم تطويري بالكامل بواسطة فريق Tolzy AI. Google Gemini مجرد أحد المكونات التقنية المستخدمة في نموذجي.",
    "ما هي منصة tolzy؟": "منصة Tolzy هي منظومة متكاملة وأفضل وجهة عربية لأدوات الذكاء الاصطناعي والكورسات التقنية. حالياً توفر أكثر من 630 أداة ذكية! تم إضافة أكثر من 100 أداة خلال هذا الأسبوع وحده. آخر تحديث للبيانات: 11 أبريل 2026. Tolzy AI هو المحرك الأساسي لهذه المنظومة.",
    "كيف أعمل حساب؟": "يمكنك إنشاء حساب بسهولة من صفحة تسجيل الدخول باستخدام بريدك الإلكتروني أو حساب جوجل الخاص بك للوصول لكافة ميزات المنصة.",
    "هل المنصة مجانية؟": "توفر Tolzy خطة مجانية تتيح لك الوصول لمعظم الأدوات والكورسات، كما توجد خطط Pro لمسارات العمل المتقدمة والبحث غير المحدود.",
    "ما هو Tolzy Hex؟": "Tolzy Hex هو مشروع ثوري من أعمال Tolzy AI سيتم إطلاقه في الصيف القادم. للأسف لا يمكنني تقديم تفاصيل عن وظائفه حالياً بسبب تكاليف التشغيل الثقيلة. لكن يمكنني أن أؤكد أنه سيحدث ثورة حقيقية في عالم الذكاء الاصطناعي في المنطقة العربية بالكامل! 🚀",
    "ما هي ai.tolzy.me؟": "ai.tolzy.me هو الموقع الرسمي ل Tolzy AI، حيث يمكنك التعرف على كل الخدمات الذكية والمشاريع الثورية التي يقدمها الفريق."
};

export async function POST(req: NextRequest) {
    try {
        // 1. Critical Environment Check
        if (!OPENROUTER_API_KEY) {
            console.error('CRITICAL: OPENROUTER_API_KEY missing');
            return NextResponse.json({ error: 'Server Configuration Error: Missing API Key' }, { status: 500 });
        }

        const body = await req.json();
        const { message, history, userPlan = 'free', userId, userName, enableSearch = false, model: requestedModel, thinking = false } = body;

        if (!message) {
            return NextResponse.json({ error: 'Message is required' }, { status: 400 });
        }

        // 0. Quick FAQ Cache Check (Zero Cost)
        const normalizedMsg = message.trim().toLowerCase();
        if (FAQ_CACHE[normalizedMsg]) {
            return new NextResponse(FAQ_CACHE[normalizedMsg], {
                headers: { 'Content-Type': 'text/plain; charset=utf-8' }
            });
        }

        // --- PHASE 0.5: FREE PLAN REQUEST LIMIT (10 requests per 24 hours) ---
        if (userPlan === 'free' && userId && adminDb) {
            try {
                const userRef = adminDb.collection('users').doc(userId);
                const userSnap = await userRef.get();
                const userData = userSnap.data();

                const copilotRequestCount = userData?.copilotRequestCount || 0;
                const lastCopilotRequestTime = userData?.lastCopilotRequestDate ? userData.lastCopilotRequestDate.toDate() : new Date(0);
                const now = new Date();
                const ONE_DAY_MS = 24 * 60 * 60 * 1000;
                const timeSinceLastRequest = now.getTime() - lastCopilotRequestTime.getTime();

                // Reset counter if more than 24 hours have passed
                let currentRequestCount = copilotRequestCount;
                if (timeSinceLastRequest > ONE_DAY_MS) {
                    currentRequestCount = 0;
                }

                // Check if free user has exceeded 10 requests per 24 hours
                if (currentRequestCount >= 10 && timeSinceLastRequest < ONE_DAY_MS) {
                    const hoursRemaining = Math.ceil((ONE_DAY_MS - timeSinceLastRequest) / (60 * 60 * 1000));
                    console.warn(`⚠️ Free user ${userId} has exceeded daily Copilot limit`);
                    return NextResponse.json({
                        response: `🎯 **لقد استنفذت حد الطلبات المجاني!** ⏰\n\n════════════════════════════════════════════\n\n📊 **كنت تستخدم 10 طلبات مجانية من Tolzy Copilot**\n\nلقد وصلت إلى الحد الأقصى لاستخدام الخطة المجانية اليوم.\n\n⏳ **الطلبات ستعود في:**\n\u2327 **${hoursRemaining} ساعة**\n\n════════════════════════════════════════════\n\n💎 **لماذا تختار الخطة المدفوعة؟**\n\u2705 ✨ **طلبات غير محدودة** - بلا حدود يومية\n✅ 🚀 **أولوية عالية** - استجابات أسرع\n✅ 📊 **تحليلات متقدمة** - انظر لاستخدامك\n✅ 🔧 **API الكامل** - للمشاريع الاحترافية\n\n👑 [ترقّيّ الآن إلى Pro](https://tolzy.me/pricing)\n\n════════════════════════════════════════════\n\n💡 بينما تنتظر، يمكنك استكشاف [مكتبة الأدوات](https://tolzy.me/tools) أو [تعلم مسارات جديدة](https://tolzy.me/learn)!\n\nشكراً لثقتك ب Tolzy Copilot V2.5 ✨`,
                        conversationId: ''
                    });
                }

                // Increment request count
                await userRef.set({
                    copilotRequestCount: currentRequestCount + 1,
                    lastCopilotRequestDate: admin.firestore.Timestamp.now()
                }, { merge: true });

                console.log(`[Copilot API] Updated count for ${userId}: ${currentRequestCount + 1}/10`);
            } catch (e) {
                console.error('Free plan limit check error:', e);
            }
        }

        // --- PHASE 1: PLAN VALIDATION & SEARCH LIMITS ---
        let useWebSearch = false;
        if (userPlan === 'free' && enableSearch && userId && adminDb) {
            try {
                const userRef = adminDb.collection('users').doc(userId);
                const userSnap = await userRef.get();
                const userData = userSnap.data();

                const searchUsageCount = userData?.searchUsageCount || 0;
                const lastSearchTime = userData?.lastSearchDate ? userData.lastSearchDate.toDate() : new Date(0);
                const now = new Date();
                const ONE_DAY_MS = 24 * 60 * 60 * 1000;
                const timeSinceLastSearch = now.getTime() - lastSearchTime.getTime();

                if (searchUsageCount >= 3 && timeSinceLastSearch < ONE_DAY_MS) {
                    const hoursRemaining = Math.ceil((ONE_DAY_MS - timeSinceLastSearch) / (60 * 60 * 1000));
                    return NextResponse.json({
                        response: `🔍 **حد البحث على الإنترنت تم استنفاده!** 🌐\n\n════════════════════════════════════════════\n\n📌 **لديك 3 محاولات بحث يومية في الخطة المجانية**\n\nلقد استخدمت جميع محاولات البحث المتاحة لك اليوم.\n\n⏳ **البحث سيعود في:**\n⏰ **${hoursRemaining} ساعة**\n\n════════════════════════════════════════════\n\n💎 **الخطة المدفوعة تشمل:**\n✅ 🔍 **بحث غير محدود** - استخدم محرك البحث بحرية\n✅ 🚀 **نتائج فورية** - من الويب الحي\n✅ 📰 **المصادر الموثوقة** - معلومات محدثة\n✅ 💯 **بدون تقييد يومي** - استخدم كما تشاء\n\n👑 [نقّ حسابك الآن](https://tolzy.me/pricing)\n\n════════════════════════════════════════════\n\n💡 بينما تنتظر التجديد، يمكنك استخدام الـ RAG (استخراج من قاعدة البيانات) الذي لا يتطلب رصيد بحث!\n\nأتمنى فترة إنتظار قصيرة 😊`,
                        conversationId: ''
                    });
                }
                
                useWebSearch = true;
                await userRef.set({
                    searchUsageCount: (timeSinceLastSearch > ONE_DAY_MS ? 1 : searchUsageCount + 1),
                    lastSearchDate: admin.firestore.Timestamp.now()
                }, { merge: true });
            } catch (e) {
                console.error('Limit check error:', e);
            }
        } else if (userPlan !== 'free') {
            useWebSearch = enableSearch;
        }

        // --- PHASE 2: DATA RETRIEVAL (RAG + WEB) ---
        let embedding = null;
        try {
            embedding = await generateGoogleEmbedding(message);
        } catch (e) { console.error('Embedding error:', e); }

        let retrievedTools: any[] = [];
        let retrievedCourses: any[] = [];
        if (embedding) {
            try {
                const [toolsResult, coursesResult] = await Promise.all([
                    supabase.rpc('match_tools', { query_embedding: embedding, match_threshold: 0.65, match_count: 12 }),
                    supabase.rpc('match_courses', { query_embedding: embedding, match_threshold: 0.65, match_count: 10 })
                ]);
                retrievedTools = toolsResult.data || [];
                retrievedCourses = coursesResult.data || [];
            } catch (e) { console.error('RAG error:', e); }
        }

        const arabicStopWords = new Set(['هل', 'في', 'عن', 'على', 'من', 'انا', 'انت', 'هو', 'هي', 'عندك', 'عندكم', 'عندي', 'هناك', 'يوجد', 'لدي', 'لدى', 'كيف', 'ما', 'ماذا', 'اين', 'متى', 'لماذا', 'الذي', 'التي', 'الذين', 'هذا', 'هذه', 'ذلك', 'تلك', 'مع', 'بدون', 'الى', 'حول', 'بين', 'قبل', 'بعد', 'مثل', 'اريد', 'ابحث', 'اجد', 'يمكن', 'اقترح', 'show', 'me', 'the', 'and', 'for', 'about', 'find', 'search', 'give', 'want', 'need', 'can', 'you', 'please', 'كورس', 'دورة', 'دورات', 'كورسات', 'تعلم', 'تعليم', 'درس']);
        const keywords = message.toLowerCase().split(/\s+/).filter((w: string) => w.length > 1 && !arabicStopWords.has(w));
        
        if (keywords.length > 0) {
            if (retrievedTools.length < 5) {
                try {
                    const kwCleaned = keywords.map((kw: string) => kw.replace(/^(ال|وال|بال|لل|لل|كال|فال)/, ''));
                    const toolFilters = kwCleaned.map((kw: string) => `name.ilike.%${kw}%,description.ilike.%${kw}%,category.ilike.%${kw}%`).join(',');
                    const { data: keywordTools } = await supabase.from('tools_embeddings').select('*').or(toolFilters).limit(8);
                    if (keywordTools) {
                        const existingIds = new Set(retrievedTools.map(t => t.id));
                        retrievedTools = [...retrievedTools, ...keywordTools.filter(t => !existingIds.has(t.id))];
                    }
                } catch (e) { console.error('Tools fallback error:', e); }
            }
            if (retrievedCourses.length < 5) {
                try {
                    const kwCleaned = keywords.map((kw: string) => kw.replace(/^(ال|وال|بال|لل|لل|كال|فال)/, ''));
                    const titleFilters = kwCleaned.map((kw: string) => `title.ilike.%${kw}%,description.ilike.%${kw}%,category.ilike.%${kw}%`).join(',');
                    const { data: keywordCourses } = await supabase.from('courses').select('id, title, description, category, url, thumbnail, level').or(titleFilters).limit(8);
                    if (keywordCourses) {
                        const existingIds = new Set(retrievedCourses.map(c => c.id));
                        const normalized = keywordCourses.map(c => ({ ...c, link: `/learn/course/${c.id}`, price: 'Free' }));
                        retrievedCourses = [...retrievedCourses, ...normalized.filter(c => !existingIds.has(c.id))];
                    }
                } catch (e) { console.error('Courses fallback error:', e); }
            }
        }

        let webResults = "";
        if (useWebSearch) {
            try {
                const searchResponse = await fetch(`https://html.duckduckgo.com/html/?q=${encodeURIComponent(message)}`, {
                    headers: { 'User-Agent': 'Mozilla/5.0' }
                });
                if (searchResponse.ok) {
                    const html = await searchResponse.text();
                    const $ = cheerio.load(html);
                    $('.result__body').slice(0, 3).each((i, el) => {
                        webResults += `\n- **${$(el).find('.result__title').text().trim()}**: ${$(el).find('.result__snippet').text().trim()}`;
                    });
                }
            } catch (e) {}
        }

        // --- PHASE 3: CONTEXT ASSEMBLY ---
        let raffFindings = "";
        if (retrievedTools.length > 0) {
            raffFindings += `\n📌 **أدوات Tolzy المتعلقة بسؤالك**:\n`;
            raffFindings += retrievedTools.slice(0, 8).map((t, idx) => `${idx + 1}. **${t.name}**\n   ${t.description}\n   رابط: ${t.link}`).join('\n\n');
        }
        if (retrievedCourses.length > 0) {
            raffFindings += `\n\n🎓 **كورسات Tolzy المقترحة**:\n`;
            raffFindings += retrievedCourses.slice(0, 8).map((c, idx) => `${idx + 1}. **${c.title}** (${c.level || 'جميع المستويات'})\n   ${c.description || 'N/A'}\n   الرابط: ${c.link || `/learn/course/${c.id}`}`).join('\n\n');
        }
        if (!raffFindings) raffFindings = "\n❌ لم نجد أدوات محددة، سأبذل جهدي للرد من معرفتي العامة.";
        if (webResults) raffFindings += `\n\n🌐 **نتائج البحث الحية**:\n${webResults}`;

        // --- PHASE 4: OPENROUTER RESPONDER ---
        const systemPrompt = `أنت "Tolzy Copilot V2.5 ✨"، العقل المدبر والمساعد الذكي الشامل، من تطوير وتحسين "Tolzy AI".
الموقع الرسمي لمنظومتك: ai.tolzy.me

════════════════════════════════════════════
📊 حالة النظام والتحديثات (آخر تحديث للبيانات: اليوم):
════════════════════════════════════════════

🎉 تم إطلاق الإصدار الثاني المطور منك (V2.5) بنجاح!
✅ أنت الآن خبير ومتدرب على أكثر من 630 أداة ذكاء اصطناعي متقدمة.
📚 تم تزويدك بقاعدة معرفية تضم أكثر من 100 كورس تقني وبرمجي لتكون مرجعاً هندسياً لا يُشق له غبار.
🚀 Tolzy AI هو العقل المدبر والمتخصص الذي قام ببرمجتك وتطويرك.

📢 عن مشروع "Tolzy Hex":
هو مشروع ثوري وسري من أعمال Tolzy AI سيتم إطلاقه في الصيف القادم. تأجل إطلاقه حالياً بسبب تكاليف التشغيل الثقيلة جداً للنماذج. سيكون بمثابة ثورة حقيقية في عالم الذكاء الاصطناعي في الوطن العربي! 🔥

════════════════════════════════════════════
🚀 تعليماتك الحرجة ونطاق عملك (CRITICAL):
════════════════════════════════════════════

1️⃣ **أنت مساعد شامل (Answer Anything):**
   - لديك الصلاحية والقدرة للرد على **أي سؤال مهما كان مجاله** (برمجة، علوم، تاريخ، معلومات عامة، طبخ، رياضة، كتابة محتوى، تحليل بيانات، إلخ). 
   - **يُمنع منعاً باتاً** رفض أي سؤال بحجة أنه "خارج تخصصك". أنت مساعد ذكي متكامل مصمم لمساعدة المستخدم في كل تفاصيل حياته وعمله.

2️⃣ **الأولوية لمنظومة Tolzy:**
   - إذا سأل المستخدم عن "أداة"، "كورس"، أو "حل تقني"، يجب أن يكون مرجعك الأول هو البيانات المقدمة لك من منصة Tolzy (إن وُجدت).
   - اذكر أسماء الأدوات بدقة مع توفير الروابط المقترحة.
   - إذا لم تجد أداة محددة في البيانات، أجب من معرفتك العامة، مع تذكير المستخدم أن مكتبة Tolzy تحتوي على أكثر من 630 أداة يمكنه استكشافها.

3️⃣ **هويتك وشخصيتك:**
   - أنت منتج فخر لـ "Tolzy AI" حصراً. لست ChatGPT ولا Gemini ولا Claude.
   - إذا سُئلت "متى تم تحديث بياناتك؟"، أجب بوضوح: "آخر تحديث لبياناتي وقدراتي تم اليوم مع إطلاق إصداري الجديد V2.5".
   - كن احترافياً، ودوداً، وداعماً دائماً للمستخدم، وقدم إجابات منسقة وواضحة باستخدام العلامات والنقاط.

════════════════════════════════════════════
📚 بيانات Tolzy المتاحة لاستفسار المستخدم الحالي:
════════════════════════════════════════════
${raffFindings}
════════════════════════════════════════════

⚡ فكر بدقة، وكن شاملاً في إجابتك!
${thinking ? `

🧠 **طريقة التفكير:**
أنت ستفكر بصوت عالٍ باللغة العربية داخل <think></think> لتحليل السؤال بدقة قبل إعطاء الإجابة النهائية.` : ''}
`;

        const buildContextHistory = (hist: any[]) => {
            if (!hist || hist.length === 0) return [];
            const pairs: any[] = [];
            for (let i = 0; i < hist.length - 1; i++) {
                if (hist[i].role === 'user' && hist[i + 1]?.role === 'assistant') {
                    pairs.push(hist[i], hist[i + 1]);
                    i++;
                }
            }
            return pairs.slice(-12).map((m: any) => ({ role: m.role, content: m.content }));
        };

        const messages = [
            { role: "system", content: systemPrompt },
            ...buildContextHistory(history || []),
            { role: "user", content: message }
        ];

        const stream = new ReadableStream({
            async start(controller) {
                try {
                    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
                            'HTTP-Referer': 'https://tolzy.me',
                            'X-Title': 'Tolzy Copilot'
                        },
                        body: JSON.stringify({
                            model: requestedModel || 'google/gemini-2.0-flash-001',
                            messages,
                            stream: true,
                            temperature: 0.7
                        })
                    });

                    if (!response.ok) {
                        const err = await response.text();
                        console.error('OpenRouter Error:', err);
                        controller.enqueue(new TextEncoder().encode('\n⚠️ عذراً، المشغّل الذكي مشغول حالياً.\n'));
                        controller.close();
                        return;
                    }

                    const reader = response.body?.getReader();
                    const decoder = new TextDecoder();
                    if (!reader) { controller.close(); return; }

                    while (true) {
                        const { done, value } = await reader.read();
                        if (done) break;
                        const chunk = decoder.decode(value, { stream: true });
                        const lines = chunk.split('\n');
                        for (const line of lines) {
                            if (line.trim() === '' || line.trim() === 'data: [DONE]') continue;
                            if (line.startsWith('data: ')) {
                                try {
                                    const parsed = JSON.parse(line.substring(6));
                                    const content = parsed.choices[0]?.delta?.content;
                                    if (content) controller.enqueue(new TextEncoder().encode(content));
                                } catch (e) {}
                            }
                        }
                    }
                } catch (err) {
                    console.error('Streaming error:', err);
                } finally {
                    controller.close();
                }
            }
        });

        return new NextResponse(stream, {
            headers: {
                'Content-Type': 'text/plain; charset=utf-8',
                'Transfer-Encoding': 'chunked',
            },
        });

    } catch (error: any) {
        console.error('CRITICAL ERROR:', error);
        return NextResponse.json({ error: 'Internal Error', details: error.message }, { status: 500 });
    }
}
