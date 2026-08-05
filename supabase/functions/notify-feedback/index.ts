// Notifies a Telegram chat whenever a new row lands in `feedback` (see
// useFeedback.ts, the header's feedback button). Wired up as a Supabase
// Database Webhook (Database -> Webhooks in the dashboard) that fires on
// INSERT to `feedback` and POSTs the row here - not called from the
// client, so the bot token never reaches the browser bundle.
import { createClient } from 'npm:@supabase/supabase-js@2'

const TELEGRAM_API = 'https://api.telegram.org'

interface FeedbackWebhookPayload {
  type: 'INSERT'
  table: string
  record: {
    id: string
    user_id: string
    message: string
    created_at: string
  }
}

Deno.serve(async (req) => {
  try {
    const botToken = Deno.env.get('TELEGRAM_BOT_TOKEN')
    const chatId = Deno.env.get('TELEGRAM_CHAT_ID')
    if (!botToken || !chatId) {
      return new Response(JSON.stringify({ error: 'TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID not configured' }), {
        status: 500,
      })
    }

    const payload = (await req.json()) as FeedbackWebhookPayload
    if (payload.table !== 'feedback' || payload.type !== 'INSERT') {
      return new Response(JSON.stringify({ skipped: true }), { headers: { 'Content-Type': 'application/json' } })
    }
    const { record } = payload

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )
    const { data: userData } = await supabase.auth.admin.getUserById(record.user_id)
    const email = userData?.user?.email ?? record.user_id

    const text = `New feedback from ${email}:\n\n${record.message}`

    const res = await fetch(`${TELEGRAM_API}/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text }),
    })
    if (!res.ok) {
      return new Response(JSON.stringify({ error: `Telegram sendMessage failed: ${await res.text()}` }), {
        status: 502,
      })
    }

    return new Response(JSON.stringify({ sent: true }), { headers: { 'Content-Type': 'application/json' } })
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), { status: 500 })
  }
})
