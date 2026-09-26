import { describe, expect, it } from 'vitest'
import { mkdtemp, readdir, readFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { checkBody, MAX_BYTES, responsesDir, store } from './collect'
import { STORE_KEY, response } from './store'
import { toAnswer } from '../hero/podium/order'

const live = (extra: Record<string, unknown> = {}) => JSON.stringify({ version: STORE_KEY, mode: 'live', code: 'abcd1234', answers: { months: 30 }, ...extra })

describe('POST /api/responses: the body', () => {
  it('accepts a live v2 response and files it under the r code', () => {
    const c = checkBody(live())
    expect(c.ok && c.code).toBe('abcd1234')
  })
  it('refuses preview runs, other versions, junk and huge bodies', () => {
    expect(checkBody(live({ mode: 'preview' }))).toMatchObject({ ok: false, status: 400 })
    expect(checkBody(live({ version: 'ascent-game-v1' }))).toMatchObject({ ok: false, status: 400 })
    expect(checkBody('not json')).toMatchObject({ ok: false, status: 400 })
    expect(checkBody('[]')).toMatchObject({ ok: false, status: 400 })
    expect(checkBody(live({ answers: [] }))).toMatchObject({ ok: false, status: 400 })
    expect(checkBody('x'.repeat(MAX_BYTES + 1))).toMatchObject({ ok: false, status: 413 })
  })
  it('never lets a code reach the file system unless it is a plain code', () => {
    for (const bad of ['../../etc/passwd', 'a/b', '', 'ab', null]) {
      const c = checkBody(live({ code: bad }))
      expect(c.ok && c.code).toBe('nocode')
    }
  })
  it('response() carries the code from the link', () => {
    const r = response({
      answers: {}, segment: {}, events: [], timing: {}, seed: 1, channel: 'phone', viewport: null,
      mode: 'live', tStart: null, tEnd: null, link: 'r:abcd1234', finished: true, token: { code: 'abcd1234' },
    })
    expect(r.code).toBe('abcd1234')
    expect(r.version).toBe(STORE_KEY)
  })
})

describe('where responses go', () => {
  it('production without RESPONSES_DIR refuses (so the game never thanks for a lost answer)', () => {
    expect(responsesDir({ NODE_ENV: 'production' })).toBeNull()
    expect(responsesDir({ NODE_ENV: 'production', RESPONSES_DIR: '/data/responses' })).toBe('/data/responses')
    expect(responsesDir({ NODE_ENV: 'development' })).toMatch(/\.data[/\\]responses$/)
  })
  it('each send is its own file; a second send never overwrites the first', async () => {
    const dir = await mkdtemp(path.join(tmpdir(), 'ascent-'))
    const a = await store(dir, 'abcd1234', { answers: { months: 30 } }, 1000)
    const b = await store(dir, 'abcd1234', { answers: { months: 36 } }, 1000)
    expect(a).not.toBe(b)
    const files = (await readdir(dir)).sort()
    expect(files).toHaveLength(2)
    const one = JSON.parse(await readFile(path.join(dir, files[0]), 'utf8'))
    expect(one.receivedAt).toBe(new Date(1000).toISOString())
  })
})

describe('podium answer', () => {
  it('complete: ids in rank order; partial: by position, so a gap survives; none: []', () => {
    expect(toAnswer(['a', 'b'])).toEqual(['a', 'b'])
    expect(toAnswer([null, 'b'])).toEqual({ second: 'b' })
    expect(toAnswer(['a', null, 'c'])).toEqual({ first: 'a', third: 'c' })
    expect(toAnswer([null, null])).toEqual([])
  })
})
