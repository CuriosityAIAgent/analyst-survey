/* Frame-wide CSS for the desk layout (Game renders it once).
   - Keycaps show only with a hover-capable fine pointer.
   - Inside a host scaled by transform (a phone stage fit into the desk
     stage, [data-host-scaled] with --host-k), a lifted item follows the
     pointer 1:1: useDrag's inline translate is in screen px, so divide it by
     the host's scale. (!important beats the inline style; nothing else.)
   - Focus rings: 2px navy, 2px offset.
   - Board items (S02, S06, S09): with a hover-capable fine pointer, the
     [data-hover-lift] part rises 2px with a soft shadow and the item's
     HoverTip (full name, 'Press 1–4') shows; never while lifted.
   - While a follow-up sheet is open, the parent's readout and the controls
     marked data-under-sheet="hide" are hidden: the follow-up never echoes the
     answer that triggered it (design 9.3), even blurred. */
export const DESK_CSS = `
@media (hover: none), (pointer: coarse) {
  [data-game] .keycap, [data-game] [data-keys] { display: none !important; }
}
[data-host-scaled] [data-lifted="true"] {
  transform: translate(calc(var(--dx, 0px) / var(--host-k, 1)), calc(var(--dy, 0px) / var(--host-k, 1))) scale(1.06) !important;
}
[data-game][data-layout^="desk"]:not([data-sheet-open=""]) [data-readout],
[data-game][data-layout^="desk"]:not([data-sheet-open=""]) [data-under-sheet="hide"],
[data-game][data-layout^="desk"]:not([data-sheet-open=""]) [data-footnote] {
  visibility: hidden;
}
[data-hover-tip] { display: none; }
@media (hover: hover) and (pointer: fine) {
  [data-layout^="desk"] [data-hover-lift] { transition: transform 150ms, filter 150ms; }
  [data-layout^="desk"] .group:hover [data-hover-lift] { transform: translateY(-2px); filter: drop-shadow(0 6px 8px rgba(13,12,11,0.16)); }
  [data-layout^="desk"] .group:hover > [data-hover-tip],
  [data-layout^="desk"] .group:focus-visible > [data-hover-tip] { display: block; }
  [data-layout^="desk"] [data-lifted="true"] [data-hover-tip],
  [data-layout^="desk"] [data-lifted="true"] > [data-hover-tip],
  [data-layout^="desk"] [data-dragging="true"] [data-hover-tip] { display: none !important; }
}
[data-layout^="desk"] button:focus-visible,
[data-layout^="desk"] [role="button"]:focus-visible,
[data-layout^="desk"] a:focus-visible {
  outline: 2px solid #14233B;
  outline-offset: 2px;
}
`

export default function DeskStyles() {
  return <style>{DESK_CSS}</style>
}
