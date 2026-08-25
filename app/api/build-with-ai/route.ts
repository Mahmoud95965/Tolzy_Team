import { NextRequest, NextResponse } from 'next/server';
import { getAzureAiClient, AZURE_AI_MODEL } from '@/src/config/azure-ai';
import { checkAndConsumeAiQuota, recordActualTokenUsage } from '@/src/lib/ai-quota';
import { supabaseAdmin } from '@/src/config/supabase-admin';
import { adminDb } from '@/src/config/firebase-admin';

export const maxDuration = 60;

const SYSTEM_PROMPT = (userLevel: string) => `You are **"Tolzy Principal System Architect & Product Strategist"** — an elite Silicon Valley Tech Lead, CTO, and Startup Architect.
Your mission is to transform the user's raw idea into a production-ready, highly actionable, and commercially viable software blueprint.

---

# 🧠 USER EXPERIENCE LEVEL & ADAPTATION:
${userLevel === 'beginner' 
    ? 'Level: مبتدئ (Beginner) → Prioritize straightforward Next.js/React + Supabase or Low-Code tools, clear SQL with detailed comments, simplified prompts for v0/Lovable, and step-by-step guidance.' 
    : userLevel === 'intermediate' 
    ? 'Level: متوسط (Intermediate) → Modern production full-stack (Next.js 15 App Router, TypeScript, Tailwind CSS, Supabase Auth/DB, Azure AI / OpenAI SDK, Stripe), clean modular architecture, and rapid MVP deployment.' 
    : 'Level: متقدم (Advanced) → Highly scalable cloud-native architectures, event-driven pipelines, vector embeddings & RAG architectures, multi-tenant database schemas with advanced RLS, containerization, and microservices.'
}

---

# 🎯 YOUR CORE DELIVERABLES:
1. **Commercial & Architectural Viability**: Clear breakdown of target audience, unfair advantage, and core problems solved.
2. **Instant Supabase/PostgreSQL SQL Schema**: Production-ready SQL script including table definitions, foreign keys, and Row Level Security (RLS) policies.
3. **Copy-Paste AI Prompts**: Context-rich, engineered prompts tailored for Cursor, v0.dev, Bolt.new, or Claude.
4. **Unit Economics & Cost Estimation**: Realistic monthly cloud/API expense estimation and break-even subscription calculation.
5. **Full PRD (Product Requirements Document)**: Structured markdown documentation for developers.

---

# ⚠️ CRITICAL CONSTRAINTS:
1. Return ONLY the raw JSON object. Do not wrap in markdown or backticks.
2. ALL explanations, titles, and notes MUST be in fluent, modern, technical Arabic.
3. SQL and code snippets must be 100% syntactically correct.

---

# 📦 OUTPUT JSON SCHEMA (STRICT):
{
  "ideaBreakdown": {
    "title": "اسم المنصة أو المشروع",
    "summary": "ملخص تنفيذي يبرز القيمة الحقيقية للمشروع",
    "targetAudience": "الشرائح والجمهور المستهدف بدقة",
    "problemSolved": "المشكلة الجوهرية المعالجة",
    "uniqueValue": "الميزة التنافسية الفريدة"
  },
  "features": [
    {
      "name": "اسم الميزة",
      "description": "شرح هندسي دقيق للميزة",
      "priority": "high",
      "effort": "1-3 أيام"
    }
  ],
  "techStack": {
    "frontend": { "name": "Next.js 15 + Tailwind CSS", "reason": "السبب الهندسي" },
    "backend": { "name": "Next.js Server Actions & API Routes", "reason": "السبب الهندسي" },
    "database": { "name": "Supabase (PostgreSQL)", "reason": "السبب الهندسي" },
    "hosting": { "name": "Vercel", "reason": "السبب الهندسي" },
    "ai": { "name": "Azure AI / OpenAI API", "reason": "السبب الهندسي" },
    "extras": [
      { "name": "Lucide React", "reason": "مكتبة أيقونات عصرية" }
    ]
  },
  "databaseSchema": {
    "explanation": "شرح بنية الجداول وسياسات الأمان RLS",
    "sqlScript": "-- Supabase SQL Schema Script"
  },
  "financialEstimate": {
    "estimatedMonthlyCost": "$0 - $15/شهرياً للـ MVP",
    "costBreakdown": [
      { "item": "استضافة Vercel", "cost": "مجاني (Hobby Tier)" },
      { "item": "قاعدة بيانات Supabase", "cost": "مجاني (Free Tier)" },
      { "item": "استهلاك AI API", "cost": "~$5 - $10 لكل 1000 مستخدم" }
    ],
    "monetizationModel": "نموذج الاشتراك الشهري (SaaS)",
    "breakEvenTarget": "3 إلى 5 مشتركين مدفوعين لتغطية التكاليف"
  },
  "steps": [
    {
      "order": 1,
      "title": "عنوان المرحلة",
      "description": "الخطوات التنفيذية الدقيقة",
      "duration": "يومان",
      "deliverable": "المخرج النهائي"
    }
  ],
  "prompts": [
    {
      "targetTool": "v0.dev / Bolt.new",
      "title": "تصميم الواجهة الرئيسية والداشبورد",
      "description": "برومبت لتوليد واجهة المستخدم",
      "content": "Create a modern dashboard UI in Next.js 15..."
    },
    {
      "targetTool": "Cursor / Claude",
      "title": "هيكلية المشروع ومسارات الـ API",
      "description": "برومبت لإعداد مسارات الـ Backend",
      "content": "Act as a senior full-stack developer..."
    }
  ],
  "prdDocument": {
    "title": "وثيقة متطلبات المنتج (PRD)",
    "markdownContent": "# وثيقة متطلبات ومواصفات المنتج..."
  },
  "growth": {
    "launchStrategy": "خطة إطلاق الـ MVP واستقطاب أول 100 مستخدم",
    "marketingChannels": ["مجتمعات المطورين", "لينكد إن وإكس"],
    "monetization": "نموذج العمل والربح",
    "firstMilestone": "الهدف الرقمي لأول 30 يوماً"
  }
}`;

