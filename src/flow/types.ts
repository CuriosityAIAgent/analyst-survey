/* The survey is a graph of cards, not a list of levels. Each card has one
   interaction; branches decide what comes next from the answer just given
   (or one given earlier). Content lives in src/content/flow.json. */

export type Kind = 'show' | 'pick' | 'multi' | 'swipe' | 'slider' | 'rank' | 'tokens' | 'text'
export type Section = 'open' | 'pulse' | 'hindsight' | 'knowing' | 'infrastructure' | 'ai' | 'bold' | 'wrap'

export type Option = { id: string; label: string; visual?: string }
export type Token = { id: string; label: string; count: number; colour: string }
export type Branch = { when: string; goto: string }

export type Card = {
  id: string
  section: Section
  kind: Kind
  prompt: string
  sub?: string
  visual?: string
  options?: Option[]
  sides?: { left: string; right: string }
  slider?: { min: number; max: number; left: string; right: string; marks?: { at: number; label: string }[]; style?: 'route' | 'plain' }
  max?: number
  tokens?: Token[]
  optional?: boolean
  branches?: Branch[]
  next: string
  answers: string[]
  seconds: number
}

export type Graph = {
  name: string
  thesis: string
  start: string
  cards: Card[]
  consistencyPairs: { a: string; b: string; construct: string }[]
  mainPathSeconds: number
  weakestPoint?: string
}

/* What each kind stores as its answer. */
export type Answer =
  | null                          // show
  | string                        // pick, text
  | string[]                      // multi, rank (rank is ordered)
  | number                        // slider
  | Record<string, 'left' | 'right'>   // swipe: itemId -> side
  | Record<string, string[]>      // tokens: tokenId -> optionIds it was dropped on

export const SECTIONS: { id: Section; title: string }[] = [
  { id: 'open', title: 'Base camp' },
  { id: 'pulse', title: 'Looking back' },
  { id: 'hindsight', title: 'Hindsight' },
  { id: 'knowing', title: 'Knowing what you know now' },
  { id: 'infrastructure', title: 'What should surround the work' },
  { id: 'ai', title: 'The AI question' },
  { id: 'bold', title: 'The bold questions' },
  { id: 'wrap', title: 'The summit' },
]
