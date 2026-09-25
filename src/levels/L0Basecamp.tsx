'use client'
import { useStore } from '@/store/useStore'
import { Chip, Level } from '@/components/ui'

const BUSINESS = ['USPB', 'IPB', 'Solutions']
const AI = ['Every day', 'Most weeks', 'Now and then', 'Barely', 'Not allowed to yet']
const ALONE = ['Run a client review', 'Pitch a prospect', 'Work a list of names cold', 'Take on my own names', 'Say no to an Advisor']

export default function L0() {
  const { answers, set } = useStore()
  const s = answers.segment
  const toggle = (k: 'canAlone' | 'notTrusted', v: string) =>
    set('segment', { [k]: s[k].includes(v) ? s[k].filter((x) => x !== v) : [...s[k], v] })

  return (
    <Level
      title="You made the climb. Help us map the next one."
      sub="Twelve minutes, mostly tapping. It shapes what the programme teaches and where the firm puts AI first."
    >
      <p className="mb-6 rounded-[2px] border border-rule bg-ground p-3 text-[13px] leading-relaxed text-muted">
        <strong className="text-forest">Prototype.</strong> Nothing is sent anywhere yet. Your
        answers stay in this browser and are cleared when you start again. Before this is
        fielded it needs the token service and the response API, so what you type here is
        for shaping the instrument, not for the record.
      </p>
      <div className="space-y-6">
        <Field label="Which business?">
          {BUSINESS.map((b) => <Chip key={b} on={s.business === b} onClick={() => set('segment', { business: b })}>{b}</Chip>)}
        </Field>
        <Field label="How often do you use AI tools today?">
          {AI.map((a) => <Chip key={a} on={s.aiUse === a} onClick={() => set('segment', { aiUse: a })}>{a}</Chip>)}
        </Field>
        <Field label="By the end of the programme, what could you do alone?" note="Pick any.">
          {ALONE.map((a) => (
            <Chip key={a} on={s.canAlone.includes(a)} onClick={() => toggle('canAlone', a)}
              label={`Could do alone by the end: ${a}`}>{a}</Chip>
          ))}
        </Field>
        <Field label="And what did you still not trust yourself on?" note="Be honest, nobody sees your name.">
          {ALONE.map((a) => (
            <Chip key={a} on={s.notTrusted.includes(a)} onClick={() => toggle('notTrusted', a)}
              label={`Did not trust myself on: ${a}`}>{a}</Chip>
          ))}
        </Field>
      </div>
    </Level>
  )
}

function Field({ label, note, children }: { label: string; note?: string; children: React.ReactNode }) {
  return (
    <div role="group" aria-label={label}>
      <div className="mb-2 text-[14px] font-medium text-ink">{label}</div>
      {note && <div className="mb-2 text-[13px] text-muted">{note}</div>}
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  )
}
export const l0Ready = (s: { business?: string; aiUse?: string }) => !!(s.business && s.aiUse)
