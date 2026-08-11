// Every function called from the browser (as opposed to a Database
// Webhook or a manual curl) needs these: the browser preflights any
// cross-origin request carrying an Authorization header with an OPTIONS
// request, and blocks the real response client-side unless
// Access-Control-Allow-Origin is present - curl/server-to-server calls
// never hit this, which is why a function can look fine in testing and
// still fail from the actual app with "Failed to send a request".
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

export function handleCors(req: Request): Response | null {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }
  return null
}
