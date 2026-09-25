'use client'
/* What Frame and Sheet need from the orchestrator, without prop drilling.
   Outside <Game> (the /art/game preview) the defaults keep them rendering.
   The layout (phone / desk / deskCompact) has its own context: layout.ts. */
import { createContext, useContext } from 'react'

/** How the current screen arrived: a camp change up or down the mountain, or
    a crossfade within a camp (and under reduced motion). */
export type Arrival = 'up' | 'down' | 'fade'

export type GameCtx = {
  /** Back, as the top bar shows it. Never loses answers. */
  back: () => void
  canBack: boolean
  sound: boolean
  toggleSound: () => void
  reduced: boolean
  /** Bumped on every Back: transient widgets (the camp walk) key on it. */
  visit: number
  /** True while the game is moving between steps (buttons ignore presses). */
  busy: boolean
  /** How this screen arrived (the desk stage pans diagonally on 'up'/'down'). */
  arrival: Arrival
  /** The shortcut overlay (desk: '?' or the top bar's Keys button). */
  keysOpen: boolean
  setKeysOpen: (open: boolean) => void
}

export const GameContext = createContext<GameCtx>({
  back: () => {},
  canBack: false,
  sound: false,
  toggleSound: () => {},
  reduced: false,
  visit: 0,
  busy: false,
  arrival: 'fade',
  keysOpen: false,
  setKeysOpen: () => {},
})

export const useGameCtx = () => useContext(GameContext)
