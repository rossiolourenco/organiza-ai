import { Task, Priority, Status, TaskInput } from '../types/models';
import { addDays, dayKey, monthStart, validDate, weekStart } from './dates';

export interface Filters {
  search: string; status: Status | ''; priority: Priority | ''; category: string;
  start: string; end: string; overdue: boolean; favorites: boolean;
}
export const emptyFilters: Filters = {
  search: '', status: '', priority: '', category: '', start: '', end: '', overdue: false, favorites: false,
};
export function filterError(filters: Filters): string | null {
  if ((filters.start && !validDate(filters.start)) || (filters.end && !validDate(filters.end)))
    return 'Informe datas válidas no formato AAAA-MM-DD.';
  if (filters.start && filters.end && filters.start > filters.end)
    return 'A data inicial deve ser anterior ou igual à final.';
  return null;
}
export function isOverdue(task: Pick<Task, 'status' | 'dataPrazo'>, today = dayKey()): boolean {
  return task.status !== 'CONCLUIDA' && !!task.dataPrazo && task.dataPrazo < today;
}
export function isDueToday(task: Task, today = dayKey()): boolean {
  return task.dataPrazo === today && task.status !== 'CONCLUIDA';
}
export function filterTasks(tasks: Task[], f: Filters, today = dayKey()): Task[] {
  if (filterError(f)) return [];
  const query = f.search.trim().toLocaleLowerCase('pt-BR');
  return tasks.filter(t =>
    (!query || [t.titulo, t.descricao, t.detalhes?.notas, ...(t.detalhes?.etiquetas || [])]
      .join(' ').toLocaleLowerCase('pt-BR').includes(query)) &&
    (!f.status || t.status === f.status) && (!f.priority || t.prioridade === f.priority) &&
    (!f.category || String(t.categoria?.id || 'none') === f.category) &&
    (!f.start || (!!t.dataPrazo && t.dataPrazo >= f.start)) &&
    (!f.end || (!!t.dataPrazo && t.dataPrazo <= f.end)) &&
    (!f.overdue || isOverdue(t, today)) && (!f.favorites || t.detalhes?.favorita));
}
const priorityRank: Record<Priority, number> = { ALTA: 0, MEDIA: 1, BAIXA: 2 };
export const priorityWeight: Record<Priority, number> = { ALTA: 24, MEDIA: 12, BAIXA: 4 };
export function sortTasks(tasks: Task[], mode: 'prazo' | 'prioridade' | 'personalizada' = 'prazo'): Task[] {
  return [...tasks].sort((a, b) => Number(!!b.detalhes?.fixada) - Number(!!a.detalhes?.fixada) ||
    (mode === 'prioridade' ? priorityRank[a.prioridade] - priorityRank[b.prioridade] :
      mode === 'personalizada' ? (a.detalhes?.ordem || 0) - (b.detalhes?.ordem || 0) :
        (a.dataPrazo || '9999').localeCompare(b.dataPrazo || '9999')) || a.id - b.id);
}
export function taskInput(task: Task): TaskInput {
  return { titulo: task.titulo, descricao: task.descricao, prioridade: task.prioridade,
    status: task.status, dataPrazo: task.dataPrazo,
    categoria: task.categoria ? { id: task.categoria.id } : null, detalhes: task.detalhes };
}
export function validateTask(task: TaskInput): string | null {
  if (!task.titulo.trim() || task.titulo.length > 150) return 'Título obrigatório, até 150 caracteres.';
  if (task.dataPrazo && !validDate(task.dataPrazo)) return 'Prazo inválido. Use AAAA-MM-DD.';
  const d = task.detalhes;
  if (d?.horario && !/^([01]\d|2[0-3]):[0-5]\d$/.test(d.horario)) return 'Horário inválido. Use HH:MM.';
  if (d?.recorrencia && d.recorrencia !== 'NENHUMA' && !task.dataPrazo) return 'Defina um prazo para repetir a tarefa.';
  if (d?.subtarefas.some(s => !s.titulo.trim())) return 'Preencha ou remova as subtarefas vazias.';
  if (d?.duracaoEstimada != null && (!Number.isInteger(d.duracaoEstimada) || d.duracaoEstimada < 1 || d.duracaoEstimada > 1440))
    return 'Duração estimada deve ficar entre 1 e 1440 minutos.';
  return null;
}

