import { Api, ApiError, normalizeServer, request } from '../src/services/api';

const fetchMock = jest.fn();
beforeEach(() => { global.fetch = fetchMock; fetchMock.mockReset(); });
test('aceita IP legado e preserva HTTPS/porta explícita', () => {
  expect(normalizeServer('192.168.1.50')).toBe('http://192.168.1.50:8080');
  expect(normalizeServer('https://api.example.org/')).toBe('https://api.example.org');
  expect(normalizeServer('localhost:8088')).toBe('http://localhost:8088');
  expect(() => normalizeServer('https://user:pass@example.org')).toThrow();
  expect(() => normalizeServer('https://example.org/api')).toThrow();
});
test('envia credencial, preserva usuarioId e expira sessão em 401', async () => {
  fetchMock.mockResolvedValue({ ok: false, status: 401, json: async () => ({}) });
  const expired = jest.fn();
  const api = new Api({ id: 1, nome: 'Teste', email: 'test@demo.invalid', server: 'https://api.example.org', token: 'secret' }, expired);
  await expect(api.tasks()).rejects.toBeInstanceOf(ApiError);
  expect(expired).toHaveBeenCalledTimes(1);
  expect(fetchMock).toHaveBeenCalledWith('https://api.example.org/api/tarefas?usuarioId=1',
    expect.objectContaining({ headers: expect.objectContaining({ Authorization: 'Bearer secret' }) }));
});
test('erros de rede, 403 e servidor não viram sucesso', async () => {
  fetchMock.mockRejectedValueOnce(new Error('network'));
  await expect(request('https://api.example.org', '/tarefas')).rejects.toThrow('Sem conexão');
  fetchMock.mockResolvedValueOnce({ ok: false, status: 403, json: async () => ({}) });
  await expect(request('https://api.example.org', '/tarefas')).rejects.toThrow('não tem acesso');
  fetchMock.mockResolvedValueOnce({ ok: false, status: 400, json: async () => ({ message: 'Prazo inválido' }) });
  await expect(request('https://api.example.org', '/tarefas')).rejects.toThrow('Prazo inválido');
});
test('DELETE 204 não tenta interpretar JSON', async () => {
  fetchMock.mockResolvedValue({ ok: true, status: 204 });
  await expect(request('https://api.example.org', '/tarefas/1', { method: 'DELETE' })).resolves.toBeUndefined();
});
test('lixeira e hábitos usam endpoints reais com método correto', async () => {
  fetchMock.mockImplementation(async () => ({ ok: true, status: 200, json: async () => [] }));
  const api = new Api({ id: 7, nome: 'Teste', email: 'test@demo.invalid', server: 'https://api.example.org', token: 'secret' }, jest.fn());
  await api.trash();
  expect(fetchMock).toHaveBeenLastCalledWith('https://api.example.org/api/tarefas/lixeira?usuarioId=7',
    expect.objectContaining({ method: 'GET' }));
  await api.restoreTask(3);
  expect(fetchMock).toHaveBeenLastCalledWith('https://api.example.org/api/tarefas/3/restaurar?usuarioId=7',
    expect.objectContaining({ method: 'POST' }));
  await api.purgeTask(3);
  expect(fetchMock).toHaveBeenLastCalledWith('https://api.example.org/api/tarefas/3/definitivo?usuarioId=7',
    expect.objectContaining({ method: 'DELETE' }));
  await api.setHabitRecord(5, '2026-11-18', true);
  expect(fetchMock).toHaveBeenLastCalledWith('https://api.example.org/api/habitos/5/registros?usuarioId=7',
    expect.objectContaining({ method: 'POST', body: JSON.stringify({ data: '2026-11-18' }) }));
  await api.setHabitRecord(5, '2026-11-18', false);
  expect(fetchMock).toHaveBeenLastCalledWith(
    'https://api.example.org/api/habitos/5/registros?data=2026-11-18&usuarioId=7',
    expect.objectContaining({ method: 'DELETE' }));
});
