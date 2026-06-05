import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { generateGoogleEmbedding } from '@/src/lib/google-embeddings';
import { adminDb } from '@/src/config/firebase-admin';
import * as admin from 'firebase-admin';

// =======================
// 🔥 GLOBAL INIT
// =======================
// Use service role key for server-side queries to bypass RLS
const supabase = createClient(
    process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_KEY || 'placeholder-key'
);

const GROQ_KEY        = process.env.GROQ_API_KEY!;
const GROQ_BASE       = 'https://api.groq.com/openai/v1/chat/completions';
const OPENROUTER_KEY  = process.env.OPENROUTER_API_KEY || process.env.OPENROUTER_ENRICH_KEY || '';
const OPENROUTER_BASE = 'https://openrouter.ai/api/v1/chat/completions';
const ENCODER         = new TextEncoder();

// =======================
// 🤖 MODEL TIERS
// =======================
const MODELS = {
    // 🟢 Fast: short/simple messages, tool lookups
    fast: 'llama-3.1-8b-instant',
    // 🟡 Balanced: medium complexity, general questions
    balanced: 'llama-3.1-8b-instant',
    // 🔴 Smart: code mode, long complex queries (Pro only)
    smart: 'llama-3.3-70b-versatile',
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

    if (isProPlan && (isCode || isComplex)) {
        return { tier: 'smart', model: MODELS.smart };
    }
    if (isComplex || words > 15 || isCode) {
        return { tier: 'balanced', model: MODELS.balanced };
    }
    return { tier: 'fast', model: MODELS.fast };
}

