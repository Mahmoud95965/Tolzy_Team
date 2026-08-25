import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/src/utils/supabaseAdmin';
import { getAzureAiClient, AZURE_AI_MODEL } from '@/src/config/azure-ai';
import { checkAndConsumeAiQuota, recordActualTokenUsage } from '@/src/lib/ai-quota';

export const maxDuration = 60;

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

        // --- Unified AI Token Quota Check ---
        const quota = await checkAndConsumeAiQuota(userId, undefined, 400);
        if (!quota.allowed) {
            return NextResponse.json({
                error: quota.error || 'لقد استهلكت رصيد التوكنات المتاح في باقتك. يرجى الترقية لفتح المزيد!'
            }, { status: 429, headers: corsHeaders() });
        }

        if (!videoId || !question) {
            return NextResponse.json({ error: 'videoId and question are required' }, { status: 400, headers: corsHeaders() });
        }

        // 1. Retrieve the most relevant transcript chunks using Supabase Full-Text / Keyword search
        const { data: chunks, error: rpcError } = await supabaseAdmin.rpc('match_transcript_chunks', {
            p_video_id: videoId,
            p_query: question,
            p_limit: 6
        });

        let relevantChunks = chunks;

        // Fallback 1: Manual ilike search if RPC fails or returns empty results
        if (rpcError || !relevantChunks || relevantChunks.length === 0) {
            if (rpcError) {
                console.warn('RPC match_transcript_chunks failed, using fallback manual search:', rpcError);
            }
            
            const { data: fallbackChunks } = await supabaseAdmin
                .from('youtube_transcript_chunks')
                .select('*')
                .eq('video_id', videoId)
                .ilike('text', `%${question}%`)
                .limit(6);

            relevantChunks = fallbackChunks;
        }

        // Fallback 2: Comprehensive distributed coverage across the video if no exact match is found
        if (!relevantChunks || relevantChunks.length === 0) {
            const { data: distributedChunks } = await supabaseAdmin
                .from('youtube_transcript_chunks')
                .select('*')
                .eq('video_id', videoId)
                .order('chunk_index', { ascending: true })
                .limit(8); // سحب سياق أكبر حتى يمتلك الموديل نظرة شاملة عن الفيديو
            
            relevantChunks = distributedChunks;
        }

        // 2. Build Context from relevant chunks
        let contextText = '';
        let approximateRef = '00:00';

        if (relevantChunks && relevantChunks.length > 0) {
            contextText = relevantChunks
                .map((chunk: any) => `[الوقت: ${formatTime(chunk.start_time || 0)}] ${chunk.text}`)
                .join('\n\n');

            const firstChunkTime = relevantChunks[0].start_time || 0;
            approximateRef = formatTime(firstChunkTime);
        } else {
            contextText = 'لا يتوفر تفريغ نصي دقيق لهذه اللحظة، يرجى الإجابة بناءً على الفهم العام لمحتوى الفيديو.';
        }

        // 3. System Prompt for strict JSON response format
        const systemPrompt = `أنت **"Tolzy OmniLearn 🎓"** — المعلم الذكي التفاعلي المتقدم داخل منصة **Tolzy OmniLearn**.
مهمتك هي مساعدة الطالب في استيعاب المادة التعليمية للفيديو بأعلى كفاءة وتقديم تجربة تعليمية شيقة وشخصية.

---

### 🌟 المبادئ البيداغوجية والتعليمية:
1. **الشرح المبسط والعميق**: اشرح المفاهيم بأسلوب مشجع وواضح جداً، مع استخدام الأمثلة العملية والتشبيهات اليومية التي ترسخ الفهم.
2. **الاستناد للتفريغ النصي**: استخدم نصوص وتوقيتات الفيديو أدناه كمرجعك الأساسي، ووجه الطالب للوقت التقريبي (${approximateRef}) في الفيديو متى ما كان ذلك مفيداً.
3. **التنسيق الجمالي**: نسق نص الإجابة بـ Markdown (عناوين خفيفة، نقاط، وتمييز الكلمات المفتاحية بالخط العريض).
4. **الاختبار التفاعلي الذكي (Quiz Generation)**:
   - إذا سأل الطالب سؤالاً مفهومياً أو تعليمياً أو طلب اختبار فهمه، قم بإنشاء كائن \`quiz\` اختباري رائع لقياس الفهم الفوري.
   - الكويز يجب أن يحتوي على: سؤال ذكي، 4 خيارات، فهرس الإجابة الصحيحة (\`correctAnswer\`: 0-3)، وتفسير تعليمي واضح وممتع (\`explanation\`).

---

### 📦 صيغة الـ JSON المطلوبة بدقة (Strict Output):
{
  "text": "نص الشرح والإجابة الوافية والمنسقة باللغة العربية مع دعم Markdown",
  "timestamp": "${approximateRef}",
  "quiz": null // أو كائن: { "question": "السؤال الاختباري", "options": ["الخيار 1", "الخيار 2", "الخيار 3", "الخيار 4"], "correctAnswer": 0, "explanation": "تفسير سبب صحة هذه الإجابة" }
}

---

## 🎬 سياق المادة وتفريغ الفيديو المتاح حالياً:
${contextText}`;

        // 4. Format chat history
        const formattedMessages: any[] = [];
        if (chatHistory && Array.isArray(chatHistory)) {
            const limitedHistory = chatHistory.slice(-12);
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
            max_tokens: 2500,
            response_format: { type: 'json_object' }
        });

        const actualTokens = completion.usage?.total_tokens || 400;
        await recordActualTokenUsage(userId, actualTokens, 400);

        const rawContent = completion.choices[0]?.message?.content?.trim() || '{}';

        // 6. Robust Parse and structure the response
        let finalResponse = {
            text: rawContent,
            timestamp: approximateRef,
            quiz: null
        };

        try {
            let cleanJsonText = rawContent;
            if (cleanJsonText.includes('{')) {
                cleanJsonText = cleanJsonText.substring(cleanJsonText.indexOf('{'), cleanJsonText.lastIndexOf('}') + 1);
            }
            const parsed = JSON.parse(cleanJsonText);
            finalResponse = {
                text: parsed.text || parsed.answer || rawContent,
                timestamp: parsed.timestamp || approximateRef,
                quiz: parsed.quiz || null
            };
        } catch (parseError) {
            console.warn('Failed to parse Azure AI response as JSON, falling back to raw text:', parseError);
        }

        return NextResponse.json(finalResponse, { headers: corsHeaders() });

    } catch (error: any) {
        console.error('Ask API Global Error:', error.message);
        return NextResponse.json({ 
            error: error.message || 'حدث خطأ أثناء الاتصال بمحرك الذكاء الاصطناعي وإعداد الرد' 
        }, { status: 500, headers: corsHeaders() });
    }
}
