import dotenv from 'dotenv';

// Ensuring environment variables are loaded if used in standalone scripts
dotenv.config();

/**
 * توليد Embeddings باستخدام موديل Hugging Face كبديل لـ Google
 * @param {string} text - النص المراد تحويله لمتجهات
 * @returns {Promise<number[]>} - مصفوفة المتجهات (1024 dimension)
 */
export async function generateGoogleEmbedding(text) {
    const apiKey = process.env.HUGGINGFACE_API_KEY || process.env.NEXT_PUBLIC_HUGGINGFACE_API_KEY;

    if (!apiKey) {
        throw new Error("HUGGINGFACE_API_KEY is missing from environment variables.");
    }

    const model = "mixedbread-ai/mxbai-embed-large-v1";
    const maxRetries = 3;
    let delayMs = 5000;

    for (let i = 0; i <= maxRetries; i++) {
        try {
            const url = `https://router.huggingface.co/hf-inference/models/${model}`;
            const cleanText = text.replace(/\n/g, " ").replace(/\s+/g, " ").trim();
            
            const response = await fetch(url, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${apiKey}`,
                    "Content-Type": "application/json",
                    "x-wait-for-model": "true"
                },
                body: JSON.stringify({
                    inputs: cleanText,
                    options: { wait_for_model: true }
                })
            });

            if (response.status === 503 || response.status === 429) {
                if (i < maxRetries) {
                    console.warn(`⚠️ Rate limit or service unavailable. Retrying in ${delayMs/1000}s... (Attempt ${i+1}/${maxRetries})`);
                    await new Promise(resolve => setTimeout(resolve, delayMs));
                    delayMs *= 2;
                    continue;
                }
            }

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HF embedding error: ${response.status} - ${errorText}`);
            }

            const result = await response.json();
            if (Array.isArray(result)) {
                if (Array.isArray(result[0]) && typeof result[0] !== 'number') {
                    return result[0];
                }
                return result;
            } else {
                throw new Error("Unexpected format from Hugging Face");
            }
        } catch (error) {
            if (i === maxRetries) {
                console.error("❌ Embedding Error after retries:", error.message);
                throw error;
            }
            console.warn(`⚠️ Warning: Attempt ${i+1} failed: ${error.message}. Retrying...`);
            await new Promise(resolve => setTimeout(resolve, delayMs));
            delayMs *= 2;
        }
    }
}

/**
 * توليد Embeddings دفعة واحدة باستخدام Hugging Face كبديل لـ Google
 * @param {string[]} texts - النصوص المراد تحويلها
 * @returns {Promise<number[][]>} - مصفوفة المتجهات ثنائية الأبعاد (1024 dimension لكل نص)
 */
export async function batchGenerateGoogleEmbeddings(texts) {
    const apiKey = process.env.HUGGINGFACE_API_KEY || process.env.NEXT_PUBLIC_HUGGINGFACE_API_KEY;

    if (!apiKey) {
        throw new Error("HUGGINGFACE_API_KEY is missing from environment variables.");
    }

    const model = "mixedbread-ai/mxbai-embed-large-v1";
    const maxRetries = 3;
    let delayMs = 10000;

    for (let i = 0; i <= maxRetries; i++) {
        try {
            const url = `https://router.huggingface.co/hf-inference/models/${model}`;
            const cleanTexts = texts.map(t => t.replace(/\n/g, " ").replace(/\s+/g, " ").trim());

            const response = await fetch(url, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${apiKey}`,
                    "Content-Type": "application/json",
                    "x-wait-for-model": "true"
                },
                body: JSON.stringify({
                    inputs: cleanTexts,
                    options: { wait_for_model: true }
                })
            });

            if (response.status === 503 || response.status === 429) {
                if (i < maxRetries) {
                    console.warn(`⚠️ Batch Rate limit or service unavailable. Retrying in ${delayMs/1000}s... (Attempt ${i+1}/${maxRetries})`);
                    await new Promise(resolve => setTimeout(resolve, delayMs));
                    delayMs *= 2;
                    continue;
                }
            }

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HF batch embedding error: ${response.status} - ${errorText}`);
            }

            const result = await response.json();
            if (Array.isArray(result)) {
                return result;
            } else {
                throw new Error("Unexpected format from Hugging Face for batch");
            }
        } catch (error) {
            if (i === maxRetries) {
                console.error("❌ Batch Embedding Error after retries:", error.message);
                throw error;
            }
            console.warn(`⚠️ Warning: Batch attempt ${i+1} failed: ${error.message}. Retrying...`);
            await new Promise(resolve => setTimeout(resolve, delayMs));
            delayMs *= 2;
        }
    }
}
