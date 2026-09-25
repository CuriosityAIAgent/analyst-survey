'use client'
/* KeyCap: one key, drawn as a small paper cap (design 3.8): Archivo 12, 22px
   tall, a 1px rule-soft border, radius 3. Keycaps are for a keyboard and a
   fine pointer: under (hover: none) they hide (the `keycap` class, styled in
   DeskStyles), so a landscape iPad never shows them.

     <KeyCap k="Enter" />            one key ('Enter' draws as ↵)
     <KeyText text="[1]–[4] sends the task you're on." />
                                     spec text with [X] marks -> KeyCaps */
import { Fragment } from 'react'
import type { CSSProperties } from 'react'

const GLYPH: Record<string, string> = {
  Enter: '↵', Return: '↵', Esc: 'Esc', Escape: 'Esc',
  ArrowLeft: '←', ArrowRight: '→', ArrowUp: '↑', ArrowDown: '↓',
  Delete: 'Del', Backspace: '⌫', Space: 'Space',
}

export default function KeyCap({ k, className = '', style, quiet }: {
  k: string
  className?: string
  style?: CSSProperties
  /** On an ink button: a light outline instead of a paper cap. */
  quiet?: boolean
}) {
  const text = GLYPH[k] ?? k
  return (
    <kbd
      className={`keycap inline-flex h-[22px] min-w-[22px] items-center justify-center rounded-[3px] px-[6px] align-middle font-[family-name:var(--font-ui)] text-[12px] font-medium not-italic leading-none ${className}`}
      style={{
        border: `1px solid ${quiet ? 'rgba(248,247,244,0.45)' : '#DDD9D2'}`,
        background: quiet ? 'transparent' : '#F8F7F4',
        color: quiet ? 'inherit' : '#262320',
        ...style,
      }}
      aria-label={k === 'Enter' ? 'Enter' : undefined}
    >
      {text}
    </kbd>
  )
}

/** Spec text with keys marked [X]: each mark becomes a KeyCap. */
export function KeyText({ text, className }: { text: string; className?: string }) {
  const parts = text.split(/(\[[^\]]+\])/g).filter(Boolean)
  return (
    <span className={className}>
      {parts.map((p, i) => {
        const m = /^\[([^\]]+)\]$/.exec(p)
        return m ? <KeyCap key={i} k={m[1]} className="mx-[1px]" /> : <Fragment key={i}>{p}</Fragment>
      })}
    </span>
  )
}
