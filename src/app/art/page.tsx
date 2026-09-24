'use client'
import { ActivityArt } from '@/components/ActivityArt'

const IDS = ['pitchbook', 'reviewpack', 'movemoney', 'onboard', 'lending', 'clientmail']
const LABELS: Record<string, string> = {
  pitchbook: 'The pitchbook', reviewpack: 'The review pack', movemoney: 'Moving money',
  onboard: 'Onboarding and KYC', lending: 'Lending and credit', clientmail: 'The client email',
}

export default function Art() {
  return (
    <main className="min-h-dvh bg-paper p-10">
      <p className="eyebrow">Authored SVG · recolours per state</p>
      <h1 className="display mt-3 text-[40px] text-ink">Activity objects</h1>

      {(['navy', 'bronze', 'forest'] as const).map((tone) => (
        <div key={tone} className="mt-9">
          <p className="eyebrow mb-3">{tone}</p>
          <div className="flex flex-wrap gap-3">
            {IDS.map((id) => (
              <div key={id} className="panel flex w-[176px] flex-col items-center gap-3 p-4">
                <ActivityArt id={id} tone={tone} size={68} />
                <span className="text-center font-[family-name:var(--font-ui)] text-[13px] text-ink-2">
                  {LABELS[id]}
                </span>
              </div>
            ))}
          </div>
        </div>
      ))}

      <div className="mt-10">
        <p className="eyebrow mb-3">on a selected card, as it would appear in the Handover</p>
        <div className="flex gap-3">
          {IDS.slice(0, 3).map((id) => (
            <div key={id} className="flex w-[200px] flex-col items-center gap-3 rounded-[2px] bg-ink p-5">
              <ActivityArt id={id} tone="bronze" size={68} />
              <span className="text-center font-[family-name:var(--font-ui)] text-[13px] text-white">
                {LABELS[id]}
              </span>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
