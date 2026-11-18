export type Status = 'PENDENTE' | 'EM_ANDAMENTO' | 'CONCLUIDA';
export type Priority = 'BAIXA' | 'MEDIA' | 'ALTA';
export type Recurrence = 'NENHUMA' | 'DIARIA' | 'SEMANAL' | 'MENSAL';
export type Frequency = 'DIARIA' | 'SEMANAL';

export interface Category { id: number; nome: string; cor: string | null }
export interface ChecklistItem { id: string; titulo: string; concluida: boolean }

export interface TaskDetails {
  horario: string; notas: string; etiquetas: string[];
  favorita: boolean; fixada: boolean; ordem: number;
  subtarefas: ChecklistItem[]; recorrencia: Recurrence; fusoHorario: string;
  /** Classificação explícita da matriz de Eisenhower. `null` = ainda não classificada. */
  importante: boolean | null; urgente: boolean | null;
  /** Duração estimada em minutos, opcional. */
  duracaoEstimada: number | null;
}

export interface Task {
  id: number; titulo: string; descricao: string | null;
  prioridade: Priority; status: Status; dataPrazo: string | null;
  categoria: Category | null; detalhes: TaskDetails | null;
  conclusoes: string[]; proximaGerada: boolean;
}
export type TaskInput = Pick<Task, 'titulo' | 'descricao' | 'prioridade' | 'status' | 'dataPrazo'> & {
  categoria: { id: number } | null; detalhes?: TaskDetails | null;
};

export interface Session { id: number; nome: string; email: string; token: string; server: string }

export interface HabitRecord { id: number; data: string }
export interface Habit {
  id: number; nome: string; descricao: string | null;
  frequencia: Frequency; metaSemanal: number; cor: string | null;
  ativo: boolean; registros: HabitRecord[];
}
export type HabitInput = Pick<Habit, 'nome' | 'descricao' | 'frequencia' | 'metaSemanal' | 'cor' | 'ativo'>;

export const statuses: Record<Status, string> = {
  PENDENTE: 'Pendente', EM_ANDAMENTO: 'Em andamento', CONCLUIDA: 'Concluída',
};
export const priorities: Record<Priority, string> = { BAIXA: 'Baixa', MEDIA: 'Média', ALTA: 'Alta' };
export const frequencies: Record<Frequency, string> = { DIARIA: 'Diário', SEMANAL: 'Semanal' };

export function defaultDetails(): TaskDetails {
  return { horario: '', notas: '', etiquetas: [], favorita: false, fixada: false,
    ordem: 0, subtarefas: [], recorrencia: 'NENHUMA',
    fusoHorario: Intl.DateTimeFormat().resolvedOptions().timeZone || 'America/Sao_Paulo',
    importante: null, urgente: null, duracaoEstimada: null };
}
