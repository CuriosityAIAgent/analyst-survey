'use client'
/* Standout 4: the stamp and certificate (question 5.5).
   Six bold ideas, one paper card at a time. Three rubber stamps sit under the
   card: Yes (tick), Not sure (?), No (cross). Pressing one slams an ink stamp
   onto the card with a knock, then the card slides onto that stamp's pile.
   One ink colour for all three, so no answer looks favoured.
   If the certification card gets a Yes, a follow-up rises in place, led by
   its topic line ("One more on certification."), never by the answer. */
import { useRef, useState } from 'react'
import V2Frame from '../V2Frame'
import { useLaptop } from '../hero/podium/useLaptop'
import { stampKnock, unlockAudio } from '../hero/podium/sound'
import { StampMark, InkFilter, Mark } from '../hero/stamp/ink'
import type { Choice } from '../hero/stamp/ink'

type Idea = { id: string; topic: string; text: string; note?: string }
const IDEAS: Idea[] = [
  { id: 'a', topic: 'Promotion', text: 'Promote on proven skills, not years.' },
  { id: 'b', topic: 'Certification', text: 'Sign off on set tasks before they do them alone.' },
  { id: 'c', topic: 'Early clients', text: 'A few HNW clients each, supervised, by year two.' },
  { id: 'd', topic: 'AI role play', text: 'Make AI client role play required before real meetings.' },
  { id: 'e', topic: 'AI agents', text: 'Analysts run their own AI agents by year two.', note: 'AI agents: AI that does tasks for you, such as preparing a meeting pack.' },
  { id: 'f', topic: 'Advisor capacity', text: 'Let Advisors take on more clients with the time AI saves.' },
]
const CHOICES: { id: Choice; label: string }[] = [
  { id: 'yes', label: 'Yes' },
  { id: 'unsure', label: 'Not sure' },
  { id: 'no', label: 'No' },
]
const PROOF = [
  'An Advisor watches a real meeting',
  'A case study',
  'Role play with an AI client',
  'A written test',
  'Client feedback',
]
const TILT: Record<Choice, number> = { yes: -8, unsure: 5, no: -4 }

