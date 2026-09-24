import { Answers, Lane } from '@/store/useStore'
import { ACTIVITIES, DESTINATIONS, MAXDIFF_SETS, TRAITS, TRIALS, BRICKS } from '@/content/content'

/** ?demo=1 seeds a full response. ?level=N jumps. Keep behind the working-group role in production. */
export function seed(): Answers {
  const lanes: Record<string, Lane> = {}
  ACTIVITIES.forEach((a, i) => { lanes[a.id] = (['agent', 'both', 'human'] as Lane[])[i % 3] })
  const spend: Record<string, number> = {}
  ;['clientroom', 'checkai', 'names', 'learning'].forEach((d, i) => { spend[d] = [3, 2, 2, 1][i] })
  return {
    segment: { business: 'USPB', months: '13–24', aiUse: 'Most weeks', canAlone: ['Run a client review'], notTrusted: ['Pitch a prospect'] },
    fuel: MAXDIFF_SETS.map((s, i) => ({ round: i, shown: [...s], best: s[0], worst: s[2], ms: 9000 })),
    advisor: { top3: [TRAITS[7].id, TRAITS[0].id, TRAITS[3].id], dependence: 72, changeTop2: ['checkwork', 'standards'] },
    handover: {
      lanes, notDone: [],
      clips: ['pitchbook', 'proposal', 'reviewpack', 'clientmail', 'research'],
      reckoning: 'Be shown a wrong-but-plausible draft and made to find the error',
    },
    capacity: { spend, after: { checkai: 1, learning: 1, names: 1 } },
    trials: Object.fromEntries(TRIALS.map((t) => [t.id, { answer: 'yes' as const, followUp: [t.yes.opts[0]] }])),
    route: { years: [[BRICKS[0].id, BRICKS[1].id], [BRICKS[2].id, BRICKS[7].id], [BRICKS[9].id]] },
    mark: { score: 6, missing: 'Whether anyone actually reads this.' },
    summit: {},
  }
}
