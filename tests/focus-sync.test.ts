import { FocusSession, mergeFocusSessions } from '../src/domain/focus';

const local = (id: string, duration: number, completedAt: number, taskId: number | null): FocusSession =>
  ({ id, mode: 'focus', duration, completedAt, taskId });

describe('mergeFocusSessions', () => {
  it('combina locais e remotas sem duplicar a mesma sessão', () => {
    // Local concluída às 10:00 (25 min, tarefa 1); remota equivalente (mesma tarefa/minuto).
    const localSessions = [local('l1', 25 * 60000, Date.parse('2026-11-20T13:00:00Z'), 1)];
    const remote = [{ id: 7, minutos: 25, data: '2026-11-20', iniciadaEm: '2026-11-20T13:00:00Z', tarefaId: 1 }];

    const merged = mergeFocusSessions(localSessions, remote);
    expect(merged.length).toBe(1);
    expect(merged[0].id).toBe('l1');
  });

  it('inclui sessões remotas vindas de outro aparelho', () => {
    const remote = [
      { id: 8, minutos: 25, data: '2026-11-20', iniciadaEm: '2026-11-20T14:00:00Z', tarefaId: null },
    ];
    const merged = mergeFocusSessions([], remote);
    expect(merged.length).toBe(1);
    expect(merged[0].id).toBe('r8');
    expect(merged[0].duration).toBe(25 * 60000);
    expect(merged[0].completedAt).toBe(Date.parse('2026-11-20T14:00:00Z'));
  });

  it('ordena por conclusão', () => {
    const remote = [
      { id: 9, minutos: 25, data: '2026-11-20', iniciadaEm: '2026-11-20T12:00:00Z', tarefaId: null },
      { id: 10, minutos: 25, data: '2026-11-20', iniciadaEm: '2026-11-20T11:00:00Z', tarefaId: null },
    ];
    const merged = mergeFocusSessions([], remote);
    expect(merged.map(s => s.id)).toEqual(['r10', 'r9']);
  });
});
