'use client'
/* Chips drawn as part of the scene, so no follow-up sheet reads as a form.

   TagChip    a card luggage tag (the F5 tag's finish): notched left end with
              an eyelet, a stitched edge. Used by the one-tap sheets (F2b,
              F3a, F3b, F3c). Chosen: an ink edge and a forest cord tied
              through the eyelet.
   PlateChip  a blank brass name plate (the F4 plaque's finish): bronze
              outline, two screws, Archivo caps. Used for F4's methods.

   NameTip    a placed tile's name, shown above it on hover or keyboard
              focus (put it inside an element with class group/placed).

   All options on a sheet share one finish, so none looks like the better
   answer. Both are pure drawings: put them inside your own button or drag
   item, which owns the hit area (44px or more). */

import type { ReactNode } from 'react'

const INK = '#0D0C0B'
const PAPER = '#F8F7F4'
const RULE = '#8C857A'
const FOREST = '#1F4B3A'
const BRONZE = '#7A3E12'

export function TagChip({ label, on, size = 15, trail }: {
  label: string; on: boolean; size?: number
  /** Drawn inside the tag at its right end (desk: the option's number key). */
  trail?: ReactNode
}) {
  return (
    <span className="relative block h-full w-full">
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 170 56" preserveAspectRatio="none" aria-hidden style={{ overflow: 'visible' }}>
        <path d="M18 2 H164 Q168 2 168 6 V50 Q168 54 164 54 H18 L3 40 V16 Z" fill={PAPER} stroke={on ? INK : RULE}
          strokeWidth={on ? 1.8 : 1} vectorEffect="non-scaling-stroke" strokeLinejoin="round" />
        <path d="M22 7 H163 V49 H22" fill="none" stroke={RULE} strokeWidth={0.8} strokeDasharray="1 3" vectorEffect="non-scaling-stroke" opacity={0.8} />
      </svg>
      {/* the eyelet, kept round outside the stretched svg; a cord when chosen */}
      <svg className="absolute left-[4px] top-1/2 -translate-y-1/2" width={20} height={20} viewBox="-10 -10 20 20" aria-hidden style={{ overflow: 'visible' }}>
        {on && <path d="M-1 0 C -8 -6, -14 -2, -18 -8 M-1 0 C -8 5, -13 3, -18 9" fill="none" stroke={FOREST} strokeWidth={1.6} strokeLinecap="round" />}
        <circle cx={2} r={3.6} fill={on ? FOREST : PAPER} stroke={INK} strokeWidth={1.2} />
        <circle cx={2} r={1.3} fill={PAPER} />
      </svg>
      <span
        className={`absolute inset-y-0 left-[24px] ${trail ? 'right-[40px]' : 'right-[8px]'} flex items-center justify-center text-center font-[family-name:var(--font-ui)] text-ink ${on ? 'font-semibold' : ''}`}
        style={{ fontSize: size, lineHeight: `${size + 4}px` }}
      >
        {label}
      </span>
      {trail && <span className="absolute right-[10px] top-1/2 flex -translate-y-1/2">{trail}</span>}
    </span>
  )
}

export function PlateChip({ label, ghost = false }: { label: string; ghost?: boolean }) {
  return (
    <span className="relative inline-flex h-full items-center px-[20px]">
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 120 44" preserveAspectRatio="none" aria-hidden>
        <rect x={1.5} y={2} width={117} height={40} rx={3} fill={ghost ? 'none' : PAPER} stroke={ghost ? RULE : BRONZE}
          strokeWidth={ghost ? 1 : 1.5} strokeDasharray={ghost ? '3 3' : undefined} vectorEffect="non-scaling-stroke" />
        {!ghost && <rect x={4.5} y={6} width={111} height={32} rx={1.5} fill="none" stroke={BRONZE} strokeWidth={0.7} vectorEffect="non-scaling-stroke" opacity={0.6} />}
      </svg>
      {!ghost && (
        <>
          <Screw className="left-[7px]" />
          <Screw className="right-[7px]" />
        </>
      )}
      <span
        className={`relative whitespace-nowrap font-[family-name:var(--font-ui)] text-[11px] font-semibold uppercase leading-[14px] tracking-[0.12em] ${ghost ? 'invisible' : ''}`}
        style={{ color: BRONZE }}
      >
        {label}
      </span>
    </span>
  )
}

function Screw({ className }: { className: string }) {
  return (
    <svg className={`absolute top-1/2 -translate-y-1/2 ${className}`} width={6} height={6} viewBox="-3 -3 6 6" aria-hidden>
      <circle r={2.2} fill={PAPER} stroke={BRONZE} strokeWidth={0.9} />
      <path d="M-1.3 -0.6 L1.3 0.6" stroke={BRONZE} strokeWidth={0.8} />
    </svg>
  )
}

/** A placed tile's name, shown above it on hover or keyboard focus (and
    in the helper line while it is lifted). */
export function NameTip({ text }: { text: string }) {
  return (
    <span className="pointer-events-none absolute bottom-[calc(100%+2px)] left-1/2 z-20 hidden -translate-x-1/2 whitespace-nowrap rounded-[2px] bg-ink px-[6px] py-[2px] font-[family-name:var(--font-ui)] text-[11px] leading-[14px] text-paper group-hover/placed:block group-focus-visible/placed:block"
      aria-hidden>
      {text}
    </span>
  )
}


/** Desk: a board item's full name and its keys, shown on hover or keyboard
    focus with a fine pointer (design 3.7; styled in DeskStyles, hidden while
    the item is lifted). Put it inside the useDrag item (the `group`). */
export function HoverTip({ text, keys }: { text: string; keys: string }) {
  return (
    <span data-hover-tip
      className="pointer-events-none absolute bottom-[calc(100%+4px)] left-1/2 z-30 -translate-x-1/2 whitespace-nowrap rounded-[3px] bg-ink px-[8px] py-[4px] font-[family-name:var(--font-ui)] text-[12px] leading-[16px] text-paper"
      aria-hidden>
      {text} <span className="opacity-70">· Press {keys}</span>
    </span>
  )
}
