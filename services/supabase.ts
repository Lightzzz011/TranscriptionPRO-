import { createClient } from '@supabase/supabase-js';

// NOTE: Fill these in with your real Supabase details.
// For the purpose of this demo, if these are missing, the app uses a simulated Auth provider.
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://xyz.supabase.co';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'your-anon-key';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
