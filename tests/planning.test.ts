import { buildTimeline, estimateMinutes, planDay, PLANNING_WEIGHTS, scoreTask } from '../src/domain/planning';
import { defaultDetails, Task } from '../src/types/models';

const task = (overrides: Partial<Task> = {}): Task => ({
  id: 1, titulo: 'Tarefa', descricao: null, prioridade: 'MEDIA', status: 'PENDENTE',
  dataPrazo: null, categoria: null, detalhes: defaultDetails(), conclusoes: [], proximaGerada: false, ...overrides,
});
const TODAY = '2026-11-18';

describe('planejamento determinístico', () => {
  test('pesos documentados priorizam atraso, prazo e prioridade', () => {
    const overdue = task({ id: 1, dataPrazo: '2026-11-10', prioridade: 'MEDIA' });
    const todayTask = task({ id: 2, dataPrazo: TODAY, prioridade: 'BAIXA' });
    const later = task({ id: 3, dataPrazo: '2026-11-30', prioridade: 'ALTA' });
    const scored = [later, todayTask, overdue].map(item => scoreTask(item, TODAY));
    expect(scored[2].score).toBeGreaterThan(scored[1].score);
    expect(scored[1].score).toBeGreaterThan(scored[0].score);
    expect(scored[2].reasons).toContain('está atrasada');
  });

  test('empate é resolvido por duração e depois por id, de forma reproduzível', () => {
    const a = task({ id: 9, detalhes: { ...defaultDetails(), duracaoEstimada: 30 } });
    const b = task({ id: 4, detalhes: { ...defaultDetails(), duracaoEstimada: 30 } });
    const first = planDay([a, b], TODAY, 120).items.map(item => item.task.id);
    const second = planDay([b, a], TODAY, 120).items.map(item => item.task.id);
    expect(first).toEqual([4, 9]);
    expect(second).toEqual(first);
  });

  test('respeita a disponibilidade e envia o restante para overflow', () => {
    const tasks = [
      task({ id: 1, detalhes: { ...defaultDetails(), duracaoEstimada: 60 } }),
      task({ id: 2, detalhes: { ...defaultDetails(), duracaoEstimada: 45 } }),
      task({ id: 3, detalhes: { ...defaultDetails(), duracaoEstimada: 30 } }),
    ];
    const plan = planDay(tasks, TODAY, 30, 8 * 60);
    expect(plan.usedMinutes).toBeLessThanOrEqual(30);
    expect(plan.items).toHaveLength(1);
    expect(plan.overflow).toHaveLength(2);
    expect(plan.items[0].task.id).toBe(3);
    expect(plan.availableMinutes).toBe(30);
    expect(plan.totalTasks).toBe(3);
  });

  test('timeline começa no horário configurado e avança pela estimativa', () => {
    const items = [{ task: task(), score: 10, minutes: 30, reasons: [] },
      { task: task({ id: 2 }), score: 9, minutes: 45, reasons: [] }];
    const line = buildTimeline(items, 9 * 60);
    expect(line[0]).toMatchObject({ startMinute: 540, endMinute: 570 });
    expect(line[1]).toMatchObject({ startMinute: 570, endMinute: 615 });
  });

  test('tarefas concluídas não entram e estimativa ausente usa 30 minutos', () => {
    expect(estimateMinutes(task())).toBe(30);
    expect(estimateMinutes(task({ detalhes: { ...defaultDetails(), duracaoEstimada: 15 } }))).toBe(15);
    const plan = planDay([task({ id: 1 }), task({ id: 2, status: 'CONCLUIDA' })], TODAY, 120);
    expect(plan.items.map(item => item.task.id)).toEqual([1]);
  });

  test('constantes são públicas e estáveis para documentação', () => {
    expect(PLANNING_WEIGHTS).toEqual({ overdue: 50, dueToday: 30, dueTomorrow: 15, dueThisWeek: 8,
      important: 10, urgent: 12, favorite: 5, pinned: 4, shortBonusMax: 6 });
  });
});
