'use client'
import { useStore } from '@/store/useStore'
import { Chip, Level } from '@/components/ui'

const BUSINESS = ['USPB', 'IPB', 'Solutions']
const MONTHS = ['0–6', '7–12', '13–24', '25–36', "I've finished the programme"]
const AI = ['Every day', 'Most weeks', 'Now and then', 'Barely', 'Not allowed to yet']
const ALONE = ['Run a client review', 'Pitch a prospect', 'Work a list of names cold', 'Take on my own names', 'Say no to an Advisor']

export default function L0() {
  const { answers, set } = useStore()
  const s = answers.segment
  const toggle = (k: 'canAlone' | 'notTrusted', v: string) =>
    set('segment', { [k]: s[k].includes(v) ? s[k].filter((x) => x !== v) : [...s[k], v] })

  return (
    <Level
      title="You're on the climb. Help us map the next one."
      sub="Twelve minutes, mostly tapping. It shapes what the programme teaches and where the firm puts AI first. Your answers reach the working group under a code, never with your name on them."
    >
      <div className="space-y-6">
        <Field label="Which business?">
          {BUSINESS.map((b) => <Chip key={b} on={s.business === b} onClick={() => set('segment', { business: b })}>{b}</Chip>)}
        </Field>
        <Field label="How long have you been in it?">
          {MONTHS.map((m) => <Chip key={m} on={s.months === m} onClick={() => set('segment', { months: m })}>{m}</Chip>)}
        </Field>
        <Field label="How often do you use AI tools for work today?">
          {AI.map((a) => <Chip key={a} on={s.aiUse === a} onClick={() => set('segment', { aiUse: a })}>{a}</Chip>)}
        </Field>
        <Field label="What can you already do alone?" note="Pick any.">
          {ALONE.map((a) => (
            <Chip key={a} on={s.canAlone.includes(a)} onClick={() => toggle('canAlone', a)}
              label={`Can already do alone: ${a}`}>{a}</Chip>
          ))}
        </Field>
        <Field label="And what do you not trust yourself on yet?" note="Be honest, nobody sees your name.">
          {ALONE.map((a) => (
            <Chip key={a} on={s.notTrusted.includes(a)} onClick={() => toggle('notTrusted', a)}
              label={`Do not trust myself on: ${a}`}>{a}</Chip>
          ))}
        </Field>
      </div>
    </Level>
  )
}

function Field({ label, note, children }: { label: string; note?: string; children: React.ReactNode }) {
  return (
    <div role="group" aria-label={label}>
      <div className="mb-2 text-[14px] font-medium text-snow">{label}</div>
      {note && <div className="mb-2 text-[13px] text-ink2/80">{note}</div>}
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  )
}
export const l0Ready = (s: { business?: string; months?: string; aiUse?: string }) => !!(s.business && s.months && s.aiUse)
