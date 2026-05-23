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

        // --- Plan check: Ask YouTube Learn is Pro/Ultra only ---
        if (adminDb) {
            try {
                const userRef = adminDb.collection('users').doc(userId);
                const userSnap = await userRef.get();
                const userData = userSnap.data();
                const userPlan = String(userData?.plan || 'free').toLowerCase();
                const isPro = userPlan.includes('pro') || userPlan.includes('ultra');

                if (!isPro) {
                    return NextResponse.json({
                        error: 'عذراً، ميزة Ask YouTube Learn متوفرة فقط لمشتركي باقة Pro. يرجى ترقية حسابك للاستفادة منها.'
                    }, { status: 403, headers: corsHeaders() });
                }
            } catch (e) {
                console.error('YouTube Learn ask plan check error:', e);
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

        // 2. Format context text with precise timestamps
        const contextText = relevantChunks && relevantChunks.length > 0 
            ? relevantChunks.map((c: any) => `[T-Timestamp: ${formatTime(Number(c.start_time))}] ${c.text}`).join('\n\n')
            : 'نص تفريغ الفيديو غير متوفر حالياً.';

        // Approximate timestamp of the first matched chunk as reference
        const firstMatchStartTime = relevantChunks && relevantChunks.length > 0 ? Number(relevantChunks[0].start_time) : 0;
        const approximateTimestamp = formatTime(firstMatchStartTime);

        // 3. Construct System Prompt with strict Arabic RAG instructions
        const systemPrompt = `أنت مساعد تعليمي ذكي ومحترف لمنصة Tolzy Learn الفائقة الجودة.
مهمتك هي الإجابة عن أسئلة المستخدمين بدقة واحترافية بالاعتماد حصرياً على سياق تفريغ الفيديو (Video Transcript Context) المرفق بالأسفل.

قواعد صارمة للإجابة والتفاعل:
1. يجب أن تكون إجابتك باللغة العربية الفصحى، بأسلوب علمي راقٍ وجميل ومنسق بشكل ممتاز.
2. أجب فقط من خلال المعلومات المذكورة في سياق تفريغ الفيديو المرفق.
3. إذا لم تكن الإجابة موجودة في السياق، وضح ذلك بأدب ("هذه المعلومة غير مذكورة في الفيديو الشارح ولكن...")، ثم قدم إجابة عامة مختصرة ودقيقة مع توضيح أنها إضافية وليست من الفيديو.
4. استخدم التنسيق المنسق الجميل (Markdown) بشكل كامل مثل العناوين الفرعية، القوائم المنقطة، وإبراز الكلمات الهامة (Bold).
5. أشر دائماً إلى التوقيت الزمني (مثال: [04:15]) عند مناقشة مواضيع تم اقتباسها من هذا التوقيت في الشرح.
6. إذا طلب المستخدم "اختبار"، "أسئلة"، "سؤال"، "تقييم"، "اختبرني"، "quiz" (أو إذا كان السؤال يحمل معنى تقييم الفهم)، قم بصياغة اختبار تفاعلي (Quiz) يحتوي على 3 أسئلة اختيار من متعدد متعلقة بمحتوى الفيديو. أرفق هيكل هذا الاختبار في حقل "quiz" في مخرجات الـ JSON كما هو موضح بالأسفل. وفي حال لم يطلب اختباراً، ضع قيمة حقل "quiz" كـ null.

تنسيق الاستجابة المطلوبة:
يجب أن تكون مخرجاتك عبارة عن كائن JSON صالح بنسبة 100% يحتوي على الحقول التالية فقط وبدون أي إضافات خارج الهيكل:
{
  "text": "نص الإجابة العربية المنسقة بالكامل بـ Markdown مع الإشارة للـ timestamps للفقرات...",
  "timestamp": "التوقيت الزمني التقريبي لبداية موضوع السؤال كـ MM:SS (مثال: '${approximateTimestamp}')",
  "quiz": [
    {
      "id": 1,
      "question": "السؤال الأول حول محتوى الفيديو؟",
      "options": ["الخيار الأول", "الخيار الثاني (الافتراض الصحيح مثلاً)", "الخيار الثالث", "الخيار الرابع"],
      "correctIndex": 1,
      "explanation": "شرح سبب صحة هذا الخيار بالتحديد بناءً على ما جاء في الفيديو..."
    }
  ]
}

سياق الفيديو المتاح حالياً كمرجع لك:
--------------------
${contextText}
--------------------`;

        // 4. Format chat history
        const formattedMessages = [];
        if (chatHistory && Array.isArray(chatHistory)) {
            // Include last 8 messages for conversational context to prevent token bloat
            const limitedHistory = chatHistory.slice(-8);
            for (const msg of limitedHistory) {
                formattedMessages.push({
                    role: msg.sender === 'user' ? 'user' : 'assistant',
                    content: msg.text
                });
            }
        }

        // 5. Call Groq Completions API with Llama 3.3 70B model in JSON mode
        const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
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
            })
        });

        if (!groqResponse.ok) {
            const errBody = await groqResponse.text();
            console.error('Groq API returned an error:', errBody);
            throw new Error('فشل محرك الذكاء الاصطناعي في الاستجابة، يرجى المحاولة لاحقاً');
        }

        const data = await groqResponse.json();
        const rawContent = data.choices[0].message.content.trim();

        // 6. Parse and structure the response
        let finalResponse = {
            text: rawContent,
            timestamp: approximateTimestamp,
            quiz: null
        };

        try {
            const parsed = JSON.parse(rawContent);
            finalResponse = {
                text: parsed.text || parsed.answer || rawContent,
                timestamp: parsed.timestamp || approximateTimestamp,
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
