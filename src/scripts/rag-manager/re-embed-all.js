/**
 * سكريبت توليد الـ Embeddings للكورسات باستخدام Hugging Face
 * نموذج: mixedbread-ai/mxbai-embed-large-v1 (1024 dimensions)
 */
import { createClient } from '@supabase/supabase-js';
import { generateHuggingFaceEmbedding } from '../../lib/huggingface.js';
import dotenv from 'dotenv';
dotenv.config();

// Supabase Setup
const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY
);

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const migrateCourses = async () => {
    console.log("\n--- 📚 Migrating COURSES Embeddings using Hugging Face ---");
    
    const { data: existingCourses } = await supabase.from('courses_embeddings').select('id');
    const existingIds = new Set(existingCourses?.map(c => c.id) || []);
    console.log(`ℹ️ Found ${existingIds.size} courses already embedded in Supabase.`);

    const { data: courses, error: fetchErr } = await supabase.from('courses').select('*');
    if (fetchErr) {
        console.error("❌ Error fetching courses from database:", fetchErr.message);
        return;
    }

    const newCourses = courses.filter(c => !existingIds.has(`course-${c.id}`));
    if (newCourses.length === 0) {
        console.log("✅ All courses are already embedded successfully.");
        return;
    }

    console.log(`⏳ Processing ${newCourses.length} courses sequentially...`);
    
    let successCount = 0;
    let failedCount = 0;

    for (let i = 0; i < newCourses.length; i++) {
        const course = newCourses[i];
        console.log(`\n[${i + 1}/${newCourses.length}] Processing Course: ${course.title}...`);
        
        try {
            const text = `${course.title}. ${course.description || ''}`;
            const embedding = await generateHuggingFaceEmbedding(text);
            
            if (embedding) {
                const row = {
                    id: `course-${course.id}`, 
                    title: course.title,
                    description: course.description,
                    category: course.category || 'Course',
                    link: `/learn/course/${course.id}`,
                    embedding: embedding
                };

                const { error } = await supabase.from('courses_embeddings').upsert(row);
                if (error) {
                    console.error(`   ❌ Failed to save to Supabase: ${error.message}`);
                    failedCount++;
                } else {
                    console.log(`   ✅ Success!`);
                    successCount++;
                }
            } else {
                console.error(`   ❌ Failed to generate Hugging Face embedding.`);
                failedCount++;
            }
        } catch (e) {
            console.error(`   ❌ Exception: ${e.message}`);
            failedCount++;
        }
        
        // Respectful delay between API calls
        await delay(500);
    }

    console.log("\n--------------------------------");
    console.log(`✅ Completed! Success: ${successCount}, Failed: ${failedCount}`);
    console.log("--------------------------------");
};

const run = async () => {
    console.log("========================================");
    console.log("   🚀 Hugging Face Courses RAG Syncer");
    console.log("========================================\n");

    try {
        await migrateCourses();
        console.log("\n🎉 COURSES SYNCHRONIZATION COMPLETED!");
    } catch (error) {
        console.error("CRITICAL ERROR:", error);
    }
};

run();
