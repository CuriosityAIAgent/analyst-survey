/* The pure rules behind the S02 board and the S05 brick plate, and the one
   route-precision scale S05 and S11 share. */
import { describe, expect, it } from 'vitest'
import { applyDrop, boardOf } from './screens/S02'
import { available, cutOf, unsupportedOf } from './screens/S05'
import { routePrecision } from './content'

const empty = () => boardOf({})

describe('S02 board (applyDrop)', () => {
  it('packs a tile into a zone and takes it out of the tray', () => {
    const r = applyDrop(empty(), 'classroom', 'rucksack:0')!
    expect(r.board.rucksack).toEqual(['classroom'])
  })

  it('a tile lives in only one of rucksack, tarp or bench', () => {
    let b = applyDrop(empty(), 'admin', 'out:0')!.board
    b = applyDrop(b, 'admin', 'rerig:0')!.board
    expect(b.out).toEqual([])
    expect(b.rerig).toEqual(['admin'])
  })

  it('the hand takes a copy: a packed tile stays packed', () => {
    let b = applyDrop(empty(), 'present', 'rucksack:0')!.board
    b = applyDrop(b, 'present', 'hand:0')!.board
    expect(b.rucksack).toEqual(['present'])
    expect(b.hand).toEqual(['present'])
  })

  it('dropping on a full zone body bounces (null); on a full slot it swaps', () => {
    let b = applyDrop(empty(), 'admin', 'out:0')!.board
    b = applyDrop(b, 'formatting', 'out:1')!.board
    expect(applyDrop(b, 'ops', 'out')).toBeNull()
    const r = applyDrop(b, 'ops', 'out:0')!
    expect(r.board.out).toEqual(['ops', 'formatting'])
    expect(r.swapped).toBe('admin')
  })

  it('swapping across zones sends the occupant where the tile came from', () => {
    let b = applyDrop(empty(), 'admin', 'out:0')!.board
    b = applyDrop(b, 'ops', 'rerig:0')!.board
    b = applyDrop(b, 'admin', 'rerig:0')!.board
    expect(b.rerig).toEqual(['admin'])
    expect(b.out).toEqual(['ops'])
  })

  it("the hand's copy can only go back to the tray", () => {
    const b = applyDrop(empty(), 'present', 'hand:0')!.board
    expect(applyDrop(b, 'copy:present', 'rucksack:0')).toBeNull()
    expect(applyDrop(b, 'copy:present', 'tray')!.board.hand).toEqual([])
  })
})

describe('S05 brick plate', () => {
  it('a rung is available in its own lane and every later one', () => {
    const lanes = { map: 'day1', compass: 'proven' } as const
    expect([...available(lanes, 'day1')]).toEqual([1])
    expect([...available(lanes, 'proven')].sort()).toEqual([1, 2])
  })

  it('kit.cut counts contiguous rungs from the bottom', () => {
    expect(cutOf({ map: 'day1', compass: 'day1', gps: 'day1' })).toEqual({ day1: 2, proven: 2 })
    expect(cutOf({ map: 'day1', compass: 'proven', guidebook: 'proven' })).toEqual({ day1: 1, proven: 3 })
  })

  it('a brick with a missing rung under it is unsupported, and stays', () => {
    expect(unsupportedOf({ brief: 'day1' })).toEqual(['brief'])
    expect(unsupportedOf({ map: 'day1', compass: 'day1', guidebook: 'proven' })).toEqual([])
    expect(unsupportedOf({ map: 'day1', radio: 'proven', brief: 'none' })).toEqual(['radio'])
  })
})

describe('route precision (S05 strip and S11 summit)', () => {
  it('sharpens with Day-one bricks: none, pencil for a map alone, the timed line for the full kit', () => {
    expect(routePrecision({})).toBe(0)
    expect(routePrecision({ map: 'day1' })).toBe(1)
    expect(routePrecision({ map: 'day1', compass: 'day1', brief: 'proven' })).toBe(2)
    expect(routePrecision({ map: 'day1', compass: 'day1', guidebook: 'day1', gps: 'day1', radio: 'day1', brief: 'day1' })).toBe(4)
  })
})

