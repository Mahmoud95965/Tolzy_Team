/**
 * سكريبت إعادة توليد الـ Embeddings لكل من الأدوات والكورسات
 * باستخدام Google text-embedding-004 (768 dimensions)
 */
import admin from 'firebase-admin';
import { createClient } from '@supabase/supabase-js';
import { generateGoogleEmbedding, batchGenerateGoogleEmbeddings } from '../../lib/google-embeddings.js';
import dotenv from 'dotenv';
dotenv.config();

// ==========================================
// 1. Configuration & Clients
// ==========================================

// Firebase
const firebaseConfig = {
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
};

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(firebaseConfig),
    });
}
const firestore = admin.firestore();

// Supabase
const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_KEY
);

// ==========================================
// 2. Helper Functions
// ==========================================

const buildToolDescription = (data) => {
    let parts = [];
    if (data.longDescription) parts.push(data.longDescription);
    else if (data.description) parts.push(data.description);
    if (data.features) parts.push(`الميزات: ${data.features.slice(0, 5).join('، ')}`);
    return parts.join(' | ') || data.name;
};

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// ==========================================
// 3. MAIN MIGRATION LOGIC
// ==========================================

const migrateTools = async () => {
    console.log("\n--- 🛠️  Migrating TOOLS Embeddings (BATCH MODE) ---");
    
    // 1. جلب المعرفات الموجودة
    const { data: existingTools } = await supabase.from('tools_embeddings').select('id');
    const existingIds = new Set(existingTools?.map(t => t.id) || []);
    console.log(`ℹ️  Found ${existingIds.size} tools already in Supabase.`);

    // 2. جلب الأدوات المتبقية من Firebase
    const snapshot = await firestore.collection('tools').get();
    const toolsToProcess = [];
    snapshot.forEach(doc => {
        if (!existingIds.has(doc.id)) {
            const data = doc.data();
            toolsToProcess.push({
                id: doc.id,
                name: data.name,
                description: buildToolDescription(data),
                category: data.category?.[0] || 'General',
                link: `https://www.tolzy.me/tools/${doc.id}`
            });
        }
    });

    if (toolsToProcess.length === 0) {
        console.log("✅ All tools are already migrated.");
        return;
    }

    console.log(`⏳ Processing ${toolsToProcess.length} remaining tools in batches...`);
    
    const BATCH_SIZE = 50;
    for (let i = 0; i < toolsToProcess.length; i += BATCH_SIZE) {
        const batch = toolsToProcess.slice(i, i + BATCH_SIZE);
        console.log(`\n📦 Initializing Batch [${Math.floor(i/BATCH_SIZE)+1}/${Math.ceil(toolsToProcess.length/BATCH_SIZE)}] (${batch.length} items)...`);
        
        try {
            const texts = batch.map(t => `${t.name}. ${t.description}`);
            const embeddings = await batchGenerateGoogleEmbeddings(texts);
            
            for (let j = 0; j < batch.length; j++) {
                const item = { ...batch[j], embedding: embeddings[j] };
                const { error } = await supabase.from('tools_embeddings').upsert(item);
                if (error) console.error(`   ❌ [${i+j+1}] Failed: ${item.name} - ${error.message}`);
                else console.log(`   ✅ [${i+j+1}] Success: ${item.name}`);
            }
            await delay(2000);
        } catch (e) {
            console.error(`❌ Batch error: ${e.message}`);
        }
    }
};

const migrateCourses = async () => {
    console.log("\n--- 📚 Migrating COURSES Embeddings (BATCH MODE) ---");
    
    const { data: existingCourses } = await supabase.from('courses_embeddings').select('id');
    const existingIds = new Set(existingCourses?.map(c => c.id) || []);
    console.log(`ℹ️  Found ${existingIds.size} courses already in Supabase.`);

    const { data: courses, error: fetchErr } = await supabase.from('courses').select('*');
    if (fetchErr) {
        console.error("❌ Error fetching courses:", fetchErr.message);
        return;
    }

    const newCourses = courses.filter(c => !existingIds.has(`course-${c.id}`));
    if (newCourses.length === 0) {
        console.log("✅ All courses are already migrated.");
        return;
    }

    console.log(`⏳ Processing ${newCourses.length} new courses in batches...`);
    
    const BATCH_SIZE = 50;
    for (let i = 0; i < newCourses.length; i += BATCH_SIZE) {
        const batch = newCourses.slice(i, i + BATCH_SIZE);
        console.log(`\n📦 Initializing Batch [${Math.floor(i/BATCH_SIZE)+1}/${Math.ceil(newCourses.length/BATCH_SIZE)}] (${batch.length} items)...`);
        
        try {
            const texts = batch.map(c => `${c.title}. ${c.description}`);
            const embeddings = await batchGenerateGoogleEmbeddings(texts);
            
            for (let j = 0; j < batch.length; j++) {
                const course = batch[j];
                const row = {
                    id: `course-${course.id}`, 
                    title: course.title,
                    description: course.description,
                    category: course.category || 'Course',
                    link: `/learn/course/${course.id}`,
                    embedding: embeddings[j]
                };

                const { error } = await supabase.from('courses_embeddings').upsert(row);
                if (error) console.error(`   ❌ [${i+j+1}] Failed: ${row.title} - ${error.message}`);
                else console.log(`   ✅ [${i+j+1}] Success: ${row.title}`);
            }
            await delay(2000);
        } catch (e) {
            console.error(`❌ Batch error: ${e.message}`);
        }
    }
};

const run = async () => {
    console.log("========================================");
    console.log("   🚀 Google Embedding Migration Tool");
    console.log("========================================\n");

    try {
        await migrateTools();
        await migrateCourses();
        console.log("\n🎉 ALL MIGRATIONS COMPLETED SUCCESSFULLY!");
    } catch (error) {
        console.error("CRITICAL ERROR:", error);
    }
};

run();

