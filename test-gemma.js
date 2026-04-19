import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
dotenv.config({ path: '.env' });

async function listModels() {
    const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    if (!apiKey) {
        console.error("No API key found in .env");
        return;
    }

    const genAI = new GoogleGenerativeAI(apiKey);

    try {
        console.log("Fetching available models...");

        // Test gemma-3-27b-it
        const modelName = "gemma-3-27b-it";
        console.log(`Testing model: ${modelName}`);
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent("Hello, are you there?");
        console.log("Success! Response:", result.response.text());

    } catch (error) {
        console.error("Error with gemma-3-27b-it:", error.message);

        // Falback: Test standard gemini model to verify API key works
        try {
            console.log("Testing fallback model: gemini-1.5-flash...");
            const fallbackModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
            const result = await fallbackModel.generateContent("Hello");
            console.log("Fallback success! API Key is valid.");
        } catch (fallbackError) {
            console.error("Fallback failed too:", fallbackError.message);
        }
    }
}

listModels();
