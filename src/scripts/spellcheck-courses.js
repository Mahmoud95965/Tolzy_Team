import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fetch from 'node-fetch';
dotenv.config();

// ==========================================
// 1. Configuration
// ==========================================
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const openRouterKey = process.env.OPENROUTER_ENRICH_KEY;

if (!supabaseUrl || !supabaseKey || !openRouterKey) {
    console.error("❌ Missing environment variables (SUPABASE_URL, SUPABASE_KEY, OPENROUTER_ENRICH_KEY)");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// ==========================================
// 2. AI Spellcheck Logic
// ==========================================

async function spellcheckWithAI(batch, retries = 3, initialDelay = 5000) {
    const systemPrompt = "You are an expert Arabic linguist and proofreader. Correct any spelling, grammar, or punctuation errors in the provided course data. Maintain the original professional tone. Return ONLY a valid JSON array.";
    const userPrompt = `
    Review and fix spelling/grammar for these Arabic courses:
    ${JSON.stringify(batch.map(c => ({ id: c.external_id, title: c.title, description: c.description })), null, 2)}
    
    OUTPUT FORMAT: Return ONLY a JSON array:
    [{"id": "...", "title": "corrected_title", "description": "corrected_description"}]
    `;

    let currentDelay = initialDelay;
    for (let i = 0; i < retries; i++) {
        try {
            const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${openRouterKey}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    model: "google/gemini-2.0-flash-001",
                    messages: [
                        { role: "system", content: systemPrompt },
                        { role: "user", content: userPrompt }
                    ],
                    temperature: 0.1
                })
            });

            if (!response.ok) throw new Error(`OpenRouter Error: ${response.statusText}`);

            const data = await response.json();
            let text = data.choices[0].message.content.trim();
            
            if (text.startsWith('```json')) text = text.substring(7);
            if (text.startsWith('```')) text = text.substring(3);
            if (text.endsWith('```')) text = text.slice(0, -3);
            
            return JSON.parse(text);
        } catch (error) {
            if (error.message?.includes("429") && i < retries - 1) {
                console.warn(`⏳ Rate limit... Waiting ${currentDelay/1000}s...`);
                await delay(currentDelay);
                currentDelay *= 2;
                continue;
            }
            throw error;
        }
    }
}

// ==========================================
// 3. Execution
// ==========================================

async function run() {
    console.log("🚀 Starting AI Spellcheck & Proofreading for Courses...");

    const { data: courses, error: fetchErr } = await supabase.from('courses').select('*');
    if (fetchErr) {
        console.error("❌ Failed to fetch courses:", fetchErr.message);
        return;
    }

    console.log(`⏳ Reviewing ${courses.length} courses in batches of 10...`);

    const BATCH_SIZE = 10;
    for (let i = 0; i < courses.length; i += BATCH_SIZE) {
        const batch = courses.slice(i, i + BATCH_SIZE);
        console.log(`\n⏳ Batch [${Math.floor(i/BATCH_SIZE)+1}/${Math.ceil(courses.length/BATCH_SIZE)}]...`);

        try {
            const correctedResults = await spellcheckWithAI(batch);
            
            if (correctedResults) {
                for (const result of correctedResults) {
                    const originalCourse = batch.find(c => c.external_id === result.id);
                    if (!originalCourse) continue;

                    // Only update if there's a difference
                    if (originalCourse.title !== result.title || originalCourse.description !== result.description) {
                        const { error: updateErr } = await supabase
                            .from('courses')
                            .update({
                                title: result.title,
                                description: result.description,
                                updated_at: new Date().toISOString()
                            })
                            .eq('external_id', result.id);

                        if (updateErr) console.error(`   ❌ Failed ${result.id}:`, updateErr.message);
                        else console.log(`   📝 Fixed: ${result.title}`);
                    } else {
                        console.log(`   ✅ Correct: ${result.title}`);
                    }
                }
            }
            await delay(1000);
        } catch (e) {
            console.error(`❌ Batch error: ${e.message}`);
        }
    }

    console.log("\n✨ SPELLCHECK COMPLETED SUCCESSFULLY!");
}

run();
