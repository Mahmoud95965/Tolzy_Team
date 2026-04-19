import dotenv from "dotenv";
import fs from "fs";
import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import { createClient } from "@supabase/supabase-js";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { generateGoogleEmbedding } from "./src/lib/google-embeddings.js";

// Load .env.local if exists, otherwise .env
if (fs.existsSync(".env.local")) {
    dotenv.config({ path: ".env.local" });
} else {
    dotenv.config();
}

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Initialize Supabase
const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
// Note: Ideally use SERVICE_ROLE_KEY for writing if RLS is strict, but trying anon first.
const supabase = createClient(supabaseUrl, supabaseKey);


async function seed() {
    console.log("🚀 Starting seeding process...");

    // 1. Fetch Tools from Firestore
    console.log("Fetching tools from Firestore...");
    const toolsSnapshot = await getDocs(collection(db, "tools"));
    const tools = [];
    toolsSnapshot.forEach((doc) => {
        const data = doc.data();
        tools.push({
            id: doc.id,
            name: data.name,
            description: data.description || data.shortDescription || "",
            category: data.category || "General",
            link: `https://www.tolzy.me/tools/${doc.id}`,
            fullText: `${data.name} ${data.description || ""} ${data.category || ""}`
        });
    });
    console.log(`Found ${tools.length} tools in Firestore.`);

    // 2. Fetch existing IDs from Supabase to skip them
    console.log("Fetching existing embeddings from Supabase to avoid duplicates...");
    const { data: existingData, error: fetchError } = await supabase
        .from("tools_embeddings")
        .select("id");

    if (fetchError) {
        console.error("❌ Error fetching existing IDs from Supabase:", fetchError.message);
        return; // Stop script if we can't read from Supabase
    }

    const existingIds = new Set(existingData.map(row => row.id));
    
    // Filter tools (Keep only those NOT in existingIds)
    const toolsToProcess = tools.filter(tool => !existingIds.has(tool.id));
    
    console.log(`⏩ Skipping ${existingIds.size} already embedded tools.`);
    console.log(`🚀 Will process ${toolsToProcess.length} new tools.`);

    if (toolsToProcess.length === 0) {
        console.log("✅ All tools are already embedded. Nothing to do.");
        return;
    }

    // 3. Process sequentially in logical batches
    const BATCH_SIZE = 10;
    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < toolsToProcess.length; i += BATCH_SIZE) {
        const batch = toolsToProcess.slice(i, i + BATCH_SIZE);
        console.log(`Processing batch ${Math.floor(i / BATCH_SIZE) + 1} (${i + 1} - ${i + batch.length} of ${toolsToProcess.length})...`);

        // Process one by one inside the batch to avoid Rate Limits
        for (const tool of batch) {
            let retries = 3;
            let success = false;

            while (retries > 0 && !success) {
                try {
                    // 1. Generate Embedding
                    const vector = await generateGoogleEmbedding(tool.fullText);

                    // 2. Upload to Supabase
                    const { error } = await supabase
                        .from("tools_embeddings")
                        .upsert({
                            id: tool.id,
                            name: tool.name,
                            description: tool.description,
                            category: tool.category,
                            link: tool.link,
                            embedding: vector
                        });

                    if (error) {
                        console.error(`   ❌ Supabase Error (${tool.name}):`, error.message);
                        errorCount++;
                        break; // DB error, skip to next tool
                    } else {
                        console.log(`   ✅ Saved: ${tool.name}`);
                        successCount++;
                        success = true; // Break out of retry loop
                    }

                } catch (err) {
                    if (err.message.includes('429')) {
                        console.warn(`   ⚠️ Rate Limit 429 hit for (${tool.name}). Waiting 20 seconds... (Attempt ${4 - retries}/3)`);
                        await new Promise(r => setTimeout(r, 20000)); // Wait 20s
                        retries--;
                    } else {
                        console.error(`   ❌ API Error (${tool.name}):`, err.message);
                        errorCount++;
                        break; // Other API error, skip to next tool
                    }
                }
            }

            if (!success && retries === 0) {
                console.error(`   ❌ Failed permanently after retries (${tool.name})`);
                errorCount++;
            }

            // Slight delay (500ms) between tools to ease pressure
            await new Promise(r => setTimeout(r, 500));
        }

        // Delay between batches
        console.log("   ⏳ Taking a short break before the next batch...");
        await new Promise(r => setTimeout(r, 3000));
    }

    console.log("\n--------------------------------");
    console.log(`✅ Completed! Success: ${successCount}, Failed: ${errorCount}`);
    console.log("--------------------------------");
}

seed();