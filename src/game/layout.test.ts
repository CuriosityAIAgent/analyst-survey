import { describe, expect, it } from 'vitest'
import { layoutFor, layoutOverride } from './layout'

describe('useLayout thresholds (design section 2)', () => {
  it('picks desk, deskCompact or phone from the viewport', () => {
    expect(layoutFor(1440, 790)).toBe('desk')
    expect(layoutFor(1920, 950)).toBe('desk')
    expect(layoutFor(1280, 600)).toBe('deskCompact')
    expect(layoutFor(1366, 768)).toBe('desk')
    expect(layoutFor(1360, 699)).toBe('deskCompact')
    expect(layoutFor(1024, 700)).toBe('deskCompact') // landscape tablet
    expect(layoutFor(1024, 1366)).toBe('phone') // portrait tablet
    expect(layoutFor(390, 660)).toBe('phone')
    expect(layoutFor(1023, 700)).toBe('phone')
    expect(layoutFor(1100, 900)).toBe('phone') // too square
    expect(layoutFor(0, 0)).toBe('phone')
  })
  it('?layout= overrides; anything else is ignored', () => {
    expect(layoutOverride('?layout=desk')).toBe('desk')
    expect(layoutOverride('?screen=S02&layout=deskCompact')).toBe('deskCompact')
    expect(layoutOverride('?layout=phone')).toBe('phone')
    expect(layoutOverride('?layout=tv')).toBeNull()
    expect(layoutOverride('')).toBeNull()
  })
})
