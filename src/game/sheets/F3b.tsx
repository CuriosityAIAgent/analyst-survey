'use client'
/* F3b · Camp II · "Earning the agent team" (half-sheet over S05, one tap).
   Fires when the Expedition brief went into Once proven. Stores
   kit.agentsEarn. Body shared with F3a (PickSheet). */
import { PickSheet } from './F3a'
import type { StepProps } from '../types'

export default function F3b(p: StepProps) {
  return <PickSheet p={p} id="F3b" store="kit.agentsEarn" branch="proven" />
}
