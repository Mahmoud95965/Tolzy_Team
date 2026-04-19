import dotenv from "dotenv";

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;

if (!apiKey) {
    console.error("❌ API Key not found.");
    process.exit(1);
}

const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

console.log("Fetching available models from:", url.replace(apiKey, "HIDDEN_KEY"));

fetch(url)
    .then(res => res.json())
    .then(data => {
        if (data.error) {
            console.error("❌ API Error:", data.error);
        } else if (data.models) {
            console.log("✅ Available Models:");
            data.models.forEach(m => {
                if (m.name.includes("embedding")) {
                    console.log(` - ${m.name} (Supported methods: ${m.supportedGenerationMethods})`);
                }
            });
            // console.log("All models:", data.models.map(m => m.name));
        } else {
            console.log("⚠️ No models returned.", data);
        }
    })
    .catch(err => console.error("❌ Network Error:", err));
