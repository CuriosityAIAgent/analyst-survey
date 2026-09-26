import { afterEach, describe, expect, it, vi } from 'vitest'
import { sendResponse } from './send'

const reply = (status: number, body: unknown) =>
  vi.fn(async () => new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } }))

describe('sendResponse: three outcomes', () => {
  afterEach(() => { vi.unstubAllGlobals() })
  it("'sent' only when the server stored it", async () => {
    vi.stubGlobal('window', { setTimeout, clearTimeout })
    vi.stubGlobal('fetch', reply(200, { ok: true, id: 'x' }))
    expect(await sendResponse({})).toBe('sent')
  })
  it("'not-collecting' when storage is not switched on (prototype review)", async () => {
    vi.stubGlobal('window', { setTimeout, clearTimeout })
    vi.stubGlobal('fetch', reply(503, { ok: false, error: 'not-configured' }))
    expect(await sendResponse({})).toBe('not-collecting')
  })
  it("'failed' for a disk error, a bad request or the network", async () => {
    vi.stubGlobal('window', { setTimeout, clearTimeout })
    vi.stubGlobal('fetch', reply(503, { ok: false, error: 'store-failed' }))
    expect(await sendResponse({})).toBe('failed')
    vi.stubGlobal('fetch', reply(400, { ok: false }))
    expect(await sendResponse({})).toBe('failed')
    vi.stubGlobal('fetch', vi.fn(async () => { throw new Error('offline') }))
    expect(await sendResponse({})).toBe('failed')
  })
})
