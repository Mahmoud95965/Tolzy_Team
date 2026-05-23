import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import * as cheerio from 'cheerio';
import { generateGoogleEmbedding } from '@/src/lib/google-embeddings';
import { adminDb } from '@/src/config/firebase-admin';
import * as admin from 'firebase-admin';

// =======================
// 🔥 GLOBAL INIT
// =======================
const supabase = createClient(
    process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_KEY || ''
);

const GROQ_KEY   = process.env.GROQ_API_KEY!;
const GROQ_BASE  = 'https://api.groq.com/openai/v1/chat/completions';
const ENCODER    = new TextEncoder();

// =======================
// 🤖 MODEL TIERS
// =======================
// Tier is chosen automatically based on complexity — invisible to the user.
// All appear as "TOLZY Copilot V2.5" in the UI.
const MODELS = {
    // 🟢 Fast: short/simple messages, tool lookups
    fast: [
        'llama-3.1-8b-instant',
    ],
    // 🟡 Balanced: medium complexity, general questions
    balanced: [
        'llama-3.1-8b-instant',
    ],
    // 🔴 Smart: code mode, long complex queries (Pro only)
    smart: [
        'llama-3.3-70b-versatile',
    ],
} as const;

type Tier = keyof typeof MODELS;

function selectModel(
    sanitized: string,
    mode: string,
    isProPlan: boolean
): { tier: Tier; model: string } {
    const words = sanitized.split(/\s+/).length;
    const isCode = mode === 'code';
    const isComplex = words > 40 || /شرح|تحليل|قارن|اشرح|اكتب|صمم|خطة|مفصل|detailed|explain|compare|design|plan/i.test(sanitized);

    // 🔒 قصر النموذج الذكي القوي (smart) على المشتركين في الخطة المدفوعة Pro فقط
    if (isProPlan && (isCode || isComplex)) {
        const tier: Tier = 'smart';
        return { tier, model: MODELS.smart[0] };
    }
    if (isComplex || words > 15 || isCode) {
        const tier: Tier = 'balanced';
        return { tier, model: MODELS.balanced[0] };
    }
    const tier: Tier = 'fast';
    return { tier, model: MODELS.fast[0] };
}


