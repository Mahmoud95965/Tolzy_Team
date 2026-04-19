import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Fix __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
const envPath = path.resolve(process.cwd(), '.env');
const envConfig = dotenv.parse(fs.readFileSync(envPath));

const supabaseUrl = envConfig.SUPABASE_URL || envConfig.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = envConfig.SUPABASE_KEY || envConfig.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Error: Missing Supabase credentials in .env');
    process.exit(1);
}

console.log(`Checking Supabase connection...`);
console.log(`URL: ${supabaseUrl}`);
// Mask key for security in logs
console.log(`Key: ${supabaseKey.substring(0, 10)}...`);

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
    try {
        console.log('\n--- 1. Testing Connection (Listing Tables) ---');
        // Simple query to checking if we can reach Supabase. 
        // Note: 'conversations' might respond with [] if empty or blocked by RLS.
        const { data: listData, error: listError } = await supabase
            .from('conversations')
            .select('count', { count: 'exact', head: true });

        if (listError) {
            console.error('❌ Error connecting/listing:', listError.message);
            console.error('Details:', listError);
            if (listError.code === '42P01') {
                console.error('💡 HINT: The table "conversations" does not exist. Did you run the SQL script?');
            }
        } else {
            console.log('✅ Connection successful. Table found.');
        }

        console.log('\n--- 2. Testing Insert (Write Permission) ---');
        console.log('\n--- 2. Testing Insert (Auto-ID Generation) ---');
        // Test Insert WITHOUT an ID to ensure auto-gen works with upsert/insert
        const { data: insertData, error: insertError } = await supabase
            .from('conversations')
            .upsert({
                user_id: 'test-user-auto',
                title: 'Test Auto-ID',
                messages: [{ role: 'system', content: 'Auto-ID test' }],
                updated_at: new Date().toISOString()
            })
            .select()
            .single();

        if (insertError) {
            console.error('❌ Insert Failed:', insertError.message);
            console.error('Full Error:', insertError);
            if (insertError.code === '42501') {
                console.error('💡 HINT: RLS Policy Violation. Permission denied.');
            }
            if (insertError.code === '22P02') {
                console.error('💡 HINT: Invalid input syntax (e.g. UUID format).');
            }
        } else {
            console.log('✅ Insert successful!', insertData);

            // CLEANUP
            console.log('\n--- 3. Cleaning up test record ---');
            const { error: deleteError } = await supabase
                .from('conversations')
                .delete()
                .eq('id', insertData.id);

            if (deleteError) console.error('⚠️ Could not delete test record:', deleteError.message);
            else console.log('✅ Cleanup successful.');
        }

    } catch (err) {
        console.error('Unexpected script error:', err);
    }
}

testConnection();
