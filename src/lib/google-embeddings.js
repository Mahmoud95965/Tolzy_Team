import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from 'dotenv';

// Ensuring environment variables are loaded if used in standalone scripts
dotenv.config();

/**
 * توليد Embeddings باستخدام موديل Google text-embedding-004
 * @param {string} text - النص المراد تحويله لمتجهات
 * @returns {Promise<number[]>} - مصفوفة المتجهات (768 dimension)
 */
export async function generateGoogleEmbedding(text) {
    const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;

    if (!apiKey) {
        throw new Error("GEMINI_API_KEY is missing from environment variables.");
    }

    const maxRetries = 3;
    let delayMs = 5000;

    for (let i = 0; i <= maxRetries; i++) {
        try {
            const genAI = new GoogleGenerativeAI(apiKey);
            const model = genAI.getGenerativeModel({ model: "gemini-embedding-2-preview" });
            const cleanText = text.replace(/\n/g, " ").replace(/\s+/g, " ").trim();
            const result = await model.embedContent({
                content: { parts: [{ text: cleanText }] },
                outputDimensionality: 1024
            });
            return result.embedding.values;
        } catch (error) {
            if (error.message?.includes("429") && i < maxRetries) {
                console.warn(`⚠️ Rate limit hit. Retrying in ${delayMs/1000}s... (Attempt ${i+1}/${maxRetries})`);
                await new Promise(resolve => setTimeout(resolve, delayMs));
                delayMs *= 2;
                continue;
            }
            console.error("❌ Google Embedding Error:", error.message);
            throw error;
        }
    }
}

export async function batchGenerateGoogleEmbeddings(texts) {
    const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;

    if (!apiKey) {
        throw new Error("GEMINI_API_KEY is missing from environment variables.");
    }

    const maxRetries = 3;
    let delayMs = 10000;

    for (let i = 0; i <= maxRetries; i++) {
        try {
            const genAI = new GoogleGenerativeAI(apiKey);
            const model = genAI.getGenerativeModel({ model: "gemini-embedding-2-preview" });

            const result = await model.batchEmbedContents({
                requests: texts.map((t) => ({
                    content: { role: "user", parts: [{ text: t.replace(/\n/g, " ").trim() }] },
                    outputDimensionality: 1024
                })),
            });

            return result.embeddings.map((e) => e.values);
        } catch (error) {
            if (error.message?.includes("429") && i < maxRetries) {
                console.warn(`⚠️ Batch Rate limit hit. Retrying in ${delayMs/1000}s... (Attempt ${i+1}/${maxRetries})`);
                await new Promise(resolve => setTimeout(resolve, delayMs));
                delayMs *= 2;
                continue;
            }
            console.error("❌ Google Batch Embedding Error:", error.message);
            throw error;
        }
    }
}
