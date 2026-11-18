import { weekReview } from '../src/domain/review';
import { defaultDetails, Habit, Task } from '../src/types/models';
import type { FocusSession } from '../src/domain/focus';

const TODAY = '2026-11-18'; // quarta-feira; semana começa em 2026-11-16
const task = (overrides: Partial<Task> = {}): Task => ({
  id: 1, titulo: 'Tarefa', descricao: null, prioridade: 'MEDIA', status: 'PENDENTE',
  dataPrazo: null, categoria: null, detalhes: defaultDetails(), conclusoes: [], proximaGerada: false, ...overrides,
});
const session = (completedAt: string, minutes: number, id = completedAt + minutes): FocusSession => ({
  id, mode: 'focus', duration: minutes * 60000, completedAt: new Date(completedAt).getTime(), taskId: null,
});
const habit = (overrides: Partial<Habit> = {}): Habit => ({
  id: 1, nome: 'Ler', descricao: null, frequencia: 'DIARIA', metaSemanal: 3, cor: null, ativo: true,
  registros: [], ...overrides,
});

describe('revisão semanal por regras', () => {
  test('conta conclusões reais da semana e compara com a anterior', () => {
    const tasks = [
      task({ id: 1, status: 'CONCLUIDA', dataPrazo: '2026-11-17', conclusoes: ['2026-11-17T12:00:00Z'] }),
      task({ id: 2, status: 'CONCLUIDA', dataPrazo: '2026-11-18', conclusoes: ['2026-11-18T12:00:00Z'] }),
      task({ id: 3, status: 'CONCLUIDA', conclusoes: ['2026-11-10T12:00:00Z'] }),
      task({ id: 4, dataPrazo: '2026-11-19' }),
      task({ id: 5, dataPrazo: '2026-11-10' }),
    ];
    const review = weekReview(tasks, [], [], TODAY, { tasks: 1, minutes: 25 }, TODAY);
    expect(review.start).toBe('2026-11-16');
    expect(review.end).toBe('2026-11-22');
    expect(review.completed).toBe(2);
    expect(review.completedPrevious).toBe(1);
    expect(review.delta).toBe(1);
    expect(review.dueInWeek).toBe(3);
    expect(review.completedDueInWeek).toBe(2);
    expect(review.rate).toBe(67);
    expect(review.overdueNow).toBe(1);
    expect(review.pendingNow).toBe(2);
  });

  test('tempo de foco, categorias e hábitos refletem apenas a semana selecionada', () => {
    const tasks = [
      task({ id: 1, status: 'CONCLUIDA', categoria: { id: 1, nome: 'Estudos', cor: '#635BFF' },
        dataPrazo: '2026-11-17', conclusoes: ['2026-11-17T12:00:00Z'] }),
      task({ id: 2, status: 'CONCLUIDA', categoria: { id: 1, nome: 'Estudos', cor: '#635BFF' },
        dataPrazo: '2026-11-18', conclusoes: ['2026-11-18T12:00:00Z'] }),
    ];
    const sessions = [session('2026-11-17T12:00:00', 25), session('2026-11-18T12:00:00', 50),
      session('2026-11-10T12:00:00', 30)];
    const habits = [habit({ id: 1, registros: [{ id: 1, data: '2026-11-16' }, { id: 2, data: '2026-11-17' }] }),
      habit({ id: 2, nome: 'Correr', metaSemanal: 2, registros: [{ id: 3, data: '2026-11-16' }] })];
    const review = weekReview(tasks, sessions, habits, TODAY, { tasks: 2, minutes: 25 }, TODAY);
    expect(review.focusMinutes).toBe(75);
    expect(review.focusPrevious).toBe(30);
    expect(review.topCategories[0]).toMatchObject({ name: 'Estudos', count: 2 });
    expect(review.habits).toEqual([
      { id: 1, nome: 'Ler', count: 2, target: 3, achieved: false },
      { id: 2, nome: 'Correr', count: 1, target: 2, achieved: false },
    ]);
    expect(review.goals.daysMet).toBe(0);
  });

  test('recomendações são acionadas por regras explícitas', () => {
    const overdue = task({ id: 1, dataPrazo: '2026-11-10' });
    const review = weekReview([overdue], [], [], TODAY, { tasks: 1, minutes: 25 }, TODAY);
    expect(review.recommendations.some(item => item.title === 'Revise prazos atrasados')).toBe(true);
    expect(review.recommendations.some(item => item.title === 'Comece com um hábito')).toBe(true);

    const noAlerts = weekReview([], [session('2026-11-17T12:00:00', 200)],
      [habit({ metaSemanal: 1, registros: [{ id: 1, data: '2026-11-16' }] })], TODAY,
      { tasks: 1, minutes: 10 }, TODAY);
    expect(noAlerts.recommendations.some(item => item.title === 'Revise prazos atrasados')).toBe(false);
  });
});
