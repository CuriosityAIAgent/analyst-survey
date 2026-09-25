# Art style: one hand throughout

From `docs/reviews/ascent-game-design.md` ("Art list", "Fun and feel"). Every piece in this folder follows these rules. Tokens live in `kit.tsx`.

## Grid and size
- Draw on a **64x64** grid (`viewBox="0 0 64 64"`). Exceptions: bricks are **72x30**; scenes are **390x660**; other large pieces use the natural sizes in `kit.tsx` (`naturalSize`).
- Size through `ArtSvg` so `size`, `width` and `height` behave the same everywhere.

## Line and fill
- Flat-fill engraving with a **1.5px ink outline**: `stroke="#0D0C0B" strokeWidth={1.5} vectorEffect="non-scaling-stroke"` (use `INK` and `STROKE`).
- **One accent fill per object**, chosen from navy `#14233B`, bronze `#7A3E12` or forest `#1F4B3A`, on paper `#F8F7F4`. These are the `globals.css` tokens. Reusing `ActivityArt.tsx`? Move its slightly different hexes onto these tokens.
- **No gradients.** No blur, glow or drop shadow inside art. Tone comes from flat fills and hatching (thin ink lines), never opacity ramps.
- **No faces.** Figures have no eyes, mouths or expressions. Heads are a plain circle.
- **No text inside art**, except the brick labels (set in Archivo). Stamps ('POLICY') are set in CSS by the screen, not drawn.

## Colour and fairness
- **Choices on one screen share one accent**, so no option looks more attractive than another:
  - S02 gear tiles: all forest, same weight.
  - S05 bricks: all six the same navy. The icon and the plate's row height carry the order, never the colour.
  - S07 cards, S09 traits: one accent per screen.
  - `origin-seed` and `origin-bootprint` share one finish.
- The deck's vote colours map to forest (Green), navy (Blue), bronze (Amber) and ink (Red). No new colour token.
- Neutral situations. No badges, trophies, winning poses or reward flourishes on any choice.

## Figures and motion
- Every figure is adapted from the `survey.ts` climber. Use `src/game/Figure.tsx` (rookie in forest, "you" in bronze, ghost as a bronze outline). Do not draw a second climber.
- Motion is **SVG transforms on that one figure**, rotating or translating limb groups. Never use frame sets.
- Scenes: every object sits on the ground plane. Keep the top 112px quiet, because the top bar and prompt sit there. Behind them the ridge is an ink hairline, not a filled band.

## States
Pieces with states take `state` / `value` (see `kit.tsx` `ArtProps`). For example: rucksack `zipped`, hand-zone `closed`, tarp-out `folded`, fu-door `shut|ajar|open`, bootprints `solid|ghost`, snow-overlay `value` 0-4, route-layers `value` 0-4, cairn-stone `value` 0-5.

## Registering
Add each piece to the registry in its category file (the comment at the top lists the ids that belong there). `<Art id>` picks it up, and `/art/game` shows it next to every other piece. When all 69 ids are registered, `art.test.ts` passes un-skipped.
