import { GoogleGenerativeAI } from "@google/generative-ai";
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

// ==========================================
// 1. Configuration
// ==========================================
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY; // Using the provided key
const geminiKey = process.env.GEMINI_API_KEY;

if (!supabaseUrl || !supabaseKey || !geminiKey) {
    console.error("❌ Missing environment variables (SUPABASE_URL, SUPABASE_KEY, GEMINI_API_KEY)");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);
const genAI = new GoogleGenerativeAI(geminiKey);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

// ==========================================
// 2. Helper Functions & Logic
// ==========================================

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function enrichWithRetry(batch, retries = 3, initialDelay = 5000) {
    const prompt = `
    You are an AI specialized in educational content enhancement and Arabic translation.
    
    Given the following JSON array of courses, for each course:
    1. Translate the title and description to professional, engaging Arabic.
    2. Extract and generate a list of 5-8 specific skills (in Arabic) that a student will gain from this course (e.g., "برمجة جافا سكريبت", "تحليل البيانات", "تصميم واجهات").
    3. Suggest a duration (e.g., "4 أسابيع") and level (["مبتدئ", "متوسط", "متقدم"]) in Arabic.
    
    COURSES DATA:
    ${JSON.stringify(batch.map(c => ({ id: c.external_id, title: c.title, description: c.description })), null, 2)}
    
    OUTPUT FORMAT: Return ONLY a JSON array with the following object for each course:
    {
      "id": "exact_original_id",
      "translated_title": "...",
      "translated_description": "...",
      "skills": ["skill1", "skill2", ...],
      "duration": "...",
      "level": "..."
    }
    `;

    let currentDelay = initialDelay;
    for (let i = 0; i < retries; i++) {
        try {
            const result = await model.generateContent(prompt);
            let text = result.response.text().trim();
            
            if (text.startsWith('```json')) text = text.substring(7);
            if (text.startsWith('```')) text = text.substring(3);
            if (text.endsWith('```')) text = text.slice(0, -3);
            
            return JSON.parse(text);
        } catch (error) {
            if (error.message?.includes("429") && i < retries - 1) {
                console.warn(`⏳ Quota hit. Waiting ${currentDelay/1000}s and retrying... (Attempt ${i+1}/${retries})`);
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
    console.log("🚀 Starting Course Enrichment with Gemini...");

    // 1. جلب الكورسات
    const { data: courses, error: fetchErr } = await supabase
        .from('courses')
        .select('*');

    if (fetchErr) {
        console.error("❌ Failed to fetch courses:", fetchErr.message);
        return;
    }

    // 2. تصفية الكورسات التي تحتاج لإثراء (تخطي التي لديها مهارات بالفعل)
    const coursesToProcess = courses.filter(c => {
        const hasSkills = c.metadata && c.metadata.skills && Array.isArray(c.metadata.skills) && c.metadata.skills.length > 0;
        return !hasSkills;
    });

    console.log(`ℹ️  Found ${courses.length} courses total.`);
    console.log(`ℹ️  ${courses.length - coursesToProcess.length} already enriched. Skipping.`);
    console.log(`⏳ Processing ${coursesToProcess.length} new courses in batches of 5...`);

    const BATCH_SIZE = 5;
    for (let i = 0; i < coursesToProcess.length; i += BATCH_SIZE) {
        const batch = coursesToProcess.slice(i, i + BATCH_SIZE);
        console.log(`\n⏳ Batch [${Math.floor(i/BATCH_SIZE)+1}/${Math.ceil(coursesToProcess.length/BATCH_SIZE)}]...`);

        try {
            const enrichedResults = await enrichWithRetry(batch);
            
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
                            metadata: updatedMetadata
                        })
                        .eq('external_id', result.id);

                    if (updateErr) {
                        console.error(`   ❌ Update Failed ${result.id}:`, updateErr.message);
                    } else {
                        console.log(`   ✅ Success: ${result.translated_title}`);
                    }
                }
            }
        } catch (e) {
            console.error(`❌ Batch failed completely: ${e.message}`);
        }
        
        await delay(5000); // 5s wait between batches
    }

    console.log("\n✨ COURSE ENRICHMENT PHASE COMPLETED!");
}

run();
