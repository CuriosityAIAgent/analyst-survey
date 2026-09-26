/* One <pattern> per jug, drawn in paper at low opacity over the clay colour. */
import { JUGS, type Jug } from './jugs'

export const patId = (prefix: string, j: Jug) => `${prefix}-pat-${j.id}`

export default function Patterns({ prefix, size = 7 }: { prefix: string; size?: number }) {
  const s = size
  const ink = 'rgba(248,247,244,0.26)'
  return (
    <>
      {JUGS.map((j) => (
        <pattern key={j.id} id={patId(prefix, j)} width={s} height={s} patternUnits="userSpaceOnUse">
          {j.pattern === 'diag' && <path d={`M-1 ${s + 1} L${s + 1} -1`} stroke={ink} strokeWidth={s * 0.17} />}
          {j.pattern === 'back' && <path d={`M-1 -1 L${s + 1} ${s + 1}`} stroke={ink} strokeWidth={s * 0.17} />}
          {j.pattern === 'dots' && <circle cx={s / 2} cy={s / 2} r={s * 0.16} fill={ink} />}
          {j.pattern === 'vert' && <path d={`M${s / 2} 0 V${s}`} stroke={ink} strokeWidth={s * 0.16} />}
          {j.pattern === 'grid' && <path d={`M0 ${s / 2} H${s} M${s / 2} 0 V${s}`} stroke={ink} strokeWidth={s * 0.1} />}
        </pattern>
      ))}
    </>
  )
}
