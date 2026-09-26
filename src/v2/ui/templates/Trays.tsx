'use client'
/* Template 4: the trays.
   Labelled trays with the count in the heading; tiles below, label first and a
   small icon second. Drag a tile into a tray, or tap a tile then tap a tray.
   Tap a placed tile to send it back. A full tray says "Full. Tap one to swap"
   inside itself; tapping one of its tiles while holding another swaps them. */
import { useRef, useState } from 'react'
import type { ReactNode } from 'react'

export type TrayDef = { id: string; label: string; cap?: number }
export type TrayItem = { id: string; label: string; sub?: string; icon?: ReactNode }
export type Placed = Record<string, string>   // item id -> tray id

type Props = {
  trays: TrayDef[]
  items: TrayItem[]
  placed: Placed
  onChange: (p: Placed) => void
  layout?: 'columns' | 'rows'   // columns: three side-by-side trays with slots (3.1); rows: full-width trays (AI tools)
}

type Drag = { id: string; x: number; y: number; w: number; over: string | null; moved: boolean; sx: number; sy: number }

export default function Trays({ trays, items, placed, onChange, layout = 'columns' }: Props) {
  const [sel, setSel] = useState<string | null>(null)
  const [drag, setDrag] = useState<Drag | null>(null)
  const [refused, setRefused] = useState<string | null>(null)
  const refuseT = useRef<ReturnType<typeof setTimeout> | null>(null)

  const inTray = (t: string) => items.filter((i) => placed[i.id] === t)
  const full = (t: TrayDef) => t.cap !== undefined && inTray(t.id).length >= t.cap
  const holding = drag?.moved ? drag.id : sel

  const refuse = (t: string) => {
    setRefused(t)
    if (refuseT.current) clearTimeout(refuseT.current)
    refuseT.current = setTimeout(() => setRefused(null), 2000)
  }
  const put = (id: string, t: string | null) => {
    const n = { ...placed }
    if (t) n[id] = t
    else delete n[id]
    onChange(n)
  }
  const dropOnTray = (id: string, t: TrayDef) => {
    if (placed[id] === t.id) return
    if (full(t)) { refuse(t.id); return }
    put(id, t.id)
    setSel(null)
  }
  // a placed tile was the target: swap if holding another tile, else send it back
  const dropOnTile = (id: string, target: string) => {
    if (id === target) return
    const t = placed[target]
    const tray = trays.find((x) => x.id === t)
    if (tray && !full(tray)) { dropOnTray(id, tray); return }
    const n = { ...placed }
    const from = placed[id]
    n[id] = t
    if (from) n[target] = from
    else delete n[target]
    onChange(n)
    setSel(null)
  }

  const tapTile = (id: string) => {
    if (sel && sel !== id && placed[id]) { dropOnTile(sel, id); return }
    if (placed[id] && !sel) { put(id, null); return }
    setSel(sel === id ? null : id)
  }
  const tapTray = (t: TrayDef) => { if (sel) dropOnTray(sel, t) }

  /* pointer drag, with the tap as the fallback */
  const hit = (x: number, y: number) => {
    const el = document.elementFromPoint(x, y) as HTMLElement | null
    const tile = el?.closest('[data-tile-placed]') as HTMLElement | null
    if (tile) return { tile: tile.dataset.tilePlaced!, tray: tile.dataset.inTray ?? null }
    const tray = el?.closest('[data-tray-id]') as HTMLElement | null
    if (tray) return { tile: null, tray: tray.dataset.trayId! }
    if (el?.closest('[data-pool]')) return { tile: null, tray: 'pool' }
    return { tile: null, tray: null }
  }
  const onDown = (e: React.PointerEvent, id: string) => {
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
    const r = (e.currentTarget as HTMLElement).getBoundingClientRect()
    setDrag({ id, x: e.clientX, y: e.clientY, w: r.width, over: null, moved: false, sx: e.clientX, sy: e.clientY })
  }
  const onMove = (e: React.PointerEvent) => {
    if (!drag) return
    const moved = drag.moved || Math.hypot(e.clientX - drag.sx, e.clientY - drag.sy) > 6
    const h = moved ? hit(e.clientX, e.clientY) : null
    setDrag({ ...drag, x: e.clientX, y: e.clientY, moved, over: h?.tray ?? null })
  }
  const onUp = (e: { clientX: number; clientY: number }, cancelled = false) => {
    if (!drag) return
    const d = drag
    setDrag(null)
    if (!d.moved) { if (!cancelled) tapTile(d.id); return }
    const h = hit(e.clientX, e.clientY)
    if (h.tile && h.tile !== d.id) { dropOnTile(d.id, h.tile); return }
    if (h.tray === 'pool') { put(d.id, null); setSel(null); return }
    const t = trays.find((x) => x.id === h.tray)
    if (t) dropOnTray(d.id, t)
  }
  const dragItem = drag?.moved ? items.find((i) => i.id === drag.id) : null

  const tileProps = (id: string) => ({
    onPointerDown: (e: React.PointerEvent) => onDown(e, id),
    onPointerMove: onMove,
    onPointerUp: (e: React.PointerEvent) => onUp(e),
    onPointerCancel: () => { if (drag) onUp({ clientX: drag.x, clientY: drag.y }, true) },
    onKeyDown: (e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); tapTile(id) } },
  })

  const cols = layout === 'columns'

  return (
    <div className="flex flex-col">
      <style>{`
        @keyframes v2tt-shake { 0%,100%{transform:translateX(0)} 20%{transform:translateX(-2px)} 40%{transform:translateX(2px)} 60%{transform:translateX(-2px)} 80%{transform:translateX(2px)} }
        .v2tt-shake { animation: v2tt-shake .3s ease-in-out 1; }
        @keyframes v2tt-in { from{transform:scale(.9);opacity:.3} to{transform:scale(1);opacity:1} }
        .v2tt-in { animation: v2tt-in .18s ease-out 1; }
        @media (prefers-reduced-motion: reduce){ .v2tt-shake,.v2tt-in{animation:none!important} }
      `}</style>

      {/* the trays */}
      <div className={cols ? 'grid grid-cols-3 gap-2 sm:gap-3' : 'flex flex-col gap-2.5'}>
        {trays.map((t) => {
          const got = inTray(t.id)
          const isFull = full(t)
          const target = !!holding && placed[holding] !== t.id
          const over = drag?.moved && drag.over === t.id
          const showFull = isFull && (refused === t.id || (target && over) || (!!sel && target))
          return (
            <div key={t.id} data-tray-id={t.id} onClick={() => tapTray(t)}
              className={`relative flex rounded-[8px] border-2 p-1.5 transition-colors sm:p-2 ${refused === t.id ? 'v2tt-shake' : ''} ${
                over && !isFull ? 'border-forest bg-forest/10' : target && !isFull ? 'border-forest/60 bg-ground' : 'border-rule-soft bg-ground'} ${cols ? 'flex-col' : 'min-h-[60px] flex-row items-stretch gap-2'} ${!isFull && target ? 'cursor-pointer' : ''}`}>
              <div className={`relative flex px-1 ${cols ? 'min-h-[36px] flex-col items-start pb-1 sm:min-h-0 sm:flex-row sm:items-baseline sm:justify-between sm:gap-1.5 sm:pb-1.5' : 'w-[34%] shrink-0 flex-col justify-center sm:w-[200px]'}`}>
                <span className="font-[family-name:var(--font-ui)] text-[14px] font-semibold leading-[18px] text-ink sm:text-[15px]">{t.label}</span>
                <span className={`font-[family-name:var(--font-ui)] text-[12px] leading-[16px] tabular-nums sm:text-[13px] ${isFull ? 'font-semibold text-forest' : 'text-muted'}`}>
                  {t.cap !== undefined ? (isFull ? 'Full' : `${t.cap - got.length} left`) : `${got.length} tool${got.length === 1 ? '' : 's'}`}
                </span>
                {showFull && (
                  <span className="pointer-events-none absolute -inset-0.5 flex items-center justify-center rounded-[5px] bg-ink px-1 text-center font-[family-name:var(--font-ui)] text-[12px] font-medium leading-[14px] text-white">
                    Full. Tap one to swap
                  </span>
                )}
              </div>
              <div className={cols ? 'flex flex-col gap-1.5' : 'grid flex-1 grid-cols-1 content-center gap-1.5 sm:grid-cols-2'}>
                {got.map((i) => (
                  <Tile key={i.id} item={i} compact placed trayId={t.id} selected={sel === i.id} lifting={drag?.moved === true && drag.id === i.id}
                    swapTarget={!!sel && sel !== i.id && isFull} {...tileProps(i.id)} />
                ))}
                {cols && t.cap !== undefined && Array.from({ length: t.cap - got.length }).map((_, k) => (
                  <div key={k} aria-hidden className={`h-10 rounded-[6px] border border-dashed ${target ? 'border-forest/50' : 'border-rule'}`} />
                ))}
                {!cols && !got.length && (
                  <div aria-hidden className={`h-10 rounded-[6px] border border-dashed sm:col-span-2 ${target ? 'border-forest/50' : 'border-rule-soft'}`} />
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* the tiles */}
      <div data-pool className={`mt-3 grid gap-2 ${cols ? 'grid-cols-3 sm:grid-cols-4' : 'grid-cols-2 sm:grid-cols-3'}`}>
        {items.map((i) =>
          placed[i.id] ? (
            cols ? <div key={i.id} aria-hidden className="min-h-[48px] rounded-[6px] border border-dashed border-rule-soft" /> : null
          ) : (
            <Tile key={i.id} item={i} selected={sel === i.id} lifting={drag?.moved === true && drag.id === i.id} {...tileProps(i.id)} />
          ),
        )}
      </div>

      {/* the tile under your finger while dragging */}
      {dragItem && drag && (
        <div className="pointer-events-none fixed z-50" style={{ left: drag.x - Math.min(drag.w, 180) / 2, top: drag.y - 28, width: Math.min(drag.w, 180) }}>
          <Tile item={dragItem} ghost />
        </div>
      )}
    </div>
  )
}

type TileProps = {
  item: TrayItem; compact?: boolean; placed?: boolean; trayId?: string; selected?: boolean; lifting?: boolean; ghost?: boolean; swapTarget?: boolean
} & Partial<Pick<React.HTMLAttributes<HTMLDivElement>, 'onPointerDown' | 'onPointerMove' | 'onPointerUp' | 'onPointerCancel' | 'onKeyDown'>>

function Tile({ item, compact, placed, trayId, selected, lifting, ghost, swapTarget, ...h }: TileProps) {
  return (
    <div role={ghost ? undefined : 'button'} tabIndex={ghost ? undefined : 0}
      aria-pressed={ghost ? undefined : !!selected}
      aria-label={ghost ? undefined : `${item.label}${item.sub ? `: ${item.sub}` : ''}${placed ? '. Placed. Tap to take it out.' : ''}`}
      data-tile-placed={placed ? item.id : undefined} data-in-tray={trayId}
      onClick={(e) => e.stopPropagation()}
      {...h}
      className={`group relative flex touch-none select-none gap-2 rounded-[6px] border bg-ground text-left transition-[transform,box-shadow,border-color,opacity] duration-150 ${
        compact ? 'min-h-10 items-center px-2 py-1' : 'items-start'} ${compact ? '' : item.sub ? 'min-h-[64px] px-2.5 py-2' : 'min-h-[48px] px-2 py-1.5'} ${
        ghost ? 'rotate-[-2deg] border-ink shadow-[0_12px_28px_rgba(13,12,11,0.25)]'
          : selected ? '-translate-y-0.5 border-2 border-navy shadow-[0_6px_16px_rgba(20,35,59,0.22)]'
          : swapTarget ? 'cursor-pointer border-bronze/60 hover:border-bronze'
          : 'cursor-grab border-rule-soft shadow-[0_1px_0_#DDD9D2] hover:-translate-y-0.5 hover:border-rule'} ${lifting ? 'opacity-30' : ''} ${placed && !ghost ? 'v2tt-in' : ''}`}>
      <div className="min-w-0 flex-1">
        <p className={`font-[family-name:var(--font-ui)] font-semibold text-ink ${compact ? 'text-[12px] leading-[15px] sm:text-[13px] sm:leading-[16px]' : 'text-[13px] leading-[16px] sm:text-[14px] sm:leading-[18px]'}`}>{item.label}</p>
        {item.sub && !compact && <p className="mt-0.5 font-[family-name:var(--font-ui)] text-[12px] leading-[15px] text-muted sm:text-[13px] sm:leading-[17px]">{item.sub}</p>}
      </div>
      {item.icon && <span className={`shrink-0 text-bronze ${compact ? 'hidden sm:block' : ''}`}>{item.icon}</span>}
    </div>
  )
}
