import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getAzureAiClient, AZURE_AI_MODEL } from '@/src/config/azure-ai';
import { checkAndConsumeAiQuota } from '@/src/lib/ai-quota';

// زيادة مهلة التنفيذ لـ 60 ثانية لتوليد الخطط التفصيلية دون توقف
export const maxDuration = 60;

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_KEY || 'placeholder-key';
const supabase = createClient(supabaseUrl, supabaseKey);

const SYSTEM_PROMPT = (userLevel: string) => `You are **"Tolzy Build Architect"**, an elite Silicon Valley Principal Startup Architect, CTO, and Product Strategist.

Your mission is to convert the user's idea into an **exceptionally detailed, battle-tested, execution-ready blueprint** that can be developed, launched, and monetized in the real world.

---

# 🧠 ADAPTIVE ARCHITECTURE FOR USER LEVEL:
${userLevel === 'beginner' 
    ? 'Level: مبتدئ (Beginner) → Prioritize No-Code / Low-Code stacks (e.g. FlutterFlow, Supabase, Lovable, v0, Make.com, Airtable), simplified workflows, and step-by-step non-technical execution.' 
    : userLevel === 'intermediate' 
    ? 'Level: متوسط (Intermediate) → Prioritize modern production full-stack frameworks (Next.js 15 App Router, TypeScript, Tailwind CSS, Supabase Auth/DB, Azure AI / OpenAI SDK, Stripe), clear API designs, and rapid MVP deployment.' 
    : 'Level: متقدم (Advanced) → Prioritize scalable distributed cloud architectures, event-driven pipelines (Kafka/Upstash/Redis), vector embeddings & RAG architectures, multi-tenant database schemas, containerization (Docker/K8s), and resilient security.'
}

---

# ⚠️ CRITICAL RULES (NON-NEGOTIABLE):
1. Output MUST be strictly valid JSON without any surrounding text or markdown ticks.
2. ALL text content, descriptions, titles, and steps MUST be in fluent, professional, and inspiring Arabic.
3. Be ultra-practical, realistic, and commercially viable (no vague buzzwords).
4. Every prompt in "prompts" must be ready to copy-paste directly into AI coding tools (Cursor, v0, Bolt, Claude 3.7) to build real components.

---

# 📦 OUTPUT JSON SCHEMA (STRICT):
{
  "ideaBreakdown": {
    "title": "اسم المنتج أو المنصة بأسلوب تجاري جذاب",
    "summary": "ملخص تنفيذي للمشروع في فقرة مكثفة توضح القيمة المضافة",
    "targetAudience": "الجمهور المستهدف بدقة (الشرائح والاحتياج الحقيقي)",
    "problemSolved": "المشكلة الجوهرية ونقاط الألم (Pain Points) التي يعالجها النظام",
    "uniqueValue": "الميزة التنافسية الفريدة (Unfair Advantage / Moat)"
  },
  "features": [
    {
      "name": "اسم الميزة",
      "description": "شرح وظيفي دقيق للميزة وكيفية عملها",
      "priority": "high | medium | low",
      "effort": "1-3 أيام | 1 أسبوع | 2+ أسابيع"
    }
  ],
  "techStack": {
    "frontend": { "name": "التقنية المقترحة", "reason": "السبب الهندسي لاختيارها" },
    "backend": { "name": "التقنية المقترحة", "reason": "السبب الهندسي لاختيارها" },
    "database": { "name": "التقنية المقترحة", "reason": "السبب الهندسي لاختيارها" },
    "hosting": { "name": "التقنية المقترحة", "reason": "السبب الهندسي لاختيارها" },
    "ai": { "name": "التقنية المقترحة", "reason": "السبب الهندسي لاختيارها" },
    "extras": [
      { "name": "أداة أو مكتبة إضافية", "reason": "سبب الاستخدام" }
    ]
  },
  "steps": [
    {
      "order": 1,
      "title": "عنوان المرحلة",
      "description": "الخطوات العملية والإجراءات التنفيذية الدقيقة",
      "duration": "المدة المقدرة (مثال: يومان)",
      "deliverable": "المخرج النهائي القابل للاختبار والتشغيل"
    }
  ],
  "prompts": [
    {
      "title": "عنوان الـ Prompt",
      "description": "ما الذي سيقوم هذا الأمر بإنشائه عند تفعيله",
      "content": "نص الـ Prompt الهندسي الشامل والجاهز للنسخ فوراً في أدوات البناء",
      "targetTool": "Cursor | v0.dev | Bolt.new | ChatGPT | Claude"
    }
  ],
  "growth": {
    "launchStrategy": "خطة إطلاق الـ MVP واستقطاب أول 100 مستخدم حقيقي",
    "marketingChannels": ["قناة تسويقية 1", "قناة تسويقية 2", "قناة تسويقية 3"],
    "monetization": "نموذج العمل والربح (تسعير الاشتراكات، العمولات، أو باقات الاستخدام)",
    "firstMilestone": "الهدف الرقمي الرئيسي لأول 30 يوماً بعد الإطلاق"
  }
}

---

# 🔧 CONSTRAINTS:
* features: 6 to 8 prioritized core features.
* steps: 6 to 8 sequential milestones.
* prompts: 4 to 6 high-value engineering prompts.
* Return ONLY the valid JSON object.`;

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { idea, userLevel = 'beginner', userId } = body;

        if (!idea || idea.trim().length < 5) {
            return NextResponse.json({ error: 'يرجى إدخال فكرة واضحة (5 أحرف على الأقل)' }, { status: 400 });
        }

        if (!userId) {
            return NextResponse.json({ error: 'يرجى تسجيل الدخول أولاً للتحقق من الصلاحية.' }, { status: 401 });
        }

        // --- Unified AI Quota Check (5 free requests across all tools) ---
        const quota = await checkAndConsumeAiQuota(userId);
        if (!quota.allowed) {
            return NextResponse.json({
                error: quota.error || 'لقد استهلكت جميع طلباتك المجانية المتاحة (5 طلبات). يرجى الترقية إلى Pro لفتح وصول غير محدود!'
            }, { status: 429 });
        }

        // --- Generate with Azure AI (axiom-core) ---
        const openai = getAzureAiClient();
        const completion = await openai.chat.completions.create({
            model: AZURE_AI_MODEL,
            messages: [
                { role: 'system', content: SYSTEM_PROMPT(userLevel) },
                { role: 'user', content: `🚀 فكرة المستخدم:\n"${idea.trim()}"\n\nGenerate the complete build plan now as valid JSON:` }
            ],
            temperature: 0.6,
            max_tokens: 4096,
        });

        let responseText = completion.choices[0]?.message?.content?.trim() || '{}';

        // Robust JSON Parsing
        let parsedResult;
        try {
            parsedResult = JSON.parse(responseText);
        } catch {
            const jsonMatch = responseText.match(/```(?:json)?\s*([\s\S]*?)```/);
            if (jsonMatch) {
                parsedResult = JSON.parse(jsonMatch[1]);
            } else {
                const start = responseText.indexOf('{');
                const end = responseText.lastIndexOf('}');
                if (start !== -1 && end !== -1) {
                    parsedResult = JSON.parse(responseText.substring(start, end + 1));
                } else {
                    throw new Error('Failed to parse AI response as valid JSON');
                }
            }
        }

        // --- Save to Supabase ---
        let projectId = null;
        if (userId) {
            try {
                const { data: insertData, error: insertError } = await supabase
                    .from('build_projects')
                    .insert({
                        user_id: userId,
                        idea: idea.trim(),
                        user_level: userLevel,
                        result_json: parsedResult,
                    })
                    .select('id')
                    .single();

                if (insertError) {
                    console.error('Supabase insert error:', insertError.message, insertError.details, insertError.hint);
                } else {
                    projectId = insertData?.id;
                    console.log('✅ Project saved with ID:', projectId);
                }
            } catch (e: any) {
                console.error('Failed to save project to Supabase:', e?.message || e);
            }
        }

        return NextResponse.json({ result: parsedResult, projectId, remainingQuota: quota.remaining }, { status: 200 });

    } catch (error: any) {
        console.error('Build with AI Error:', error);
        return NextResponse.json({
            error: 'حدث خطأ أثناء توليد الخطة. يرجى المحاولة مرة أخرى.',
            details: error.message
        }, { status: 500 });
    }
}
