import { createClient } from '@supabase/supabase-js';

// Get environment variables with fallback values
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://thhdjoujpzwtsetrahnb.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRoaGRqb3VqcHp3dHNldHJhaG5iIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU3ODQ1MTAsImV4cCI6MjA3MTM2MDUxMH0.FXfcWsZuly-UcPPwdiSREK3v4UuLlHed2ftACdebIL0';

// Validate the Supabase URL - allow both http and https protocols
if (!supabaseUrl || (!supabaseUrl.startsWith('http://') && !supabaseUrl.startsWith('https://'))) {
  console.error('Invalid Supabase URL. Please check your environment variables.');
  throw new Error('Invalid Supabase URL: Must be a valid HTTP or HTTPS URL.');
}

// Create and export the Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);