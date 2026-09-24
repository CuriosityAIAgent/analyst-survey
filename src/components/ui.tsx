'use client'
import { ReactNode } from 'react'

export function Chip({
  on, onClick, children, disabled, label,
}: { on: boolean; onClick: () => void; children: ReactNode; disabled?: boolean; label?: string }) {
  return (
    <button type="button" className="choice" aria-pressed={on} aria-label={label}
      onClick={onClick} disabled={disabled}>
      {children}
    </button>
  )
}

/** The editorial panel. Opaque paper on the dark field — interface text never
    sits on the changing sky. */
export function Level({
  title, sub, aside, children,
}: { title: string; sub?: string; aside?: string; children: ReactNode }) {
  return (
    <div className="panel mx-auto w-full max-w-[680px] p-6 sm:p-9">
      <h1 tabIndex={-1} className="display text-[30px] text-ink sm:text-[40px]">{title}</h1>
      {sub && <p className="mt-3 max-w-[58ch] text-[17px] leading-[1.5] text-ink-2">{sub}</p>}
      {aside && <p className="mt-2 text-[14px] text-muted">{aside}</p>}
      <div className="mt-7">{children}</div>
    </div>
  )
}

export function FooterBar({
  label, canProceed, onNext, onBack, hint, showBack = true,
}: { label: string; canProceed: boolean; onNext: () => void; onBack: () => void; hint?: string; showBack?: boolean }) {
  return (
    <div className="sticky bottom-0 z-20 mx-auto mt-3 w-full max-w-[680px] px-4 pb-[max(16px,env(safe-area-inset-bottom))]">
      <div className="panel flex items-center gap-3 px-4 py-3">
        {showBack && <button onClick={onBack} className="btn-quiet" type="button">Back</button>}
        <span className="min-w-0 flex-1 truncate text-[14px] text-muted">{hint}</span>
        <button type="button" onClick={onNext} disabled={!canProceed} className="btn">{label}</button>
      </div>
    </div>
  )
}
