import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '.env') });

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_KEY
);

async function check() {
    console.log("Checking RAG Synchronization...");

    const { data: courses } = await supabase.from('courses').select('id, title');
    const { data: embeddings } = await supabase.from('courses_embeddings').select('id, title');

    console.log(`\nCourses in source table: ${courses?.length || 0}`);
    console.log(`Embeddings in RAG table : ${embeddings?.length || 0}`);

    const courseIds = new Set(courses?.map(c => String(c.id)) || []);
    const staleEntries = embeddings?.filter(e => !courseIds.has(String(e.id))) || [];

    if (staleEntries.length > 0) {
        console.log(`\n❌ Found ${staleEntries.length} stale entries in courses_embeddings:`);
        staleEntries.forEach(e => {
            console.log(`- [${e.id}] ${e.title}`);
        });
    } else {
        console.log("\n✅ No stale entries found in courses_embeddings.");
    }

    // Check tools too just in case
    const { data: toolsEmbeddings } = await supabase.from('tools_embeddings').select('id, name');
    console.log(`\nTools in RAG table: ${toolsEmbeddings?.length || 0}`);
}

check();
