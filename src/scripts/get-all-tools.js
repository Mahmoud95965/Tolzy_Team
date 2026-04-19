
/**
 * Script to fetch all tools from Firebase Firestore and save to a JSON file
 */

import admin from 'firebase-admin';
import fs from 'fs';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Fix for __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from the root .env file
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// Firebase Setup
const firebaseConfig = {
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
};

if (!admin.apps.length) {
    try {
        admin.initializeApp({
            credential: admin.credential.cert(firebaseConfig),
        });
    } catch (error) {
        console.error('Error initializing Firebase Admin:', error);
        process.exit(1);
    }
}

const db = admin.firestore();

const main = async () => {
    console.log("========================================");
    console.log("   📥 Fetching All Tools from Firestore");
    console.log("========================================\n");

    try {
        console.log("Connecting to Firestore...");
        const snapshot = await db.collection('tools').get();

        if (snapshot.empty) {
            console.log("❌ No tools found in Firestore!");
            return;
        }

        const tools = [];
        snapshot.forEach(doc => {
            tools.push({
                id: doc.id,
                ...doc.data()
            });
        });

        console.log(`✅ Successfully fetched ${tools.length} tools.`);

        const outputPath = path.resolve(__dirname, '../../all_tools.json');

        console.log(`💾 Saving to ${outputPath}...`);
        fs.writeFileSync(outputPath, JSON.stringify(tools, null, 2));

        console.log("\n✨ Process Completed Successfully!");
        console.log(`📂 File saved: all_tools.json`);

    } catch (error) {
        console.error("❌ Error fetching tools:", error);
    }
};

main();
