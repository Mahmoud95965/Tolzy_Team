import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { adminDb } from '@/src/config/firebase-admin';
import * as admin from 'firebase-admin';
import { createClient } from '@supabase/supabase-js';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY || '';
const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

const SYSTEM_PROMPT = (userLevel: string) => `You are **"Tolzy Build Architect"**, a world-class AI Product Architect, Startup Engineer, and Technical Strategist.

Your mission is to transform any user idea into a **production-ready, execution-focused product blueprint** that can be built in the real world.

You do NOT give advice.
You DO NOT explain theory.
You ONLY design executable systems.

---

# 🎯 CORE OBJECTIVE

Take a user idea and generate a complete build plan that includes:

* Product design
* Feature set (MVP-first)
* Technical architecture
* Step-by-step execution plan
* AI-ready prompts
* Growth + monetization strategy

---

# ⚠️ CRITICAL RULES (NON-NEGOTIABLE)

1. Output MUST be valid JSON only.
2. NO markdown, NO explanations, NO extra text.
3. ALL text MUST be in Arabic.
4. Be extremely practical and execution-focused.
5. Prefer simplicity over complexity (MVP mindset).
6. If something is uncertain, make a reasonable assumption — do NOT ask questions.
7. Do NOT hallucinate tools that don't exist.
8. Always optimize for "can be built in real life".

---

# 🧠 ADAPTIVE INTELLIGENCE LEVEL

User Level: ${userLevel === 'beginner' ? 'مبتدئ → No-code tools, simple stack, guided steps' : userLevel === 'intermediate' ? 'متوسط → modern frameworks + APIs' : 'متقدم → scalable architecture + best practices'}

---

# 📦 OUTPUT JSON SCHEMA (STRICT)

Return ONLY this structure:

{
  "ideaBreakdown": {
    "title": "",
    "summary": "",
    "targetAudience": "",
    "problemSolved": "",
    "uniqueValue": ""
  },
  "features": [
    {
      "name": "",
      "description": "",
      "priority": "high | medium | low",
      "effort": "1-3 أيام | 1 أسبوع | 2+ أسابيع"
    }
  ],
  "techStack": {
    "frontend": { "name": "", "reason": "" },
    "backend": { "name": "", "reason": "" },
    "database": { "name": "", "reason": "" },
    "hosting": { "name": "", "reason": "" },
    "ai": { "name": "", "reason": "" },
    "extras": [{ "name": "", "reason": "" }]
  },
  "steps": [
    {
      "order": 1,
      "title": "",
      "description": "",
      "duration": "",
      "deliverable": ""
    }
  ],
  "prompts": [
    {
      "title": "",
      "description": "",
      "content": "",
      "targetTool": ""
    }
  ],
  "growth": {
    "launchStrategy": "",
    "marketingChannels": [],
    "monetization": "",
    "firstMilestone": ""
  }
}

---

# 🔧 HARD CONSTRAINTS

* features: 6 to 10 items
* steps: 6 to 8 items
* prompts: 4 to 6 items
* Keep everything actionable (no generic statements like "improve UX")

---

# 💡 QUALITY RULES

* Think like a startup founder shipping in 7 days
* Think like a senior engineer building scalable systems
* Think like a product manager prioritizing MVP

Every output must:

* Be buildable
* Be realistic
* Be monetizable
* Be launchable

---

# 🚀 FINAL INSTRUCTION

Take the user's idea and produce the full structured build plan now.

Return ONLY JSON.
`;

export async function POST(req: NextRequest) {
    try {
        if (!GEMINI_API_KEY) {
            return NextResponse.json({ error: 'Server Configuration Error: Missing Gemini API Key' }, { status: 500 });
        }

        const body = await req.json();
        const { idea, userLevel = 'beginner', userId } = body;

        if (!idea || idea.trim().length < 5) {
            return NextResponse.json({ error: 'يرجى إدخال فكرة واضحة (5 أحرف على الأقل)' }, { status: 400 });
        }

        if (!userId) {
            return NextResponse.json({ error: 'يرجى تسجيل الدخول أولاً للتحقق من الصلاحية.' }, { status: 401 });
        }

        // --- Plan validation: Build with AI is Pro/Ultra only ---
        if (adminDb) {
            try {
                const userRef = adminDb.collection('users').doc(userId);
                const userSnap = await userRef.get();
                const userData = userSnap.data();
                const userPlan = String(userData?.plan || 'free').toLowerCase();
                const isPro = userPlan.includes('pro') || userPlan.includes('ultra');

                if (!isPro) {
                    return NextResponse.json({
                        error: 'عذراً، ميزة البناء بالذكاء الاصطناعي متوفرة فقط لمشتركي باقة Pro. يرجى ترقية حسابك للاستفادة منها.'
                    }, { status: 403 });
                }
            } catch (e) {
                console.error('Build plan check error:', e);
            }
        }

        // --- Generate with Gemini ---
        const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({
            model: 'gemini-2.5-flash',
            generationConfig: {
                temperature: 0.8,
                maxOutputTokens: 8192,
                responseMimeType: 'application/json',
            },
        });

        const prompt = `${SYSTEM_PROMPT(userLevel)}\n\n═══════════════════════════════════════\n🚀 فكرة المستخدم:\n"${idea.trim()}"\n═══════════════════════════════════════\n\nGenerate the complete build plan now as valid JSON:`;

        const result = await model.generateContent(prompt);
        const responseText = result.response.text();

        // Parse JSON to validate
        let parsedResult;
        try {
            parsedResult = JSON.parse(responseText);
        } catch {
            // Try to extract JSON from potential markdown wrapping
            const jsonMatch = responseText.match(/```(?:json)?\s*([\s\S]*?)```/);
            if (jsonMatch) {
                parsedResult = JSON.parse(jsonMatch[1]);
            } else {
                // Try trimming and finding the first { to last }
                const start = responseText.indexOf('{');
                const end = responseText.lastIndexOf('}');
                if (start !== -1 && end !== -1) {
                    parsedResult = JSON.parse(responseText.substring(start, end + 1));
                } else {
                    throw new Error('Failed to parse AI response as JSON');
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

        return NextResponse.json({ result: parsedResult, projectId }, { status: 200 });

    } catch (error: any) {
        console.error('Build with AI Error:', error);
        return NextResponse.json({
            error: 'حدث خطأ أثناء توليد الخطة. يرجى المحاولة مرة أخرى.',
            details: error.message
        }, { status: 500 });
    }
}
