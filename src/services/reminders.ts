import { Task } from '../types/models';

/**
 * Implementação Web: notificações locais agendadas não são equivalentes às nativas
 * e não fazem parte do escopo desta versão. O app informa a indisponibilidade na UI.
 */
export const notificationsSupported = false;
export type PermissionState = 'granted' | 'denied' | 'undetermined' | 'unsupported';

export async function notificationPermission(): Promise<PermissionState> { return 'unsupported'; }
export async function notificationPermissionSilent(): Promise<PermissionState> { return 'unsupported'; }
export async function cancelAllReminders(): Promise<void> { /* indisponível na Web */ }
export async function scheduleTaskReminders(_tasks: Task[], _leadMinutes: number): Promise<number> { return 0; }
export async function scheduleFocusEnd(_endAt: number, _taskTitle?: string): Promise<string | null> { return null; }
export async function cancelReminder(_id: string | null): Promise<void> { /* indisponível na Web */ }