export default function Stamp() {
  const laptop = useLaptop()
  const [answers, setAnswers] = useState<Record<string, Choice>>({})
  const [order, setOrder] = useState<string[]>([])
  const [inking, setInking] = useState<Choice | null>(null)
  const [phase, setPhase] = useState<'cards' | 'cert'>('cards')
  const [proof, setProof] = useState<number | null>(null)
  const cardRef = useRef<HTMLDivElement | null>(null)
  const pileRefs = useRef<Record<Choice, HTMLDivElement | null>>({ yes: null, unsure: null, no: null })
  const busy = useRef(false)

  const done = order.length
  const current = IDEAS[done]
  const left = IDEAS.length - done

  const press = (c: Choice) => {
    if (busy.current || !current) return
    busy.current = true
    unlockAudio()
    const idea = current
    setInking(c)
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    window.setTimeout(() => {
      stampKnock()
      cardRef.current?.animate(
        [{ transform: 'scale(1)' }, { transform: 'scale(.985) translateY(2px)' }, { transform: 'scale(1)' }],
        { duration: 180, easing: 'ease-out' },
      )
    }, reduce ? 0 : 130)
    const finish = () => {
      setAnswers((a) => ({ ...a, [idea.id]: c }))
      setOrder((o) => [...o, idea.id])
      setInking(null)
      busy.current = false
      if (idea.id === 'b' && c === 'yes') setPhase('cert')
    }
    window.setTimeout(() => {
      const card = cardRef.current
      const pile = pileRefs.current[c]
      if (!card || !pile || reduce) return finish()
      const a = card.getBoundingClientRect()
      const b = pile.getBoundingClientRect()
      const dx = b.left + b.width / 2 - (a.left + a.width / 2)
      const dy = b.top + b.height / 2 - (a.top + a.height / 2)
      const fly = card.animate(
        [
          { transform: 'translate(0,0) scale(1) rotate(0deg)', opacity: 1 },
          { transform: `translate(${dx * 0.2}px, ${dy * 0.1 - 14}px) scale(.9) rotate(${TILT[c] / 2}deg)`, opacity: 1, offset: 0.3 },
          { transform: `translate(${dx}px, ${dy}px) scale(.14) rotate(${TILT[c]}deg)`, opacity: 0.2 },
        ],
        { duration: 420, easing: 'cubic-bezier(.5,0,.4,1)', fill: 'forwards' },
      )
      fly.onfinish = finish
    }, reduce ? 250 : 720)
  }

  const back = () => {
    if (busy.current) return
    if (phase === 'cert') { setPhase('cards'); setProof(null); undoLast(); return }
    if (done) undoLast()
  }
  const undoLast = () => {
    const last = order[order.length - 1]
    if (!last) return
    if (last === 'b') setProof(null)
    setOrder((o) => o.slice(0, -1))
    setAnswers((a) => { const n = { ...a }; delete n[last]; return n })
  }
  const reset = () => { setAnswers({}); setOrder([]); setPhase('cards'); setProof(null) }

  const pile = (c: Choice) => order.filter((id) => answers[id] === c)

  if (phase === 'cert') {
    return (
      <V2Frame
        block="faster" step={laptop ? 23 : 16} total={laptop ? 25 : 17}
        bridge="One more on certification."
        question="How should an Analyst prove they’re ready for a task like a client review?"
        instruction="Tap one."
        missing={proof === null ? 'Tap one' : undefined}
        onNext={() => setPhase('cards')}
        onBack={back}
        tray={
          <div className="flex flex-col gap-1.5 lg:gap-2">
            {PROOF.map((p, i) => (
              <button key={p} type="button" aria-pressed={proof === i} onClick={() => setProof(i)}
                className={`flex min-h-[44px] items-center gap-3 rounded-[4px] border px-3.5 text-left font-[family-name:var(--font-ui)] text-[15px] transition-colors lg:min-h-[48px] ${
                  proof === i ? 'border-ink bg-ink text-white' : 'border-rule bg-ground text-ink hover:border-ink'
                }`}>
                <span aria-hidden className={`flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full border ${proof === i ? 'border-white' : 'border-rule'}`}>
                  {proof === i && <span className="h-2 w-2 rounded-full bg-white" />}
                </span>
                {p}
              </button>
            ))}
          </div>
        }
      >
        <Certificate proof={proof === null ? null : PROOF[proof]} />
        <Styles />
      </V2Frame>
    )
  }

  return (
    <V2Frame
      block="faster" step={laptop ? 23 : 16} total={laptop ? 25 : 17}
      question="Six ideas for A2A. Should we do each?"
      instruction="Tap a stamp. 6 cards."
      missing={left ? `Stamp ${left} more card${left === 1 ? '' : 's'}` : undefined}
      onNext={reset}
      onBack={back}
    >
      <InkFilter />
      <div className="mx-auto flex w-full max-w-[520px] flex-1 flex-col">
        {/* the card, with the rest of the deck peeking behind it */}
        <div className="relative min-h-[196px] lg:min-h-[228px]">
          {left > 2 && <div aria-hidden className="absolute inset-x-3 top-3 bottom-[-8px] rounded-[6px] border border-rule-soft bg-[#FBFAF7]" style={{ transform: 'rotate(1.2deg)' }} />}
          {left > 1 && <div aria-hidden className="absolute inset-x-1.5 top-1.5 bottom-[-4px] rounded-[6px] border border-rule-soft bg-[#FDFCFA]" style={{ transform: 'rotate(-0.8deg)' }} />}
          {current ? (
            <div key={current.id} ref={cardRef}
              className="v2s-rise relative flex h-full min-h-[196px] flex-col rounded-[6px] border border-[#D9D3C7] bg-ground px-5 pb-5 pt-4 shadow-[0_1px_0_#DDD9D2,0_10px_24px_rgba(13,12,11,.08)] lg:min-h-[228px] lg:px-7 lg:pt-5"
              style={{ backgroundImage: 'linear-gradient(180deg,#FFFFFF,#FCFBF8)' }}>
              <p className="font-[family-name:var(--font-ui)] text-[12px] font-semibold uppercase tracking-[0.1em] text-muted">
                <span className="text-bronze">{current.topic}</span>
                <span className="mx-1.5 text-rule">·</span>
                {done + 1} of {IDEAS.length}
              </p>
              <p className="mt-2.5 font-[family-name:var(--font-text)] text-[23px] font-semibold leading-[30px] text-ink lg:mt-3 lg:text-[28px] lg:leading-[36px]">
                {current.text}
              </p>
              {current.note && (
                <p className="mt-3 border-t border-rule-soft pt-2.5 font-[family-name:var(--font-ui)] text-[13px] leading-[18px] text-muted">
                  {current.note}
                </p>
              )}
              {inking && (
                <div aria-hidden className="pointer-events-none absolute bottom-3 right-3 lg:bottom-5 lg:right-6" style={{ transform: `rotate(${TILT[inking]}deg)` }}>
                  <div className="v2s-slam"><StampMark c={inking} size={laptop ? 1.1 : 0.9} /></div>
                </div>
              )}
            </div>
          ) : (
            <div className="relative flex h-full min-h-[196px] flex-col items-center justify-center rounded-[6px] border border-dashed border-rule-soft text-center lg:min-h-[228px]">
              <p className="font-[family-name:var(--font-text)] text-[22px] font-semibold text-ink">All 6 ideas stamped.</p>
              <p className="mt-1 font-[family-name:var(--font-ui)] text-[14px] text-muted">Back takes the last one off its pile.</p>
            </div>
          )}
        </div>

        {/* piles and stamps */}
        <div className="mt-auto grid grid-cols-3 gap-3 pt-5 lg:gap-5 lg:pt-7">
          {CHOICES.map((c) => {
            const ids = pile(c.id)
            return (
              <div key={c.id} className="flex flex-col items-center">
                <div ref={(el) => { pileRefs.current[c.id] = el }} className="relative mb-2 h-[40px] w-[64px]" aria-label={`${c.label}: ${ids.length}`}>
                  {ids.length === 0 && <div aria-hidden className="absolute inset-x-1 bottom-0 h-[30px] rounded-[3px] border border-dashed border-rule-soft" />}
                  {ids.map((id, k) => (
                    <div key={id} aria-hidden
                      className="v2s-land absolute inset-x-1 bottom-0 flex h-[30px] items-center justify-center rounded-[3px] border border-[#D9D3C7] bg-ground shadow-[0_1px_1px_rgba(13,12,11,.08)]"
                      style={{ transform: `translateY(${-k * 3}px) rotate(${(k % 2 ? 1 : -1) * (2 + k)}deg)`, zIndex: k }}>
                      <Mark c={c.id} className="h-3.5 w-3.5 text-bronze" />
                    </div>
                  ))}
                  {ids.length > 0 && (
                    <span className="absolute -right-4 bottom-1 font-[family-name:var(--font-ui)] text-[12px] font-semibold tabular-nums text-muted">{ids.length}</span>
                  )}
                </div>
                <button type="button" onClick={() => press(c.id)} disabled={!current}
                  className={`group flex w-full flex-col items-center outline-none disabled:opacity-40 ${inking === c.id ? 'v2s-press' : ''}`}
                  aria-label={`Stamp ${c.label}`}>
                  {/* the handle */}
                  <span aria-hidden className="h-[14px] w-[30px] rounded-t-full transition-transform group-active:translate-y-[3px] lg:h-[16px] lg:w-[34px]"
                    style={{ background: 'radial-gradient(ellipse at 40% 30%, #A8774A 0%, #7A4E2A 60%, #5C3920 100%)' }} />
                  <span aria-hidden className="h-[6px] w-[12px] transition-transform group-active:translate-y-[3px]" style={{ background: 'linear-gradient(90deg,#5C3920,#7A4E2A,#5C3920)' }} />
                  {/* the rubber face, with its word */}
                  <span className="flex h-[48px] w-full items-center justify-center gap-1.5 rounded-[4px] border-2 border-ink bg-ground font-[family-name:var(--font-ui)] text-[15px] font-semibold text-ink shadow-[0_3px_0_#0D0C0B] transition-[transform,box-shadow] group-hover:bg-[#F3F1EC] group-active:translate-y-[3px] group-active:shadow-[0_0_0_#0D0C0B] lg:h-[54px] lg:text-[16px]">
                    <Mark c={c.id} className="h-4 w-4" />
                    {c.label}
                  </span>
                </button>
              </div>
            )
          })}
        </div>
      </div>
      <Styles />
    </V2Frame>
  )
}

