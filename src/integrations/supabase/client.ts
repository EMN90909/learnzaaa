import { createClient } from '@supabase/supabase-js';

// Use the correct Supabase URL format that the library expects
const supabaseUrl = 'https://thhdjoujpzwtsetrahnb.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRoaGRqb3VqcHp3dHNldHJhaG5iIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU3ODQ1MTAsImV4cCI6MjA3MTM2MDUxMH0.FXfcWsZuly-UcPPwdiSREK3v4UuLlHed2ftACdebIL0';

// Create and export the Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);