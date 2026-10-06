import { createClient, type SupabaseClient, type User, type Session } from '@supabase/supabase-js'

export const SUPABASE_PROJECT_URL =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_URL) ||
  'https://xcarqzopfaozxugfhslo.supabase.co'

export const SUPABASE_ANON_KEY =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_ANON_KEY) ||
  ''

let supabaseInstance: SupabaseClient | null = null

export function getSupabase(): SupabaseClient {
  if (!supabaseInstance) {
    if (!SUPABASE_PROJECT_URL || !SUPABASE_ANON_KEY) {
      console.warn('Supabase URL or Anon Key is missing. Check your environment variables.')
    }
    supabaseInstance = createClient(SUPABASE_PROJECT_URL, SUPABASE_ANON_KEY, {
      auth: {
        storageKey: 'enka_auth_session',
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  }
  return supabaseInstance
}

export async function getCurrentUser(): Promise<User | null> {
  const client = getSupabase()
  const { data: { user } } = await client.auth.getUser()
  return user
}

export async function getCurrentSession(): Promise<Session | null> {
  const client = getSupabase()
  const { data: { session } } = await client.auth.getSession()
  return session
}

export async function signOut(): Promise<void> {
  const client = getSupabase()
  await client.auth.signOut()
}
