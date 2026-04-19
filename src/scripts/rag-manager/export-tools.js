import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error("❌ Error: SUPABASE_URL or SUPABASE_KEY is missing in .env");
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const main = async () => {
    console.log("========================================");
    console.log("   📥 Tolzy Tools Exporter v1.0");
    console.log("========================================");

    console.log("🔍 Fetching all tools from Supabase...");

    const { data, error } = await supabase
        .from('tools_embeddings')
        .select('id, name, description, category, link')
        .order('name', { ascending: true });

    if (error) {
        console.error("❌ Error fetching tools:", error.message);
        process.exit(1);
    }

    console.log(`✅ Found ${data.length} tools.`);

    // Save to JSON file
    const outputPath = path.join(__dirname, 'tools_export.json');
    const exportData = {
        exportDate: new Date().toISOString(),
        totalTools: data.length,
        tools: data
    };

    fs.writeFileSync(outputPath, JSON.stringify(exportData, null, 2), 'utf-8');
    console.log(`📁 Exported to: ${outputPath}`);

    console.log("\n✨ Export Completed Successfully.");
};

main().catch(err => {
    console.error("Critical Error:", err);
});
