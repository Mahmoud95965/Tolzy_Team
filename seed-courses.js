import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, query, where } from "firebase/firestore";
import { createClient } from "@supabase/supabase-js";
import { generateHuggingFaceEmbedding } from "./src/lib/huggingface.js";

// Initialize Gemini (only for other tasks if needed, not embedding)
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY);
import dotenv from "dotenv";
import fs from "fs";

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
const supabase = createClient(supabaseUrl, supabaseKey);

// Initialize Gemini



async function seed() {
    console.log("🚀 Starting Course seeding process...");

    // 1. Fetch Published Courses
    console.log("Fetching courses from Firestore...");
    // Only fetch published courses
    const q = query(collection(db, "courses")); // Filtering in memory to be safe if index missing
    const coursesSnapshot = await getDocs(q);

    const courses = [];
    coursesSnapshot.forEach((doc) => {
        const data = doc.data();
        // Skip unpublished if needed, though client side filtering is safer without composite index
        if (data.isPublished === false) return;

        const whatYouWillLearnText = Array.isArray(data.whatYouWillLearn)
            ? data.whatYouWillLearn.join(", ")
            : "";

        courses.push({
            id: doc.id,
            title: data.title,
            description: data.description || "",
            category: data.category || "General",
            level: data.level || "All Levels",
            price: data.price || "Free",
            link: `https://www.tolzy.me/learn/course/${doc.id}`,
            // Rich context for embedding
            fullText: `Course Title: ${data.title}. Description: ${data.description || ""}. Category: ${data.category}. What you will learn: ${whatYouWillLearnText}. Level: ${data.level}.`
        });
    });
    console.log(`Found ${courses.length} published courses.`);

    // 2. Process in Batches
    const BATCH_SIZE = 5; // Smaller batch specific for accurate processing
    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < courses.length; i += BATCH_SIZE) {
        const batch = courses.slice(i, i + BATCH_SIZE);
        console.log(`Processing batch ${Math.floor(i / BATCH_SIZE) + 1} (${i + 1} - ${Math.min(i + batch.length, courses.length)})...`);

        await Promise.all(batch.map(async (course) => {
            try {
                // Generate Embedding
                const vector = await generateHuggingFaceEmbedding(course.fullText);

                // Upload to Supabase
                const { error } = await supabase
                    .from("courses_embeddings")
                    .upsert({
                        id: course.id,
                        title: course.title,
                        description: course.description,
                        category: course.category,
                        level: course.level,
                        price: course.price,
                        link: course.link,
                        embedding: vector
                    });

                if (error) {
                    console.error(`   ❌ Supabase Error (${course.title}):`, error.message);
                    errorCount++;
                } else {
                    // console.log(`   ✅ Saved: ${course.title}`);
                    successCount++;
                }
            } catch (err) {
                if (err.message && err.message.includes('429')) {
                    console.error(`   ❌ Rate Limit 429 (${course.title}). Pausing...`);
                    await new Promise(r => setTimeout(r, 10000)); // Wait 10s
                } else {
                    console.error(`   ❌ Error (${course.title}):`, err.message);
                }
                errorCount++;
            }
        }));

        // Rate limit pause between batches
        await new Promise(r => setTimeout(r, 2000));
    }

    console.log("\n--------------------------------");
    console.log(`✅ Completed! Success: ${successCount}, Failed: ${errorCount}`);
    console.log("--------------------------------");
}

seed();

