
export async function generateMixedbreadEmbedding(text) {
    // Access the environment variable inside the function to ensure dotenv has loaded
    const MIXEDBREAD_API_KEY = process.env.MIXEDBREAD_API_KEY || process.env.NEXT_PUBLIC_MIXEDBREAD_API_KEY;

    if (!MIXEDBREAD_API_KEY) {
        throw new Error("MIXEDBREAD_API_KEY is missing. Please check your .env file.");
    }

    const maxRetries = 5;
    let baseDelay = 2000; // Start with 2 seconds

    for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
            const response = await fetch("https://api.mixedbread.ai/v1/embeddings", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${MIXEDBREAD_API_KEY}`
                },
                body: JSON.stringify({
                    model: "mxbai-embed-large-v1",
                    input: text,
                    encoding_format: "float"
                })
            });

            // Handle Rate Limiting (429) and Server Errors (5xx)
            if (response.status === 429 || response.status >= 500) {
                const errorText = await response.text();
                console.warn(`⚠️ Mixedbread API Warning (Attempt ${attempt + 1}/${maxRetries}): ${response.status} - ${errorText.substring(0, 100)}...`);

                if (attempt < maxRetries - 1) {
                    const delay = baseDelay * Math.pow(2, attempt); // Exponential backoff: 2s, 4s, 8s, 16s...
                    console.log(`⏳ Waiting ${delay / 1000}s before retrying...`);
                    await new Promise(resolve => setTimeout(resolve, delay));
                    continue;
                }
            }

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Mixedbread API Error (${response.status} ${response.statusText}): ${errorText.substring(0, 200)}...`);
            }

            const data = await response.json();
            return data.data[0].embedding;

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
