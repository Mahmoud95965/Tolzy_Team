import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

let cachedTools = null;
let lastFetchTime = 0;
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

export const getAllTools = async () => {
    const now = Date.now();

    // Return cached data if valid
    if (cachedTools && (now - lastFetchTime < CACHE_DURATION)) {
        console.log('Serving tools from memory cache');
        return cachedTools;
    }

    console.log('Fetching tools from Supabase...');
    try {
        const { data, error } = await supabase
            .from('tools_embeddings')
            .select('id, name, description, category, link, url');

        if (error) {
            console.error('Supabase Error:', error.message);
            return cachedTools || [];
        }

        if (!data || data.length === 0) {
            console.log('No tools found in Supabase.');
            return [];
        }

        const tools = data.map(tool => ({
            id: tool.id,
            name: tool.name,
            description: tool.description || "",
            category: tool.category || "General",
            externalUrl: tool.link || null, // الرابط الأصلي للأداة من Supabase
            link: `https://www.tolzy.me/tools/${tool.id}` // رابط صفحة الأداة على Tolzy
        }));

        cachedTools = tools;
        lastFetchTime = now;
        console.log(`Fetched ${tools.length} tools successfully from Supabase.`);
        return tools;
    } catch (error) {
        console.error("Error fetching tools:", error);
        return cachedTools || [];
    }
};
