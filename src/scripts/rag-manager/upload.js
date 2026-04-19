import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import crypto from 'crypto';
dotenv.config();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error("❌ Error: SUPABASE_URL or SUPABASE_KEY is missing in .env");
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

/**
 * حذف جميع البيانات القديمة من الجدول
 */
export const clearTable = async (tableName = 'tools_embeddings') => {
    console.log(`\n🗑️  Clearing all data from table: '${tableName}'...`);

    const { error } = await supabase
        .from(tableName)
        .delete()
        .neq('id', ''); // حذف كل الصفوف (trick للحذف الكامل)

    if (error) {
        console.error(`❌ Error clearing table:`, error.message);
        return false;
    }

    console.log(`✅ Table cleared successfully!`);
    return true;
};

/**
 * رفع البيانات إلى Supabase
 */
export const uploadToSupabase = async (items, tableName = 'tools_embeddings') => {
    console.log(`\n📤 Uploading ${items.length} items to Supabase table: '${tableName}'...`);

    if (items.length === 0) return;

    // تحويل البيانات لتناسب أعمدة الجدول
    const rows = items.map(item => ({
        id: item.id || crypto.randomUUID(),
        name: item.name,
        description: item.description || "",
        category: item.category || "General",
        link: item.link || `https://www.tolzy.me/tools/${item.id}`,
        embedding: item.embedding
    }));

    // تقسيم الرفع إلى دفعات
    const BATCH_SIZE = 50;
    for (let i = 0; i < rows.length; i += BATCH_SIZE) {
        const batch = rows.slice(i, i + BATCH_SIZE);

        const { error } = await supabase
            .from(tableName)
            .upsert(batch, { onConflict: 'id' });

        if (error) {
            console.error(`❌ Error uploading batch ${i / BATCH_SIZE + 1}:`, error.message);
        } else {
            console.log(`   -> Uploaded batch items ${i + 1} to ${Math.min(i + BATCH_SIZE, rows.length)}`);
        }
    }

    console.log("✅ Upload Process Finished!");
};