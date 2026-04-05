// Required Packages
import { createClient } from '@supabase/supabase-js';

// Direct Supabase Connection
const {
    VITE_SUPABASE_URL: supabaseUrl,
    VITE_SUPABASE_KEY: supabaseAnonKey
} = import.meta.env;

if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('[supabase] VITE_SUPABASE_URL or VITE_SUPABASE_KEY is not set – Supabase features will be unavailable.');
}

const supabase = createClient(supabaseUrl ?? 'http://localhost:54321', supabaseAnonKey ?? 'placeholder');

// Export Connection's
export { supabase };
