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

// ==========================================
// 2. Helper Functions
// ==========================================

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function enrichWithOpenRouter(batch, retries = 3, initialDelay = 5000) {
    const systemPrompt = "You are an AI specialized in educational content enhancement and Arabic translation. Return ONLY a valid JSON array.";
    const userPrompt = `
    Given the following JSON array of courses, for each course:
    1. Translate the title and description to professional, engaging Arabic.
    2. Extract/generate 5-8 specific skills in Arabic (e.g., "برمجة جافا سكريبت", "تحليل البيانات").
    3. Suggest a duration (e.g., "4 أسابيع") and level (["مبتدئ", "متوسط", "متقدم"]) in Arabic.
    
    COURSES DATA:
    ${JSON.stringify(batch.map(c => ({ id: c.external_id, title: c.title, description: c.description })), null, 2)}
    
    OUTPUT FORMAT: Return ONLY a JSON array with:
    [{"id": "...", "translated_title": "...", "translated_description": "...", "skills": [...], "duration": "...", "level": "..."}]
    `;

    let currentDelay = initialDelay;
    for (let i = 0; i < retries; i++) {
        try {
            const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${openRouterKey}`,
                    "Content-Type": "application/json",
                    "HTTP-Referer": "https://tolzy.me", 
                    "X-Title": "Tolzy Enrichment"
                },
                body: JSON.stringify({
                    model: "google/gemini-2.0-flash-001", // Using the closest stable 2.0 Flash model
                    messages: [
                        { role: "system", content: systemPrompt },
                        { role: "user", content: userPrompt }
                    ],
                    temperature: 0.1
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`OpenRouter API Error: ${errorData.error?.message || response.statusText}`);
            }

            const data = await response.json();
            let text = data.choices[0].message.content.trim();
            
            if (text.startsWith('```json')) text = text.substring(7);
            if (text.startsWith('```')) text = text.substring(3);
            if (text.endsWith('```')) text = text.slice(0, -3);
            
            return JSON.parse(text);
        } catch (error) {
            if (error.message?.includes("429") && i < retries - 1) {
                console.warn(`⏳ Rate limit hit (OpenRouter). Waiting ${currentDelay/1000}s... (Attempt ${i+1}/${retries})`);
                await delay(currentDelay);
                currentDelay *= 2;
                continue;
            }
            throw error;
        }
    }
}

// ==========================================
// 3. Execution Loop
// ==========================================

async function run() {
    console.log("🚀 Starting Course Enrichment with OPENROUTER AI...");

    const { data: courses, error: fetchErr } = await supabase.from('courses').select('*');
    if (fetchErr) {
        console.error("❌ Failed to fetch courses:", fetchErr.message);
        return;
    }

    const coursesToProcess = courses.filter(c => {
        const hasSkills = c.metadata && c.metadata.skills && Array.isArray(c.metadata.skills) && c.metadata.skills.length > 0;
        return !hasSkills;
    });

    console.log(`ℹ️  Found ${courses.length} courses total.`);
    console.log(`ℹ️  ${courses.length - coursesToProcess.length} already enriched. Skipping.`);
    console.log(`⏳ Processing ${coursesToProcess.length} new courses in batches of 10...`);

    const BATCH_SIZE = 10;
    for (let i = 0; i < coursesToProcess.length; i += BATCH_SIZE) {
        const batch = coursesToProcess.slice(i, i + BATCH_SIZE);
        console.log(`\n⏳ Batch [${Math.floor(i/BATCH_SIZE)+1}/${Math.ceil(coursesToProcess.length/BATCH_SIZE)}]...`);

        try {
            const enrichedResults = await enrichWithOpenRouter(batch);
            
            if (enrichedResults) {
                for (const result of enrichedResults) {
                    const originalCourse = batch.find(c => c.external_id === result.id);
                    if (!originalCourse) continue;

                    const updatedMetadata = {
                        ...(originalCourse.metadata || {}),
                        duration: result.duration,
                        level: result.level,
                        skills: result.skills
                    };

                    const { error: updateErr } = await supabase
                        .from('courses')
                        .update({
                            title: result.translated_title,
                            description: result.translated_description,
                            metadata: updatedMetadata,
                            updated_at: new Date().toISOString()
                        })
                        .eq('external_id', result.id);

                    if (updateErr) console.error(`   ❌ Update Failed ${result.id}:`, updateErr.message);
                    else console.log(`   ✅ Success: ${result.translated_title}`);
                }
            }
            await delay(1000); // Small delay between batches for OpenRouter
        } catch (e) {
            console.error(`❌ Batch failed: ${e.message}`);
        }
    }

    console.log("\n✨ COURSE ENRICHMENT PHASE COMPLETED!");
}

run();
