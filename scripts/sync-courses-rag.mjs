/**
 * 🔄 Course RAG Sync Script (V2)
 * Fetches enriched data from 'courses' table and updates 'courses_embeddings'
 * used by Copilot for RAG search.
 */

import { createClient } from '@supabase/supabase-js';
import { generateHuggingFaceEmbedding } from '../src/lib/huggingface.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY
);

async function main() {
    console.log("========================================");
    console.log("   📚 Course RAG Synchronization Tool (V2)");
    console.log("========================================\n");

    // 1. Fetch enriched courses
    console.log("📥 Fetching enriched courses from 'courses' table...");
    const { data: courses, error: fetchError } = await supabase
        .from('courses')
        .select('id, external_id, title, description, category, metadata, url, thumbnail');

    if (fetchError) {
        console.error("❌ Error fetching courses:", fetchError.message);
        return;
    }

    console.log(`✅ Found ${courses.length} courses to process.\n`);

    // 2. Generate embeddings and update courses_embeddings
    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < courses.length; i++) {
        const course = courses[i];
        const skills = course.metadata?.skills || [];
        const skillsText = skills.length > 0 ? ` Skills: ${skills.join(', ')}` : '';
        
        // Use the enriched description if available, otherwise the main one
        const finalDescription = course.description || '';
        
        const textToEmbed = `
Course: ${course.title}
Category: ${course.category}
Description: ${finalDescription}
${skillsText}
`.trim();

        console.log(`[${i + 1}/${courses.length}] Processing: ${course.title}...`);

        try {
            const embedding = await generateHuggingFaceEmbedding(textToEmbed);
            
            if (embedding) {
                // Upsert into courses_embeddings
                const { error: upsertError } = await supabase
                    .from('courses_embeddings')
                    .upsert({
                        id: course.id, // Use the real UUID ID from the 'courses' table
                        title: course.title,
                        description: finalDescription,
                        category: course.category,
                        level: course.level || 'All Levels',
                        price: 'Free', // Default for now
                        link: `/learn/course/${course.id}`, // Store the correct platform link
                        thumbnail: course.thumbnail, // Sync thumbnail
                        embedding: embedding
                    });

                if (upsertError) {
                    console.error(`   ❌ Upsert failed: ${upsertError.message}`);
                    failCount++;
                } else {
                    console.log(`   ✅ RAG Entry updated.`);
                    successCount++;
                }
            } else {
                console.warn(`   ⚠️  Embedding generation returned null.`);
                failCount++;
            }
        } catch (error) {
            console.error(`   ❌ Error: ${error.message}`);
            failCount++;
        }

        // Rate limiting for HuggingFace (and to avoid Supabase burst limits)
        await new Promise(resolve => setTimeout(resolve, 300));
    }

    // 3. Cleanup: Remove stale embeddings for courses that no longer exist
    console.log("\n🧹 Cleaning up stale embeddings...");
    const { data: embeddingEntries, error: embFetchError } = await supabase
        .from('courses_embeddings')
        .select('id');

    if (!embFetchError && embeddingEntries) {
        const currentCourseIds = new Set(courses.map(c => String(c.id)));
        const staleIds = embeddingEntries
            .map(e => String(e.id))
            .filter(id => !currentCourseIds.has(id));

        if (staleIds.length > 0) {
            console.log(`🗑️ Found ${staleIds.length} stale entries. Deleting...`);
            const { error: deleteError } = await supabase
                .from('courses_embeddings')
                .delete()
                .in('id', staleIds);
            
            if (deleteError) {
                console.error(`❌ Cleanup failed: ${deleteError.message}`);
            } else {
                console.log(`✅ Successfully deleted ${staleIds.length} stale entries.`);
            }
        } else {
            console.log("✅ No stale entries found.");
        }
    }

    console.log("\n========================================");
    console.log("   ✨ Sync Completed!");
    console.log("========================================");
    console.log(`✅ Success: ${successCount}`);
    console.log(`❌ Failed:  ${failCount}`);
    console.log(`📊 Total processed: ${courses.length}`);
}

main().catch(err => {
    console.error("Critical Error:", err);
    process.exit(1);
});