/** Progresso real de checklist; tarefas sem checklist usam o próprio status. */
export function taskProgress(task: Task): number {
  const steps = task.detalhes?.subtarefas || [];
  if (steps.length) return Math.round(steps.filter(s => s.concluida).length / steps.length * 100);
  return task.status === 'CONCLUIDA' ? 100 : 0;
}
export function completedOn(task: Task, date: string): boolean {
  return (task.conclusoes || []).some(c => dayKey(new Date(c)) === date);
}
export function completedInRange(task: Task, start: string, end: string): boolean {
  return (task.conclusoes || []).some(c => {
    const day = dayKey(new Date(c));
    return day >= start && day <= end;
  });
}
export function analytics(tasks: Task[], today = dayKey()) {
  const completedOnDay = (date: string) => tasks.filter(t => completedOn(t, date)).length;
  const week = Array.from({ length: 7 }, (_, i) => {
    const date = addDays(weekStart(today), i); return { date, count: completedOnDay(date) };
  });
  const daily = tasks.filter(t => t.dataPrazo === today);
  const done = tasks.filter(t => t.status === 'CONCLUIDA').length;
  let streak = 0;
  let cursor = completedOnDay(today) ? today : addDays(today, -1);
  const dates = new Set(tasks.flatMap(t => (t.conclusoes || []).map(c => dayKey(new Date(c)))));
  while (dates.has(cursor)) { streak++; cursor = addDays(cursor, -1); }
  const monthStartDate = monthStart(today);
  return {
    total: tasks.length, done, pending: tasks.length - done,
    overdue: tasks.filter(t => isOverdue(t, today)).length,
    today: daily.length, todayDone: daily.filter(t => t.status === 'CONCLUIDA').length,
    completedToday: completedOnDay(today), week, streak,
    completedMonth: tasks.filter(t => completedInRange(t, monthStartDate, today)).length,
    rate: tasks.length ? Math.round(done / tasks.length * 100) : 0,
    checklistPending: tasks.filter(t => t.status !== 'CONCLUIDA'
      && (t.detalhes?.subtarefas || []).some(s => !s.concluida)).length,
  };
}

export type GroupMode = 'date' | 'category' | 'none';
export interface TaskGroup { key: string; title: string; subtitle?: string; tasks: Task[] }

/** Agrupamento estável e determinístico, preservando a ordenação recebida. */
export function groupTasks(tasks: Task[], mode: GroupMode, today = dayKey()): TaskGroup[] {
  if (mode === 'none') return [{ key: 'all', title: 'Todas as tarefas', tasks }];
  if (mode === 'category') {
    const map = new Map<string, TaskGroup>();
    for (const task of tasks) {
      const key = task.categoria ? `c${task.categoria.id}` : 'none';
      if (!map.has(key)) map.set(key, { key, title: task.categoria?.nome || 'Sem categoria', tasks: [] });
      map.get(key)!.tasks.push(task);
    }
    return [...map.values()].sort((a, b) =>
      (a.key === 'none' ? 1 : 0) - (b.key === 'none' ? 1 : 0) || a.title.localeCompare(b.title, 'pt-BR'));
  }
  const buckets: { key: string; title: string; test: (t: Task) => boolean }[] = [
    { key: 'overdue', title: 'Atrasadas', test: t => isOverdue(t, today) },
    { key: 'today', title: 'Hoje', test: t => t.dataPrazo === today && !isOverdue(t, today) },
    { key: 'tomorrow', title: 'Amanhã', test: t => t.dataPrazo === addDays(today, 1) },
    { key: 'week', title: 'Nesta semana', test: t => !!t.dataPrazo && t.dataPrazo > addDays(today, 1) && t.dataPrazo <= addDays(today, 7) },
    { key: 'later', title: 'Mais adiante', test: t => !!t.dataPrazo && t.dataPrazo > addDays(today, 7) },
    { key: 'none', title: 'Sem prazo', test: t => !t.dataPrazo },
  ];
  return buckets.map(bucket => ({ key: bucket.key, title: bucket.title, tasks: tasks.filter(bucket.test) }))
    .filter(group => group.tasks.length > 0);
}
