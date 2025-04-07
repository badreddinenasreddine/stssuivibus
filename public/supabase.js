import { createClient } from 'https://esm.sh/@supabase/supabase-js';

const supabaseUrl = 'https://vfczofpofoaovoexjpia.supabase.co';
// Directly assign the Supabase API key
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZmY3pvZnBvZm9hb3ZvZXhqcGlhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM1OTA4MDIsImV4cCI6MjA1OTE2NjgwMn0.swltb41nI_D4pDXFTYp2TuzSJPX1pBn_koIWlBn8HCg'; // Replace with your actual Supabase API key

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});
