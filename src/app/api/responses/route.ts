/* POST /api/responses: one finished Ascent response (see src/v2/engine/collect.ts).

   200 { ok: true, id }  stored
   4xx { ok: false }     the body is not a live v2 response
   503 { ok: false }     nowhere to store it (production without RESPONSES_DIR),
                         or the disk refused: the game shows "Couldn't send. Tap to
                         try again." and keeps the answers in the browser. */
import { MAX_BYTES, checkBody, responsesDir, store } from '@/v2/engine/collect'

export async function POST(request: Request) {
  // refuse an oversized body before reading it
  const len = Number(request.headers.get('content-length') ?? 0)
  if (len > MAX_BYTES) return Response.json({ ok: false, error: 'too-large' }, { status: 413 })
  const raw = await request.text()
  const c = checkBody(raw)
  if (!c.ok) return Response.json({ ok: false, error: c.error }, { status: c.status })
  const dir = responsesDir()
  if (!dir) {
    console.error('[responses] RESPONSES_DIR is not set: refusing to accept a response that would be lost')
    return Response.json({ ok: false, error: 'not-configured' }, { status: 503 })
  }
  try {
    const id = await store(dir, c.code, c.body)
    return Response.json({ ok: true, id })
  } catch (e) {
    console.error('[responses] could not write a response', e)
    return Response.json({ ok: false, error: 'store-failed' }, { status: 503 })
  }
}
