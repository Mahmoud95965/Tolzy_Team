
import dotenv from 'dotenv';
dotenv.config();

const API_KEY = process.env.HUGGINGFACE_API_KEY || process.env.NEXT_PUBLIC_HUGGINGFACE_API_KEY;
const MODEL = "mixedbread-ai/mxbai-embed-large-v1";

const endpoints = [
    `https://router.huggingface.co/hf-inference/models/${MODEL}`,
];

async function testPayload(name, payload) {
    const URL = endpoints[0];
    console.log(`Testing payload: ${name} on ${URL}`);
    try {
        const response = await fetch(endpoints[0], {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${API_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        });

        console.log(`Status: ${response.status} ${response.statusText}`);

        if (response.ok) {
            console.log("✅ SUCCESS!");
            const data = await response.json();

            // Check if it looks like an embedding (array of floats)
            if (Array.isArray(data)) {
                if (Array.isArray(data[0])) {
                    console.log(`Received Array of Arrays. Length: ${data.length}, Dim: ${data[0].length}`);
                } else {
                    console.log(`Received Array. Length: ${data.length}`);
                    if (typeof data[0] === 'number') console.log("It is an embedding!");
                }
            } else {
                console.log("Received Object:", JSON.stringify(data).substring(0, 100));
            }
            return true;
        } else {
            const text = await response.text();
            console.log(`❌ Failed: ${text.substring(0, 200)}...`);
            return false;
        }
    } catch (error) {
        console.log(`❌ Error: ${error.message}`);
        return false;
    }
}

async function run() {
    console.log(`Targeting: ${endpoints[0]}\n`);
    await testPayload("Standard Inputs Array", { inputs: "Hello world" });
}

run();
