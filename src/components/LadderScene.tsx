import { RungId } from '@/content/ladder'

/* The five rungs as desk scenes.

   The neutrality device is the frame itself: same desk, same lamp, same twelve
   pages, same planted error on page nine, same camera. Only the respondent's
   RELATIONSHIP to the work changes. Because nothing else varies, the scenes
   cannot be read as "further along is better" or "further along is worse" —
   there is no richer drawing further up the ladder to reward the eye.

   The underline beneath a page means a person read that one before it counted.
   Watching it survive to `briefed` and break at `standing` is the inspection
   line, which is the single thing this instrument exists to find. */

const INK = '#0D0C0B'
const INK_2 = '#3A3631'
const PAPER = '#FFFFFF'
const DESK = '#E7E1D7'
const DESK_EDGE = '#CFC7B9'
const BRONZE = '#925626'
const NAVY = '#16243B'
const FOREST = '#23402F'
const LAMP = '#F6EDE0'

type Cfg = {
  time: string
  pagesFrom: number      // x where the twelve pages begin
  read: number           // how many of the twelve a person read before it counted
  figure: 'seated' | 'standing' | 'distant' | 'absent'
  lamp: boolean
  second: boolean        // a second surface beside the book
  arriving: boolean      // the pages land finished rather than being made
  queue: boolean         // a stream of other books passing
}

const CFG: Record<RungId, Cfg> = {
  own:      { time: '5:40pm', pagesFrom: 128, read: 12, figure: 'seated',   lamp: true,  second: false, arriving: false, queue: false },
  assisted: { time: '6:05pm', pagesFrom: 128, read: 12, figure: 'seated',   lamp: true,  second: true,  arriving: false, queue: false },
  briefed:  { time: '6:10pm', pagesFrom: 128, read: 12, figure: 'standing', lamp: true,  second: false, arriving: true,  queue: false },
  standing: { time: '6:00am', pagesFrom: 128, read: 2,  figure: 'distant',  lamp: false, second: false, arriving: true,  queue: false },
  service:  { time: '6:00am', pagesFrom: 128, read: 0,  figure: 'absent',   lamp: false, second: false, arriving: true,  queue: true },
}

