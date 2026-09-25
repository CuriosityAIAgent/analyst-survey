'use client'
import { LadderScene, READ_COUNT } from '@/components/LadderScene'
import { RUNGS, SCENES, VIGNETTE, INSPECTION_LINE } from '@/content/ladder'

export default function Art() {
  return (
    <main className="min-h-dvh bg-paper px-6 py-12 sm:px-12">
      <div className="mx-auto max-w-[860px]">
        <p className="eyebrow">The ladder</p>
        <h1 className="display mt-3 text-[40px] text-ink sm:text-[52px]">One book, five ways</h1>
        <p className="mt-5 max-w-[62ch] text-[17px] leading-[1.5] text-ink-2">
          <strong className="font-semibold">{VIGNETTE.title}.</strong> {VIGNETTE.body}
        </p>
        <p className="mt-4 max-w-[62ch] text-[15px] leading-[1.5] text-muted">
          Same desk, same twelve pages, same error on page nine every time
          <span className="mx-1.5 inline-block h-[7px] w-[7px] rounded-full align-middle" style={{ background: '#925626' }} />
          Only where you stand changes. A green rule under a page means a person
          read that one before it counted.
        </p>

        {RUNGS.map((r) => {
          const read = READ_COUNT(r.id)
          const isLine = r.id === INSPECTION_LINE
          return (
            <section key={r.id} className="mt-12 border-t border-rule-soft pt-8">
              <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
                <h2 className="display text-[27px] text-ink">{r.label}</h2>
                <span className="font-[family-name:var(--font-ui)] text-[13px] text-muted">
                  {read} of 12 read before it counted
                </span>
              </div>

              <div className="mt-5 grid gap-7 md:grid-cols-[360px_1fr]">
                <div className="bg-ground p-1">
                  <LadderScene rung={r.id} width={352} />
                </div>
                <div>
                  <p className="text-[16px] leading-[1.5] text-ink-2">{SCENES[r.id].happens}</p>
                  <dl className="mt-5 space-y-3 text-[15px]">
                    <div className="flex gap-4">
                      <dt className="w-[130px] shrink-0 font-[family-name:var(--font-ui)] text-[13px] text-muted">You still do</dt>
                      <dd className="flex-1 text-ink-2">{SCENES[r.id].youDo}</dd>
                    </div>
                    <div className="flex gap-4">
                      <dt className="w-[130px] shrink-0 font-[family-name:var(--font-ui)] text-[13px] text-muted">You stop doing</dt>
                      <dd className="flex-1 text-ink-2">{SCENES[r.id].youStop}</dd>
                    </div>
                  </dl>
                </div>
              </div>

              {isLine && (
                <p className="mt-6 border-l-2 pl-4 text-[15px] leading-[1.5] text-ink-2" style={{ borderColor: '#23402F' }}>
                  This is the last rung where every finished page is read before it
                  counts. The pipeline does not break at automation in general. It
                  breaks on the next step down.
                </p>
              )}
            </section>
          )
        })}
      </div>
    </main>
  )
}
