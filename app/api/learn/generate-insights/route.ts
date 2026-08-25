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

function buildFallbackFlashcards(title: string, description: string, chunks: any[]) {
    const cards: any[] = [];
    
    cards.push({
        id: 1,
        term: title || "المفهوم الأساسي للمادة",
        definition: description ? description.slice(0, 160) : "المفهوم الجوهري الذي يتمحور حوله هذا المحتوى التعليمي وتطبيقاته العملية.",
        category: "مفهوم رئيسي",
        timestamp: "00:00"
    });

    if (chunks && Array.isArray(chunks) && chunks.length > 0) {
        const sampleChunks = chunks.slice(0, 5);
        sampleChunks.forEach((chunk: any, idx: number) => {
            const text = (chunk.text || '').trim();
            if (text.length > 20) {
                const firstSentence = text.split(/[.،\n]/)[0] || `القسم التعليمي ${idx + 1}`;
                const term = firstSentence.length > 40 ? firstSentence.slice(0, 40) + '...' : firstSentence;
                const definition = text.length > 180 ? text.slice(0, 180) + '...' : text;
                const timeSec = chunk.start_time || (idx * 60);
                const timeStr = `${Math.floor(timeSec / 60)}:${(Math.floor(timeSec % 60)).toString().padStart(2, '0')}`;

                cards.push({
                    id: cards.length + 1,
                    term: term || `المحور التعليمي ${idx + 1}`,
                    definition: definition,
                    category: idx % 2 === 0 ? "بنية وتطوير" : "تطبيق عملي",
                    timestamp: timeStr
                });
            }
        });
    }

    const defaultConcepts = [
        { term: "المعمارية البرمجية (Architecture)", definition: "تنظيم وتنسيق أجزاء النظام لضمان قابلية التوسع والصيانة العالية.", category: "بنية برمجية" },
        { term: "أفضل الممارسات (Best Practices)", definition: "الأساليب والأنماط الهندسية المجربة لتحقيق أقصى أداء وحماية للبرمجيات.", category: "كفاءة وأداء" },
        { term: "التطبيق والتنفيذ (Implementation)", definition: "تحويل المفاهيم النظرية إلى كود تنفيذي يعمل بسلاسة في بيئة الإنتاج.", category: "تطبيق عملي" }
    ];

    while (cards.length < 4) {
        const nextConcept = defaultConcepts[cards.length - 1] || defaultConcepts[0];
        cards.push({
            id: cards.length + 1,
            term: nextConcept.term,
            definition: nextConcept.definition,
            category: nextConcept.category,
            timestamp: "01:00"
        });
    }

    return cards;
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { videoId, title, description, chunks } = body;

        if (!videoId && !title) {
            return NextResponse.json({ error: 'videoId or title is required' }, { status: 400, headers: corsHeaders() });
        }

        // Prepare context text from chunks or description
        let contextText = '';
        if (chunks && Array.isArray(chunks) && chunks.length > 0) {
            contextText = chunks
                .slice(0, 10)
                .map((c: any, i: number) => `[قسم ${i + 1}${c.start_time ? ` - توقيت: ${Math.floor(c.start_time / 60)}:${(Math.floor(c.start_time % 60)).toString().padStart(2, '0')}` : ''}]: ${c.text}`)
                .join('\n\n');
        } else {
            contextText = `عنوان المحتوى: ${title}\n\nالوصف والملخص:\n${description || ''}`;
        }

        const prompt = `أنت "Tolzy OmniTutor 🎓" — خبير هندسة البرمجيات والتلخيص التعليمي الذكي.
قم بتحليل محتوى المادة التعليمية التالية واستخراج:
1. "summary": مصفوفة (Array) تحتوي على 4 إلى 5 نقاط أساسية كملخص تنفيذي مركز جداً وشامل (TL;DR)، مكتوبة بلغة عربية احترافية مع إضافة إيموجي مميز في بداية كل نقطة.
2. "flashcards": مصفوفة (Array) تحتوي على 6 بطاقات تعليمية (Flashcards) لأهم المفاهيم، المصطلحات، أو التقنيات المذكورة في المحتوى. كل بطاقة تحتوي على:
   - "id": رقم تسلسلي (1 إلى 6)
   - "term": اسم المصطلح أو المفهوم باللغة العربية مع المصطلح بالإنجليزية إن وجد
   - "definition": شرح مبسط وعميق وواضح للمصطلح في سطرين
   - "category": تصنيف المصطلح (مثل: أداء، أمان، بنية، مكتبات، ذكاء اصطناعي، قواعد بيانات)
   - "timestamp": التوقيت التقريبي في الفيديو إن وجد (مثل: "02:15")

---
بيانات المادة:
العنوان: ${title}
المحتوى والتفريغ:
${contextText.slice(0, 6000)}

---
المخرج المطلوب بدقة JSON (Strict JSON):
{
  "summary": [
    "🚀 النقطة الأولى...",
    "💡 النقطة الثانية...",
    "⚙️ النقطة الثالثة...",
    "🔒 النقطة الرابعة..."
  ],
  "flashcards": [
    {
      "id": 1,
      "term": "اسم المفهوم (Concept)",
      "definition": "الشرح الدقيق للمفهوم...",
      "category": "بنية برمجية",
      "timestamp": "01:30"
    }
  ]
}`;

        const openai = getAzureAiClient();
        const response = await openai.chat.completions.create({
            model: AZURE_AI_MODEL,
            messages: [{ role: "user", content: prompt }],
            temperature: 0.2,
            max_tokens: 2500,
            response_format: { type: "json_object" }
        });

        const rawContent = response.choices[0]?.message?.content?.trim() || '{}';
        let cleanJsonText = rawContent;
        if (cleanJsonText.includes('{')) {
            cleanJsonText = cleanJsonText.substring(cleanJsonText.indexOf('{'), cleanJsonText.lastIndexOf('}') + 1);
        }

        let parsed: any = {};
        try {
            parsed = JSON.parse(cleanJsonText);
        } catch (parseErr) {
            console.warn('JSON parse warning in generate-insights:', parseErr);
        }

        const summary = Array.isArray(parsed.summary) && parsed.summary.length > 0 ? parsed.summary : [
            `📌 ${title}: استعراض شامل لأهم المبادئ والتقنيات المطروحة.`,
            `💡 مناقشة المفاهيم الأساسية وتطبيقاتها العملية.`,
            `⚙️ توضيح أفضل الممارسات الهندسية لتحقيق أقصى كفاءة.`,
            `🎯 نصائح وتوجيهات عملية لتطبيق ما تم تعلمه في مشاريع حقيقية.`
        ];

        let rawCards = parsed.flashcards || parsed.flashCards || parsed.cards || parsed.concepts || parsed.terms || [];
        const flashcards = Array.isArray(rawCards) && rawCards.length > 0 
            ? rawCards.map((c: any, idx: number) => ({
                id: idx + 1,
                term: c.term || c.title || c.concept || `مفهوم ${idx + 1}`,
                definition: c.definition || c.desc || c.description || c.explanation || "الشرح والتفاصيل البرمجية لهذا المفهوم.",
                category: c.category || "مفهوم تقني",
                timestamp: c.timestamp || "00:00"
            }))
            : buildFallbackFlashcards(title, description, chunks);

        return NextResponse.json({
            summary,
            flashcards
        }, { headers: corsHeaders() });

    } catch (error: any) {
        console.error('Generate Insights Error:', error);
        const { title = 'المادة التعليمية', description = '', chunks = [] } = (await req.json().catch(() => ({}))) || {};
        return NextResponse.json({
            summary: [
                `📌 ${title}: استعراض شامل لأهم المفاهيم والتقنيات المطروحة.`,
                `💡 شرح الأفكار الرئيسية وتطبيقاتها العملية.`,
                `⚙️ التركيز على أفضل الممارسات الهندسية والبرمجية.`
            ],
            flashcards: buildFallbackFlashcards(title, description, chunks)
        }, { headers: corsHeaders() });
    }
}
