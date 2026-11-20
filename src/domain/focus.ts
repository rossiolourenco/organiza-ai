import { dayKey, weekStart } from './dates';

export type FocusMode = 'focus' | 'short' | 'long';
export interface Timer {
  id: string; mode: FocusMode; duration: number; remaining: number;
  endAt: number | null; startedAt: number; taskId: number | null;
}
export interface FocusSession { id: string; mode: FocusMode; duration: number; completedAt: number; taskId: number | null }
export interface FocusState {
  timer: Timer | null; sessions: FocusSession[];
  durations: Record<FocusMode, number>; goals: { tasks: number; minutes: number };
}
export const initialFocus: FocusState = {
  timer: null, sessions: [], durations: { focus: 25, short: 5, long: 15 }, goals: { tasks: 3, minutes: 50 },
};
export function decodeFocus(raw: string | null): FocusState {
  if (!raw) return initialFocus;
  const value = JSON.parse(raw) as FocusState;
  const integer = (v: unknown, max: number) => typeof v === 'number' && Number.isInteger(v) && v >= 1 && v <= max;
  const mode = (m: unknown) => m === 'focus' || m === 'short' || m === 'long';
  const stamp = (v: unknown) => typeof v === 'number' && Number.isFinite(v) && v >= 0;
  const task = (v: unknown) => v === null || integer(v, Number.MAX_SAFE_INTEGER);
  const valid = value && Array.isArray(value.sessions) && value.sessions.every(s =>
    s && typeof s.id === 'string' && mode(s.mode) && integer(s.duration, 180 * 60000) &&
    stamp(s.completedAt) && task(s.taskId)) &&
    value.durations && ['focus', 'short', 'long'].every(m => integer(value.durations[m as FocusMode], 180)) &&
    value.goals && integer(value.goals.tasks, 100) && integer(value.goals.minutes, 1440);
  const t = value?.timer;
  if (!valid || (t !== null && (!t || typeof t.id !== 'string' || !mode(t.mode) ||
    !integer(t.duration, 180 * 60000) || !stamp(t.remaining) || t.remaining > t.duration ||
    !stamp(t.startedAt) || (t.endAt !== null && !stamp(t.endAt)) || !task(t.taskId))))
    throw new Error('Histórico local inválido. Os dados não foram sobrescritos.');
  return value;
}
export function remaining(timer: Timer, now: number): number {
  return timer.endAt === null ? timer.remaining : Math.max(0, timer.endAt - now);
}
export function recoverFocus(state: FocusState, now: number): FocusState {
  const timer = state.timer;
  if (!timer || timer.endAt === null || timer.endAt > now) return state;
  return { ...state, timer: null, sessions: state.sessions.some(s => s.id === timer.id) ? state.sessions :
    [...state.sessions, { id: timer.id, mode: timer.mode, duration: timer.duration,
      completedAt: timer.endAt, taskId: timer.taskId }] };
}
export function pauseTimer(timer: Timer, now: number): Timer {
  return { ...timer, remaining: remaining(timer, now), endAt: null };
}
export function resumeTimer(timer: Timer, now: number): Timer {
  return { ...timer, endAt: now + timer.remaining };
}
/** Tempo efetivamente decorrido, descontando pausas. */
export function elapsed(timer: Timer, now: number): number {
  return Math.max(0, timer.duration - remaining(timer, now));
}
/**
 * Encerramento antecipado registra apenas o tempo realmente decorrido.
 * Sessões com menos de um minuto não entram no histórico para não inflar métricas.
 */
export function finishEarly(timer: Timer, now: number): FocusSession | null {
  const duration = elapsed(timer, now);
  if (duration < 60000) return null;
  return { id: timer.id, mode: timer.mode, duration, completedAt: now, taskId: timer.taskId };
}
export function focusMinutes(sessions: FocusSession[], today = dayKey()) {
  const focus = sessions.filter(s => s.mode === 'focus');
  // Mesma regra do backend: arredonda cada sessão para o minuto mais próximo (mínimo 1).
  const minutos = (ms: number) => Math.max(1, Math.round(ms / 60000));
  const sum = (items: FocusSession[]) => items.reduce((n, s) => n + minutos(s.duration), 0);
  return { total: sum(focus), today: sum(focus.filter(s => dayKey(new Date(s.completedAt)) === today)),
    week: sum(focus.filter(s => { const d = dayKey(new Date(s.completedAt)); return d >= weekStart(today) && d <= today; })) };
}

export interface RemoteFocusSession { id: number; minutos: number; data: string; iniciadaEm: string; tarefaId: number | null }

/**
 * Une sessões locais e remotas sem duplicar a mesma sessão já sincronizada.
 * A chave de deduplicação usa tarefa + minutos + minuto de conclusão.
 */
const TOLERANCIA_MS = 5 * 60000;

export function mergeFocusSessions(local: FocusSession[], remote: RemoteFocusSession[]): FocusSession[] {
  const minutos = (ms: number) => Math.max(1, Math.round(ms / 60000));
  const out: FocusSession[] = [];
  for (const s of local) {
    // Remove duplicatas internas da mesma sessão (tarefa + minutos + janela de tempo).
    const repetida = out.some(o => o.mode === s.mode && o.taskId === s.taskId &&
      minutos(o.duration) === minutos(s.duration) && Math.abs(o.completedAt - s.completedAt) <= TOLERANCIA_MS);
    if (!repetida) out.push(s);
  }
  for (const r of remote) {
    const completedAt = Date.parse(r.iniciadaEm);
    const jaExiste = out.some(o => o.taskId === r.tarefaId && minutos(o.duration) === r.minutos &&
      Math.abs(o.completedAt - completedAt) <= TOLERANCIA_MS);
    if (!jaExiste) {
      out.push({ id: `r${r.id}`, mode: 'focus', duration: r.minutos * 60000, completedAt, taskId: r.tarefaId });
    }
  }
  return out.sort((a, b) => a.completedAt - b.completedAt);
}
