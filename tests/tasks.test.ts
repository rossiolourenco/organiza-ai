import { analytics, emptyFilters, filterError, filterTasks, isOverdue, sortTasks, validateTask } from '../src/domain/tasks';
import { addDays, dayKey, localDate, validDate, weekStart } from '../src/domain/dates';
import { defaultDetails, Task } from '../src/types/models';

const task = (overrides: Partial<Task> = {}): Task => ({
  id: 1, titulo: 'Revisar projeto', descricao: 'Banco de dados', prioridade: 'ALTA',
  status: 'PENDENTE', dataPrazo: '2026-11-17', categoria: { id: 1, nome: 'Estudos', cor: '#635BFF' },
  detalhes: defaultDetails(), conclusoes: [], proximaGerada: false, ...overrides,
});
describe('datas civis e filtros combináveis', () => {
  test.each(['2026-02-30', '2026-13-01', '26-01-01', '2026-00-10', ''])('rejeita %s', d => expect(validDate(d)).toBe(false));
  test('preserva data sem converter UTC e atravessa fevereiro bissexto', () => {
    expect(dayKey(localDate('2026-11-17'))).toBe('2026-11-17');
    expect(validDate('2024-02-29')).toBe(true);
    expect(addDays('2024-02-28', 1)).toBe('2024-02-29');
    expect(weekStart('2026-11-22')).toBe('2026-11-16');
  });
  test('limites opcionais e inclusivos excluem tarefas sem prazo apenas quando há período', () => {
    const list = [task(), task({ id: 2, dataPrazo: '2026-11-18' }), task({ id: 3, dataPrazo: null })];
    expect(filterTasks(list, emptyFilters)).toHaveLength(3);
    expect(filterTasks(list, { ...emptyFilters, start: '2026-11-17', end: '2026-11-18' })).toHaveLength(2);
    expect(filterTasks(list, { ...emptyFilters, start: '2026-11-18' }).map(t => t.id)).toEqual([2]);
    expect(filterTasks(list, { ...emptyFilters, end: '2026-11-17' }).map(t => t.id)).toEqual([1]);
  });
  test('período invertido é inválido e não altera as tarefas', () => {
    const list = [task()];
    const f = { ...emptyFilters, start: '2026-11-18', end: '2026-11-17' };
    expect(filterError(f)).toBeTruthy(); expect(filterTasks(list, f)).toEqual([]);
    expect(list[0].dataPrazo).toBe('2026-11-17');
  });
  test('aplica AND em status, prioridade, categoria, busca, favorita e atraso', () => {
    const t = task({ detalhes: { ...defaultDetails(), favorita: true, etiquetas: ['universidade'] } });
    const filters = { ...emptyFilters, status: 'PENDENTE' as const, priority: 'ALTA' as const,
      category: '1', search: 'UNIVERSIDADE', favorites: true, overdue: true };
    expect(filterTasks([t], filters, '2026-11-18')).toHaveLength(1);
    expect(filterTasks([t], { ...filters, category: '2' }, '2026-11-18')).toHaveLength(0);
    expect(filterTasks([t], filters, '2026-11-17')).toHaveLength(0);
    expect(isOverdue(task({ status: 'CONCLUIDA' }), '2026-11-18')).toBe(false);
  });
  test('ordenação preserva entrada, prioriza fixadas e ordem personalizada', () => {
    const list = [task({ id: 1, detalhes: { ...defaultDetails(), ordem: 8 } }),
      task({ id: 2, detalhes: { ...defaultDetails(), ordem: 2 } }),
      task({ id: 3, detalhes: { ...defaultDetails(), fixada: true, ordem: 10 } })];
    expect(sortTasks(list, 'personalizada').map(t => t.id)).toEqual([3, 2, 1]);
    expect(list.map(t => t.id)).toEqual([1, 2, 3]);
  });
});
describe('indicadores e formulários', () => {
  test('não inventa conclusão histórica e evita contagem duplicada no mesmo dia', () => {
    const list = [task({ id: 1, status: 'CONCLUIDA' }), task({ id: 2, status: 'CONCLUIDA',
      conclusoes: ['2026-11-17T12:00:00Z', '2026-11-17T13:00:00Z', '2026-11-16T12:00:00Z'] })];
    const a = analytics(list, '2026-11-17');
    expect(a.rate).toBe(100); expect(a.completedToday).toBe(1); expect(a.streak).toBe(2);
    expect(a.week.reduce((n, d) => n + d.count, 0)).toBe(2);
    expect(analytics([], '2026-11-17').rate).toBe(0);
  });
  test('valida prazo, horário e subtarefas', () => {
    expect(validateTask({ ...task(), dataPrazo: '2026-02-30' })).toBeTruthy();
    expect(validateTask({ ...task(), detalhes: { ...defaultDetails(), horario: '24:00' } })).toBeTruthy();
    expect(validateTask({ ...task(), detalhes: { ...defaultDetails(), subtarefas: [{ id: '1', titulo: '', concluida: false }] } })).toBeTruthy();
    expect(validateTask(task())).toBeNull();
  });
});
