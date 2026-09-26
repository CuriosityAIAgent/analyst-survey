'use client'
/* /preview: the v2 game in review mode. Next always works and every follow-up
   is shown, whatever was answered (see src/v2/engine/flow.ts). Preview runs
   never share answers with live ones. */
import Player from '@/v2/engine/Player'
export default function Page() { return <Player preview /> }
