'use client'
/* useDrag: the one drag-and-drop hook behind S02, S05, S06, S09 Beat A, the
   S10 cairn, F2a, F4 and F5.

   Three input paths, all reporting the same thing (item -> zone):
     pointer   press an item, move 6px and it lifts and follows the finger
               (setPointerCapture); release over a zone to drop there.
     tap       tap an item to lift it (it stays lifted, 'selected'), then tap a
               zone, or a placed item inside a zone, to drop it there. Tap it
               again, or empty stage, to put it down.
     keyboard  Tab to an item, Space (or Enter) lifts it, arrow keys cycle the
               valid zones (announced through aria-live), Enter or Space drops,
               Esc cancels.

   The hook never decides what a drop MEANS. Capacity, swap and copy rules
   belong to the screen: onDrop(item, zone, via) returns false to refuse, and
   the hook springs the item back and shakes the zone 2px. It never moves an
   item between containers itself: after an accepted drop the screen re-renders
   the item where it now lives (wrap it in a motion `layout` element for the
   180ms settle).

   Usage:
     const d = useDrag({ onDrop: (item, zone) => place(item, zone), labelOf })
     <div {...d.stageProps}>                       // touch-action:none etc.
       <div {...d.zone('rucksack')}>…slots…</div>  // any element; nested zones ok
       <div {...d.item('meetings')}>…tile…</div>   // NOT a <button>: role/tabIndex supplied
       {d.liveRegion}
     </div>
   Styling: the lifted item gets data-lifted="true" and the hook's own
   transform (translate + scale 1.06) and a soft ink drop-shadow, so the hook
   owns `transform`, `filter` and `z-index` on the item element; put any
   transform of your own on an inner element. Zones get data-over="true" under
   the pointer or keyboard cursor, and data-valid="true" while a lifted item
   could go there: outline them in their colour.
   A control inside an item (the S05 'i' peek) must stopPropagation on
   pointerdown and keydown so it does not start a drag. */
