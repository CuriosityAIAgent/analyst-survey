'use client'
import { ReactNode } from 'react'

export function Chip({
  on, onClick, children, disabled,
}: { on: boolean; onClick: () => void; children: ReactNode; disabled?: boolean }) {
  return (
    <button type="button" className="chip" aria-pressed={on} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  )
}

export function Level({
  title, sub, aside, children,
}: { title: string; sub?: string; aside?: string; children: ReactNode }) {
  return (
    <div className="glass mx-auto w-full max-w-[720px] p-6 sm:p-8">
      <h1 className="display text-[26px] sm:text-[34px] text-snow">{title}</h1>
      {sub && <p className="mt-2 text-[15px] leading-relaxed text-ink2">{sub}</p>}
      {aside && <p className="mt-1 text-[13px] italic text-ink2/70">{aside}</p>}
      <div className="mt-6">{children}</div>
    </div>
  )
}

export function FooterBar({
  label, canProceed, onNext, onBack, hint, showBack = true,
}: { label: string; canProceed: boolean; onNext: () => void; onBack: () => void; hint?: string; showBack?: boolean }) {
  return (
    <div className="sticky bottom-0 z-20 mx-auto w-full max-w-[720px] px-4 pb-[max(16px,env(safe-area-inset-bottom))] pt-3 mt-2">
      <div className="glass flex items-center gap-3 px-4 py-3">
        {showBack && (
          <button onClick={onBack} className="chip px-4 text-ink2" type="button">Back</button>
        )}
        <span className="min-w-0 flex-1 truncate text-[13px] text-ink2">{hint}</span>
        <button
          type="button"
          onClick={onNext}
          disabled={!canProceed}
          className="min-h-[44px] rounded-full px-6 text-[15px] font-semibold transition disabled:cursor-not-allowed"
          style={{
            background: canProceed ? 'var(--color-gold)' : 'rgba(185,198,224,0.14)',
            color: canProceed ? '#0A1430' : 'rgba(185,198,224,0.5)',
          }}
        >
          {label}
        </button>
      </div>
    </div>
  )
}
