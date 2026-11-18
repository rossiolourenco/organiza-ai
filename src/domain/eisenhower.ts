import { Task, TaskDetails } from '../types/models';
import { addDays, dayKey } from './dates';
import { isOverdue } from './tasks';

export type Quadrant = 'DO' | 'PLAN' | 'DELEGATE' | 'ELIMINATE';

export interface QuadrantMeta {
  key: Quadrant; title: string; subtitle: string; importante: boolean; urgente: boolean;
  tone: 'danger' | 'primary' | 'warning' | 'muted'; icon: string;
}
export const quadrants: QuadrantMeta[] = [
  { key: 'DO', title: 'Fazer agora', subtitle: 'Importante e urgente', importante: true, urgente: true,
    tone: 'danger', icon: 'zap' },
  { key: 'PLAN', title: 'Planejar', subtitle: 'Importante, sem urgência', importante: true, urgente: false,
    tone: 'primary', icon: 'calendar' },
  { key: 'DELEGATE', title: 'Reduzir', subtitle: 'Urgente, sem importância', importante: false, urgente: true,
    tone: 'warning', icon: 'shuffle' },
  { key: 'ELIMINATE', title: 'Eliminar', subtitle: 'Nem importante, nem urgente', importante: false, urgente: false,
    tone: 'muted', icon: 'archive' },
];

export function isClassified(task: Task): boolean {
  const d = task.detalhes;
  return d?.importante != null && d?.urgente != null;
}
export function quadrantOf(task: Task): Quadrant | null {
  const d = task.detalhes;
  if (d?.importante == null || d?.urgente == null) return null;
  if (d.importante && d.urgente) return 'DO';
  if (d.importante) return 'PLAN';
  if (d.urgente) return 'DELEGATE';
  return 'ELIMINATE';
}

/**
 * Regra explícita de sugestão (nunca aplicada automaticamente):
 * - urgente: já atrasada ou com prazo até amanhã;
 * - importante: prioridade alta, tarefa fixada, ou prioridade média com prazo em até 3 dias.
 */
export function suggestQuadrant(task: Pick<Task, 'prioridade' | 'dataPrazo' | 'status'> & { detalhes?: TaskDetails | null },
  today = dayKey()): { importante: boolean; urgente: boolean; reason: string } {
  const prazo = task.dataPrazo;
  const urgente = isOverdue(task, today) || (!!prazo && prazo <= addDays(today, 1));
  const importante = task.prioridade === 'ALTA' || !!task.detalhes?.fixada ||
    (task.prioridade === 'MEDIA' && !!prazo && prazo <= addDays(today, 3));
  const parts = [
    urgente ? (isOverdue(task, today) ? 'está atrasada' : 'vence em até 1 dia') : 'não tem urgência imediata',
    importante ? `prioridade ${task.prioridade.toLowerCase()}${task.detalhes?.fixada ? ' e está fixada' : ''}`
      : 'baixo impacto declarado',
  ];
  return { importante, urgente, reason: `Sugestão: ${parts.join(' · ')}.` };
}

export function matrix(tasks: Task[]) {
  const open = tasks.filter(t => t.status !== 'CONCLUIDA');
  const groups = new Map<Quadrant, Task[]>(quadrants.map(q => [q.key, []]));
  const unclassified: Task[] = [];
  for (const task of open) {
    const key = quadrantOf(task);
    if (key) groups.get(key)!.push(task); else unclassified.push(task);
  }
  return { groups, unclassified, total: open.length };
}
