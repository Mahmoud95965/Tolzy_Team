import { generateGoogleEmbedding } from '../../lib/google-embeddings.js';
import dotenv from 'dotenv';
dotenv.config();

async function test() {
    console.log("🔍 Testing Gemini Embedding Dimension...");
    try {
        const text = "Tolzy AI Platform Test";
        const embedding = await generateGoogleEmbedding(text);
        
        console.log("✅ Success!");
        console.log(`📊 Dimension: ${embedding.length}`);
        
        if (embedding.length === 3072) {
            console.log("⚠️  Dimension is indeed 3072. We need to update Supabase schema.");
        } else if (embedding.length === 768) {
            console.log("✨ Dimension is 768. Supabase should be fine.");
        } else {
            console.log(`❓ Dimension is ${embedding.length}. Check Supabase settings.`);
        }
    } catch (error) {
        console.error("❌ Test Failed:", error.message);
    }
}

test();