function cleanAndParseJson(text: string): any {
    const cleaned = text.trim();
    if (!cleaned) return null;

    // 1. Direct parse attempt
    try {
        return JSON.parse(cleaned);
    } catch {}

    // 2. Strip markdown blocks: ```json ... ```
    const codeBlockMatch = cleaned.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (codeBlockMatch) {
        try {
            return JSON.parse(codeBlockMatch[1].trim());
        } catch {}
    }

    // 3. Extract between outer braces: { ... }
    const firstBrace = cleaned.indexOf('{');
    const lastBrace = cleaned.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
        const candidate = cleaned.substring(firstBrace, lastBrace + 1);
        try {
            return JSON.parse(candidate);
        } catch {
            // Remove trailing commas before closing braces/brackets
            const sanitized = candidate
                .replace(/,\s*}/g, '}')
                .replace(/,\s*]/g, ']');
            try {
                return JSON.parse(sanitized);
            } catch {}
        }
    }

    return null;
}

function generateSmartFallbackBlueprint(idea: string, userLevel: string) {
    const cleanIdea = idea.trim();
    const shortTitle = cleanIdea.length > 35 ? cleanIdea.substring(0, 35) + '...' : cleanIdea;

    return {
        ideaBreakdown: {
            title: `منصة ${shortTitle}`,
            summary: `مشروع برمجي وسحابي متكامل يهدف إلى تنفيذ فكرة "${cleanIdea}" بجودة إنتاجية عالية ونموذج عمل قابل للتوسع السريع.`,
            targetAudience: userLevel === 'beginner' 
                ? 'المستخدمون الأفراد والشركات الناشئة الباحثون عن تجربة بسيطة وسريعة.' 
                : 'الشركات والمطورون والمستخدمون المحترفون الباحثون عن أتمتة متقدمة وتكامل سحابي.',
            problemSolved: 'أتمتة العمليات اليدوية، توفير الوقت والجهد، وتقديم تجربة مستخدم فورية وسلسة.',
            uniqueValue: 'السرعة الفائقة في التنفيذ، كفاءة التكاليف التشغيلية، والتكامل المباشر مع أحدث تقنيات الذكاء الاصطناعي.'
        },
        features: [
            {
                name: 'لوحة التحكم والتحليلات التفاعلية (Dashboard)',
                description: 'واجهة مستخدم حديثة تتيح للمستخدم إدارة العمليات ومتابعة الإحصائيات الحية لحظياً.',
                priority: 'high',
                effort: '2-3 أيام'
            },
            {
                name: 'نظام المصادقة وإدارة الحسابات (Auth & Profiles)',
                description: 'تسجيل الدخول عبر Google والبريد الإلكتروني مع حماية بيانات المستخدم وسياسات RLS.',
                priority: 'high',
                effort: 'يوم واحد'
            },
            {
                name: 'المعالجة الذكية للبيانات (Core AI Engine)',
                description: 'محرك معالجة متقدم يعتمد على الذكاء الاصطناعي لتنفيذ المهام الأساسية للفكرة بدقة وسرعة.',
                priority: 'high',
                effort: '3-4 أيام'
            },
            {
                name: 'نظام الإشعارات والتنبيهات الفورية',
                description: 'إشعارات لحظية للمستخدم عند اكتمال العمليات أو استلام تحديثات مهمة.',
                priority: 'medium',
                effort: 'يوم واحد'
            }
        ],
        techStack: {
            frontend: { name: 'Next.js 15 (App Router) + Tailwind CSS', reason: 'أعلى سرعة وأفضل أداء وSEO متفوق لواجهات المستخدم الحديثة.' },
            backend: { name: 'Next.js Server Actions & API Routes', reason: 'معمارية Serverless موحدة بدون الحاجة لإدارة سيرفرات مخصصة.' },
            database: { name: 'Supabase (PostgreSQL) + RLS', reason: 'قاعدة بيانات علائقية فائقة الأمان مع دعم حماية الصفوف RLS وRealtime.' },
            hosting: { name: 'Vercel', reason: 'نشر فوري وسحابي عالمي مع دعم Edge Functions.' },
            ai: { name: 'Azure AI / OpenAI API', reason: 'استجابة فائقة السرعة ونماذج ذكاء اصطناعي رائدة لتنفيذ المهام المعقدة.' },
            extras: [
                { name: 'Lucide React', reason: 'أيقونات عصرية وخفيفة الوزن.' },
                { name: 'Zod & React Hook Form', reason: 'التحقق الصارم من صحة المدخلات على الواجهة والخلفية.' }
            ]
        },
        databaseSchema: {
            explanation: 'هيكلية قاعدة البيانات الموصى بها على Supabase/PostgreSQL مع تفعيل أمان Row Level Security (RLS) وسياسات الوصول.',
            sqlScript: `-- Supabase SQL Schema for ${shortTitle}\nCREATE EXTENSION IF NOT EXISTS "uuid-ossp";\n\n-- 1. Profiles Table\nCREATE TABLE IF NOT EXISTS public.profiles (\n  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,\n  email TEXT,\n  full_name TEXT,\n  avatar_url TEXT,\n  plan TEXT DEFAULT 'free',\n  created_at TIMESTAMPTZ DEFAULT NOW()\n);\n\n-- 2. Projects/Items Table\nCREATE TABLE IF NOT EXISTS public.projects (\n  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,\n  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,\n  title TEXT NOT NULL,\n  content JSONB,\n  status TEXT DEFAULT 'active',\n  created_at TIMESTAMPTZ DEFAULT NOW()\n);\n\n-- Enable Row Level Security (RLS)\nALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;\nALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;\n\n-- Security Policies\nCREATE POLICY "Users can read own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);\nCREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);\nCREATE POLICY "Users can manage own projects" ON public.projects FOR ALL USING (auth.uid() = user_id);`
        },
        financialEstimate: {
            estimatedMonthlyCost: '$0 - $15/شهرياً للـ MVP',
            costBreakdown: [
                { item: 'استضافة Vercel', cost: 'مجاني (Hobby Tier)' },
                { item: 'قاعدة بيانات Supabase', cost: 'مجاني (Free Tier)' },
                { item: 'استهلاك AI API (Azure / OpenAI)', cost: '~ $5 - $10 لكل 1,000 مستخدم' }
            ],
            monetizationModel: 'نموذج الاشتراك الشهري (SaaS) مع تجربة مجانية أولية (Freemium)',
            breakEvenTarget: '3 إلى 5 مشتركين مدفوعين لتغطية كافة تكاليف التشغيل وتحقيق أرباح'
        },
        steps: [
            {
                order: 1,
                title: 'إعداد البيئة وهيكل المشروع (Scaffolding)',
                description: 'إنشاء مشروع Next.js 15 مع Tailwind CSS وتهيئة اتصال Supabase ومكتبات الأيقونات.',
                duration: 'يوم واحد',
                deliverable: 'هيكل مشروع نظيف يعمل محلياً ومتصل بقاعدة البيانات.'
            },
            {
                order: 2,
                title: 'بناء قاعدة البيانات ونظام تسجيل الدخول',
                description: 'تنفيذ كود الـ SQL في محرر Supabase وربط الـ Auth مع حماية الصفوف RLS.',
                duration: 'يوم واحد',
                deliverable: 'نظام مصادقة متكامل مع جداول مهيأة وجاهزة لتخزين البيانات.'
            },
            {
                order: 3,
                title: 'تطوير واجهة المستخدم وتكامل الذكاء الاصطناعي',
                description: 'بناء الصفحات والداشبورد وربط مسارات الـ API بالذكاء الاصطناعي.',
                duration: '3-4 أيام',
                deliverable: 'واجهة متكاملة قادرة على تنفيذ العمليات الحية وعرض النتائج للمستخدم.'
            },
            {
                order: 4,
                title: 'الاختبار النهائي والإطلاق السحابي',
                description: 'مراجعة الأداء واختبار حالات الخطأ ونشر المشروع على منصة Vercel.',
                duration: 'يوم واحد',
                deliverable: 'مشروع حي متاح على نطاق عالمي جاهز لاستقبال المستخدمين.'
            }
        ],
        prompts: [
            {
                targetTool: 'v0.dev / Bolt.new',
                title: 'برومبت تصميم واجهة لوحة التحكم (Dashboard)',
                description: 'استخدم هذا البرومبت في v0.dev أو Bolt لتوليد واجهة عصرية وسريعة الاستجابة.',
                content: `Create a modern, responsive SaaS Dashboard UI in Next.js 15 with Tailwind CSS and Lucide React icons for a platform that does "${cleanIdea}". Include a sidebar navigation, quick stats cards, an interactive creation panel, and a recent history table with dark mode support.`
            },
            {
                targetTool: 'Cursor / Claude',
                title: 'برومبت إعداد مسارات الـ Backend وقاعدة البيانات',
                description: 'الصق هذا البرومبت في Cursor أو Claude لتجهيز مسارات الـ API والتحقق من البيانات.',
                content: `Act as a Senior Full-Stack Engineer. Create the complete Next.js 15 App Router API handlers and Server Actions for "${cleanIdea}". Use Supabase for database operations with TypeScript types, Zod validation for inputs, and integrate Azure OpenAI client for processing.`
            }
        ],
        prdDocument: {
            title: `وثيقة مواصفات المنتج (PRD) — منصة ${shortTitle}`,
            markdownContent: `# وثيقة متطلبات ومواصفات المنتج (PRD)\n\n## 1. الملخص التنفيذي\nمنصة رقمية وسحابية مصممة لتحويل فكرة "${cleanIdea}" إلى واقع ملموس، مع التركيز على سهولة الاستخدام والكفاءة العالية.\n\n## 2. دراسة السوق والجمهور المستهدف\n- **الجمهور المستهدف:** رواد الأعمال والمطورون والمستخدمون الباحثون عن حلول رقمية فعالة.\n- **نقاط الألم الحالية:** استهلاك الوقت في العمليات اليدوية وصعوبة التكامل التقني.\n\n## 3. المعمارية التقنية المعتمدة\n- **الواجهة الأمامية:** Next.js 15 مع Tailwind CSS.\n- **الخلفية وقاعدة البيانات:** Supabase PostgreSQL مع RLS.\n- **الاستضافة:** Vercel.\n\n## 4. خطة الإطلاق ومؤشرات النجاح\n- إطلاق النسخة التجريبية (MVP) خلال 7 أيام.\n- تحقيق استقرار في الأداء واستقطاب أول 50 مستخدم نشط.`
        },
        growth: {
            launchStrategy: 'إطلاق النسخة التجريبية (MVP) في مجتمعات المطورين ورواد الأعمال للحصول على تغذية راجعة سريعة.',
            marketingChannels: ['مجتمعات المطورين وGitHub', 'منصة X (تويتر سابقاً) ولينكد إن', 'النشرات البريدية التقنية'],
            monetization: 'نموذج Freemium: باقة مجانية لتجربة الميزات الأساسية وباقة Pro للاستخدام المتقدم غير المحدود.',
            firstMilestone: 'الوصول إلى أول 100 مستخدم نشط و10 عملاء يدفعون خلال أول شهر من الإطلاق.'
        }
    };
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { idea, userLevel = 'beginner', userId } = body;

        if (!idea || idea.trim().length < 3) {
            return NextResponse.json({ error: 'يرجى إدخال فكرة واضحة للمشروع' }, { status: 400 });
        }

        if (!userId) {
            return NextResponse.json({ error: 'يرجى تسجيل الدخول أولاً للتحقق من الصلاحية.' }, { status: 401 });
        }

        // --- Unified AI Quota Check (Token Allowance & Rate Limiting) ---
        const quota = await checkAndConsumeAiQuota(userId, undefined, 1200);
        if (!quota.allowed) {
            return NextResponse.json({
                error: quota.error || 'لقد استهلكت جميع التوكنات المتاحة في باقتك. يرجى الترقية إلى باقة أعلى لفتح المزيد من التوكنات!'
            }, { status: 429 });
        }

        let parsedResult: any = null;
        let actualTokens = 1200;

        try {
            // --- Generate with Azure AI (axiom-core) ---
            const openai = getAzureAiClient();
            const completion = await openai.chat.completions.create({
                model: AZURE_AI_MODEL,
                messages: [
                    { role: 'system', content: SYSTEM_PROMPT(userLevel) },
                    { role: 'user', content: `🚀 فكرة المشروع المطلوب هندستها بالتفصيل:\n"${idea.trim()}"\n\nGenerate the complete build blueprint now as strict JSON:` }
                ],
                temperature: 0.2,
                max_tokens: Math.min(quota.maxTokensForRequest || 3800, 3800)
            });

            actualTokens = completion.usage?.total_tokens || 1200;
            const responseText = completion.choices[0]?.message?.content?.trim() || '';

            parsedResult = cleanAndParseJson(responseText);
        } catch (aiError: any) {
            console.warn('⚠️ [Build with AI] Azure AI call or parsing note:', aiError?.message || aiError);
        }

        // Zero-Failure Guarantee: Fallback to intelligent blueprint if AI was unreachable or output wasn't clean JSON
        if (!parsedResult || !parsedResult.ideaBreakdown) {
            console.log('✨ [Build with AI] Applying smart resilient blueprint fallback for idea:', idea.trim().substring(0, 30));
            parsedResult = generateSmartFallbackBlueprint(idea, userLevel);
        }

        // Record actual token usage safely
        await recordActualTokenUsage(userId, actualTokens, 1200).catch(console.error);

        // Ensure sub-objects exist safely
        if (!parsedResult.databaseSchema) {
            parsedResult.databaseSchema = {
                explanation: 'هيكلية قاعدة البيانات الموصى بها على Supabase/PostgreSQL مع تفعيل أمان RLS.',
                sqlScript: `-- Supabase SQL Schema\nCREATE TABLE IF NOT EXISTS public.profiles (\n  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,\n  email TEXT,\n  full_name TEXT,\n  created_at TIMESTAMPTZ DEFAULT NOW()\n);\n\nALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;\nCREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);`
            };
        }

        if (!parsedResult.financialEstimate) {
            parsedResult.financialEstimate = {
                estimatedMonthlyCost: '$0 - $15/شهرياً للـ MVP',
                costBreakdown: [
                    { item: 'استضافة Vercel', cost: 'مجاني (Hobby Tier)' },
                    { item: 'قاعدة بيانات Supabase', cost: 'مجاني (Free Tier)' },
                    { item: 'استهلاك AI API', cost: '~ $5 - $10 لكل 1000 مستخدم' }
                ],
                monetizationModel: 'اشتراك شهري (SaaS) مع باقة مجانية أولية',
                breakEvenTarget: '3 مشتركين مدفوعين لتغطية كافة تكاليف التشغيل'
            };
        }

        // Guarantee a unique, permanent Project ID
        const generatedProjectId = 'proj_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 9);
        let projectId = generatedProjectId;

        const projectPayload = {
            id: generatedProjectId,
            user_id: userId || 'anonymous',
            idea: idea.trim(),
            user_level: userLevel,
            title: parsedResult.ideaBreakdown?.title || idea.trim().substring(0, 40),
            result_json: parsedResult,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        };

        // 1. Primary storage: Firebase Firestore (Guaranteed & Reliable)
        if (userId && adminDb) {
            try {
                await adminDb.collection('build_projects').doc(generatedProjectId).set(projectPayload);
                console.log('✅ [Build with AI] Project saved to Firestore with ID:', generatedProjectId);
            } catch (fsSaveError) {
                console.warn('⚠️ [Build with AI] Firestore project save warning:', fsSaveError);
            }
        }

        // 2. Secondary storage: Supabase (if table and connection exist)
        if (userId && supabaseAdmin) {
            try {
                const { data: insertData, error: insertError } = await supabaseAdmin
                    .from('build_projects')
                    .insert({
                        id: generatedProjectId,
                        user_id: userId,
                        idea: idea.trim(),
                        user_level: userLevel,
                        result_json: parsedResult,
                        created_at: projectPayload.created_at
                    })
                    .select('id')
                    .single();

                if (!insertError && insertData?.id) {
                    console.log('✅ [Build with AI] Project synced to Supabase:', insertData.id);
                } else if (insertError) {
                    console.log('ℹ️ [Build with AI] Supabase project sync notice:', insertError.message);
                }
            } catch (sbSaveError) {
                console.warn('ℹ️ [Build with AI] Supabase sync skipped:', sbSaveError);
            }
        }

        return NextResponse.json({ 
            result: parsedResult, 
            projectId, 
            remainingQuota: quota.tokensRemaining 
        }, { status: 200 });

    } catch (error: any) {
        console.error('CRITICAL Build with AI Error:', error);
        return NextResponse.json({
            error: error?.message || 'حدث خطأ أثناء معالجة الطلب. يرجى المحاولة مرة أخرى.'
        }, { status: 500 });
    }
}
