
export async function generateHuggingFaceEmbedding(text) {
    // Access the environment variable inside the function to ensure dotenv has loaded
    const HUGGINGFACE_API_KEY = process.env.HUGGINGFACE_API_KEY || process.env.NEXT_PUBLIC_HUGGINGFACE_API_KEY;

    if (!HUGGINGFACE_API_KEY) {
        console.error("CRITICAL: HUGGINGFACE_API_KEY is missing from environment variables.");
        throw new Error("HUGGINGFACE_API_KEY is missing. Please add it to your .env file or Vercel project settings.");
    }

    const model = "mixedbread-ai/mxbai-embed-large-v1"; // 1024 dimensions
    const maxRetries = 5;
    let baseDelay = 3000; // Start with 3 seconds (HF models might need time to load)

    for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
            const url = `https://router.huggingface.co/hf-inference/models/${model}`;
            const response = await fetch(url, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${HUGGINGFACE_API_KEY}`,
                    "Content-Type": "application/json",
                    "x-wait-for-model": "true" // Important: Tells HF to wait if model is loading
                },
                body: JSON.stringify({
                    inputs: text,
                    options: {
                        wait_for_model: true
                    }
                })
            });

            // Handle Rate Limiting (429) & Server Errors (5xx)
            if (response.status === 503 || response.status === 429 || response.status >= 500) {
                const errorText = await response.text();
                console.warn(`⚠️ Hugging Face API Warning (Attempt ${attempt + 1}/${maxRetries}): ${response.status} - ${errorText.substring(0, 100)}...`);

                if (attempt < maxRetries - 1) {
                    const delay = baseDelay * Math.pow(2, attempt);
                    console.log(`⏳ Waiting ${delay / 1000}s before retrying...`);
                    await new Promise(resolve => setTimeout(resolve, delay));
                    continue;
                }
            }

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Hugging Face API Error (${response.status} ${response.statusText}) at ${url}: ${errorText.substring(0, 200)}...`);
            }

            const result = await response.json();

            // HF Feature Extraction returns an array (or array of arrays if batch)
            // Check if result is a valid array
            if (Array.isArray(result)) {
                // If we sent a single string, we expect a single embedding array (1D) or an array containing it (2D)
                // intfloat/multilingual-e5-large returns [0.1, 0.2, ...] (1024 floats)

                // Sometimes HF returns [[0.1, ...]] if inputs was ["text"] (array)
                // But here inputs is 'text' (string). However, to be safe:
                if (Array.isArray(result[0]) && typeof result[0] !== 'number') {
                    return result[0]; // It was nested
                }
                return result; // It was flat
            } else {
                throw new Error(`Unexpected response format from HF: ${JSON.stringify(result).substring(0, 100)}`);
            }

        } catch (error) {
            // Network errors or other fetch failures
            if (attempt < maxRetries - 1) {
                console.warn(`⚠️ Network Error (Attempt ${attempt + 1}/${maxRetries}): ${error.message}`);
                const delay = baseDelay * Math.pow(2, attempt);
                await new Promise(resolve => setTimeout(resolve, delay));
            } else {
                throw error;
            }
        }
    }
}
