/**
 * سكريبت لمزامنة الأدوات من Firebase إلى Supabase
 * يستخدم الـ Firebase Document IDs الصحيحة
 */

import admin from 'firebase-admin';
import { createClient } from '@supabase/supabase-js';
import { generateHuggingFaceEmbedding } from '../../lib/huggingface.js';
import dotenv from 'dotenv';
dotenv.config();

// Firebase Setup
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

const db = admin.firestore();

// Supabase Setup
const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_KEY
);

/**
 * دمج البيانات الغنية في وصف واحد للـ AI
 */
const buildRichDescription = (data) => {
    let parts = [];

    // الوصف الطويل أولاً
    if (data.longDescription) {
        parts.push(data.longDescription);
    } else if (data.description) {
        parts.push(data.description);
    }

    // المميزات
    if (data.pros && Array.isArray(data.pros) && data.pros.length > 0) {
        parts.push(`المميزات: ${data.pros.join('، ')}`);
    }

    // العيوب
    if (data.cons && Array.isArray(data.cons) && data.cons.length > 0) {
        parts.push(`العيوب: ${data.cons.join('، ')}`);
    }

    // الميزات
    if (data.features && Array.isArray(data.features) && data.features.length > 0) {
        parts.push(`الميزات: ${data.features.slice(0, 5).join('، ')}`);
    }

    return parts.join(' | ') || data.description || data.name;
};

/**
 * توليد Embedding لنص واحد
 */
const generateEmbedding = async (text) => {
    try {
        // Use Hugging Face
        const embedding = await generateHuggingFaceEmbedding(text);
        return embedding;
    } catch (error) {
        console.error('Embedding error:', error.message);
        return null;
    }
};

const main = async () => {
    console.log("========================================");
    console.log("   🔄 Firebase to Supabase Sync v1.0");
    console.log("========================================\n");

    // 1. جلب البيانات الموجودة حالياً في Supabase لتجنب التكرار (Incremental Sync)
    console.log("🔍 Fetching existing tools from Supabase...");
    const { data: existingData, error: fetchError } = await supabase
        .from('tools_embeddings')
        .select('id, name, description');

    if (fetchError) {
        console.error("❌ Error fetching existing data:", fetchError.message);
        return;
    }

    const existingToolsMap = new Map();
    if (existingData) {
        existingData.forEach(t => {
            existingToolsMap.set(t.id, { name: t.name, description: t.description });
        });
    }
    console.log(`✅ Found ${existingToolsMap.size} existing tools in Supabase.\n`);

    // 2. جلب الأدوات من Firebase
    console.log("📥 Fetching tools from Firebase...");
    const snapshot = await db.collection('tools').get();

    if (snapshot.empty) {
        console.log("❌ No tools found in Firebase!");
        return;
    }

    const tools = [];
    snapshot.forEach(doc => {
        const data = doc.data();
        tools.push({
            id: doc.id, // استخدام Firebase Document ID
            name: data.name,
            description: buildRichDescription(data),
            category: data.category || 'General',
            link: `https://www.tolzy.me/tools/${doc.id}` // الرابط الصحيح
        });
    });

    console.log(`✅ Found ${tools.length} tools in Firebase.\n`);

    // 3. توليد Embeddings (فقط للأدوات الجديدة أو المُعدّلة)
    console.log("🚀 Checking for new or updated tools...");
    const toolsToUpsert = [];

    for (let i = 0; i < tools.length; i++) {
        const tool = tools[i];
        
        // التحقق مما إذا كانت الأداة موجودة مسبقاً ولم تتغير
        const existing = existingToolsMap.get(tool.id);
        if (existing && existing.name === tool.name && existing.description === tool.description) {
            // الأداة موجودة ولا يوجد بها أي تعديل، لا داعي لتكرار المعالجة
            continue;
        }

        console.log(`\n⏳ Processing New/Updated Tool: ${tool.name}...`);
        const textForEmbedding = `${tool.name}. ${tool.description}`;
        const embedding = await generateEmbedding(textForEmbedding);

        if (embedding) {
            toolsToUpsert.push({
                ...tool,
                embedding: embedding
            });
        }

        // Rate limiting out of respect for HuggingFace API
        await new Promise(resolve => setTimeout(resolve, 300));
    }

    if (toolsToUpsert.length === 0) {
        console.log("\n✅ All tools are already up to date! Nothing new to sync.\n");
        return;
    }

    console.log(`\n✅ Generated ${toolsToUpsert.length} embeddings for new/updated tools.\n`);

    // 4. رفع البيانات إلى Supabase
    console.log("📤 Uploading to Supabase...");
    const BATCH_SIZE = 50;

    for (let i = 0; i < toolsToUpsert.length; i += BATCH_SIZE) {
        const batch = toolsToUpsert.slice(i, i + BATCH_SIZE);

        const { error } = await supabase
            .from('tools_embeddings')
            .upsert(batch, { onConflict: 'id' });

        if (error) {
            console.error(`❌ Batch error:`, error.message);
        } else {
            console.log(`   -> Uploaded ${i + 1} to ${Math.min(i + BATCH_SIZE, toolsToUpsert.length)}`);
        }
    }

    // 5. Cleanup: Remove stale embeddings for tools that were deleted from Firebase
    console.log("\n🧹 Cleaning up stale tool embeddings...");
    const { data: supabaseTools, error: supabaseFetchError } = await supabase
        .from('tools_embeddings')
        .select('id');

    if (!supabaseFetchError && supabaseTools) {
        const firebaseIds = new Set(tools.map(t => t.id));
        const staleIds = supabaseTools
            .map(t => t.id)
            .filter(id => !firebaseIds.has(id));

        if (staleIds.length > 0) {
            console.log(`🗑️ Found ${staleIds.length} stale tool entries. Deleting...`);
            const { error: deleteError } = await supabase
                .from('tools_embeddings')
                .delete()
                .in('id', staleIds);
            
            if (deleteError) {
                console.error(`❌ Cleanup failed: ${deleteError.message}`);
            } else {
                console.log(`✅ Successfully deleted ${staleIds.length} stale tool entries.`);
            }
        } else {
            console.log("✅ No stale tool entries found.");
        }
    }

    console.log("\n✨ Incremental Sync Completed Successfully!");
    console.log(`📦 Total new/updated tools synced: ${toolsToUpsert.length}`);
    console.log("🔗 Links format: https://www.tolzy.me/tools/{firebase-id}");
};

main().catch(err => {
    console.error("Critical Error:", err);
    process.exit(1);
});
