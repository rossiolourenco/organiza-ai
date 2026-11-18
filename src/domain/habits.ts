import { Habit, HabitInput } from '../types/models';
import { addDays, dayKey, lastDays, weekStart } from './dates';

/** Datas civis (AAAA-MM-DD). Nenhuma conversão de fuso é feita: o dia é o do usuário. */
export function recordDates(habit: Habit): string[] {
  return [...new Set(habit.registros.map(r => r.data))].sort();
}
export function isDoneOn(habit: Habit, date: string): boolean {
  return habit.registros.some(r => r.data === date);
}
export function weeklyCount(habit: Habit, date: string): number {
  const start = weekStart(date), end = addDays(start, 6);
  return new Set(habit.registros.map(r => r.data).filter(d => d >= start && d <= end)).size;
}
export function weeklyProgress(habit: Habit, today = dayKey()) {
  const count = weeklyCount(habit, today);
  const target = Math.max(1, Math.min(7, habit.metaSemanal));
  return { count, target, percent: Math.min(100, Math.round(count / target * 100)) };
}

/** Sequência atual em dias (hábito diário) ou semanas consecutivas com meta atingida. */
export function habitStreak(habit: Habit, today = dayKey()): number {
  if (habit.frequencia === 'DIARIA') {
    const dates = new Set(recordDates(habit));
    let cursor = dates.has(today) ? today : addDays(today, -1);
    let streak = 0;
    while (dates.has(cursor)) { streak++; cursor = addDays(cursor, -1); }
    return streak;
  }
  const target = Math.max(1, Math.min(7, habit.metaSemanal));
  let cursor = weekStart(today);
  if (weeklyCount(habit, cursor) < target) cursor = addDays(cursor, -7);
  let streak = 0;
  while (weeklyCount(habit, cursor) >= target) { streak++; cursor = addDays(cursor, -7); }
  return streak;
}

export function bestStreak(habit: Habit): number {
  if (habit.frequencia === 'DIARIA') {
    const dates = recordDates(habit);
    let best = 0, run = 0, previous: string | null = null;
    for (const date of dates) {
      run = previous && addDays(previous, 1) === date ? run + 1 : 1;
      previous = date; best = Math.max(best, run);
    }
    return best;
  }
  const target = Math.max(1, Math.min(7, habit.metaSemanal));
  const weeks = new Set(recordDates(habit).map(date => weekStart(date)));
  let best = 0;
  for (const week of weeks) {
    if (weeklyCount(habit, week) < target) continue;
    let run = 0;
    for (let cursor = week; weeks.has(cursor) && weeklyCount(habit, cursor) >= target;
      cursor = addDays(cursor, -7)) run++;
    best = Math.max(best, run);
  }
  return best;
}

export function consistency(habit: Habit, count = 28, today = dayKey()) {
  return lastDays(count, today).map(date => ({ date, done: isDoneOn(habit, date) }));
}

export function habitCompletion(habit: Habit, today = dayKey()) {
  const dates = recordDates(habit);
  const totalDone = dates.length;
  const last30 = lastDays(30, today);
  const done30 = last30.filter(d => dates.includes(d)).length;
  return { totalDone, done30, rate30: Math.round(done30 / 30 * 100) };
}

export function validateHabit(input: HabitInput): string | null {
  if (!input.nome.trim() || input.nome.length > 100) return 'Nome do hábito obrigatório, até 100 caracteres.';
  if (input.descricao && input.descricao.length > 500) return 'Descrição do hábito muito longa.';
  if (!['DIARIA', 'SEMANAL'].includes(input.frequencia)) return 'Escolha frequência diária ou semanal.';
  if (!Number.isInteger(input.metaSemanal) || input.metaSemanal < 1 || input.metaSemanal > 7)
    return 'A meta deve ficar entre 1 e 7 dias por semana.';
  if (input.cor && !/^#[0-9a-fA-F]{6}$/.test(input.cor)) return 'Cor inválida.';
  return null;
}

/** Normaliza registros recebidos do servidor: únicos e ordenados, sem duplicar períodos. */
export function normalizeHabit(habit: Habit): Habit {
  const unique = [...new Map(habit.registros.map(r => [r.data, r])).values()].sort((a, b) => a.data.localeCompare(b.data));
  return { ...habit, registros: unique };
}
