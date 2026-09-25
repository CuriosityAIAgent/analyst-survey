import { describe, expect, it } from 'vitest'
import graphJson from '@/content/flow.json'
import { checkGraph, mainPath } from './logic'
import type { Graph } from './types'

/* The content gate. Whatever is in flow.json must be a graph a respondent can
   always finish: no dangling ids, no cycles, no branch naming an option the
   card lacks, every card reachable. A content edit that breaks this fails CI. */
const g = graphJson as unknown as Graph
const words = (s?: string) => (s ?? '').trim().split(/\s+/).filter(Boolean).length

describe(`flow.json — "${g.name}"`, () => {
  it('is structurally sound', () => {
    expect(checkGraph(g)).toEqual([])
  })
  it('keeps prompts Instagram-short (<= 14 words)', () => {
    const long = g.cards.filter((c) => words(c.prompt) > 14).map((c) => `${c.id}: ${words(c.prompt)}w`)
    expect(long).toEqual([])
  })
  it('keeps sub-lines short (<= 14 words)', () => {
    const long = g.cards.filter((c) => words(c.sub) > 14).map((c) => `${c.id}: ${words(c.sub)}w`)
    expect(long).toEqual([])
  })
  it('keeps option labels short (<= 6 words)', () => {
    const long = g.cards.flatMap((c) => (c.options ?? []).filter((o) => words(o.label) > 6).map((o) => `${c.id}/${o.id}`))
    expect(long).toEqual([])
  })
  it('uses free text at most twice', () => {
    expect(g.cards.filter((c) => c.kind === 'text').length).toBeLessThanOrEqual(2)
  })
  it('has a main path the respondent can finish', () => {
    const p = mainPath(g)
    expect(p.length).toBeGreaterThan(0)
    expect(p[p.length - 1].next).toBe('END')
  })
})
