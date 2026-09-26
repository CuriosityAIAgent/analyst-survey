'use client'
/* The mockup screens, in the order Haresh sees them. Each file is owned by one builder. */
import type { MockScreen } from '../contract'
import Anatomy from './anatomy'
import Podium from './podium'
import Checklist from './checklist'
import Cards from './cards'
import Track from './track'
import Trays from './trays'
import AiTools from './ai-tools'
import Bottle from './bottle'
import Months from './months'
import Stamp from './stamp'
import Followup from './followup'
import BreakEnding from './break-ending'

export const SCREENS: MockScreen[] = [
  { id: 'anatomy', title: 'How every screen works', what: 'The one-column layout, labelled: question on top, the thing you play with in the middle, Next at the bottom.', Component: Anatomy },
  { id: 'podium', title: 'Standout 1: the podium', what: '"What helped you learn most?" Tap your top two onto the podium.', Component: Podium },
  { id: 'checklist', title: 'Layout 1: the checklist', what: '"What were you least prepared for?" Tap to tick two.', Component: Checklist },
  { id: 'cards', title: 'Layout 2: the card stack', what: '"Did you bring each strength with you, or learn it at J.P. Morgan?" One card at a time.', Component: Cards },
  { id: 'track', title: 'Layout 3: the track', what: '"With a different Advisor on day one, where would you be today?" Slide along the line.', Component: Track },
  { id: 'trays', title: 'Layout 4: the trays', what: '"More of, differently, or less of?" Drag activities into three trays.', Component: Trays },
  { id: 'ai-tools', title: 'The AI-tools question (trays)', what: '"Which AI tools should a new Analyst get, and when?" Drag each tool into a tray.', Component: AiTools },
  { id: 'bottle', title: 'Standout 2: your water bottle', what: '"If AI saved a day a week, where should the 8 hours go?" Pour hours in from jugs; the bottle shows the mix.', Component: Bottle },
  { id: 'months', title: 'Standout 3: the months track', what: '"How long should it take to be ready for Advisor?" The track fills month by month.', Component: Months },
  { id: 'stamp', title: 'Standout 4: stamp and certificate', what: 'Bold ideas, one card at a time: stamp Yes, Not sure or No.', Component: Stamp },
  { id: 'followup', title: 'A follow-up with its topic line', what: 'Pick two ways to learn; if classroom is one, "One more on classroom training" follows in place.', Component: Followup },
  { id: 'break-ending', title: 'Between sections, and the ending', what: 'Between sections, a figure moves up the mountain line to the next marker; the last screen says the idea plainly.', Component: BreakEnding },
]