// =======================
// ⚡ GROQ COMPLETIONS FETCH
// =======================
async function groqFetch(
    model: string,
    messages: object[],
    temperature: number
): Promise<Response> {
    const body = {
        model,
        messages,
        stream: true,
        temperature,
        max_tokens: 2048,
    };

    const res = await fetch(GROQ_BASE, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${GROQ_KEY}`,
        },
        body: JSON.stringify(body),
    });

    return res;
}

// =======================
// ⚡ FAQ CACHE (O(1) Map)
// =======================
const normalize = (s: string) =>
    s.trim().replace(/[؟\s]/g, '').toLowerCase();

const FAQ_MAP = new Map<string, string>([
    [normalize("من أنت؟"),         "أنا TOLZY Copilot ✨، مساعدك الذكي الرسمي من تطوير Tolzy AI (ai.tolzy.me)."],
    [normalize("من طورك؟"),        "تم تطويري بواسطة Tolzy AI، المالك الوحيد لكل تحديثات الذكاء الاصطناعي في هذه المنظومة."],
    [normalize("هل أنت من جوجل؟"), "لا، أنا TOLZY Copilot من تطوير Tolzy AI. الذكاء الاصطناعي مجرد مكوّن تقني في نموذجي."],
    [normalize("ما هي منصة tolzy؟"),"منصة Tolzy هي منظومة متكاملة وأفضل وجهة عربية لأدوات الذكاء الاصطناعي والكورسات التقنية. تضم أكثر من 600 أداة ذكية وأكثر من 150 كورس."],
    [normalize("كيف أعمل حساب؟"),  "يمكنك التسجيل بسهولة عبر البريد الإلكتروني أو حساب Google من صفحة تسجيل الدخول."],
    [normalize("هل المنصة مجانية؟"),"توفر Tolzy خطة مجانية تتيح الوصول لمعظم الأدوات والكورسات، مع خطط Pro للمسارات المتقدمة."],
    [normalize("ما هو Tolzy Hex؟"), "Tolzy Hex مشروع ثوري من Tolzy AI سيُطلق قريباً وسيُحدث ثورة في عالم الذكاء الاصطناعي العربي 🚀"],
    [normalize("ما هي ai.tolzy.me؟"),"ai.tolzy.me الموقع الرسمي لـ Tolzy AI، حيث تجد كل الخدمات والمشاريع الذكية للفريق."],
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
    'تعلم','تعليم','درس',
]);

const send = (c: ReadableStreamDefaultController, t: string) =>
    c.enqueue(ENCODER.encode(t));

// =======================
// 🚀 MAIN HANDLER
// =======================
export async function POST(req: NextRequest) {
    try {
        if (!GROQ_KEY) {
            return NextResponse.json({ error: 'Missing Groq API Key' }, { status: 500 });
        }

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
        const faqPartial = [...FAQ_MAP.entries()].find(([k]) => normalizedMsg.includes(k))?.[1];
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
                // Wrap Firestore get in a 1.5s timeout to prevent serverless function hangs
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
        const shouldUseRAG = words.length > 2 && sanitized.length > 15 && !SIMPLE_SET.has(normalizedMsg);
        const shouldUseWebSearch =
            enableSearch &&
            /(news|latest|update|breaking|2026|اخبار|اليوم|جديد|recent)/i.test(sanitized);

        // =======================
        // 🔒 FREE PLAN LIMIT (5 req/day)
        // =======================
        if (!isProPlan && userId && adminDb) {
            try {
                const userRef = adminDb.collection('users').doc(userId);
                
                // Wrap Firestore get in a 1.5s timeout to prevent freezes
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
                        response: `🎯 **لقد استنفدت حدك اليومي في Copilot (5 طلبات يومياً)!**\n\n⏰ سيتم تجديد طلباتك خلال **${hoursLeft} ساعة**\n\n💎 **الخطة المدفوعة Pro تشمل:**\n✅ طلبات غير محدودة ومستمرة وبدون أي قيود\n✅ الوصول لأقوى نماذج الذكاء الاصطناعي (Llama 3.3 70B)\n✅ سرعة وأولوية فائقة في معالجة طلباتك`
                    });
                }

                // Wrap Firestore set in a 1.5s timeout to prevent freezes
                const firestoreSetPromise = userRef.set({
                    copilotRequestCount: currentCount + 1,
                    lastCopilotRequestDate: admin.firestore.Timestamp.now()
                }, { merge: true });
                const setTimeoutPromise = new Promise<never>((_, reject) =>
                    setTimeout(() => reject(new Error('Firestore Set Timeout')), 1500)
                );
                await Promise.race([firestoreSetPromise, setTimeoutPromise]);
            } catch (e) { 
                console.error('Free limit error or timeout:', e); 
            }
        }

        // =======================
        // ⚡ EMBEDDING (LAZY)
        // =======================
        let embedding: any = null;
        if (shouldUseRAG) {
            try { embedding = await generateGoogleEmbedding(sanitized); } catch {}
        }

        // =======================
        // ⚡ RAG FETCH
        // =======================
        let tools: any[] = [];
        let courses: any[] = [];

        if (embedding) {
            try {
                const [t, c] = await Promise.all([
                    supabase.rpc('match_tools', { query_embedding: embedding, match_threshold: 0.65, match_count: 4 }),
                    supabase.rpc('match_courses', { query_embedding: embedding, match_threshold: 0.65, match_count: 3 })
                ]);
                tools   = Array.isArray(t?.data) ? t.data : [];
                courses = Array.isArray(c?.data) ? c.data : [];
            } catch {}
        }

        // =======================
        // ⚡ KEYWORD FALLBACK
        // =======================
        const keywords = words
            .map((w: string) => w.replace(/^(ال|وال|بال|لل|كال|فال)/, ''))
            .filter((w: string) => w.length > 2 && !STOP_WORDS.has(w));

        if (keywords.length) {
            const filter = keywords
                .map((k: string) => `name.ilike.%${k}%,description.ilike.%${k}%,category.ilike.%${k}%`)
                .join(',');
            try {
                const { data: kTools } = await supabase.from('tools_embeddings').select('*').or(filter).limit(6);
                if (kTools?.length) {
                    const map = new Map(tools.map(t => [t.id, t]));
                    kTools.forEach(t => map.set(t.id, t));
                    tools = [...map.values()];
                }
            } catch {}
            try {
                const { data: kCourses } = await supabase.from('courses').select('id,title,description,category,level').or(filter).limit(5);
                if (kCourses?.length) {
                    const map = new Map(courses.map(c => [c.id, c]));
                    kCourses.forEach(c => map.set(c.id, c));
                    courses = [...map.values()];
                }
            } catch {}
        }

        // =======================
        // ⚡ WEB SEARCH
        // =======================
        let webResults = '';
        if (shouldUseWebSearch) {
            try {
                const res = await fetch(
                    `https://html.duckduckgo.com/html/?q=${encodeURIComponent(sanitized)}`,
                    { headers: { 'User-Agent': 'Mozilla/5.0' } }
                );
                const $ = cheerio.load(await res.text());
                $('.result__body').slice(0, 3).each((_, el) => {
                    webResults += `\n- **${$(el).find('.result__title').text().trim()}**: ${$(el).find('.result__snippet').text().trim()}`;
                });
            } catch {}
        }

        // =======================
        // ⚡ CONTEXT ASSEMBLY
        // =======================
        let context = '';
        if (tools.length) {
            context += `\n📌 أدوات Tolzy:\n`;
            context += tools.slice(0, 3).map((t, i) => `${i + 1}. **${t.name}** — ${t.description?.slice(0, 100)}`).join('\n');
        }
        if (courses.length) {
            context += `\n\n🎓 كورسات Tolzy:\n`;
            context += courses.slice(0, 3).map((c, i) => `${i + 1}. **${c.title}** (${c.level || 'جميع المستويات'}) — ${c.description?.slice(0, 100) || ''}`).join('\n');
        }
        if (webResults) context += `\n\n🌐 نتائج البحث:\n${webResults}`;
        if (!context) context = '💡 لم أجد نتائج مباشرة، سأساعدك من خبرتي 👇';

        // =======================
        // ⚡ MODE INSTRUCTIONS
        // =======================
        const MODES: Record<string, string> = {
            general: 'قدم إجابات شاملة وواضحة مع أمثلة عند الحاجة.',
            code:    'استخدم code blocks مع تحديد اللغة واشرح الكود بوضوح.',
            tools:   'أولوية لأدوات Tolzy مع ذكر الاسم والوصف.',
            learn:   'قسّم الشرح لخطوات متسلسلة واقترح كورسات Tolzy.',
        };
        const modeInstruction = MODES[mode] || MODES.general;

        // =======================
        // ⚡ SYSTEM PROMPT
        // =======================
        // =============================================
        // ⚡ GMAIL CONTEXT INSTRUCTIONS
        // =============================================
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

