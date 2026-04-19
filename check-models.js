import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;

if (!apiKey) {
    console.error("❌ API Key not found in environment variables.");
    process.exit(1);
}

console.log(`🔑 Checking API Key: ${apiKey.substring(0, 5)}...`);

const genAI = new GoogleGenerativeAI(apiKey);

async function listModels() {
    try {
        // There isn't a direct listModels in the simplified SDK usually, but we can try a simple embedding to test auth.
        // Or we can try to use the model and catch specific errors.

        // Test Embedding
        console.log("🧪 Testing 'text-embedding-004'...");
        const model = genAI.getGenerativeModel({ model: "text-embedding-004" });
        const result = await model.embedContent("Hello world");
        console.log("✅ 'text-embedding-004' is working! Vector length:", result.embedding.values.length);

    } catch (error) {
        console.error("❌ Error with 'text-embedding-004':", error.message);

        // Test Fallback
        try {
            console.log("🧪 Testing fallback 'embedding-001'...");
            const model2 = genAI.getGenerativeModel({ model: "embedding-001" });
            const result2 = await model2.embedContent("Hello world");
            console.log("✅ 'embedding-001' is working! Vector length:", result2.embedding.values.length);
        } catch (error2) {
            console.error("❌ Error with 'embedding-001':", error2.message);
        }
    }
}

listModels();
