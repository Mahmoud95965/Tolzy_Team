import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

async function checkDimension() {
    try {
        const modelName = "gemini-embedding-001";
        console.log(`🧪 Testing '${modelName}'...`);
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.embedContent("Hello world");
        const dim = result.embedding.values.length;
        console.log(`✅ Success! Model: ${modelName}, Dimension: ${dim}`);
    } catch (error) {
        console.error("❌ Error:", error.message);
    }
}

checkDimension();
