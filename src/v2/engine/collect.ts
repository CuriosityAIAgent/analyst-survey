/* Server side: where a finished response is kept.

   POST /api/responses (src/app/api/responses/route.ts) calls these. One JSON
   file per send, never overwritten:

     $RESPONSES_DIR/<r code>--<ms>-<random>.json

   so a respondent who sends twice leaves two files (analysis keeps the latest
   per code) and nothing is ever lost to a race. On Railway, RESPONSES_DIR must
   point at a mounted volume (for example /data/responses): the container's own
   disk is wiped on every deploy.

   Without RESPONSES_DIR, development writes to ./.data/responses; production
   REFUSES (503), so the game says "Couldn't send" instead of thanking someone
   whose answers went nowhere.

   What is stored: the body the game sends (response() in store.ts: answers,
   segment, timing, events, channel and viewport), plus the time it arrived.
   No IP address, no user agent, no name. */
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { randomBytes } from 'node:crypto'
import { STORE_VERSION_KEY } from './version'

export const MAX_BYTES = 512 * 1024

export type Checked = { ok: true; code: string; body: Record<string, unknown> } | { ok: false; status: number; error: string }

const CODE = /^[A-Za-z0-9_-]{4,64}$/

/** Validate a raw request body. Pure, so it is tested. */
export function checkBody(raw: string): Checked {
  if (raw.length > MAX_BYTES) return { ok: false, status: 413, error: 'too-large' }
  let body: unknown
  try { body = JSON.parse(raw) } catch { return { ok: false, status: 400, error: 'not-json' } }
  if (!body || typeof body !== 'object' || Array.isArray(body)) return { ok: false, status: 400, error: 'not-an-object' }
  const b = body as Record<string, unknown>
  if (b.version !== STORE_VERSION_KEY) return { ok: false, status: 400, error: 'wrong-version' }
  if (b.mode !== 'live') return { ok: false, status: 400, error: 'not-live' }
  if (!b.answers || typeof b.answers !== 'object' || Array.isArray(b.answers)) return { ok: false, status: 400, error: 'no-answers' }
  const code = typeof b.code === 'string' && CODE.test(b.code) ? b.code : 'nocode'
  return { ok: true, code, body: b }
}

/** The folder responses go to, or null when production has none set. */
export function responsesDir(env: Record<string, string | undefined> = process.env): string | null {
  const dir = env.RESPONSES_DIR?.trim()
  if (dir) return path.resolve(dir)
  if (env.NODE_ENV === 'production') return null
  return path.resolve(process.cwd(), '.data', 'responses')
}

/** Write one response; returns its file id. Throws if the disk refuses. */
export async function store(dir: string, code: string, body: Record<string, unknown>, now = Date.now()): Promise<string> {
  await mkdir(dir, { recursive: true })
  const id = `${code}--${now}-${randomBytes(4).toString('hex')}`
  const file = path.join(dir, `${id}.json`)
  const record = { ...body, receivedAt: new Date(now).toISOString() }
  await writeFile(file, JSON.stringify(record), { flag: 'wx' })
  return id
}
