import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Validate environment variables
if (!supabaseUrl || supabaseUrl === 'your_supabase_project_url') {
  throw new Error('VITE_SUPABASE_URL is missing or not configured. Please set a valid Supabase project URL in your .env file.');
}

if (!supabaseAnonKey || supabaseAnonKey === 'your_supabase_anon_key') {
  throw new Error('VITE_SUPABASE_ANON_KEY is missing or not configured. Please set a valid Supabase anonymous key in your .env file.');
}

// Validate URL format
try {
  new URL(supabaseUrl);
} catch (error) {
  throw new Error(`VITE_SUPABASE_URL is not a valid URL: ${supabaseUrl}. Please check your .env file and ensure it follows the format: https://your-project-ref.supabase.co`);
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Export configurable bucket name
export const SUPABASE_MEDIA_BUCKET = import.meta.env.VITE_SUPABASE_MEDIA_BUCKET || 'media';