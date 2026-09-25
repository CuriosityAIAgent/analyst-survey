/* <Art id size /> for every drawing in the game.

   Looks the id up in one registry merged from the per-category files. An id
   that is not drawn yet renders a clear labelled placeholder (a dashed box
   with the id) at the piece's natural size, so every screen works today and
   fills in as the art lands. See STYLE.md. */
import type { ArtProps, ArtRegistry } from './kit'
import { naturalSize, RULE, INK } from './kit'
import { SPRITES } from './sprites'
import { SCENES, SCENE_IDS } from './scenes'
import { PEOPLE, PEOPLE_IDS } from './people'
import { PROPS, PROP_IDS } from './props'
import { GEAR, GEAR_IDS } from './gear'
import { TRACKS, TRACK_IDS } from './tracks'
import { PITCHES, PITCH_IDS } from './pitches'
import { NAV, NAV_IDS } from './nav'
import { CARDS, CARD_IDS } from './cards'
import { TRAITS, TRAIT_IDS } from './traits'

export type { ArtProps, ArtComponent, ArtRegistry, Accent } from './kit'

export const ART_REGISTRY: ArtRegistry = {
  ...SCENES, ...PEOPLE, ...PROPS, ...GEAR, ...TRACKS, ...PITCHES, ...NAV, ...CARDS, ...TRAITS,
}

/** Which file each spec art id belongs in. */
export const ART_FILES: Record<string, readonly string[]> = {
  'scenes.tsx': SCENE_IDS,
  'people.tsx': PEOPLE_IDS,
  'props.tsx': PROP_IDS,
  'gear.tsx': GEAR_IDS,
  'tracks.tsx': TRACK_IDS,
  'pitches.tsx': PITCH_IDS,
  'nav.tsx': NAV_IDS,
  'cards.tsx': CARD_IDS,
  'traits.tsx': TRAIT_IDS,
}

export const hasArt = (id: string) => Object.prototype.hasOwnProperty.call(ART_REGISTRY, id)

export function Art({ id, ...p }: ArtProps & { id: string }) {
  const sprite = spriteFor(id, p.state, p.value)
  if (sprite) return <Sprite id={id} file={sprite} {...p} />
  const C = ART_REGISTRY[id]
  if (C) return <C {...p} />
  return <ArtPlaceholder id={id} {...p} />
}

/* A 3D render replaces the drawing when one exists: <id>.webp, or
   <id>-<state>.webp for a named state. A state with no render of its own falls
   back to the drawing, so a piece never shows the wrong state. */
function spriteFor(id: string, state?: string, value?: number): string | null {
  // the classroom door is dragged through a continuous angle; show the nearest render
  if (id === 'fu-door' && !state && typeof value === 'number') {
    const k = value < 0.34 ? 'fu-door' : value < 0.67 ? 'fu-door-ajar' : 'fu-door-open'
    return SPRITES[k] ? k : null
  }
  if (state) {
    if (SPRITES[`${id}-${state}`]) return `${id}-${state}`
    // a navigation brick in a lane ('label') or its faded carry-forward ('ghost') is still that brick
    if (id.startsWith('brick-') && (state === 'label' || state === 'ghost') && SPRITES[id]) return id
    return null
  }
  return SPRITES[id] ? id : null
}

/* Rendered as <svg><image/></svg> so the same element works on a page and
   nested inside a screen's own SVG (the summit, the door, the route strip). */
function Sprite({ id, file, ...p }: ArtProps & { id: string; file: string }) {
  const [sw, sh] = SPRITES[file]
  const scene = id.startsWith('scene-')
  const [, vh] = naturalSize(id)
  // size is a height; otherwise fill the given box, or sit at the drawing's natural height
  const h = p.height ?? (p.size ?? (scene ? '100%' : vh))
  const w = p.width ?? (p.size ? (p.size * sw) / sh : scene ? '100%' : (vh * sw) / sh)
  const a11y = p.title ? { role: 'img' as const, 'aria-label': p.title } : { 'aria-hidden': true as const }
  return (
    <svg viewBox={`0 0 ${sw} ${sh}`} width={w} height={h} data-art={id} data-sprite={file}
      preserveAspectRatio={scene ? 'xMidYMax slice' : 'xMidYMid meet'}
      className={p.className}
      style={{ display: 'block', overflow: 'visible', pointerEvents: 'none', opacity: p.state === 'ghost' ? 0.35 : undefined, ...p.style }}
      {...a11y}>
      <image href={`/game/3d/${file}.webp`} width={sw} height={sh} />
    </svg>
  )
}

export function ArtPlaceholder({ id, ...p }: ArtProps & { id: string }) {
  const [vw, vh] = naturalSize(id)
  const fill = id.startsWith('scene-')
  const w = p.width ?? (p.size ? (p.size * vw) / vh : fill ? '100%' : vw)
  const h = p.height ?? (p.size ? p.size : fill ? '100%' : vh)
  const a11y = p.title ? { role: 'img' as const, 'aria-label': p.title } : { 'aria-hidden': true as const }
  const fs = Math.max(7, Math.min(11, vw / 7))
  return (
    <svg
      viewBox={`0 0 ${vw} ${vh}`}
      width={w}
      height={h}
      preserveAspectRatio={fill ? 'xMidYMin slice' : 'xMidYMid meet'}
      className={p.className}
      style={{ display: 'block', ...p.style }}
      data-art-placeholder={id}
      {...a11y}
    >
      <rect x={1} y={1} width={vw - 2} height={vh - 2} rx={2} fill="none" stroke={RULE} strokeWidth={1}
        strokeDasharray="4 3" vectorEffect="non-scaling-stroke" opacity={fill ? 0.5 : 1} />
      <text x={vw / 2} y={fill ? vh * 0.55 : vh / 2} textAnchor="middle" dominantBaseline="middle"
        fontFamily="Archivo, Arial, sans-serif" fontSize={fill ? 9 : fs} fill={INK} opacity={fill ? 0.3 : 0.6}>
        {id}
      </text>
    </svg>
  )
}
