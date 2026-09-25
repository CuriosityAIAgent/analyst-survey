'use client'
/* CampRoute: the desk panel's mini ridge (design 3.3, item 6; desk only, not
   deskCompact). Five labelled tents, an ink bootprint line from base camp to
   where the respondent is, and the forest rookie at the current camp. When
   they arrive at a new camp (after a camp walk), the mini rookie steps up
   from the last tent over 600ms. It never moves on its own. */
import { useEffect, useState } from 'react'
import { motion } from 'motion/react'
import Figure from './Figure'
import { CAMPS } from './content'

const W = 360, H = 88
// tents along a rising ridge, left to right
const PTS = [
  { x: 22, y: 56 }, { x: 102, y: 47 }, { x: 182, y: 38 }, { x: 262, y: 27 }, { x: 338, y: 12 },
]
const SHORT = ['Base', 'Camp I', 'Camp II', 'Camp III', 'Summit']

// the camp the rookie stood at the last time a route was drawn (per page)
let lastCamp = -1

export default function CampRoute({ camp, reduced }: { camp: number; reduced: boolean }) {
  const [from] = useState(() => (lastCamp >= 0 && lastCamp === camp - 1 && !reduced ? lastCamp : camp))
  const [at, setAt] = useState(from)
  useEffect(() => {
    lastCamp = camp
    if (at !== camp) {
      const t = window.setTimeout(() => setAt(camp), 120)
      return () => clearTimeout(t)
    }
  }, [camp, at])
  const p = PTS[Math.max(0, Math.min(4, at))]
  const ridge = `M 0 ${H - 6} L ${PTS.map((q) => `${q.x} ${q.y + 8}`).join(' L ')} L ${W} ${PTS[4].y + 10}`
  const walked = `M ${PTS[0].x} ${PTS[0].y} L ${PTS.slice(1, Math.max(1, camp) + 1).map((q) => `${q.x} ${q.y}`).join(' L ')}`
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} className="block max-w-full" role="img"
      aria-label={`${CAMPS[camp]}: camp ${camp + 1} of ${CAMPS.length}`} data-camp-route={camp}>
      <path d={ridge} fill="none" stroke="#8C857A" strokeWidth={1} />
      <path d={`M ${PTS.map((q) => `${q.x} ${q.y}`).join(' L ')}`} fill="none" stroke="#DDD9D2" strokeWidth={1.2} strokeDasharray="2 4" />
      {camp > 0 && <path d={walked} fill="none" stroke="#0D0C0B" strokeWidth={1.2} strokeDasharray="2 3" />}
      {PTS.map((q, i) => {
        const reached = i <= camp
        return (
          <g key={i}>
            {i === 4 ? (
              <path d={`M ${q.x - 7} ${q.y + 8} L ${q.x} ${q.y - 4} L ${q.x + 7} ${q.y + 8} Z`} fill={reached ? '#0D0C0B' : 'none'} stroke="#0D0C0B" strokeWidth={1} strokeLinejoin="round" />
            ) : (
              <>
                <path d={`M ${q.x - 8} ${q.y + 8} L ${q.x} ${q.y - 3} L ${q.x + 8} ${q.y + 8} Z`}
                  fill={i === camp ? '#1F4B3A' : reached ? '#0D0C0B' : 'none'} stroke={reached ? '#0D0C0B' : '#8C857A'} strokeWidth={1} strokeLinejoin="round" />
                <path d={`M ${q.x} ${q.y + 1} L ${q.x} ${q.y + 8}`} stroke={reached ? '#F8F7F4' : '#8C857A'} strokeWidth={0.8} />
              </>
            )}
            <text x={q.x} y={q.y + 22} textAnchor={i === 0 ? 'start' : i === 4 ? 'end' : 'middle'} dx={i === 0 ? -8 : i === 4 ? 8 : 0}
              fontFamily="Archivo, Arial, sans-serif" fontSize={10} letterSpacing="0.08em"
              fill={i === camp ? '#0D0C0B' : '#494540'} fontWeight={i === camp ? 600 : 400}>
              {SHORT[i].toUpperCase()}
            </text>
          </g>
        )
      })}
      <motion.g
        initial={false}
        animate={{ x: p.x - 12, y: p.y - 2 }}
        transition={reduced ? { duration: 0 } : { duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
        <Figure as="g" size={20} pose={at !== camp ? 'stride' : 'stand'} />
      </motion.g>
    </svg>
  )
}
