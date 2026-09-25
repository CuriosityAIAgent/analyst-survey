'use client'
import { IMAGES } from '@/content/images'

/* An illustration slot. Real image if one is registered for this key,
   otherwise a quiet placeholder that states the brief — so a card never looks
   broken, and the working group can see what each image is meant to do. */
export function Visual({ id, brief, ratio = '16/9', className = '' }: {
  id: string; brief?: string; ratio?: string; className?: string
}) {
  const src = IMAGES[id]
  if (src) {
    return (
      <div className={`overflow-hidden bg-ground ${className}`} style={{ aspectRatio: ratio }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt="" aria-hidden className="h-full w-full object-cover" />
      </div>
    )
  }
  if (!brief) return null
  return (
    <div
      aria-hidden
      className={`relative flex items-end overflow-hidden border border-dashed border-rule bg-[repeating-linear-gradient(135deg,transparent,transparent_9px,rgba(140,133,122,0.08)_9px,rgba(140,133,122,0.08)_10px)] p-3 ${className}`}
      style={{ aspectRatio: ratio }}
    >
      <span className="font-[family-name:var(--font-ui)] text-[11px] leading-snug text-muted">
        <span className="mr-1.5 uppercase tracking-[0.12em] text-ink-2">Image</span>{brief}
      </span>
    </div>
  )
}