export function LadderScene({ rung, width = 360 }: { rung: RungId; width?: number }) {
  const c = CFG[rung]
  const PW = 12, PH = 19, GAP = 3
  const x0 = 142, pageY = 96

  return (
    <svg width={width} height={width * (172 / 360)} viewBox="0 0 360 172" fill="none" aria-hidden>
      {/* lamp cone, only while someone is at the desk at night */}
      {c.lamp && <path d="M22 0 L96 0 L124 120 L0 120 Z" fill={LAMP} opacity="0.6" />}

      {/* desk: a surface in slight perspective, not a stripe */}
      <path d="M0 120 L360 120 L360 172 L0 172 Z" fill={DESK} />
      <path d="M0 120 L360 120" stroke={DESK_EDGE} strokeWidth="2" />
      <path d="M18 120 L34 172 M342 120 L326 172" stroke={DESK_EDGE} strokeWidth="1" opacity="0.6" />

      {/* the gate: the moment the book leaves your hands */}
      <line x1={x0 + 12 * (PW + GAP) + 8} y1="50" x2={x0 + 12 * (PW + GAP) + 8} y2="128"
        stroke={INK} strokeWidth="1" strokeDasharray="4 4" opacity="0.45" />

      {/* twelve pages, laid on the desk */}
      {Array.from({ length: 12 }).map((_, i) => {
        const x = x0 + i * (PW + GAP)
        const made = c.arriving || i < 9
        return (
          <g key={i}>
            <rect x={x} y={pageY} width={PW} height={PH} fill={made ? PAPER : 'none'}
              stroke={made ? INK_2 : DESK_EDGE} strokeWidth="1" />
            {made && (
              <>
                <rect x={x + 2.5} y={pageY + 4} width={PW - 5} height="1.2" fill={INK_2} opacity="0.55" />
                <rect x={x + 2.5} y={pageY + 8} width={PW - 7} height="1.2" fill={INK_2} opacity="0.4" />
                <rect x={x + 2.5} y={pageY + 12} width={PW - 5} height="1.2" fill={INK_2} opacity="0.3" />
              </>
            )}
            {i === 8 && <circle cx={x + PW / 2} cy={pageY + PH + 7} r="2.4" fill={BRONZE} />}
            {i < c.read && <rect x={x} y={pageY + PH + 2} width={PW} height="1.8" fill={FOREST} />}
          </g>
        )
      })}

      {/* pages arriving finished, from off-stage right */}
      {c.arriving && (
        <g>
          <path d={`M${x0 + 12 * (PW + GAP) + 44} ${pageY + 10} H${x0 + 12 * (PW + GAP) + 16}`}
            stroke={NAVY} strokeWidth="2" />
          <path d={`M${x0 + 12 * (PW + GAP) + 24} ${pageY + 4} l-8 6 8 6`} stroke={NAVY} strokeWidth="2" fill="none"
            strokeLinecap="round" strokeLinejoin="round" />
        </g>
      )}

      {/* other books streaming past, only at service */}
      {c.queue && [0, 1, 2].map((i) => (
        <g key={i} opacity={0.26}>
          <rect x={318 + i * 12} y={52 - i * 6} width="14" height="19" fill={PAPER} stroke={INK_2} strokeWidth="0.9" />
        </g>
      ))}

      {/* a second surface beside the book */}
      {c.second && (
        <g>
          <rect x="66" y="64" width="58" height="42" rx="1.5" fill={PAPER} stroke={INK_2} strokeWidth="1.2" />
          <rect x="72" y="72" width="36" height="1.8" fill={BRONZE} opacity="0.85" />
          <rect x="72" y="79" width="46" height="1.8" fill={BRONZE} opacity="0.6" />
          <rect x="72" y="86" width="28" height="1.8" fill={BRONZE} opacity="0.42" />
          <rect x="78" y="106" width="34" height="4" fill={INK_2} opacity="0.22" />
        </g>
      )}

      {/* the figure */}
      {c.figure !== 'absent' && (
        <g
          transform={
            c.figure === 'seated' ? 'translate(28,44)'
              : c.figure === 'standing' ? 'translate(88,28)'
              : 'translate(16,50) scale(0.78)'
          }
          opacity={c.figure === 'distant' ? 0.3 : 1}
        >
          <circle cx="18" cy="12" r="10" fill={INK} />
          {c.figure === 'seated' ? (
            <>
              <path d="M18 23 v30" stroke={INK} strokeWidth="13" strokeLinecap="round" />
              <path d="M18 53 h26" stroke={INK} strokeWidth="12" strokeLinecap="round" />
              <path d="M44 53 v18" stroke={INK} strokeWidth="11" strokeLinecap="round" />
              <path d="M22 33 l26 14" stroke={INK} strokeWidth="7.5" strokeLinecap="round" />
              <rect x="46" y="44" width="17" height="3.6" rx="1.8" fill={BRONZE} transform="rotate(20 46 44)" />
            </>
          ) : (
            <>
              <path d="M18 23 v34" stroke={INK} strokeWidth="13" strokeLinecap="round" />
              <path d="M18 57 l-8 24 M18 57 l8 24" stroke={INK} strokeWidth="9" strokeLinecap="round" />
              <path d="M22 32 l24 10" stroke={INK} strokeWidth="7.5" strokeLinecap="round" />
              <rect x="44" y="39" width="18" height="3.8" rx="1.9" fill={BRONZE} transform="rotate(24 44 39)" />
            </>
          )}
        </g>
      )}

      {/* the clock */}
      <g transform="translate(332,22)">
        <circle cx="0" cy="0" r="12" fill={PAPER} stroke={INK_2} strokeWidth="1.3" />
        <path d="M0 0 V-7 M0 0 l5 3" stroke={INK_2} strokeWidth="1.4" strokeLinecap="round" />
      </g>
      <text x="332" y="48" textAnchor="middle" fontFamily="Archivo, sans-serif" fontSize="11.5" fill={INK_2}>
        {c.time}
      </text>
    </svg>
  )
}

export const READ_COUNT = (r: RungId) => CFG[r].read
