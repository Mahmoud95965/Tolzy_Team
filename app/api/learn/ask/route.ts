import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/src/utils/supabaseAdmin';
import { adminDb } from '@/src/config/firebase-admin';

// Enable CORS
function corsHeaders() {
    return {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };
}

export async function OPTIONS() {
    return NextResponse.json({}, { headers: corsHeaders() });
}

// Format seconds to MM:SS or HH:MM:SS
function formatTime(seconds: number): string {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    if (hrs > 0) {
        return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { videoId, question, chatHistory, userId } = body;

        if (!userId) {
            return NextResponse.json({ error: 'يرجى تسجيل الدخول أولاً للتحقق من الصلاحية.' }, { status: 401, headers: corsHeaders() });
        }

        // --- Plan check: TOLZY OmniLearn is Pro/Ultra only ---
        if (adminDb) {
            try {
                const userRef = adminDb.collection('users').doc(userId);
                const userSnap = await userRef.get();
                const userData = userSnap.data();
                const userPlan = String(userData?.plan || 'free').toLowerCase();
                const isPro = userPlan.includes('pro') || userPlan.includes('ultra');

                if (!isPro) {
                    return NextResponse.json({
                        error: 'عذراً، ميزة TOLZY OmniLearn متوفرة فقط لمشتركي باقة Pro. يرجى ترقية حسابك للاستفادة منها.'
                    }, { status: 403, headers: corsHeaders() });
                }
            } catch (e) {
                console.error('TOLZY OmniLearn ask plan check error:', e);
            }
        }

        if (!videoId || !question) {
            return NextResponse.json({ error: 'videoId and question are required' }, { status: 400, headers: corsHeaders() });
        }

        const GROQ_API_KEY = process.env.GROQ_API_KEY;
        if (!GROQ_API_KEY) {
            return NextResponse.json({ error: 'عذراً، محرك الذكاء الاصطناعي غير مهيأ في الخادم (GROQ_API_KEY).' }, { status: 500, headers: corsHeaders() });
        }

        // 1. Retrieve the most relevant transcript chunks using Supabase Full-Text / Keyword search
        const { data: chunks, error: rpcError } = await supabaseAdmin.rpc('match_transcript_chunks', {
            p_video_id: videoId,
            p_query: question,
            p_limit: 4
        });

        let relevantChunks = chunks;

        // Fallback if RPC fails or returns empty results
        if (rpcError || !relevantChunks || relevantChunks.length === 0) {
            console.warn('RPC match_transcript_chunks failed, using fallback manual search:', rpcError);
            
            const { data: fallbackChunks } = await supabaseAdmin
                .from('youtube_transcript_chunks')
                .select('*')
                .eq('video_id', videoId)
                .ilike('text', `%${question}%`)
                .limit(4);

            relevantChunks = fallbackChunks;

            // Fallback 2: Get first few chunks of the video so the AI has some context
            if (!relevantChunks || relevantChunks.length === 0) {
                const { data: defaultChunks } = await supabaseAdmin
                    .from('youtube_transcript_chunks')
                    .select('*')
                    .eq('video_id', videoId)
                    .order('chunk_index', { ascending: true })
                    .limit(4);
                
                relevantChunks = defaultChunks;
            }
        }

        // 2. Format context text with precise timestamps or sections
        const isYouTube = videoId.length === 11;
        const contextText = relevantChunks && relevantChunks.length > 0 
            ? relevantChunks.map((c: any) => {
                const label = isYouTube 
                    ? `Timestamp: ${formatTime(Number(c.start_time))}`
                    : `القسم: ${Number(c.chunk_index) + 1}`;
                return `[T-${label}] ${c.text}`;
              }).join('\n\n')
            : 'محتوى المادة التعليمية غير متوفر حالياً.';

        // Approximate reference of the first matched chunk
        const firstMatchStartTime = relevantChunks && relevantChunks.length > 0 ? Number(relevantChunks[0].start_time) : 0;
        const firstMatchIndex = relevantChunks && relevantChunks.length > 0 ? Number(relevantChunks[0].chunk_index) : 0;
        const approximateRef = isYouTube 
            ? formatTime(firstMatchStartTime)
            : `القسم ${firstMatchIndex + 1}`;

        // 3. Construct System Prompt with strict Arabic RAG instructions and AXIOM persona
        const systemPrompt = `أنت "TOLZY OmniLearn ✨" — معالج ومساعد التعلم الذكي الفائق المتكامل مع محرك AXIOM الذكي من Tolzy AI.
مهمتك هي الإجابة عن أسئلة المستخدمين بدقة واحترافية عالية بالاعتماد على سياق المادة التعليمية المرفقة بالأسفل (سواء كانت تفريغ فيديو يوتيوب، محتوى مساق من Coursera، أو مقال/مدونة من موقع تعليمي).

قواعد صارمة للإجابة والتفاعل (بشخصية AXIOM الهندسية):
1. يجب أن تكون إجابتك باللغة العربية الفصحى، بأسلوب خبير هندسي وتقني مخضرم، واضح ومنظم للغاية ومنسق بشكل ممتاز.
2. أجب فقط من خلال المعلومات المذكورة في سياق المادة التعليمية المرفقة.
3. إذا لم تكن الإجابة موجودة في السياق، وضح ذلك بأدب ("هذه المعلومة غير مذكورة في المصدر ولكن...")، ثم قدم إجابة هندسية وعلمية دقيقة من ذاكرتك التقنية العامة مع توضيح أنها إضافية ومكملة للمصدر.
4. استخدم التنسيق المنسق الجميل (Markdown) بشكل كامل مثل العناوين الفرعية، القوائم المنقطة، الكلمات الهامة (Bold)، وبلوكات الأكواد البرمجية الملونة إذا لزم الأمر.
5. ${isYouTube ? 'أشر دائماً إلى التوقيت الزمني (مثال: [04:15]) عند مناقشة مواضيع تم اقتباسها من هذا التوقيت في الشرح.' : 'أشر دائماً إلى رقم القسم (مثال: [القسم 2]) عند الإشارة إلى أجزاء تم اقتباسها من هذا القسم في الشرح.'}
6. إذا طلب المستخدم "اختبار"، "أسئلة"، "سؤال"، "تقييم"، "اختبرني"، "quiz" (أو إذا كان السؤال يحمل معنى تقييم الفهم أو طلب المزيد من الأسئلة)، قم بصياغة اختبار تفاعلي (Quiz) يحتوي على 10 أسئلة اختيار من متعدد (MCQ) متعلقة بمحتوى المادة.
   هام جداً: يجب عليك قراءة تاريخ الدردشة (chatHistory) المرفق أدناه، وإذا كان هناك أسئلة اختبار قد تم تقديمها مسبقاً، فيجب أن تكون الـ 10 أسئلة الجديدة مختلفة تماماً وغير مكررة في الأفكار أو الصياغة لتغطية جوانب جديدة من المادة.
   أرفق هيكل هذا الاختبار في حقل "quiz" في مخرجات الـ JSON كما هو موضح بالأسفل. وفي حال لم يطلب اختباراً، ضع قيمة حقل "quiz" كـ null.

تنسيق الاستجابة المطلوبة:
يجب أن تكون مخرجاتك عبارة عن كائن JSON صالح بنسبة 100% يحتوي على الحقول التالية فقط وبدون أي إضافات خارج الهيكل:
{
  "text": "نص الإجابة العربية المنسقة بالكامل بـ Markdown مع الإشارة للـ ${isYouTube ? 'timestamps' : 'الأقسام'} للفقرات...",
  "timestamp": "${isYouTube ? 'التوقيت الزمني التقريبي لبداية موضوع السؤال كـ MM:SS' : 'رقم القسم التقريبي لموضوع السؤال كـ القسم X'}",
  "quiz": [
    {
      "id": 1,
      "question": "السؤال الأول حول محتوى المادة؟",
      "options": ["الخيار الأول", "الخيار الثاني (الافتراض الصحيح مثلاً)", "الخيار الثالث", "الخيار الرابع"],
      "correctIndex": 1,
      "explanation": "شرح سبب صحة هذا الخيار بالتحديد بناءً على ما جاء في المصدر..."
    }
  ]
}

سياق المادة التعليمية المتاحة حالياً كمرجع لك:
--------------------
${contextText}
--------------------`;

        // 4. Format chat history
        const formattedMessages = [];
        if (chatHistory && Array.isArray(chatHistory)) {
            // Include last 16 messages for conversational context to prevent token bloat and avoid quiz question overlap
            const limitedHistory = chatHistory.slice(-16);
            for (const msg of limitedHistory) {
                formattedMessages.push({
                    role: msg.sender === 'user' ? 'user' : 'assistant',
                    content: msg.text
                });
            }
        }

        // 5. Call Groq Completions API with Llama 3.3 70B model in JSON mode with automatic resilient fallback to Llama 3.1 8B model and AbortController timeouts
        let groqResponse;
        let responseData;

        // Primary attempt: llama-3.3-70b-versatile with 4 seconds timeout
        const primaryController = new AbortController();
        const primaryTimeoutId = setTimeout(() => primaryController.abort(), 4000);

        try {
            groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${GROQ_API_KEY}`
                },
                body: JSON.stringify({
                    model: 'llama-3.3-70b-versatile',
                    messages: [
                        { role: 'system', content: systemPrompt },
                        ...formattedMessages,
                        { role: 'user', content: question }
                    ],
                    temperature: 0.3,
                    response_format: { type: 'json_object' }
                }),
                signal: primaryController.signal
            });
            clearTimeout(primaryTimeoutId);

            if (!groqResponse.ok) {
                const errBody = await groqResponse.text();
                console.warn('Groq 70B model failed or rate-limited. Error:', errBody);
                throw new Error(`GROQ_70B_FAILED: ${errBody}`);
            }
            responseData = await groqResponse.json();
        } catch (error: any) {
            clearTimeout(primaryTimeoutId);
            const isTimeout = error.name === 'AbortError';
            console.warn(`Groq primary attempt ${isTimeout ? 'TIMED OUT' : 'FAILED'}, initiating fallback to llama-3.1-8b-instant... Error:`, error.message || error);
            
            // Fallback attempt: llama-3.1-8b-instant with 5 seconds timeout
            const fallbackController = new AbortController();
            const fallbackTimeoutId = setTimeout(() => fallbackController.abort(), 5000);

            try {
                groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${GROQ_API_KEY}`
                    },
                    body: JSON.stringify({
                        model: 'llama-3.1-8b-instant',
                        messages: [
                            { role: 'system', content: systemPrompt },
                            ...formattedMessages,
                            { role: 'user', content: question }
                        ],
                        temperature: 0.3,
                        response_format: { type: 'json_object' }
                    }),
                    signal: fallbackController.signal
                });
                clearTimeout(fallbackTimeoutId);

                if (!groqResponse.ok) {
                    const errBody = await groqResponse.text();
                    console.error('Groq API fallback model also returned an error:', errBody);
                    throw new Error(`فشل محرك الذكاء الاصطناعي في الاستجابة (خطأ من Groq: ${errBody.substring(0, 150)})`);
                }

                responseData = await groqResponse.json();
            } catch (fallbackError: any) {
                clearTimeout(fallbackTimeoutId);
                const isFallbackTimeout = fallbackError.name === 'AbortError';
                console.error(`Groq API fallback model also ${isFallbackTimeout ? 'TIMED OUT' : 'FAILED'}:`, fallbackError);
                throw new Error(`فشل محرك الذكاء الاصطناعي في الاستجابة (تفاصيل الخطأ: ${isFallbackTimeout ? 'انتهاء وقت الاتصال بالخادم' : (fallbackError.message || fallbackError)})`);
            }
        }

        const rawContent = responseData.choices[0].message.content.trim();

        // 6. Parse and structure the response
        let finalResponse = {
            text: rawContent,
            timestamp: approximateRef,
            quiz: null
        };

        try {
            const parsed = JSON.parse(rawContent);
            finalResponse = {
                text: parsed.text || parsed.answer || rawContent,
                timestamp: parsed.timestamp || approximateRef,
                quiz: parsed.quiz || null
            };
        } catch (parseError) {
            console.warn('Failed to parse Groq response as JSON, falling back to raw text payload:', parseError);
        }

        return NextResponse.json(finalResponse, { headers: corsHeaders() });

    } catch (error: any) {
        console.error('Ask API Global Error:', error.message);
        return NextResponse.json({ 
            error: error.message || 'حدث خطأ أثناء الاتصال بمحرك الذكاء الاصطناعي وإعداد الرد' 
        }, { status: 500, headers: corsHeaders() });
    }
}
