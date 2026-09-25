'use client'
/* RouteAhead: the pencil route toward the next camp, drawn in the desk
   stage's caption area from S05 on (design 3.4, grafted from panorama). Its
   precision is routePrecision(kit.lane), the same scale S05's route strip
   and the S11 summit route use: 0 nothing, 1 a faint pencil line, 2 dotted,
   3 dotted with waypoints, 4 waypoints with small timings. It sharpens as
   Day-one bricks go on. Drawn only; it stores nothing. It is 48 tall, so it
   stays inside the caption band (top 24 to 72) and never reaches the stage
   body, which starts at 76. */
import { useGame } from './store'
import { routePrecision } from './content'

const D = 'M 8 44 C 90 40, 150 26, 230 22 S 360 11, 452 9'
const WAY = [{ x: 118, y: 34 }, { x: 230, y: 22 }, { x: 350, y: 14 }]
const TIMES = ['2h', '5h', '8h']

export default function RouteAhead({ className = '' }: { className?: string }) {
  const lanes = useGame((s) => s.answers['kit.lane'])
  const n = routePrecision(lanes)
  if (n === 0) return null
  return (
    <svg width={460} height={48} viewBox="0 0 460 48" className={`pointer-events-none ${className}`} aria-hidden data-route-ahead={n}>
      <path d={D} fill="none" stroke={n >= 2 ? '#494540' : '#8C857A'} strokeWidth={n >= 2 ? 1.2 : 1}
        strokeDasharray={n >= 2 ? '2 5' : undefined} strokeLinecap="round" opacity={n === 1 ? 0.6 : 0.9} />
      {n >= 3 && WAY.map((w, i) => (
        <g key={i}>
          <circle cx={w.x} cy={w.y} r={3} fill="#F8F7F4" stroke="#0D0C0B" strokeWidth={1} />
          {n >= 4 && (
            <text x={w.x + 6} y={w.y - 4} fontFamily="Archivo, Arial, sans-serif" fontSize={10} fill="#494540">{TIMES[i]}</text>
          )}
        </g>
      ))}
      <path d="M 446 13 L 452 2 L 458 13 Z" fill="none" stroke="#0D0C0B" strokeWidth={1} strokeLinejoin="round" />
    </svg>
  )
}
