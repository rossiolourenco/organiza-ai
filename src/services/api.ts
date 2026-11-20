import { Category, FocoSession, Habit, HabitInput, Planejamento, PlanejamentoItem, Session, Task, TaskInput } from '../types/models';

export class ApiError extends Error {
  constructor(message: string, public status: number) { super(message); }
}
export function normalizeServer(value: string): string {
  const raw = value.trim();
  if (!raw) throw new Error('Informe o endereço do servidor.');
  const url = new URL(/^https?:\/\//i.test(raw) ? raw : `http://${raw}`);
  if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password ||
      url.search || url.hash || !['', '/'].includes(url.pathname))
    throw new Error('Use somente o endereço do servidor, sem senha ou caminho.');
  if (!/^https?:\/\//i.test(raw) && !url.port) url.port = '8080';
  return url.origin;
}
export async function request<T>(server: string, path: string, options: RequestInit = {}, token?: string): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);
  try {
    const response = await fetch(`${server}/api${path}`, {
      ...options, signal: controller.signal,
      headers: { 'Content-Type': 'application/json', ...options.headers,
        ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    });
    if (!response.ok) {
      let message = `Não foi possível realizar a operação (HTTP ${response.status}).`;
      try {
        const body = await response.json();
        if (typeof body.message === 'string') message = body.message;
      } catch { /* Respostas vazias/HTML não são apresentadas como mensagens confiáveis. */ }
      if (response.status === 401) message = token ? 'Sessão expirada. Entre novamente.' : 'E-mail ou senha incorretos.';
      if (response.status === 403) message = 'Você não tem acesso a este recurso.';
      if (response.status === 404) message = 'Registro não encontrado. Atualize a lista.';
      throw new ApiError(message, response.status);
    }
    return response.status === 204 ? undefined as T : await response.json() as T;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new Error(error instanceof Error && error.name === 'AbortError'
      ? 'O servidor demorou para responder. Confira a conexão e atualize antes de repetir.'
      : 'Sem conexão com o servidor. Confira o endereço e a rede.');
  } finally { clearTimeout(timeout); }
}
export function isNetworkError(error: unknown): boolean {
  return error instanceof Error && /Sem conexão|demorou para responder/.test(error.message);
}

export class Api {
  constructor(private session: Session, private expired: () => void) {}
  private async call<T>(path: string, method = 'GET', body?: unknown): Promise<T> {
    try {
      return await request<T>(this.session.server,
        `${path}${path.includes('?') ? '&' : '?'}usuarioId=${this.session.id}`,
        { method, ...(body === undefined ? {} : { body: JSON.stringify(body) }) }, this.session.token);
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) this.expired();
      throw error;
    }
  }
  tasks() { return this.call<Task[]>('/tarefas'); }
  categories() { return this.call<Category[]>('/categorias'); }
  saveTask(input: TaskInput, id?: number) { return this.call<Task>(`/tarefas${id ? `/${id}` : ''}`, id ? 'PUT' : 'POST', input); }
  completeTask(id: number) { return this.call<Task>(`/tarefas/${id}/concluir`, 'PATCH'); }
  deleteTask(id: number) { return this.call<void>(`/tarefas/${id}`, 'DELETE'); }
  trash() { return this.call<Task[]>('/tarefas/lixeira'); }
  restoreTask(id: number) { return this.call<Task>(`/tarefas/${id}/restaurar`, 'POST'); }
  purgeTask(id: number) { return this.call<void>(`/tarefas/${id}/definitivo`, 'DELETE'); }
  saveCategory(input: Pick<Category, 'nome' | 'cor'>, id?: number) {
    return this.call<Category>(`/categorias${id ? `/${id}` : ''}`, id ? 'PUT' : 'POST', input);
  }
  deleteCategory(id: number) { return this.call<void>(`/categorias/${id}`, 'DELETE'); }

  habits() { return this.call<Habit[]>('/habitos'); }
  saveHabit(input: HabitInput, id?: number) {
    return this.call<Habit>(`/habitos${id ? `/${id}` : ''}`, id ? 'PUT' : 'POST', input);
  }
  deleteHabit(id: number) { return this.call<void>(`/habitos/${id}`, 'DELETE'); }

  planejamento(data: string) { return this.call<Planejamento>(`/produtividade/planejamento?data=${encodeURIComponent(data)}`); }
  salvarPlanejamento(data: string, itens: PlanejamentoItem[], versao: number) {
    return this.call<Planejamento>('/produtividade/planejamento', 'PUT', { data, itens, versao });
  }
  focoSessoes(data: string) { return this.call<FocoSession[]>(`/produtividade/foco?data=${encodeURIComponent(data)}`); }
  registrarFoco(minutos: number, tarefaId: number | null, data: string) {
    return this.call<FocoSession>('/produtividade/foco', 'POST', { minutos, tarefaId, data });
  }
  setHabitRecord(id: number, date: string, done: boolean) {
    return done
      ? this.call<Habit>(`/habitos/${id}/registros`, 'POST', { data: date })
      : this.call<Habit>(`/habitos/${id}/registros?data=${encodeURIComponent(date)}`, 'DELETE');
  }
}
