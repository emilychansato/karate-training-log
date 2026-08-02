import { supabase } from '../lib/supabaseClient'
import { getCurrentUserId } from '../lib/getCurrentUserId'

export function useFeedback() {
  async function submitFeedback(message: string) {
    const userId = await getCurrentUserId()
    if (!userId) return { error: 'Not signed in' }

    const { error } = await supabase.from('feedback').insert({ user_id: userId, message })
    return { error: error?.message ?? null }
  }

  return { submitFeedback }
}
