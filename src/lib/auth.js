/*
 * Tiny Supabase Auth client (email + password), no supabase-js needed.
 * The session lives in localStorage and is refreshed before it expires.
 */
import { useSyncExternalStore } from 'react'

const URL = import.meta.env.VITE_SUPABASE_URL
const KEY = import.meta.env.VITE_SUPABASE_ANON_KEY
const STORE = 'ecobin:session'
const listeners = new Set()

let session = read()

function read() {
  try {
    return JSON.parse(localStorage.getItem(STORE)) || null
  } catch {
    return null
  }
}

function save(s) {
  session = s
  try {
    if (s) localStorage.setItem(STORE, JSON.stringify(s))
    else localStorage.removeItem(STORE)
  } catch {
    /* storage blocked: session lasts for this tab only */
  }
  listeners.forEach((fn) => fn())
}

function toSession(data) {
  if (!data?.access_token) return null
  return {
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    expires_at: data.expires_at || Math.floor(Date.now() / 1000) + (data.expires_in || 3600),
    user: { id: data.user?.id, email: data.user?.email, name: data.user?.user_metadata?.full_name || '' },
  }
}

async function call(path, body) {
  const res = await fetch(`${URL}/auth/v1/${path}`, {
    method: 'POST',
    headers: { apikey: KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(friendly(data))
  return data
}

function friendly(data) {
  const msg = data.msg || data.error_description || data.message || data.error || ''
  if (/invalid login credentials/i.test(msg)) return 'Wrong email or password.'
  if (/email not confirmed/i.test(msg)) return 'Please confirm your email first. Check your inbox for the link.'
  if (/already registered|already been registered/i.test(msg)) return 'An account with this email already exists. Try logging in.'
  if (/password should be at least/i.test(msg)) return 'Password must be at least 6 characters.'
  if (/rate limit|too many/i.test(msg)) return 'Too many attempts. Please wait a minute and try again.'
  return msg || 'Something went wrong. Please try again.'
}

/** Returns { needsConfirmation } when the project requires email confirmation. */
export async function signUp({ name, email, password }) {
  const redirect = encodeURIComponent(`${window.location.origin}/login`)
  const data = await call(`signup?redirect_to=${redirect}`, { email, password, data: { full_name: name } })
  const s = toSession(data)
  if (s) save(s)
  return { needsConfirmation: !s }
}

export async function logIn({ email, password }) {
  save(toSession(await call('token?grant_type=password', { email, password })))
}

export async function logOut() {
  const s = session
  save(null)
  if (s) {
    fetch(`${URL}/auth/v1/logout`, { method: 'POST', headers: { apikey: KEY, Authorization: `Bearer ${s.access_token}` } }).catch(() => {})
  }
}

async function refresh() {
  if (!session?.refresh_token) return
  try {
    const s = toSession(await call('token?grant_type=refresh_token', { refresh_token: session.refresh_token }))
    save(s ? { ...s, user: { ...s.user, name: s.user.name || session.user.name } } : null)
  } catch {
    save(null)
  }
}

// Refresh a stale session on load, and a minute before it expires.
if (typeof window !== 'undefined' && URL && KEY) {
  const tick = () => {
    if (session && session.expires_at - 60 < Date.now() / 1000) refresh()
  }
  tick()
  setInterval(tick, 30000)
}

const subscribe = (fn) => {
  listeners.add(fn)
  return () => listeners.delete(fn)
}
export const useSession = () => useSyncExternalStore(subscribe, () => session)
