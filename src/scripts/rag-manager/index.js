import path from 'path';
import { fileURLToPath } from 'url';
import { loadDataFromDirectory } from './parser.js';
import { generateEmbeddings } from './embed.js';
import { uploadToSupabase, clearTable } from './upload.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const main = async () => {
    console.log("========================================");
    console.log("   🤖 Tolzy RAG Data Manager v2.5 - جديد الآن 🆕");
    console.log("========================================");

    // تحديد مسار مجلد البيانات
    const dataDir = path.join(__dirname, 'data');
    console.log(`Reading files from: ${dataDir}`);

    // 0. حذف البيانات القديمة أولاً
    const cleared = await clearTable('tools_embeddings');
    if (!cleared) {
        console.error("⚠️  Warning: Could not clear old data. Continuing anyway...");
    }

    // 1. تحميل البيانات (مع الوصف الغني)
    const items = loadDataFromDirectory(dataDir);

    if (items.length === 0) {
        console.warn("⚠️  No data found. Please add .json or .xlsx files to the 'data' folder.");
        return;
    }

    console.log(`📊 Total Items Found: ${items.length}`);

    // إزالة التكرارات
    const uniqueItems = [];
    const seenIds = new Set();

    for (const item of items) {
        if (!item.id) {
            uniqueItems.push(item);
            continue;
        }

        if (seenIds.has(item.id)) {
            console.warn(`⚠️  Duplicate ID found: ${item.id} (${item.name}). Skipping duplicate.`);
            continue;
        }

        seenIds.add(item.id);
        uniqueItems.push(item);
    }

    if (items.length !== uniqueItems.length) {
        console.log(`🧹 Removed ${items.length - uniqueItems.length} duplicate items.`);
    }

    // 2. توليد التضمينات
    const embeddedItems = await generateEmbeddings(uniqueItems);

    if (embeddedItems.length === 0) {
        console.warn("⚠️  No embeddings generated. Exiting...");
        return;
    }

    // 3. الرفع إلى Supabase
    await uploadToSupabase(embeddedItems, 'tools_embeddings');

    console.log("\n✨ Process Completed Successfully.");
    console.log(`📦 Total tools uploaded: ${embeddedItems.length}`);
    console.log("🔗 All tools now have Tolzy links: www.tolzy.me/tools/{id}");
};

main().catch(err => {
    console.error("Critical Error:", err);
});