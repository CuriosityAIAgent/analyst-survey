/* Desk: Enter on a focused control inside the stage (a slider's hidden range,
   a radio) belongs to that control, so Frame's Enter hotkey steps aside
   (useHotkeys). Screens whose controls have nothing of their own to do with
   Enter hand it on to the panel primary with this: it clicks the step's
   primary (or 'Walk on'), which keeps Frame's own valid / busy checks. */
export function pressPanelPrimary(): boolean {
  if (typeof document === 'undefined') return false
  const sel = '[data-testid="primary"][data-valid="true"], [data-testid="walk-on"][data-valid="true"]'
  const el = document.querySelector<HTMLElement>(`[data-active-step] :is(${sel})`) ?? document.querySelector<HTMLElement>(sel)
  if (!el) return false
  el.click()
  return true
}
