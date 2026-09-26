'use client'
/* STUB: replaced by its builder. Renders a 'cards' question from questions.ts. */
import V2Frame from '../V2Frame'
import type { RenderProps } from './contract'
export default function CardsRender(p: RenderProps) {
  return (
    <V2Frame block={p.q.block} step={p.step} total={p.total} question={p.q.question} instruction={p.q.instruction}
      bridge={p.bridge} missing={p.preview ? undefined : 'Not built yet'} onNext={p.onNext} onBack={p.onBack}>
      <div className="flex flex-1 items-center justify-center border border-dashed border-rule text-muted">cards</div>
    </V2Frame>
  )
}
