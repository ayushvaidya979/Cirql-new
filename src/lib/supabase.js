/*
 * Minimal Supabase client: the site only calls a few Postgres functions
 * (RPCs), so plain fetch is enough and keeps supabase-js out of the bundle.
 * Only the public anon/publishable key is ever used here.
 */
const URL = import.meta.env.VITE_SUPABASE_URL
const KEY = import.meta.env.VITE_SUPABASE_ANON_KEY

export const hasSupabase = Boolean(URL && KEY)

export async function rpc(fn, args = {}) {
  if (!hasSupabase) throw new Error('Supabase is not configured (see .env.local)')
  const headers = { apikey: KEY, 'Content-Type': 'application/json' }
  // Legacy JWT anon keys also go in Authorization; new sb_publishable_ keys must not.
  if (!KEY.startsWith('sb_')) headers.Authorization = `Bearer ${KEY}`
  const res = await fetch(`${URL}/rest/v1/rpc/${fn}`, { method: 'POST', headers, body: JSON.stringify(args) })
  if (!res.ok) {
    const detail = await res.text().catch(() => '')
    throw new Error(`${fn} failed (${res.status}) ${detail.slice(0, 200)}`)
  }
  return res.json()
}
