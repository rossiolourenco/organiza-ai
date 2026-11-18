import { Task } from '../types/models';
import { addDays, dayKey } from './dates';
import { isOverdue, priorityWeight } from './tasks';

/** Constantes publicadas: qualquer mudança altera o resultado e deve ser documentada. */
export const PLANNING_WEIGHTS = {
  overdue: 50, dueToday: 30, dueTomorrow: 15, dueThisWeek: 8,
  important: 10, urgent: 12, favorite: 5, pinned: 4, shortBonusMax: 6,
} as const;
export const DEFAULT_ESTIMATE_MINUTES = 30;

export function estimateMinutes(task: Task): number {
  const value = task.detalhes?.duracaoEstimada;
  return value && value > 0 ? Math.round(value) : DEFAULT_ESTIMATE_MINUTES;
}

export interface ScoredTask { task: Task; score: number; minutes: number; reasons: string[] }

/**
 * Pontuação determinística e transparente. Não é uma otimização perfeita:
 * é uma heurística reprodutível para sugerir uma ordem de execução.
 */
export function scoreTask(task: Task, today = dayKey()): ScoredTask {
  const reasons: string[] = [];
  let score = 0;
  const prazo = task.dataPrazo;
  if (isOverdue(task, today)) { score += PLANNING_WEIGHTS.overdue; reasons.push('está atrasada'); }
  else if (prazo === today) { score += PLANNING_WEIGHTS.dueToday; reasons.push('vence hoje'); }
  else if (prazo === addDays(today, 1)) { score += PLANNING_WEIGHTS.dueTomorrow; reasons.push('vence amanhã'); }
  else if (prazo && prazo > today && prazo <= addDays(today, 7)) {
    score += PLANNING_WEIGHTS.dueThisWeek; reasons.push('vence nesta semana');
  }
  score += priorityWeight[task.prioridade];
  if (task.prioridade === 'ALTA') reasons.push('prioridade alta');
  if (task.detalhes?.importante) { score += PLANNING_WEIGHTS.important; reasons.push('marcada como importante'); }
  if (task.detalhes?.urgente) { score += PLANNING_WEIGHTS.urgent; reasons.push('marcada como urgente'); }
  if (task.detalhes?.favorita) { score += PLANNING_WEIGHTS.favorite; reasons.push('favorita'); }
  if (task.detalhes?.fixada) { score += PLANNING_WEIGHTS.pinned; reasons.push('fixada no topo'); }
  const minutes = estimateMinutes(task);
  score += Math.max(0, PLANNING_WEIGHTS.shortBonusMax - minutes / 15);
  if (!reasons.length) reasons.push('sem prazo próximo; mantida como opção');
  return { task, score: Math.round(score * 100) / 100, minutes, reasons };
}

export interface PlanItem extends ScoredTask { startMinute: number; endMinute: number }
export interface DayPlan {
  items: PlanItem[]; overflow: PlanItem[]; usedMinutes: number;
  availableMinutes: number; totalTasks: number;
}

export function buildTimeline(items: ScoredTask[], startMinute: number): PlanItem[] {
  let cursor = startMinute;
  return items.map(item => {
    const start = cursor;
    cursor += item.minutes;
    return { ...item, startMinute: start, endMinute: cursor };
  });
}

export function planDay(tasks: Task[], today: string, availableMinutes: number, startMinute = 8 * 60): DayPlan {
  const sorted = tasks.filter(t => t.status !== 'CONCLUIDA').map(t => scoreTask(t, today))
    .sort((a, b) => b.score - a.score || a.minutes - b.minutes || a.task.id - b.task.id);
  const accepted: ScoredTask[] = [];
  const overflow: ScoredTask[] = [];
  let used = 0;
  const limit = Math.max(0, Math.min(24 * 60, Math.round(availableMinutes)));
  for (const item of sorted) {
    if (used + item.minutes <= limit) { accepted.push(item); used += item.minutes; }
    else overflow.push(item);
  }
  return { items: buildTimeline(accepted, startMinute), overflow: buildTimeline(overflow, startMinute),
    usedMinutes: used, availableMinutes: limit, totalTasks: sorted.length };
}