قواعد مهمة للـ Gmail:
- استخدم هذه الصيغ دائماً عند أي طلب متعلق بالبريد الإلكتروني.
- لا ترد بنص عادي عند طلبات البريد — استخدم البلوكات فقط.
- يمكنك دمج شرح قصير مع البلوك.
- فاصل الرسائل في gmail-inbox هو --- في سطر منفرد.
` : '';

        const systemPrompt = `أنت "TOLZY Copilot V2.5 ✨" — المساعد الذكي من تطوير Tolzy AI. الموقع: ai.tolzy.me

تعليماتك:
1. أجب على أي سؤال بلا استثناء.
2. أولوية لأدوات وكورسات Tolzy عند الاقتراح.
3. أنت مساعد TOLZY Copilot — لست ChatGPT أو Gemini أو Claude.
4. كن احترافياً وودوداً وداعماً.
5. لديك أكثر من 600 أداة ذكية وأكثر من 150 كورس.
6. الرد بالعربية ما لم يطلب المستخدم غير ذلك.

${modeInstruction}
${gmailInstructions}
📚 Tolzy Context:
${context}`;

        // =======================
        // ⚡ SELECT MODEL (Auto)
        // =======================
        const { model } = selectModel(sanitized, mode, isProPlan);
        const temperature = mode === 'code' ? 0.2 : 0.6;

        // =======================
        // ⚡ BUILD MESSAGES
        // =======================
        const chatMessages: any[] = [
            { role: 'system', content: systemPrompt }
        ];

        // Add last 4 conversation pairs from history
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
        // ⚡ STREAM RESPONSE
        // =======================
        const stream = new ReadableStream({
            async start(controller) {
                try {
                    const res = await groqFetch(model, chatMessages, temperature);

                    if (!res.ok) {
                        const errText = await res.text();
                        console.error('[Groq Error]', res.status, model, errText);
                        if (res.status === 429) {
                            send(controller, '⚠️ تجاوزت حد الطلبات المسموح به لنموذج Groq. حاول مرة أخرى لاحقاً.');
                        } else {
                            send(controller, `⚠️ خطأ ${res.status}: تعذّر الاتصال بخادم Groq. حاول مرة أخرى.`);
                        }
                        controller.close();
                        return;
                    }

                    const reader = res.body!.getReader();
                    const decoder = new TextDecoder();

                    while (true) {
                        const { value, done } = await reader.read();
                        if (done) break;

                        for (const line of decoder.decode(value, { stream: true }).split('\n')) {
                            if (!line.startsWith('data: ')) continue;
                            const data = line.slice(6).trim();
                            if (!data || data === '[DONE]') continue;

                            try {
                                const delta = JSON.parse(data).choices?.[0]?.delta?.content;
                                if (delta) send(controller, delta);
                            } catch {}
                        }
                    }

                } catch (e) {
                    console.error('Stream error:', e);
                    send(controller, '⚠️ عذراً، حدث خطأ في الاتصال.');
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