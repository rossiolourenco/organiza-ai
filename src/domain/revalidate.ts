/**
 * Revalidação ao retomar o app.
 *
 * Evita recarregar em cada troca de estado do AppState (que dispara "inactive"/"active"
 * com frequência) e evita loops quando uma requisição já está em andamento.
 */
export const RESUME_REVALIDATE_MS = 10_000;

export function shouldRevalidate(lastRefreshAt: number, now: number = Date.now(),
  maxAgeMs: number = RESUME_REVALIDATE_MS): boolean {
  if (!Number.isFinite(lastRefreshAt) || lastRefreshAt <= 0) return true;
  return now - lastRefreshAt >= maxAgeMs;
}
