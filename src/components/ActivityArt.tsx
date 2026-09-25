/* Activity objects authored as SVG rather than generated as raster.
   Three reasons this beats a generated PNG here:
     - no provenance question at all, which is the thing currently blocking
     - they recolour at runtime, so an object can carry lane or state
     - a few hundred bytes each, crisp at any size, consistent by construction */

type Props = { id: string; tone?: 'ink' | 'navy' | 'bronze' | 'forest'; size?: number }

const TONES = {
  ink:    { body: '#0D0C0B', mid: '#3A3631', edge: '#0D0C0B', paper: '#F6EDE0' },
  navy:   { body: '#16243B', mid: '#2C4166', edge: '#0D0C0B', paper: '#F6EDE0' },
  bronze: { body: '#925626', mid: '#B8763F', edge: '#0D0C0B', paper: '#F6EDE0' },
  forest: { body: '#23402F', mid: '#3A664C', edge: '#0D0C0B', paper: '#F6EDE0' },
}

export function ActivityArt({ id, tone = 'navy', size = 72 }: Props) {
  const c = TONES[tone]
  const common = { width: size, height: size, viewBox: '0 0 64 64', fill: 'none' as const, 'aria-hidden': true }

  switch (id) {
    case 'pitchbook':
      return (
        <svg {...common}>
          <path d="M14 12h30a4 4 0 014 4v36a4 4 0 01-4 4H14z" fill={c.body} />
          <path d="M14 12h4v44h-4z" fill={c.mid} />
          <path d="M44 16h6v36l-6 4z" fill={c.paper} />
          <rect x="23" y="24" width="14" height="2" fill={c.paper} opacity=".85" />
          <rect x="23" y="30" width="10" height="2" fill={c.paper} opacity=".55" />
        </svg>
      )
    case 'reviewpack':
      return (
        <svg {...common}>
          <rect x="10" y="16" width="40" height="34" rx="1" fill={c.paper} stroke={c.edge} strokeWidth="1.5" />
          <rect x="14" y="20" width="32" height="26" fill="#fff" />
          <path d="M17 40l7-8 6 5 8-12 5 7" stroke={c.body} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <rect x="10" y="12" width="40" height="4" rx="1" fill={c.body} />
        </svg>
      )
    case 'movemoney':
      return (
        <svg {...common}>
          <rect x="8" y="20" width="48" height="26" rx="2" fill={c.paper} stroke={c.edge} strokeWidth="1.5" />
          <rect x="8" y="26" width="48" height="4" fill={c.body} />
          <circle cx="45" cy="38" r="5" fill="none" stroke={c.body} strokeWidth="1.5" />
          <path d="M42.5 38l1.8 1.8 3.4-3.6" stroke={c.body} strokeWidth="1.6" strokeLinecap="round" />
          <rect x="14" y="35" width="16" height="2" fill={c.mid} />
          <rect x="14" y="40" width="10" height="2" fill={c.mid} opacity=".6" />
        </svg>
      )
    case 'onboard':
      return (
        <svg {...common}>
          <path d="M8 22h18l4 5h26v25a2 2 0 01-2 2H10a2 2 0 01-2-2z" fill={c.body} />
          <path d="M12 30h44l-4 22H16z" fill={c.paper} />
          <rect x="34" y="18" width="4" height="10" rx="1" fill={c.mid} />
          <rect x="41" y="18" width="4" height="10" rx="1" fill={c.mid} opacity=".7" />
        </svg>
      )
    case 'lending':
      return (
        <svg {...common}>
          <path d="M32 10l22 10H10z" fill={c.body} />
          <rect x="10" y="20" width="44" height="3" fill={c.mid} />
          <rect x="15" y="25" width="5" height="20" fill={c.body} />
          <rect x="29.5" y="25" width="5" height="20" fill={c.body} />
          <rect x="44" y="25" width="5" height="20" fill={c.body} />
          <rect x="10" y="47" width="44" height="4" rx="1" fill={c.body} />
        </svg>
      )
    case 'clientmail':
      return (
        <svg {...common}>
          <rect x="8" y="18" width="48" height="30" rx="2" fill={c.paper} stroke={c.edge} strokeWidth="1.5" />
          <path d="M8 20l24 16 24-16" stroke={c.body} strokeWidth="2" fill="none" strokeLinejoin="round" />
          <circle cx="50" cy="20" r="6" fill={c.body} />
        </svg>
      )
    default:
      return (
        <svg {...common}>
          <rect x="12" y="14" width="40" height="36" rx="2" fill={c.paper} stroke={c.edge} strokeWidth="1.5" />
          <rect x="18" y="22" width="22" height="2" fill={c.mid} />
          <rect x="18" y="28" width="16" height="2" fill={c.mid} opacity=".6" />
        </svg>
      )
  }
}
