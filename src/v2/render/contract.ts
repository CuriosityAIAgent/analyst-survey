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
  /** The last screen only: what Next says ("Send", or "Couldn't send. Tap to try
      again." after a failed send). Pass it to V2Frame's nextLabel when set. */
  nextLabel?: string
  /** The last screen only, while the answers are being sent: pass it to V2Frame's
      `missing` so Next is disabled and says so ("Sending…"). */
  busy?: string
}

/* A renderer must: show q.question, q.instruction (and note/privacy) through V2Frame;
   compute `missing` ("Pick 1 more") from its constraints unless `preview`; call set()
   on every change; never repeat the respondent's earlier answers in a follow-up. */

/* Test hooks every renderer must expose, so e2e/v2-walk.mjs can play any screen
   like a person (and stays template-agnostic):
     data-q="<question or follow-up id>"      on the object root
     data-option="<option id>"                every tappable option / tile / tool / trait / card choice
     data-zone="<tray | stop | step id>"      every drop target, track stop, podium step
     data-choice="<choice id>"                card-stack and stamp buttons (per card)
     data-jug="<option id>"                   bottle jugs (tap = pour 1 hour)
     data-input                              the text field on text questions
   plus V2Frame's own data-next on Next. Tap-then-tap must work everywhere drag works. */
