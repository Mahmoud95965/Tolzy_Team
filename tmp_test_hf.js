const { HfInference } = require('@huggingface/inference');

const hf = new HfInference(process.env.HUGGINGFACE_API_KEY);

async function test() {
    try {
        const out = await hf.chatCompletion({
            model: "meta-llama/Meta-Llama-3-8B-Instruct",
            messages: [{ role: "user", content: "Say hello in Arabic." }],
            max_tokens: 50
        });
        console.log("SUCCESS:", out.choices[0].message.content);
    } catch (e) {
        console.error("ERROR:", e.message);
    }
}
test();
