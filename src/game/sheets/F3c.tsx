'use client'
/* F3c · Camp II · "No agents" (half-sheet over S05, one tap).
   Fires when the Expedition brief went into Not for them. Stores
   kit.agentsWhyNot. Body shared with F3a (PickSheet). */
import { PickSheet } from './F3a'
import type { StepProps } from '../types'

export default function F3c(p: StepProps) {
  return <PickSheet p={p} id="F3c" store="kit.agentsWhyNot" branch="none" />
}
