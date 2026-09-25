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
