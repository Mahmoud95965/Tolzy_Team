import { NextRequest, NextResponse } from 'next/server';
import { getAzureAiClient, AZURE_AI_MODEL } from '@/src/config/azure-ai';

export const maxDuration = 60;

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

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { videoId, title, description, chunks } = body;

        if (!videoId && !title) {
            return NextResponse.json({ error: 'videoId or title is required' }, { status: 400, headers: corsHeaders() });
        }

        // Prepare context text from chunks
        let contextText = '';
        if (chunks && Array.isArray(chunks) && chunks.length > 0) {
            contextText = chunks
                .slice(0, 10)
                .map((c: any, i: number) => `[قسم ${i + 1}${c.start_time ? ` - توقيت: ${Math.floor(c.start_time / 60)}:${(Math.floor(c.start_time % 60)).toString().padStart(2, '0')}` : ''}]: ${c.text}`)
                .join('\n\n');
        } else {
            contextText = `عنوان المحتوى: ${title}\n\nالوصف والملخص:\n${description || ''}`;
        }

        const prompt = `أنت "Tolzy OmniLearn 🎓" — خبير التقييم التعليمي وصياغة الاختبارات الذكية التفاعلية.
قم بصياغة اختبار استيعابي تفاعلي احترافي مكون من 5 أسئلة اختيار من متعدد (Multiple Choice Questions) يقيس الفهم العميق والمفاهيمي للمادة التعليمية أدناه.

---
بيانات المادة:
العنوان: ${title}
المحتوى والتفريغ:
${contextText.slice(0, 6000)}

---
معايير الأسئلة:
1. أن تغطي الأسئلة الـ 5 مختلف أقسام ومراحل الفيديو (بداية، وسط، خاتمة).
2. أن تكون الأسئلة ذكية وتقيس الفهم والتطبيق وليست مجرد حفظ نصوص.
3. لكل سؤال 4 خيارات واضحة وغير مكررة.
4. تحديد فهرس الخيار الصحيح بدقة في "correctIndex" (رقم من 0 إلى 3).
5. تقديم "explanation" تفسيري ممتع ومقنع يوضح سبب صحة الإجابة.
6. إضافة "timestamp" التوقيت التقريبي في الفيديو (مثل "02:15") لمساعدة الطالب على مراجعة اللقطة.

---
المخرج المطلوب بدقة JSON (Strict JSON):
{
  "quiz": [
    {
      "id": 1,
      "question": "نص السؤال الأول...",
      "options": [
        "الخيار الأول",
        "الخيار الثاني",
        "الخيار الثالث",
        "الخيار الرابع"
      ],
      "correctIndex": 1,
      "explanation": "شرح واضح لسبب صحة هذا الخيار...",
      "timestamp": "01:45"
    }
  ]
}`;

        const openai = getAzureAiClient();
        const response = await openai.chat.completions.create({
            model: AZURE_AI_MODEL,
            messages: [{ role: "user", content: prompt }],
            temperature: 0.3,
            max_tokens: 3000,
            response_format: { type: "json_object" }
        });

        const rawContent = response.choices[0]?.message?.content?.trim() || '{}';
        let cleanJsonText = rawContent;
        if (cleanJsonText.includes('{')) {
            cleanJsonText = cleanJsonText.substring(cleanJsonText.indexOf('{'), cleanJsonText.lastIndexOf('}') + 1);
        }

        const parsed = JSON.parse(cleanJsonText);
        const quiz = Array.isArray(parsed.quiz) && parsed.quiz.length > 0 ? parsed.quiz : [
            {
                id: 1,
                question: `ما هو الهدف الأساسي من دراسة "${title}"؟`,
                options: [
                    "فهم المبادئ وتطبيقها البرمجي بكفاءة",
                    "حفظ الأكواد دون فهم",
                    "استبدال جميع التقنيات الأخرى",
                    "تسريع سرعة الإنترنت فقط"
                ],
                correctIndex: 0,
                explanation: "الهدف الجوهري هو فهم آليات العمل وتطبيق الممارسات المثالية لتطوير برمجيات عالية الجودة.",
                timestamp: "00:00"
            }
        ];

        return NextResponse.json({ quiz }, { headers: corsHeaders() });

    } catch (error: any) {
        console.error('Generate Quiz Error:', error);
        return NextResponse.json({
            quiz: [
                {
                    id: 1,
                    question: `ما هو المفهوم الرئيسي الموضح في المادة؟`,
                    options: [
                        "التطبيق العملي للمفاهيم الهندسية المطروحة",
                        "تجاهل أفضل الممارسات",
                        "الاعتماد على الحلول القديمة فقط",
                        "عدم كتابة أي كود برمجي"
                    ],
                    correctIndex: 0,
                    explanation: "يركز المحتوى على التطبيق العملي وبناء حلول برمجية مستدامة.",
                    timestamp: "00:00"
                }
            ]
        }, { headers: corsHeaders() });
    }
}
