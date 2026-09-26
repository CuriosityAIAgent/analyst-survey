/* The render contract: how the v2 Player turns one question (from questions.ts)
   into one screen. Each template has ONE renderer file in src/v2/render/<template>.tsx
   that default-exports a component taking RenderProps and returning <V2Frame ...>.

   The Player owns the store, the order, follow-ups, breaks and numbering; a renderer
   only draws the question and reports its answer. Follow-ups use the same renderers:
   the Player passes the follow-up as `q` (its fields mapped onto Question) plus `bridge`. */
import type { Answer, Channel, Question } from '../questions'

export type RenderProps = {
  q: Question
  channel: Channel
  /** The saved answer for q.stores, or undefined. Never assume a shape: validate. */
  value: Answer | undefined
  /** Save the answer (the Player persists it under q.stores). */
  set: (v: Answer) => void
  /** Log an interaction for analysis (orders, peeks, undo). */
  log: (type: string, data?: Record<string, unknown>) => void
  /** 1-based question number and total for the rail (follow-ups keep their parent's number). */
  step: number
  total: number
  /** Follow-ups only: the topic line, e.g. "One more on classroom training." */
  bridge?: string
  /** Preview mode: Next is always allowed, even with no answer. */
  preview: boolean
  /** Advance (the Player decides: next follow-up, break, next question, or end). */
  onNext: () => void
  onBack: () => void
  /** A per-respondent seed for shuffles (stable across reloads). */
  seed: number
}

/* A renderer must: show q.question, q.instruction (and note/privacy) through V2Frame;
   compute `missing` ("Pick 1 more") from its constraints unless `preview`; call set()
   on every change; never repeat the respondent's earlier answers in a follow-up. */
