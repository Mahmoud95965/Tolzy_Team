import { createClient } from '@supabase/supabase-js';

// Get the environment variables from the server
// IMPORTANT: Add BILLING_SUPABASE_SERVICE_ROLE_KEY to your .env file
const SUPABASE_URL = process.env.NEXT_PUBLIC_BILLING_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = process.env.BILLING_SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';
export const hasSupabaseAdminConfig = Boolean(process.env.NEXT_PUBLIC_BILLING_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL) && Boolean(process.env.BILLING_SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY);

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.warn("Missing Supabase URL or Service Role Key in build environment. Using placeholders for build-time evaluation.");
}


// 2. Supabase Admin Client
// Using the Service Role Key allows bypassing Row Level Security (RLS) policies 
// so we can safely update user data via backend webhook without needing a user session.
export const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});
