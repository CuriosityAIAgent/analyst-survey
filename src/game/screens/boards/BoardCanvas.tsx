'use client'
/* The board desk views' canvas: Frame's DeskCanvas (k = clamp(0.72, fit,
   1.25)) inside a 32px side margin, so a board never touches the stage's
   edge or the panel's rule when the width is what limits it. */
import type { ReactNode } from 'react'
import { DeskCanvas } from '../../Frame'

export default function BoardCanvas({ w, h, children }: { w: number; h: number; children?: ReactNode }) {
  return (
    <div className="absolute bottom-3 left-8 right-8 top-0" data-board-canvas>
      <DeskCanvas w={w} h={h}>{children}</DeskCanvas>
    </div>
  )
}
