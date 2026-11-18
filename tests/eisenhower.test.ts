import { isClassified, matrix, quadrantOf, quadrants, suggestQuadrant } from '../src/domain/eisenhower';
import { defaultDetails, Task } from '../src/types/models';

const TODAY = '2026-11-18';
const task = (overrides: Partial<Task> = {}): Task => ({
  id: 1, titulo: 'Tarefa', descricao: null, prioridade: 'MEDIA', status: 'PENDENTE',
  dataPrazo: null, categoria: null, detalhes: defaultDetails(), conclusoes: [], proximaGerada: false, ...overrides,
});
const classified = (importante: boolean, urgente: boolean) =>
  ({ ...defaultDetails(), importante, urgente });

describe('matriz de Eisenhower', () => {
  test('mapeia os quatro quadrantes apenas com atributos explícitos', () => {
    expect(quadrantOf(task({ detalhes: classified(true, true) }))).toBe('DO');
    expect(quadrantOf(task({ detalhes: classified(true, false) }))).toBe('PLAN');
    expect(quadrantOf(task({ detalhes: classified(false, true) }))).toBe('DELEGATE');
    expect(quadrantOf(task({ detalhes: classified(false, false) }))).toBe('ELIMINATE');
    expect(quadrantOf(task())).toBeNull();
    expect(isClassified(task())).toBe(false);
    expect(quadrants.map(item => item.key)).toEqual(['DO', 'PLAN', 'DELEGATE', 'ELIMINATE']);
  });

  test('sugestão é explícita, determinística e nunca aplicada sozinha', () => {
    const overdueHigh = suggestQuadrant(task({ prioridade: 'ALTA', dataPrazo: '2026-11-10' }), TODAY);
    expect(overdueHigh).toMatchObject({ importante: true, urgente: true });
    expect(overdueHigh.reason).toContain('atrasada');

    const mediumSoon = suggestQuadrant(task({ prioridade: 'MEDIA', dataPrazo: '2026-11-20' }), TODAY);
    expect(mediumSoon).toMatchObject({ importante: true, urgente: false });

    const lowLater = suggestQuadrant(task({ prioridade: 'BAIXA', dataPrazo: '2026-12-20' }), TODAY);
    expect(lowLater).toMatchObject({ importante: false, urgente: false });

    const pinned = suggestQuadrant(task({ detalhes: { ...defaultDetails(), fixada: true } }), TODAY);
    expect(pinned.importante).toBe(true);
    expect(task().detalhes?.importante).toBeNull();
  });

  test('agrupa abertas e separa não classificadas', () => {
    const result = matrix([
      task({ id: 1, detalhes: classified(true, true) }),
      task({ id: 2, detalhes: classified(true, false) }),
      task({ id: 3 }),
      task({ id: 4, status: 'CONCLUIDA', detalhes: classified(false, false) }),
    ]);
    expect(result.total).toBe(3);
    expect(result.groups.get('DO')).toHaveLength(1);
    expect(result.groups.get('PLAN')).toHaveLength(1);
    expect(result.unclassified.map(item => item.id)).toEqual([3]);
  });
});
