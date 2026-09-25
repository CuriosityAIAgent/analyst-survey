/* Sheet registry: id -> component. Every component takes StepProps and
   renders <Sheet>. */
import type { ComponentType } from 'react'
import type { SheetId, StepProps } from '../types'
import F1 from './F1'
import F2a from './F2a'
import F2b from './F2b'
import F3a from './F3a'
import F3b from './F3b'
import F3c from './F3c'
import F4 from './F4'
import F5 from './F5'

export const SHEETS: Record<SheetId, ComponentType<StepProps>> = {
  F1, F2a, F2b, F3a, F3b, F3c, F4, F5,
}
