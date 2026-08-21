import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/src/utils/supabaseAdmin';
import { adminDb } from '@/src/config/firebase-admin';
import { getAzureAiClient, AZURE_AI_MODEL } from '@/src/config/azure-ai';

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

        // 2. Build Context from relevant chunks
        let contextText = '';
        let approximateRef = '';

        if (relevantChunks && relevantChunks.length > 0) {
            contextText = relevantChunks
                .map((chunk: any) => `[الوقت: ${formatTime(chunk.start_time)}] ${chunk.text}`)
                .join('\n\n');

            const firstChunkTime = relevantChunks[0].start_time || 0;
            approximateRef = formatTime(firstChunkTime);
        } else {
            contextText = 'لا يتوفر تفريغ نصي دقيق لهذه اللحظة، يرجى الإجابة بناءً على الفهم العام لمحتوى الفيديو.';
            approximateRef = '00:00';
        }

        // 3. System Prompt for strict JSON response format
        const systemPrompt = `أنت مساعد تعليمي ذكي مدمج داخل منصة Tolzy OmniLearn.
مهمتك هي الإجابة عن أسئلة الطالب بناءً على محتوى وتفريغ الفيديو المرفق، وتقديم تجربة تعليمية تفاعلية.

القواعد الصارمة:
1. أجب باللغة العربية بأسلوب واضح ومباشر ومشجع.
2. اعتمد على سياق الفيديو أدناه كمصدر رئيسي. إذا لم تكن المعلومة مذكورة بوضوح، أجب بأفضل معرفة عامة ذات صلة مع التنويه بلطف.
3. يجب أن تكون إجابتك بصيغة JSON حصراً بدون أي نصوص أو markdown خارج كائن الـ JSON.
4. إذا كان السؤال متعلقاً بمفهوم تعليمي أو اختباري، يمكنك تضمين كويز سريع اختياري (quiz) لقياس فهم الطالب.

هيكل الـ JSON المطلوب بدقة:
{
  "text": "نص الإجابة التفصيلي والمنسق باللغة العربية",
  "timestamp": "${approximateRef}",
  "quiz": null // أو كائن كويز إذا كان مناسباً للسؤال: { "question": "السؤال", "options": ["أ", "ب", "ج", "د"], "correctAnswer": 0, "explanation": "التفسير" }
}

سياق المادة التعليمية المتاحة حالياً كمرجع لك:
--------------------
${contextText}
--------------------`;

        // 4. Format chat history
        const formattedMessages: any[] = [];
        if (chatHistory && Array.isArray(chatHistory)) {
            const limitedHistory = chatHistory.slice(-16);
            for (const msg of limitedHistory) {
                formattedMessages.push({
                    role: msg.sender === 'user' ? 'user' : 'assistant',
                    content: msg.text
                });
            }
        }

        // 5. Call Azure AI completions
        const openai = getAzureAiClient();
        const completion = await openai.chat.completions.create({
            model: AZURE_AI_MODEL,
            messages: [
                { role: 'system', content: systemPrompt },
                ...formattedMessages,
                { role: 'user', content: question }
            ],
            temperature: 0.3,
            response_format: { type: 'json_object' }
        });

        const rawContent = completion.choices[0]?.message?.content?.trim() || '{}';

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
            console.warn('Failed to parse Azure AI response as JSON, falling back to raw text payload:', parseError);
        }

        return NextResponse.json(finalResponse, { headers: corsHeaders() });

    } catch (error: any) {
        console.error('Ask API Global Error:', error.message);
        return NextResponse.json({ 
            error: error.message || 'حدث خطأ أثناء الاتصال بمحرك الذكاء الاصطناعي وإعداد الرد' 
        }, { status: 500, headers: corsHeaders() });
    }
}
