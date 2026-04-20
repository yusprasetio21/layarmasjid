import { createClient, SupabaseClient } from '@supabase/supabase-js'

// Supabase credentials (hardcoded for Vercel free tier)
const supabaseUrl = 'https://gbwiftzlqmnmqpnovzoo.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdid2lmdHpscW1ubXFwbm92em9vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY0MDc5ODgsImV4cCI6MjA5MTk4Mzk4OH0.eiF-8nkfq3XNV0MmuGV_6Lys6YAFXxcPHM32u29L4ow'

// Client-side Supabase client (anon key)
export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
  },
})

// Server-side Supabase client (uses anon key since service role key not available)
export const supabaseAdmin: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
})