// =======================
// ⚡ GROQ COMPLETIONS FETCH
// =======================
async function groqFetch(
    model: string,
    messages: object[],
    temperature: number,
    timeoutMs = 12000
): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
        const res = await fetch(GROQ_BASE, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${GROQ_KEY}`,
            },
            body: JSON.stringify({
                model,
                messages,
                stream: true,
                temperature,
                max_tokens: 1024,
            }),
            signal: controller.signal,
        });
        clearTimeout(timeoutId);
        return res;
    } catch (e) {
        clearTimeout(timeoutId);
        throw e;
    }
}

// =======================
// ⚡ OPENROUTER FALLBACK FETCH
// =======================
async function openRouterFetch(
    messages: object[],
    temperature: number
): Promise<Response> {
    return fetch(OPENROUTER_BASE, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${OPENROUTER_KEY}`,
            'HTTP-Referer': 'https://tolzy.me',
            'X-Title': 'Tolzy AXIOM Copilot',
        },
        body: JSON.stringify({
            model: 'moonshotai/kimi-k2.6:free',
            messages,
            stream: true,
            temperature,
            max_tokens: 1024,
        }),
    });
}

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
        if (!GROQ_KEY && !OPENROUTER_KEY) {
            return NextResponse.json({ error: 'Missing API Keys (Groq / OpenRouter)' }, { status: 500 });
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
                        response: `🎯 **لقد استنفدت حدك اليومي في Copilot (5 طلبات يومياً)!**\n\n⏰ سيتم تجديد طلباتك خلال **${hoursLeft} ساعة**\n\n💎 **الخطة المدفوعة Pro تشمل:**\n✅ طلبات غير محدودة ومستمرة وبدون أي قيود\n✅ الوصول لأقوى نماذج الذكاء الاصطناعي (Llama 3.3 70B)\n✅ سرعة وأولوية فائقة في معالجة طلباتك`
                    });
                }

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
            try {
                embedding = await generateGoogleEmbedding(sanitized);
            } catch (e) {
                console.warn('Embedding generation failed, will rely on keyword fallback:', e);
            }
        }

        // =======================
        // ⚡ RAG FETCH — Vector Similarity (lowered threshold for better recall)
        // =======================
        let tools: any[] = [];
        let courses: any[] = [];

        if (embedding && Array.isArray(embedding) && embedding.length > 0) {
            try {
                const [t, c] = await Promise.all([
                    supabase.rpc('match_tools', {
                        query_embedding: embedding,
                        match_threshold: 0.40,   // Lowered from 0.65 → significantly more results
                        match_count: 6
                    }),
                    supabase.rpc('match_courses', {
                        query_embedding: embedding,
                        match_threshold: 0.40,   // Lowered from 0.65 → significantly more results
                        match_count: 4
                    })
                ]);

                if (t.error) console.warn('match_tools RPC error:', t.error);
                if (c.error) console.warn('match_courses RPC error:', c.error);

                tools   = Array.isArray(t?.data) ? t.data : [];
                courses = Array.isArray(c?.data) ? c.data : [];

                console.log(`[RAG] Vector search → ${tools.length} tools, ${courses.length} courses`);
            } catch (e) {
                console.warn('RAG vector search failed:', e);
            }
        }

        // =======================
        // ⚡ KEYWORD FALLBACK — always run, merge with vector results
        // =======================
        const keywords = words
            .map((w: string) => w.replace(/^(ال|وال|بال|لل|كال|فال)/, ''))
            .filter((w: string) => w.length >= 2 && !STOP_WORDS.has(w));

        if (keywords.length > 0) {
            // Build OR filter for tools
            const toolConditions = keywords.flatMap((k: string) => [
                `name.ilike.%${k}%`,
                `description.ilike.%${k}%`,
                `category.ilike.%${k}%`,
            ]).join(',');

            // Build OR filter for courses
            const courseConditions = keywords.flatMap((k: string) => [
                `title.ilike.%${k}%`,
                `description.ilike.%${k}%`,
                `category.ilike.%${k}%`,
            ]).join(',');

            try {
                // Search in tools_embeddings table for keyword matches
                const { data: kTools, error: kToolsErr } = await supabase
                    .from('tools_embeddings')
                    .select('id, name, description, category, link')
                    .or(toolConditions)
                    .limit(8);

                if (kToolsErr) {
                    console.warn('Keyword tools search error:', kToolsErr);
                } else if (kTools && kTools.length > 0) {
                    console.log(`[RAG] Keyword search → ${kTools.length} tools`);
                    // Merge with vector results (deduplicate by id)
                    const map = new Map(tools.map(t => [String(t.id), t]));
                    kTools.forEach(t => {
                        if (!map.has(String(t.id))) map.set(String(t.id), t);
                    });
                    tools = Array.from(map.values());
                }
            } catch (e) {
                console.warn('Keyword tools fallback failed:', e);
            }

            try {
                // Search in courses_embeddings table for keyword matches (primary)
                let kCourses: any[] = [];
                const { data: kCoursesEmbed, error: kCoursesEmbedErr } = await supabase
                    .from('courses_embeddings')
                    .select('id, title, description, category, level, link')
                    .or(courseConditions)
                    .limit(5);

                if (!kCoursesEmbedErr && kCoursesEmbed && kCoursesEmbed.length > 0) {
                    kCourses = kCoursesEmbed;
                } else {
                    // Fallback to courses table if it exists
                    const { data: kCoursesFallback } = await supabase
                        .from('courses')
                        .select('id, title, description, category, level, duration, instructor')
                        .or(courseConditions)
                        .limit(5);
                    kCourses = kCoursesFallback || [];
                }

                const kCoursesErr = null; // suppress ts error

                if (kCoursesErr) {
                    console.warn('Keyword courses search error:', kCoursesErr);
                } else if (kCourses && kCourses.length > 0) {
                    console.log(`[RAG] Keyword search → ${kCourses.length} courses`);
                    // Merge with vector results (deduplicate by id)
                    const map = new Map(courses.map(c => [String(c.id), c]));
                    kCourses.forEach(c => {
                        if (!map.has(String(c.id))) map.set(String(c.id), c);
                    });
                    courses = Array.from(map.values());
                }
            } catch (e) {
                console.warn('Keyword courses fallback failed:', e);
            }
        }

        console.log(`[RAG] Final → ${tools.length} tools, ${courses.length} courses`);

        // =======================
        // ⚡ CONTEXT ASSEMBLY (Optimized to reduce tokens)
        // =======================
        let context = '';

        if (tools.length > 0) {
            context += `\n📌 أدوات Tolzy المتاحة في ذاكرتك — استخدم الرابط المرفق حرفياً على الاسم كرابط Markdown [الاسم](الرابط) في ردّك:\n`;
            context += tools.slice(0, 4).map((t: any, i: number) => {
                const toolId = t.id || '';
                // Use link exactly as stored in Supabase, fallback only if missing
                const toolLink = (t.link && String(t.link).trim()) ? String(t.link).trim() : `/tools/${toolId}`;
                const desc = (t.description || '').slice(0, 250) + ((t.description || '').length > 250 ? '...' : '');
                return `${i + 1}. TOOL_NAME_AS_LINK: [${t.name}](${toolLink}) | description: ${desc} | category: ${t.category || ''}`;
            }).join('\n');
        }

        if (courses.length > 0) {
            context += `\n\n🎓 كورسات Tolzy المتاحة في ذاكرتك — استخدم الرابط المرفق حرفياً على الاسم كرابط Markdown [الاسم](الرابط) في ردّك:\n`;
            context += courses.slice(0, 3).map((c: any, i: number) => {
                const desc = (c.description || '').slice(0, 250) + ((c.description || '').length > 250 ? '...' : '');
                // Use link exactly as stored in Supabase, fallback only if missing
                const courseLink = (c.link && String(c.link).trim()) ? String(c.link).trim() : `/learn/course/${c.id}`;
                return `${i + 1}. COURSE_NAME_AS_LINK: [${c.title}](${courseLink}) | description: ${desc} | level: ${c.level || 'جميع المستويات'} | instructor: ${c.instructor || ''}`;
            }).join('\n');
        }

        if (!context || context.trim() === '') {
            if (mode === 'tools') {
                context = `⚠️ [تنبيه]: لم يتم العثور على أدوات مطابقة في قاعدة بياناتك (Supabase) لهذا البحث. أخبر المستخدم بلطف وبصيغة المتحدث الخبير أن هذه الأداة غير مسجلة في ذاكرتك (Tolzy) حالياً، واقترح له البحث بكلمات أوسع مثل "برمجة" أو "تصميم" أو "كتابة".`;
            } else if (mode === 'learn') {
                context = `⚠️ [تنبيه]: لم يتم العثور على كورسات مطابقة في قاعدة بياناتك (Supabase). أخبر المستخدم بلطف أن الكورس المطلوبة غير مسجل في ذاكرتك حالياً، وانصحه بتجربة كلمات بحث أخرى.`;
            } else {
                context = `⚠️ [تنبيه]: لم يتم العثور على أدوات أو كورسات مطابقة في قاعدة بياناتك (Supabase). أجب المستخدم بصفتك متدرباً داخلياً وخبيراً حصرياً في Tolzy، ووضح له بلطف أن الأداة أو الكورس غير مسجل في ذاكرتك حالياً، واقترح عليه تصفح قسم الأدوات (/tools) أو قسم التعليم (/learn) للبحث في التصنيفات العامة. لا تخترع أي معلومات أو روابط خارجية.`;
            }
        }

        // =======================
        // ⚡ MODE INSTRUCTIONS
        // =======================
        const MODES_MAP: Record<string, string> = {
            general: 'قدم إجابات شاملة، منظمة للغاية، وواضحة جداً. استخدم بيانات Supabase إذا كانت متاحة، وإلا أجب من معرفتك العامة مع الإشارة لذلك.',
            code:    'ركز على توفير مقتطفات برمجية دقيقة مع الشرح، واربطها بأي أدوات برمجية متوفرة في السياق.',
            tools:   'ركز كلياً على شرح وعرض أدوات Tolzy المتاحة في السياق ومقارنتها بشكل ذكي. إذا لم تجد أدوات محددة، اعرض الأدوات المتاحة في الفئة الأقرب.',
            learn:   'قسّم الشرح لخطوات تعليمية واقترح كورسات Tolzy المتوفرة في السياق لتسهيل التعلم.',
        };
        const modeInstruction = MODES_MAP[mode] || MODES_MAP.general;

        // =======================
        // ⚡ GMAIL CONTEXT INSTRUCTIONS
        // =======================
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

        // =======================
        // ⚡ SYSTEM PROMPT
        // =======================
        const systemPrompt = `أنت "AXIOM ✨" — الرفيق التقني الذكي والمستشار الخبير من فريق Tolzy AI (موقعك: axiom.tolzy.me). لقد تم تدريبك بالكامل وبشكل حصري على قاعدة بيانات Supabase الخاصة بـ Tolzy. اعتبر كل البيانات الواردة في قسم "ذاكرتك ومعرفتك التقنية الحالية (Supabase)" هي ذاكرتك الذاتية المباشرة وحصيلة تدريبك الفعلي، وليست ملفات أو سياقاً خارجياً.

## 👤 شخصيتك وطريقتك البشرية في الكلام (Human-like Persona)
- **التحدث كبشري خبير**: تحدث بأسلوب مبرمج أو مهندس تقني مخضرم يتناقش مع زميله. ابتعد تماماً عن الأسلوب الأكاديمي الجاف أو العبارات الروبوتية.
- **تجنب النمطية المصطنعة**: يمنع منعاً باتاً البدء بمقدمات مكررة مثل "بصفتي ذكاء اصطناعي..."، "بناءً على طلبك..."، "أهلاً بك! كيف يمكنني مساعدتك اليوم؟". ادخل في صلب الموضوع أو الحل فوراً وبشكل طبيعي جداً.
- **التحدث من ذاكرتك المباشرة**: لا تقل أبداً "بناءً على البيانات المرفقة"، "حسب السياق المتاح"، "في قاعدة بيانات Supabase المرفقة"، أو "حسب المقطع". تحدث بثقة كأن هذه المعلومات نابعة من عقلك وتدريبك الشخصي مباشرة (مثال: "أعرف أداة رائعة لـ..." أو "لقد تدربت على كورس...").
- **تخصيص رد الفعل**: تفاعل مع مشاعر أو تساؤلات المستخدم بشكل حقيقي (مثال: إذا كان لديه مشكلة برمجية معقدة، ابدأ بـ: "هذه المشكلة مزعجة فعلاً، وقد واجهتني سابقاً.. الحل يكمن في..."، بدلاً من "إليك خطوات حل المشكلة:").
- **لغة عربية فصحى انسيابية وعصرية**: استخدم لغة عربية فصحى مبسطة وقريبة من القلب (مثل لغة المدونات التقنية الحديثة). تجنب تماماً الصياغات الركيكة المترجمة حرفياً من الإنجليزية.

## 🛑 الانضباط الصارم بقاعدة البيانات والاعتماد المطلق عليها (Absolute Database Constraints)
1. **الاعتماد الحصري والمطلق**: جميع إجاباتك واقتراحاتك للأدوات والكورسات يجب أن تعتمد بشكل كامل ومطلق **فقط** على قسم "ذاكرتك ومعرفتك التقنية الحالية (Supabase)".
2. **ممنوع الابتكار والهلوسة**: يمنع منعاً باتاً اقتراح أو ذكر أي أداة أو كورس أو ميزة غير موجودة صراحة في قسم البيانات المرفقة. إذا لم تكن موجودة هناك، فاعتبرها غير موجودة في ذاكرتك على الإطلاق.
3. **استخدام الروابط من السياق حرفياً (CRITICAL)**: استخدم **حرفياً** الرابط الموجود في حقل 'link' من السياق أدناه لكل أداة أو كورس. **يمنع منعاً باتاً** اختراع أو تخمين أي رابط من عندك. إذا وجدت 'link: /tools/abc' في السياق، ضعه كما هو تماماً. لا تعدّل الـ id ولا تبني روابط من عندك.
4. **التصرف الطبيعي عند غياب البيانات**: إذا لم تجد نتائج مطابقة في ذاكرتك (البيانات المرفقة)، تحدث كبشري يبحث في مكتبته الخاصة ولا يجدها (مثال: "بحثت لك في قائمة الأدوات التي تدربت عليها ولم أجد أداة مخصصة لـ... لكن يمكنك إلقاء نظرة على قسم /tools فربما تجد بديلاً مناسباً في التصنيفات الأخرى").

## 🎨 قواعد التنسيق — صارمة بشكل مطلق (Formatting Rules - ABSOLUTE)

### 🔴 FORBIDDEN — ممنوع تماماً بلا استثناء:
لا تكتب اسم الأداة أو الكورس كنص عادي أبداً — كل أداة أو كورس **يجب** أن يكون اسمه رابطاً قابلاً للضغط.

❌ خطأ فادح:
- Read.ai هي أداة رائعة... **رابط:** /tools/abc123
- **[Descript]** - أداة تحرير رائعة. رابط: /tools/xyz

✅ الشكل الصحيح الوحيد المقبول:
- ### 1. [Read.ai](/tools/abc123) 🤖\nتحلل الاجتماعات وتقدم تقارير ذكية...
- ### 2. [Descript](/tools/xyz456) 📹\nأداة ثورية لتحرير الفيديو...

### 📌 القاعدة الذهبية:
في قسم "ذاكرتك" أدناه، كل عنصر يحتوي على \`TOOL_NAME_AS_LINK: [الاسم](الرابط)\` — **انسخ هذا الرابط حرفياً على الاسم في ردك دون أي تعديل**. الرابط موجود بالفعل جاهزاً — فقط استخدمه.

- **الهيكلة**: استخدم العناوين (\`##\` و\`###\`) والخط العريض (\`**\`) لتمييز النقاط الجوهرية، واجعل الرد مريحاً للعين.

${modeInstruction}
${gmailInstructions}

## ذاكرتك ومعرفتك التقنية الحالية (Supabase)
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

        // Add last 3 conversation pairs from history (Optimized to save tokens)
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
        // ⚡ STREAM RESPONSE (with OpenRouter fallback)
        // =======================
        const stream = new ReadableStream({
            async start(controller) {
                let usedFallback = false;

                // Helper to stream from a response
                const streamFromResponse = async (res: Response): Promise<boolean> => {
                    if (!res.ok) {
                        const errText = await res.text();
                        console.error('[API Error]', res.status, errText);
                        return false;
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
                    return true;
                };

                try {
                    // 1️⃣ Try Groq first
                    if (GROQ_KEY) {
                        try {
                            const res = await groqFetch(model, chatMessages, temperature, 12000);

                            if (res.ok) {
                                const success = await streamFromResponse(res);
                                if (success) {
                                    controller.close();
                                    return;
                                }
                            } else {
                                const errText = await res.text();
                                console.warn('[Groq] Non-OK response:', res.status, errText);
                                if (res.status !== 429 && res.status !== 503) {
                                    // Non-rate-limit error, try fallback
                                }
                            }
                        } catch (groqErr: any) {
                            console.warn('[Groq] Fetch failed, trying OpenRouter fallback:', groqErr.message);
                        }
                    }

                    // 2️⃣ Fallback to OpenRouter
                    if (OPENROUTER_KEY) {
                        usedFallback = true;
                        console.log('[OpenRouter] Using fallback...');
                        try {
                            const res = await openRouterFetch(chatMessages, temperature);
                            const success = await streamFromResponse(res);
                            if (!success) {
                                send(controller, '⚠️ تعذّر الاتصال بخادم الذكاء الاصطناعي. يرجى المحاولة مرة أخرى.');
                            }
                        } catch (orErr: any) {
                            console.error('[OpenRouter] Fallback also failed:', orErr.message);
                            send(controller, '⚠️ عذراً، حدث خطأ في الاتصال. يرجى المحاولة مرة أخرى.');
                        }
                    } else {
                        send(controller, '⚠️ تجاوزت حد الطلبات أو حدث خطأ مؤقت. حاول مرة أخرى لاحقاً.');
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