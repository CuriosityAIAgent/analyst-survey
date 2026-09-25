'use client'
/* /art/game: every art id in the spec, drawn or not, in a labelled grid for
   review. Drawn pieces render; missing ones show their placeholder. The
   climber (Figure) is shown in every variant and pose at the top. */
import { Art, ART_FILES, hasArt } from '@/game/art'
import { naturalSize } from '@/game/art/kit'
import Figure, { type FigurePose, type FigureVariant } from '@/game/Figure'
import { SPEC } from '@/game/content'
import Playground from '@/game/Playground'

const POSES: FigurePose[] = ['stand', 'stride', 'crouch', 'openHand', 'setDown']
const VARIANTS: FigureVariant[] = ['rookie', 'you', 'ghost']

const fileOf = (id: string) => Object.entries(ART_FILES).find(([, ids]) => ids.includes(id))?.[0] ?? '?'

/** Pieces whose default render says little on its own: show them in their
    states (route-layers at each precision, strap-kit with sample bricks,
    the zones full and empty). */
type Variant = { label: string; props: Record<string, unknown> }
const VARIANTS_OF: Record<string, Variant[]> = {
  'route-layers': [1, 2, 3, 4].map((v) => ({ label: `precision ${v}`, props: { value: v } })),
  'strap-kit': [
    { label: 'map', props: { data: ['map'] } },
    { label: 'map, compass, guidebook', props: { data: ['map', 'compass', 'guidebook'] } },
    { label: 'all six', props: { data: ['map', 'compass', 'guidebook', 'gps', 'radio', 'brief'] } },
  ],
  rucksack: [{ label: 'open', props: {} }, { label: 'zipped', props: { state: 'zipped' } }],
  'hand-zone': [{ label: 'open', props: {} }, { label: 'closed', props: { state: 'closed' } }],
  'tarp-out': [{ label: 'open', props: {} }, { label: 'folded', props: { state: 'folded' } }],
  'bench-rerig': [{ label: 'open', props: {} }, { label: 'spliced', props: { state: 'spliced' } }],
}

function cellSize(id: string): { w: number; h: number } {
  const [w, h] = naturalSize(id)
  if (id.startsWith('scene-')) return { w: 156, h: 264 }
  const scale = Math.min(1, 180 / w, 240 / h) // fits a 200px cell
  return { w: Math.round(w * scale), h: Math.round(h * scale) }
}

export default function ArtGame() {
  const groups = [...new Set(SPEC.art.map((a) => a.group))]
  const drawn = SPEC.art.filter((a) => hasArt(a.id)).length
  return (
    <main className="min-h-dvh bg-paper px-5 py-8 sm:px-10" data-art-page>
      <div className="mx-auto max-w-[1100px]">
        <p className="eyebrow">The Ascent · art review</p>
        <h1 className="display mt-2 text-[34px] text-ink">Every drawing in the game</h1>
        <p className="mt-2 font-[family-name:var(--font-ui)] text-[13px] text-muted" data-art-count>
          {drawn} of {SPEC.art.length} drawn · dashed boxes are not drawn yet · style rules in src/game/art/STYLE.md
        </p>

        <section className="mt-8 border-t border-rule-soft pt-5">
          <h2 className="display text-[22px] text-ink">Primitives (reference usage)</h2>
          <div className="mt-4"><Playground /></div>
        </section>

        <section className="mt-8 border-t border-rule-soft pt-5">
          <h2 className="display text-[22px] text-ink">The climber (Figure.tsx)</h2>
          <div className="mt-4 grid grid-cols-[repeat(auto-fill,minmax(150px,1fr))] gap-4">
            {VARIANTS.map((v) => POSES.map((pose) => (
              <figure key={`${v}-${pose}`} className="flex flex-col items-center gap-2 border border-rule-soft bg-ground p-3">
                <div className="flex h-[100px] items-end">
                  <Figure variant={v} pose={pose} t={1.1} size={84} />
                </div>
                <figcaption className="font-[family-name:var(--font-ui)] text-[11px] text-muted">{v} · {pose}</figcaption>
              </figure>
            )))}
            <figure className="flex flex-col items-center gap-2 border border-rule-soft bg-ground p-3">
              <div className="flex h-[100px] items-end gap-1">
                <Figure pose="stand" size={48} />
                <Figure pose="stride" t={0} size={48} />
                <Figure pose="stride" t={1.6} size={48} />
                <Figure pose="stride" t={3.1} size={48} />
              </div>
              <figcaption className="font-[family-name:var(--font-ui)] text-[11px] text-muted">rookie · 48px (game size)</figcaption>
            </figure>
          </div>
        </section>

        {groups.map((g) => (
          <section key={g} className="mt-10 border-t border-rule-soft pt-5">
            <h2 className="display text-[22px] text-ink">{g}</h2>
            <div className="mt-4 grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-4">
              {SPEC.art.filter((a) => a.group === g).map((a) => {
                const { w, h } = cellSize(a.id)
                const ok = hasArt(a.id)
                return (
                  <figure key={a.id} className="flex flex-col gap-2 border border-rule-soft bg-ground p-3" data-art-cell={a.id} data-drawn={ok}>
                    {VARIANTS_OF[a.id] ? (
                      <div className={`flex min-h-[90px] items-center justify-center gap-3 overflow-hidden ${a.id === 'route-layers' ? 'flex-col' : 'flex-wrap'}`}>
                        {VARIANTS_OF[a.id].map((v) => {
                          const vw = a.id === 'route-layers' ? w : 64, vh = a.id === 'route-layers' ? h : 64
                          return (
                            <div key={v.label} className="flex flex-col items-center gap-1" data-art-variant={v.label}>
                              <div style={{ width: vw, height: vh }}>
                                <Art id={a.id} width={vw} height={vh} {...v.props} />
                              </div>
                              <span className="font-[family-name:var(--font-ui)] text-[10px] text-muted">{v.label}</span>
                            </div>
                          )
                        })}
                      </div>
                    ) : (
                      <div className="flex min-h-[90px] items-center justify-center overflow-hidden" style={{ background: a.id.startsWith('scene-') ? '#F8F7F4' : undefined }}>
                        <div style={{ width: w, height: h }}>
                          <Art id={a.id} width={w} height={h} />
                        </div>
                      </div>
                    )}
                    <figcaption>
                      <div className="flex items-baseline justify-between gap-2">
                        <code className="font-[family-name:var(--font-ui)] text-[12px] font-semibold text-ink">{a.id}</code>
                        <span className="font-[family-name:var(--font-ui)] text-[10px] uppercase tracking-[0.12em]" style={{ color: ok ? '#1F4B3A' : '#8C857A' }}>
                          {ok ? 'drawn' : 'to draw'}
                        </span>
                      </div>
                      <p className="mt-1 font-[family-name:var(--font-ui)] text-[10px] text-muted">{fileOf(a.id)} · {a.status}</p>
                      <p className="mt-1 text-[12px] leading-[1.35] text-ink-2">{a.brief}</p>
                    </figcaption>
                  </figure>
                )
              })}
            </div>
          </section>
        ))}
      </div>
    </main>
  )
}