/* ---------------------------------------------------------------- desk boards
   The phone and desk views of S02, S05, S06 and S09 A share one hook each
   (screens/boards/use*.ts), so a drop sequence stores the same answers on both
   channels. These pin the pure pieces those hooks store through, and check
   the desk number keys point at real zones. */
import { answersOf, S02_KEYS, ZONE_IDS as S02_ZONES } from './screens/boards/useS02Board'
import { placeAnswers, S05_KEYS, plainName, BY_ID } from './screens/boards/useS05Plate'
import { S06_KEYS, ZONES as S06_ZONES, nameOf as s06Name } from './screens/boards/useS06Pitches'
import { ropeDrop, S09_KEYS, CLIPS } from './screens/boards/useS09Rope'
import { zones } from './content'
import type { KitEvent } from './types'

describe('desk boards: shared stores', () => {
  it('S02 stores the same vote keys for a board, with the Blue copy flag', () => {
    let b = applyDrop(empty(), 'present', 'rucksack:0')!.board
    b = applyDrop(b, 'present', 'hand:0')!.board
    b = applyDrop(b, 'admin', 'out')!.board
    const a = answersOf(b, [])
    expect(a).toEqual({
      'vote.green': ['present'], 'vote.greenOrder': ['present'], 'vote.blue': 'present',
      'vote.blueAlsoGreen': true, 'vote.red': ['admin'], 'vote.amber': [],
    })
    // greenOrder keeps the order they first went in
    b = applyDrop(b, 'meetings', 'rucksack:0')!.board // swaps present out to the tray
    expect(answersOf(b, ['present'])['vote.greenOrder']).toEqual(['meetings'])
  })

  it('S05 placement writes lane, cut, unsupported and the event', () => {
    const ev: KitEvent = { t: 1, brick: 'brief', to: 'day1', via: 'key' }
    const a = placeAnswers({ map: 'day1' }, 'brief', 'day1', ev)
    expect(a['kit.lane']).toEqual({ map: 'day1', brief: 'day1' })
    expect(a['kit.cut']).toEqual({ day1: 1, proven: 1 })
    expect(a['kit.unsupported']).toEqual(['brief'])
    expect(a['kit.events']).toEqual([ev])
    expect(placeAnswers({ map: 'day1' }, 'map', null, { ...ev, brick: 'map', to: null })['kit.lane']).toEqual({})
  })

  it('S05 names are plain first', () => {
    expect(plainName(BY_ID.get('map')!)).toBe('LLM chat · Paper map')
  })

  it('S06 names the plain category first', () => {
    expect(S06_ZONES.find((z) => z.id === 'own')!.plain).toBe('The Analyst, no AI')
    expect(s06Name('own:1')).toBe('The Analyst, no AI, slot 2')
  })

  it('S09 rope: clip, swap between clips, bump from the tray, unclip', () => {
    let s = ropeDrop([null, null, null], 'calm', 'clip1')!
    s = ropeDrop(s, 'story', 'clip3')!
    expect(ropeDrop(s, 'story', 'clip1')).toEqual(['story', null, 'calm'])
    expect(ropeDrop(s, 'depth', 'clip1')).toEqual(['depth', null, 'story'])
    expect(ropeDrop(s, 'calm', 'tray')).toEqual([null, null, 'story'])
    expect(ropeDrop(s, 'depth', 'tray')).toBeNull()
  })

  it('desk number keys point at real zones, in the spec order', () => {
    expect([S02_KEYS[1], S02_KEYS[2], S02_KEYS[3], S02_KEYS[4]]).toEqual(S02_ZONES)
    expect([S05_KEYS[1], S05_KEYS[2], S05_KEYS[3]]).toEqual(zones('S05').map((z) => z.id))
    expect([S06_KEYS[1], S06_KEYS[2], S06_KEYS[3], S06_KEYS[4]]).toEqual(S06_ZONES.map((z) => z.id))
    expect([S09_KEYS[1], S09_KEYS[2], S09_KEYS[3]]).toEqual(CLIPS.map((c) => c.id))
    for (const k of [S02_KEYS, S05_KEYS, S06_KEYS, S09_KEYS]) expect(k.Delete).toBe('tray')
  })
})
