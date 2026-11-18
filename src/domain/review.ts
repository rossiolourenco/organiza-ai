import { Habit, Task } from '../types/models';
import { addDays, dayKey, daysBetween, weekEnd, weekStart } from './dates';
import { completedInRange, isOverdue } from './tasks';
import type { FocusSession } from './focus';
import { weeklyCount } from './habits';

export interface Recommendation { tone: 'info' | 'warning' | 'success'; title: string; detail: string }
export interface WeekReview {
  start: string; end: string;
  completed: number; completedPrevious: number; delta: number;
  pendingNow: number; overdueNow: number; dueInWeek: number; completedDueInWeek: number;
  rate: number; focusMinutes: number; focusPrevious: number; focusDelta: number;
  topCategories: { name: string; color: string | null; count: number }[];
  habits: { id: number; nome: string; count: number; target: number; achieved: boolean }[];
  goals: { tasks: number; focus: number; daysMet: number; focusAchieved: boolean; habitsAchieved: number };
  recommendations: Recommendation[];
  activeDays: number;
}

const minutesOf = (sessions: FocusSession[], start: string, end: string) =>
  Math.floor(sessions.filter(s => s.mode === 'focus').filter(s => {
    const day = dayKey(new Date(s.completedAt));
    return day >= start && day <= end;
  }).reduce((total, s) => total + s.duration, 0) / 60000);

/**
 * Revisão semanal baseada exclusivamente em dados registrados.
 * Fórmulas documentadas em docs/MOBILE-3.0.md.
 */
export function weekReview(tasks: Task[], sessions: FocusSession[], habits: Habit[],
  weekOf: string, goals: { tasks: number; minutes: number }, today = dayKey()): WeekReview {
  const start = weekStart(weekOf), end = weekEnd(weekOf);
  const previousStart = addDays(start, -7), previousEnd = addDays(start, -1);
  const completedTasks = tasks.filter(t => completedInRange(t, start, end));
  const previousTasks = tasks.filter(t => completedInRange(t, previousStart, previousEnd));
  const dueInWeek = tasks.filter(t => !!t.dataPrazo && t.dataPrazo >= start && t.dataPrazo <= end);
  const completedDueInWeek = dueInWeek.filter(t => completedInRange(t, start, end)).length;
  const rate = dueInWeek.length ? Math.round(completedDueInWeek / dueInWeek.length * 100) : 0;
  const focusMinutes = minutesOf(sessions, start, end);
  const focusPrevious = minutesOf(sessions, previousStart, previousEnd);

  const categoryMap = new Map<string, { name: string; color: string | null; count: number }>();
  for (const task of completedTasks) {
    const key = task.categoria ? String(task.categoria.id) : 'none';
    const entry = categoryMap.get(key) || { name: task.categoria?.nome || 'Sem categoria',
      color: task.categoria?.cor ?? null, count: 0 };
    entry.count++; categoryMap.set(key, entry);
  }
  const topCategories = [...categoryMap.values()].sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))
    .slice(0, 4);

  const habitRows = habits.map(habit => {
    const count = weeklyCount(habit, start);
    const target = Math.max(1, Math.min(7, habit.metaSemanal));
    return { id: habit.id, nome: habit.nome, count, target, achieved: count >= target };
  });

  const days = daysBetween(start, end).filter(day => day <= today);
  const daysMet = days.filter(day => tasks.filter(t => completedInRange(t, day, day)).length >= goals.tasks).length;
  const focusGoal = goals.minutes * 7;

  const recommendations: Recommendation[] = [];
  const overdueNow = tasks.filter(t => isOverdue(t, today)).length;
  if (overdueNow > 0) recommendations.push({ tone: 'warning', title: 'Revise prazos atrasados',
    detail: `${overdueNow} tarefa(s) estão atrasadas. Replaneje ou redefina o prazo para reduzir ruído.` });
  if (dueInWeek.length >= 3 && rate < 50) recommendations.push({ tone: 'info', title: 'Divida tarefas grandes',
    detail: `A conclusão da semana ficou em ${rate}%. Checklists menores ajudam a manter o ritmo.` });
  if (focusMinutes < Math.round(focusGoal * 0.6)) recommendations.push({ tone: 'info', title: 'Reserve blocos de foco',
    detail: `Foram ${focusMinutes} min de foco contra a meta semanal de ${focusGoal} min. Tente um bloco curto por dia.` });
  if (topCategories.length === 1 && completedTasks.length >= 3) recommendations.push({ tone: 'info',
    title: 'Equilibre as áreas', detail: `Todas as conclusões vieram de “${topCategories[0].name}”. Verifique outras áreas da vida.` });
  if (!habits.length) recommendations.push({ tone: 'info', title: 'Comece com um hábito',
    detail: 'Hábitos criam constância fora dos prazos. Comece com um hábito simples e diário.' });
  if (rate >= 80 && dueInWeek.length > 0) recommendations.push({ tone: 'success', title: 'Semana consistente',
    detail: `${rate}% das tarefas com prazo na semana foram concluídas. Mantenha o ritmo.` });

  return {
    start, end, completed: completedTasks.length, completedPrevious: previousTasks.length,
    delta: completedTasks.length - previousTasks.length,
    pendingNow: tasks.filter(t => t.status !== 'CONCLUIDA').length, overdueNow,
    dueInWeek: dueInWeek.length, completedDueInWeek, rate, focusMinutes, focusPrevious,
    focusDelta: focusMinutes - focusPrevious, topCategories, habits: habitRows,
    goals: { tasks: goals.tasks, focus: focusGoal, daysMet, focusAchieved: focusMinutes >= focusGoal,
      habitsAchieved: habitRows.filter(h => h.achieved).length },
    recommendations, activeDays: daysMet,
  };
}
