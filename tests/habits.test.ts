import {
  bestStreak, consistency, habitCompletion, habitStreak, isDoneOn, normalizeHabit,
  recordDates, validateHabit, weeklyCount, weeklyProgress,
} from '../src/domain/habits';
import { Habit } from '../src/types/models';

const TODAY = '2026-11-18';
const habit = (overrides: Partial<Habit> = {}): Habit => ({
  id: 1, nome: 'Ler', descricao: null, frequencia: 'DIARIA', metaSemanal: 7, cor: '#635BFF',
  ativo: true, registros: [], ...overrides,
});
const records = (...dates: string[]) => dates.map((data, index) => ({ id: index + 1, data }));

describe('hábitos e sequências', () => {
  test('sequência diária continua quando hoje ainda não foi marcado', () => {
    const value = habit({ registros: records('2026-11-18', '2026-11-17', '2026-11-16') });
    expect(habitStreak(value, TODAY)).toBe(3);
    const pendingToday = habit({ registros: records('2026-11-17', '2026-11-16') });
    expect(habitStreak(pendingToday, TODAY)).toBe(2);
    expect(habitStreak(habit({ registros: records('2026-11-15') }), TODAY)).toBe(0);
  });

  test('sequência semanal conta semanas consecutivas com meta atingida', () => {
    const value = habit({ frequencia: 'SEMANAL', metaSemanal: 2, registros: records(
      '2026-11-16', '2026-11-17', // semana atual
      '2026-11-09', '2026-11-10', // semana anterior
      '2026-10-26', // semana retrasada, meta não atingida
      '2026-10-19', '2026-10-20',
    ) });
    expect(weeklyCount(value, TODAY)).toBe(2);
    expect(habitStreak(value, TODAY)).toBe(2);
    expect(bestStreak(value)).toBe(2);
    expect(weeklyProgress(value, TODAY)).toEqual({ count: 2, target: 2, percent: 100 });
  });

  test('melhor sequência diária é preservada mesmo após interrupção', () => {
    const value = habit({ registros: records('2026-11-01', '2026-11-02', '2026-11-03', '2026-11-04', '2026-11-10') });
    expect(bestStreak(value)).toBe(4);
    expect(habitStreak(value, TODAY)).toBe(0);
  });

  test('normaliza registros duplicados e calcula consistência por data civil', () => {
    const value = normalizeHabit(habit({ registros: records('2026-11-17', '2026-11-17', '2026-11-18') }));
    expect(recordDates(value)).toEqual(['2026-11-17', '2026-11-18']);
    expect(isDoneOn(value, '2026-11-18')).toBe(true);
    expect(consistency(value, 3, TODAY)).toEqual([
      { date: '2026-11-16', done: false }, { date: '2026-11-17', done: true }, { date: '2026-11-18', done: true },
    ]);
    expect(habitCompletion(value, TODAY).done30).toBe(2);
  });

  test('valida nome, frequência, meta e cor', () => {
    expect(validateHabit({ nome: ' ', descricao: '', frequencia: 'DIARIA', metaSemanal: 7, cor: null, ativo: true })).toBeTruthy();
    expect(validateHabit({ nome: 'Ler', descricao: '', frequencia: 'DIARIA', metaSemanal: 0, cor: null, ativo: true })).toBeTruthy();
    expect(validateHabit({ nome: 'Ler', descricao: '', frequencia: 'MENSAL' as never, metaSemanal: 7, cor: null, ativo: true })).toBeTruthy();
    expect(validateHabit({ nome: 'Ler', descricao: '', frequencia: 'DIARIA', metaSemanal: 7, cor: 'azul', ativo: true })).toBeTruthy();
    expect(validateHabit({ nome: 'Ler', descricao: '', frequencia: 'DIARIA', metaSemanal: 7, cor: '#635BFF', ativo: true })).toBeNull();
  });
});
