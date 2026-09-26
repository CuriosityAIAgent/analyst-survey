'use client'
/* Client side of the send: POST the finished response to /api/responses.
   'sent'           the server stored it (200 { ok: true })
   'not-collecting' the server has no storage configured yet (503 not-configured):
                    the prototype is being reviewed, so the game ends honestly
                    ("this is a preview; nothing is sent") instead of an error
   'failed'         anything else (offline, a timeout, a 4xx or 5xx): Send stays
                    live with "Couldn't send. Tap to try again." */
import { STORE_VERSION_KEY } from './version'

export const RESPONSES_URL = '/api/responses'
const TIMEOUT_MS = 20000

export type SendResult = 'sent' | 'not-collecting' | 'failed'

export async function sendResponse(payload: Record<string, unknown>): Promise<SendResult> {
  const ctl = new AbortController()
  const t = window.setTimeout(() => ctl.abort(), TIMEOUT_MS)
  try {
    const res = await fetch(RESPONSES_URL, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ ...payload, version: STORE_VERSION_KEY }),
      signal: ctl.signal,
      cache: 'no-store',
    })
    const j = (await res.json().catch(() => null)) as { ok?: unknown; error?: unknown } | null
    if (res.status === 503 && j?.error === 'not-configured') return 'not-collecting'
    if (!res.ok) return 'failed'
    return j?.ok === true ? 'sent' : 'failed'
  } catch {
    return 'failed'
  } finally {
    window.clearTimeout(t)
  }
}