function Certificate({ proof }: { proof: string | null }) {
  return (
    <div className="v2s-cert mx-auto w-full max-w-[520px] rounded-[4px] bg-ground p-1.5 shadow-[0_10px_24px_rgba(13,12,11,.10)]">
      <div className="relative flex items-center gap-3.5 rounded-[2px] border-2 border-[#B8862B] px-3.5 py-3 lg:gap-5 lg:px-6 lg:py-4" style={{ outline: '1px solid #B8862B', outlineOffset: '-6px' }}>
        {/* the seal: presses in once there is an answer */}
        <span aria-hidden className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full transition-all duration-300 lg:h-12 lg:w-12 ${proof ? 'scale-100 opacity-100' : 'scale-75 opacity-25'}`}
          style={{ background: 'radial-gradient(circle at 35% 30%, #2F6A53, #1F4B3A 70%)', boxShadow: '0 2px 4px rgba(13,12,11,.25), inset 0 0 0 2px rgba(255,255,255,.18)' }}>
          <Mark c="yes" className="h-4 w-4 text-white" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-[family-name:var(--font-ui)] text-[11px] font-semibold uppercase tracking-[0.14em] text-bronze">Signed off: client review</p>
          <p className="mt-1.5 font-[family-name:var(--font-ui)] text-[12px] text-muted">Proved by</p>
          <p key={proof ?? 'blank'} className={`min-h-[24px] border-b border-rule font-[family-name:var(--font-text)] text-[17px] italic leading-[24px] text-ink ${proof ? 'v2s-write' : ''}`}>
            {proof ?? '\u00a0'}
          </p>
        </div>
      </div>
    </div>
  )
}

function Styles() {
  return (
    <style>{`
      @keyframes v2s-rise { from { transform: translateY(8px) scale(.97); opacity: .6; } to { transform: none; opacity: 1; } }
      .v2s-rise { animation: v2s-rise 260ms cubic-bezier(.3,.7,.2,1) both; }
      @keyframes v2s-slam {
        0% { transform: scale(1.7); opacity: 0; }
        55% { transform: scale(.95); opacity: 1; }
        75% { transform: scale(1.02); }
        100% { transform: scale(1); opacity: 1; }
      }
      .v2s-slam { animation: v2s-slam 230ms cubic-bezier(.5,0,.6,1) both; transform-origin: center; }
      @keyframes v2s-press { 0% { transform: translateY(0); } 30%, 60% { transform: translateY(5px); } 100% { transform: translateY(0); } }
      .v2s-press { animation: v2s-press 420ms ease-out; }
      @keyframes v2s-land { from { opacity: 0; } to { opacity: 1; } }
      .v2s-land { animation: v2s-land 160ms ease-out both; }
      @keyframes v2s-cert { from { transform: translateY(40px) scale(.96); opacity: 0; } to { transform: none; opacity: 1; } }
      .v2s-cert { animation: v2s-cert 480ms cubic-bezier(.2,.8,.2,1) both; }
      @keyframes v2s-write { from { clip-path: inset(0 100% 0 0); } to { clip-path: inset(0 0 0 0); } }
      .v2s-write { animation: v2s-write 520ms ease-out both; }
    `}</style>
  )
}
