import { createClient } from '@supabase/supabase-js'

export const driverSupabase = createClient(
  import.meta.env.VITE_DRIVER_SUPABASE_URL,
  import.meta.env.VITE_DRIVER_SUPABASE_ANON_KEY,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    },
  }
)

export const mainSupabase = createClient(
  import.meta.env.VITE_MAIN_SUPABASE_URL,
  import.meta.env.VITE_MAIN_SUPABASE_ANON_KEY
)
