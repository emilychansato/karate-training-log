import { supabase } from './supabaseClient'

/** Resolves the signed-in user's id for inserts that need `user_id` set
 * explicitly — every user-owned table's RLS insert policy checks
 * `auth.uid() = user_id`, and Postgres won't fill that in for us. */
export async function getCurrentUserId(): Promise<string | null> {
  const { data } = await supabase.auth.getClaims()
  return (data?.claims?.sub as string | undefined) ?? null
}
