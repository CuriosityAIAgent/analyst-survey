import { describe, expect, it } from 'vitest'
import { ART_V1 } from '../content'
import { ART_FILES, ART_REGISTRY } from './index'

describe('art registry', () => {
  it('every spec art id is assigned to exactly one art file', () => {
    const all = Object.values(ART_FILES).flat()
    expect([...all].sort()).toEqual([...ART_V1].sort())
    expect(new Set(all).size).toBe(all.length)
  })

  it('registers nothing outside the spec', () => {
    for (const id of Object.keys(ART_REGISTRY)) expect(ART_V1).toContain(id)
  })

  it('every v1 art id in the spec is drawn and registered', () => {
    const missing = ART_V1.filter((id) => !(id in ART_REGISTRY))
    expect(missing).toEqual([])
  })
})
