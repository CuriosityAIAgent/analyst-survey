'use client'
/* What Frame and Sheet need from the orchestrator, without prop drilling.
   Outside <Game> (the /art/game preview) the defaults keep them rendering. */
import { createContext, useContext } from 'react'

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
}

export const GameContext = createContext<GameCtx>({
  back: () => {},
  canBack: false,
  sound: false,
  toggleSound: () => {},
  reduced: false,
  visit: 0,
  busy: false,
})

export const useGameCtx = () => useContext(GameContext)
