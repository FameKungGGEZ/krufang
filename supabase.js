import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim() || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim() || ''

export const isLocalMode = import.meta.env.VITE_USE_LOCAL_STORAGE === 'true'

if (!isLocalMode && (!supabaseUrl || !supabaseAnonKey)) {
  console.error('Supabase credentials are missing. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.')
}

export const supabase = !isLocalMode && supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null