import { createElement, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { CSSProperties, KeyboardEvent as RKeyboardEvent, MouseEvent as RMouseEvent, PointerEvent as RPointerEvent, ReactElement } from 'react'

export type DropVia = 'pointer' | 'tap' | 'key'

export type DragOptions = {
  /** Called on every drop. `zone` is null when a pointer drop lands outside
      every zone (treat as "back to the tray" or ignore). Return false to
      refuse: the item springs back and the zone shakes. */
  onDrop: (item: string, zone: string | null, via: DropVia) => boolean | void
  /** Which zones light up (and can be reached by the keyboard) while `item`
      is lifted. Default: every zone. A pointer drop on a zone that fails this
      is refused without calling onDrop. */
  canDrop?: (item: string, zone: string) => boolean
  /** Keyboard cycling order. Default: the order zones were registered in. */
  zones?: string[]
  /** Long-press (450ms; cancelled by 8px of movement). E.g. open a peek card. */
  onLongPress?: (item: string) => void
  /** Lift / cancel hooks, for logging and sound. */
  onLift?: (item: string, via: DropVia) => void
  onCancel?: (item: string) => void
  /** A drop that canDrop refused (the item springs back, the zone shakes):
      e.g. S06 strains the strap when a third pitch hits own feet. */
  onRefuse?: (item: string, zone: string, via: DropVia) => void
  /** Act at once on a tap or Space/Enter instead of lifting (the S10
      cairn: one tap = one stone). Return true to consume the press; only
      asked when nothing is lifted. Pointer drags are unaffected. */
  onPress?: (item: string, via: 'tap' | 'key') => boolean | void
  /** Human names for announcements. Default: the id. */
  labelOf?: (id: string) => string
  /** Stop every input path (e.g. while a sheet covers the screen). */
  disabled?: boolean
}

export type ItemExtra = {
  disabled?: boolean
  onKeyDown?: (e: RKeyboardEvent<HTMLElement>) => void
  className?: string
  style?: CSSProperties
}

export type DragApi = {
  stageProps: {
    ref: (el: HTMLElement | null) => void
    style: CSSProperties
    onClick: (e: RMouseEvent) => void
    onKeyDown: (e: RKeyboardEvent) => void
    'data-drag-stage': true
  }
  item: (id: string, extra?: ItemExtra) => Record<string, unknown>
  zone: (id: string) => Record<string, unknown>
  /** The item currently lifted by any path, or null. */
  lifted: string | null
  /** True only while a pointer drag is in progress. */
  dragging: boolean
  /** Tap-then-tap / keyboard selection (lifted but not following a pointer). */
  selected: string | null
  /** The zone under the pointer or keyboard cursor. */
  over: string | null
  /** Would the lifted item be accepted by canDrop at this zone? */
  isValid: (zone: string) => boolean
  /** Latest aria-live text, and a ready-made polite live region to render. */
  announce: string
  liveRegion: ReactElement
  /** Put the lifted item down without dropping it. */
  cancel: () => void
  /** Shake a zone 2px (e.g. when a full zone's body is hit). */
  shake: (zone: string) => void
}

export const LONG_PRESS_MS = 450
export const LONG_PRESS_SLOP = 8
export const DRAG_SLOP = 6

export const STAGE_STYLE: CSSProperties = {
  touchAction: 'none',
  WebkitTouchCallout: 'none',
  userSelect: 'none',
  WebkitUserSelect: 'none',
}

const reducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

export function shakeEl(el: HTMLElement | null | undefined) {
  if (!el || reducedMotion() || !el.animate) return
  el.animate(
    [{ transform: 'translateX(0)' }, { transform: 'translateX(-2px)' }, { transform: 'translateX(2px)' },
      { transform: 'translateX(-2px)' }, { transform: 'translateX(0)' }],
    { duration: 200, easing: 'ease-in-out' },
  )
}

export function useDrag(opts: DragOptions): DragApi {
  const o = useRef(opts)
  o.current = opts

  const [lifted, setLifted] = useState<string | null>(null)
  const [dragging, setDragging] = useState(false)
  const [over, setOver] = useState<string | null>(null)
  const [announce, setAnnounce] = useState('')

  const liftedRef = useRef<string | null>(null)
  const overRef = useRef<string | null>(null)
  liftedRef.current = lifted
  overRef.current = over

  const itemEls = useRef(new Map<string, HTMLElement>())
  const zoneEls = useRef(new Map<string, HTMLElement>())
  const itemRefFns = useRef(new Map<string, (el: HTMLElement | null) => void>())
  const zoneRefFns = useRef(new Map<string, (el: HTMLElement | null) => void>())
  const stageEl = useRef<HTMLElement | null>(null)
  const suppressClick = useRef(false)
  const refocus = useRef<string | null>(null)

  type Press = { id: string; pointerId: number; x0: number; y0: number; el: HTMLElement; timer: number | null; long: boolean; moved: boolean }
  const press = useRef<Press | null>(null)

  const name = (id: string) => o.current.labelOf?.(id) ?? id
  const say = (s: string) => setAnnounce((prev) => (prev === s ? s + '​' : s))
  const valid = useCallback((item: string, zone: string) => (o.current.canDrop ? o.current.canDrop(item, zone) : true), [])

  const zoneOrder = () => {
    const ids = o.current.zones ?? [...zoneEls.current.keys()]
    const item = liftedRef.current
    return item ? ids.filter((z) => zoneEls.current.has(z) && valid(item, z)) : ids
  }

  const setVars = (el: HTMLElement, dx: number, dy: number) => {
    el.style.setProperty('--dx', `${dx}px`)
    el.style.setProperty('--dy', `${dy}px`)
  }
  const clearVars = (el: HTMLElement | undefined | null, spring = false) => {
    if (!el) return
    if (spring && !reducedMotion()) {
      el.style.transition = 'transform 180ms cubic-bezier(.2,.9,.3,1.25)'
      window.setTimeout(() => { el.style.transition = '' }, 200)
    }
    el.style.setProperty('--dx', '0px')
    el.style.setProperty('--dy', '0px')
  }

  const lift = (id: string, via: DropVia) => {
    setLifted(id)
    liftedRef.current = id
    setOver(null)
    o.current.onLift?.(id, via)
    if (via === 'key') say(`${name(id)} lifted. Arrow keys choose a place, Enter drops, Escape cancels.`)
    else if (via === 'tap') say(`${name(id)} lifted. Tap a place to put it.`)
  }

  const end = () => {
    setLifted(null); liftedRef.current = null
    setDragging(false)
    setOver(null); overRef.current = null
  }

  const cancel = useCallback(() => {
    const id = liftedRef.current
    if (!id) return
    clearVars(itemEls.current.get(id), true)
    o.current.onCancel?.(id)
    say(`${name(id)} put back.`)
    end()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const shake = useCallback((zone: string) => shakeEl(zoneEls.current.get(zone)), [])

  const drop = (item: string, zone: string | null, via: DropVia) => {
    const el = itemEls.current.get(item)
    let ok: boolean | void = false
    if (zone !== null && !valid(item, zone)) { ok = false; o.current.onRefuse?.(item, zone, via) }
    else ok = o.current.onDrop(item, zone, via)
    if (ok === false) {
      clearVars(el, true)
      if (zone) shake(zone)
      say(zone ? `${name(zone)} can't take it.` : `${name(item)} put back.`)
    } else {
      clearVars(el, false)
      say(zone ? `${name(item)} placed: ${name(zone)}.` : `${name(item)} put back.`)
      if (via === 'key') refocus.current = item
    }
    end()
  }

  // after a keyboard drop the item may have re-rendered elsewhere: keep focus on it
  useEffect(() => {
    if (!refocus.current) return
    const id = refocus.current
    refocus.current = null
    requestAnimationFrame(() => itemEls.current.get(id)?.focus({ preventScroll: true }))
  })

  const hit = (x: number, y: number): string | null => {
    let best: string | null = null
    let bestArea = Infinity
    for (const [id, el] of zoneEls.current) {
      const r = el.getBoundingClientRect()
      if (x >= r.left && x <= r.right && y >= r.top && y <= r.bottom) {
        const a = r.width * r.height
        if (a < bestArea) { best = id; bestArea = a }
      }
    }
    return best
  }

  const zoneContaining = (el: HTMLElement): string | null => {
    let best: string | null = null
    let bestArea = Infinity
    for (const [id, z] of zoneEls.current) {
      if (z.contains(el)) {
        const r = z.getBoundingClientRect()
        if (r.width * r.height < bestArea) { best = id; bestArea = r.width * r.height }
      }
    }
    return best
  }

  /* ------------------------------------------------ pointer */
  const onPointerDown = (id: string, disabled?: boolean) => (e: RPointerEvent<HTMLElement>) => {
    if (o.current.disabled || disabled) return
    if (e.button !== 0) return
    suppressClick.current = false
    const el = e.currentTarget
    try { el.setPointerCapture(e.pointerId) } catch { /* old Safari */ }
    const p: Press = { id, pointerId: e.pointerId, x0: e.clientX, y0: e.clientY, el, timer: null, long: false, moved: false }
    if (o.current.onLongPress) {
      p.timer = window.setTimeout(() => {
        if (press.current !== p || p.moved) return
        p.long = true
        suppressClick.current = true
        o.current.onLongPress?.(id)
      }, LONG_PRESS_MS)
    }
    press.current = p
  }

  const onPointerMove = (e: RPointerEvent<HTMLElement>) => {
    const p = press.current
    if (!p || e.pointerId !== p.pointerId || p.long) return
    const dx = e.clientX - p.x0, dy = e.clientY - p.y0
    const dist = Math.hypot(dx, dy)
    if (!p.moved) {
      if (dist > LONG_PRESS_SLOP && p.timer) { clearTimeout(p.timer); p.timer = null }
      if (dist < DRAG_SLOP) return
      p.moved = true
      if (p.timer) { clearTimeout(p.timer); p.timer = null }
      // a pointer drag replaces any tap selection
      if (liftedRef.current && liftedRef.current !== p.id) clearVars(itemEls.current.get(liftedRef.current))
      lift(p.id, 'pointer')
      setDragging(true)
    }
    p.el.style.transition = 'none'
    setVars(p.el, dx, dy)
    const z = hit(e.clientX, e.clientY)
    if (z !== overRef.current) { overRef.current = z; setOver(z) }
  }

  const onPointerUp = (e: RPointerEvent<HTMLElement>) => {
    const p = press.current
    if (!p || e.pointerId !== p.pointerId) return
    if (p.timer) clearTimeout(p.timer)
    press.current = null
    p.el.style.transition = ''
    if (p.long) { suppressClick.current = true; return }
    if (p.moved) {
      suppressClick.current = true
      drop(p.id, hit(e.clientX, e.clientY), 'pointer')
    }
    // a still press becomes a click, handled in onClick (so assistive tech
    // that only sends clicks works too)
  }

  const onPointerCancel = (e: RPointerEvent<HTMLElement>) => {
    const p = press.current
    if (!p || e.pointerId !== p.pointerId) return
    if (p.timer) clearTimeout(p.timer)
    press.current = null
    p.el.style.transition = ''
    if (p.moved) cancel()
  }

  /* ------------------------------------------------ tap */
  const onItemClick = (id: string, disabled?: boolean) => (e: RMouseEvent<HTMLElement>) => {
    e.stopPropagation()
    if (suppressClick.current) { suppressClick.current = false; return }
    if (o.current.disabled || disabled) return
    const cur = liftedRef.current
    if (cur === id) return cancel()
    if (cur) {
      const z = zoneContaining(e.currentTarget)
      if (z) return drop(cur, z, 'tap')
    }
    if (!cur && o.current.onPress?.(id, 'tap')) return
    lift(id, 'tap')
  }

  const onZoneClick = (id: string) => (e: RMouseEvent<HTMLElement>) => {
    e.stopPropagation()
    if (o.current.disabled) return
    const cur = liftedRef.current
    if (cur) drop(cur, id, 'tap')
  }

  /* ------------------------------------------------ keyboard */
  const onItemKey = (id: string, extra?: ItemExtra) => (e: RKeyboardEvent<HTMLElement>) => {
    extra?.onKeyDown?.(e)
    if (e.defaultPrevented || o.current.disabled || extra?.disabled) return
    const cur = liftedRef.current
    const k = e.key
    if (cur !== id) {
      if (k === ' ' || k === 'Enter' || k === 'Spacebar') {
        e.preventDefault()
        if (cur) {
          const z = zoneContaining(e.currentTarget)
          if (z) return drop(cur, z, 'key')
        }
        if (!cur && o.current.onPress?.(id, 'key')) return
        lift(id, 'key')
      }
      return
    }
    if (k === 'Escape') { e.preventDefault(); e.stopPropagation(); return cancel() }
    if (k === 'ArrowRight' || k === 'ArrowDown' || k === 'ArrowLeft' || k === 'ArrowUp') {
      e.preventDefault()
      const zs = zoneOrder()
      if (!zs.length) { say('Nowhere to put it.'); return }
      const i = overRef.current ? zs.indexOf(overRef.current) : -1
      const step = k === 'ArrowRight' || k === 'ArrowDown' ? 1 : -1
      const ni = i < 0 ? (step > 0 ? 0 : zs.length - 1) : (i + step + zs.length) % zs.length
      const z = zs[ni]
      overRef.current = z
      setOver(z)
      say(`${name(z)}. ${ni + 1} of ${zs.length}.`)
      return
    }
    if (k === 'Enter' || k === ' ' || k === 'Spacebar') {
      e.preventDefault()
      if (overRef.current) drop(id, overRef.current, 'key')
      else say('Choose a place with the arrow keys first.')
    }
  }

  /* ------------------------------------------------ props */
  const itemRef = (id: string) => {
    let fn = itemRefFns.current.get(id)
    if (!fn) {
      fn = (el: HTMLElement | null) => {
        if (el) itemEls.current.set(id, el)
        else if (itemEls.current.get(id) && !itemEls.current.get(id)!.isConnected) itemEls.current.delete(id)
      }
      itemRefFns.current.set(id, fn)
    }
    return fn
  }
  const zoneRef = (id: string) => {
    let fn = zoneRefFns.current.get(id)
    if (!fn) {
      fn = (el: HTMLElement | null) => {
        if (el) zoneEls.current.set(id, el)
        else if (zoneEls.current.get(id) && !zoneEls.current.get(id)!.isConnected) zoneEls.current.delete(id)
      }
      zoneRefFns.current.set(id, fn)
    }
    return fn
  }

  const item = (id: string, extra?: ItemExtra) => {
    const isLifted = lifted === id
    const style: CSSProperties = {
      touchAction: 'none',
      WebkitTouchCallout: 'none',
      userSelect: 'none',
      WebkitUserSelect: 'none',
      cursor: extra?.disabled ? 'default' : isLifted && dragging ? 'grabbing' : 'grab',
      position: 'relative',
      ...(extra?.style ?? {}),
      ...(isLifted
        ? {
            transform: 'translate(var(--dx, 0px), var(--dy, 0px)) scale(1.06)',
            filter: 'drop-shadow(0 6px 8px rgba(13,12,11,0.22))',
            zIndex: 40,
          }
        : {}),
    }
    return {
      ref: itemRef(id),
      role: 'button',
      tabIndex: extra?.disabled ? -1 : 0,
      'aria-pressed': isLifted,
      'aria-disabled': extra?.disabled || undefined,
      'aria-roledescription': 'draggable',
      'data-item': id,
      'data-lifted': isLifted ? 'true' : undefined,
      className: extra?.className,
      style,
      onPointerDown: onPointerDown(id, extra?.disabled),
      onPointerMove,
      onPointerUp,
      onPointerCancel,
      onLostPointerCapture: onPointerCancel,
      onClick: onItemClick(id, extra?.disabled),
      onKeyDown: onItemKey(id, extra),
      onContextMenu: (e: RMouseEvent) => e.preventDefault(),
      onDragStart: (e: RMouseEvent) => e.preventDefault(),
    }
  }

  const zone = (id: string) => ({
    ref: zoneRef(id),
    'data-zone': id,
    'data-over': over === id ? 'true' : undefined,
    'data-valid': lifted && valid(lifted, id) ? 'true' : undefined,
    onClick: onZoneClick(id),
  })

  const stageProps = useMemo(() => ({
    ref: (el: HTMLElement | null) => { stageEl.current = el },
    style: STAGE_STYLE,
    onClick: () => { if (liftedRef.current) cancel() },
    onKeyDown: (e: RKeyboardEvent) => { if (e.key === 'Escape' && liftedRef.current) cancel() },
    'data-drag-stage': true as const,
  }), [cancel])

  // disabling mid-lift puts the item down
  useEffect(() => { if (opts.disabled && liftedRef.current) cancel() }, [opts.disabled, cancel])

  const liveRegion = createElement(LiveRegion, { text: announce })

  return {
    stageProps,
    item,
    zone,
    lifted,
    dragging,
    selected: dragging ? null : lifted,
    over,
    isValid: (z: string) => (lifted ? valid(lifted, z) : false),
    announce,
    liveRegion,
    cancel,
    shake,
  }
}

/** A visually hidden polite live region. */
export function LiveRegion({ text }: { text: string }) {
  return createElement('div', {
    'aria-live': 'polite',
    'aria-atomic': true,
    style: {
      position: 'absolute', width: 1, height: 1, padding: 0, margin: -1, overflow: 'hidden',
      clip: 'rect(0,0,0,0)', whiteSpace: 'nowrap', border: 0,
    },
  }, text)
}
