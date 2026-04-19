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

async function listTitles() {
    const { data: courses } = await supabase.from('courses').select('title').order('title');
    console.log("Current Courses in Supabase:");
    courses?.forEach((c, i) => {
        console.log(`${i+1}. ${c.title}`);
    });
}

listTitles();
