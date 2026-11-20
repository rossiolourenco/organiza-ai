import { elapsed, finishEarly, focusMinutes, FocusState, initialFocus, pauseTimer, recoverFocus, remaining, resumeTimer, Timer } from '../src/domain/focus';

const timer: Timer = { id: 'unique-session', mode: 'focus', duration: 60000,
  remaining: 60000, endAt: 61000, startedAt: 1000, taskId: 4 };
test('calcula a partir de timestamps e recupera uma única sessão depois de suspender', () => {
  const state: FocusState = { ...initialFocus, timer };
  expect(remaining(timer, 31000)).toBe(30000);
  expect(recoverFocus(state, 60000)).toBe(state);
  const recovered = recoverFocus(state, 100000);
  expect(recovered.timer).toBeNull();
  expect(recovered.sessions).toEqual([{ id: timer.id, mode: 'focus', duration: 60000, completedAt: 61000, taskId: 4 }]);
  expect(recoverFocus(recovered, 200000).sessions).toHaveLength(1);
  expect(recoverFocus({ ...recovered, timer }, 200000).sessions).toHaveLength(1);
});
test('pausar não inclui tempo parado e retomar ajusta deadline', () => {
  const paused = pauseTimer(timer, 21000);
  expect(remaining(paused, 100000)).toBe(40000);
  const resumed = resumeTimer(paused, 200000);
  expect(resumed.endAt).toBe(240000);
  expect(remaining(resumed, 210000)).toBe(30000);
});
test('tempo de foco exclui pausas e usa dia da conclusão', () => {
  const completedAt = new Date(2026, 10, 17, 12).getTime();
  const stats = focusMinutes([
    { id: '1', mode: 'focus', duration: 1500000, completedAt, taskId: null },
    { id: '2', mode: 'short', duration: 300000, completedAt, taskId: null },
  ], '2026-11-17');
  expect(stats).toEqual({ total: 25, today: 25, week: 25 });
});
test('encerrar antes do fim registra apenas o tempo decorrido', () => {
  const longTimer: Timer = { ...timer, duration: 600000, remaining: 600000, endAt: 601000 };
  expect(elapsed(longTimer, 181000)).toBe(180000);
  const early = finishEarly(longTimer, 181000);
  expect(early).toMatchObject({ id: 'unique-session', duration: 180000, completedAt: 181000, taskId: 4 });
  expect(finishEarly(longTimer, 31000)).toBeNull();
  const paused = pauseTimer(longTimer, 61000);
  expect(elapsed(paused, 90000)).toBe(60000);
});

test('arredonda minutos por sessão, consistente com o backend', () => {
  const completedAt = Date.parse('2026-11-17T12:00:00Z');
  const stats = focusMinutes([
    { id: 'a', mode: 'focus', duration: 1500000, completedAt, taskId: null },
    { id: 'b', mode: 'focus', duration: 100000, completedAt, taskId: null },
  ], '2026-11-17');
  // 25 min + round(1,66) = 2 => 27 (o cálculo antigo por total daria 26).
  expect(stats.total).toBe(27);
});
