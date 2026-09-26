/* Small flat line icons for the tray tiles: the twelve 3.1 activities and the
   six 3.4 AI tools. Label first; these sit second. Names are the option ids in
   questions.ts (plus the preview's older names, kept as aliases). */
const P: Record<string, React.ReactNode> = {
  meetings: <><circle cx="8" cy="8" r="2.5" /><circle cx="16" cy="8" r="2.5" /><path d="M3 20c0-3 2.2-5 5-5s5 2 5 5M11 20c0-3 2.2-5 5-5s5 2 5 5" /></>,
  presenting: <><rect x="3" y="4" width="18" height="11" rx="1" /><path d="M12 15v5M8 20h8M7 11l3-3 2 2 4-4" /></>,
  portfolio: <><path d="M12 3a9 9 0 1 0 9 9h-9z" /><path d="M15 3.5A9 9 0 0 1 20.5 9H15z" /></>,
  outreach: <><path d="M3 11 21 3l-6 18-3.5-7.5z" /><path d="M11.5 13.5 21 3" /></>,
  briefs: <><path d="M6 3h9l4 4v14H6z" /><path d="M15 3v4h4M9 11h7M9 14.5h7M9 18h4" /></>,
  onboarding: <><rect x="5" y="4" width="14" height="17" rx="1" /><path d="M9 4V2.5h6V4M8.5 10l1.5 1.5 3-3M8.5 16l1.5 1.5 3-3" /></>,
  debriefs: <><path d="M3 5h12v8H8l-3 3v-3H3z" /><path d="M15 9h6v8h-2v3l-3-3h-4v-4" /></>,
  morning: <><path d="M4 18h16M7 18a5 5 0 0 1 10 0M12 6V4M5.6 9.6 4.2 8.2M18.4 9.6l1.4-1.4" /></>,
  classroom: <><path d="M2 9l10-5 10 5-10 5z" /><path d="M6 11v5c0 1.5 3 3 6 3s6-1.5 6-3v-5M22 9v6" /></>,
  roleplay: <><circle cx="7" cy="9" r="3" /><circle cx="17" cy="9" r="3" /><path d="M2 20c.5-3 2.5-5 5-5M22 20c-.5-3-2.5-5-5-5M10 5.5h4" /></>,
  crm: <><ellipse cx="12" cy="5.5" rx="7" ry="2.5" /><path d="M5 5.5v13c0 1.4 3.1 2.5 7 2.5s7-1.1 7-2.5v-13M5 12c0 1.4 3.1 2.5 7 2.5s7-1.1 7-2.5" /></>,
  decks: <><rect x="6" y="3" width="15" height="11" rx="1" /><path d="M3 7v10a1 1 0 0 0 1 1h13" /><path d="M9 7h9M9 10h5" /></>,

  /* 3.4: the AI tools */
  'ai-chat': <><path d="M4 5h16v10H10l-4 4v-4H4z" /><path d="M8 9h8M8 12h5" /></>,
  'ai-office': <><rect x="3" y="4" width="18" height="16" rx="1" /><path d="M3 9h18M3 14.5h18M9 4v16" /></>,
  'ai-research': <><path d="M4 5c2.5-1 5-1 8 1 3-2 5.5-2 8-1v14c-2.5-1-5-1-8 1-3-2-5.5-2-8-1z" /><path d="M12 6v14" /></>,
  'ai-client': <><rect x="3" y="5" width="18" height="14" rx="1.5" /><circle cx="9" cy="11" r="2.2" /><path d="M5.5 16.5c.6-1.8 1.9-2.8 3.5-2.8s2.9 1 3.5 2.8M15 10h3.5M15 13.5h3.5" /></>,
  'ai-markets': <><path d="M3 18l5-6 4 3 6-8" /><path d="M15 7h3v3" /><path d="M3 21h18" /></>,
  'ai-meetings': <><rect x="4" y="5" width="16" height="15" rx="1" /><path d="M4 9.5h16M8.5 3v4M15.5 3v4M8 13.5l2 2 4-4" /></>,
}

/** questions.ts option ids -> icon names. */
const ALIAS: Record<string, string> = {
  'client-meetings': 'meetings',
  'role-plays': 'roleplay',
}

/** The icon for an option on a question, or undefined if there is none.
    3.4's tools share ids with other lists ('meetings'), so they are prefixed. */
export function iconName(questionId: string, optionId: string): string | undefined {
  const name = questionId.startsWith('q3.4') ? `ai-${optionId}` : (ALIAS[optionId] ?? optionId)
  return name in P ? name : undefined
}

export default function ActivityIcon({ name, size = 18 }: { name: string; size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
      {P[ALIAS[name] ?? name]}
    </svg>
  )
}
