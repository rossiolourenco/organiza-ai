import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { Task } from '../types/models';
import { addDays, dayKey, timeToMinutes } from '../domain/dates';

/**
 * Notificações locais. Não há serviço de push externo.
 * Web: indisponível (a API de notificações do navegador exige contexto e não é
 * equivalente ao agendamento nativo). Android/iOS: requer permissão do usuário.
 */
export const notificationsSupported = Platform.OS !== 'web';

if (notificationsSupported) {
  try {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowBanner: true, shouldShowList: true, shouldPlaySound: false, shouldSetBadge: false,
      }),
    });
    void Notifications.setNotificationChannelAsync('default', {
      name: 'Organiza Aí', importance: Notifications.AndroidImportance.DEFAULT, sound: null,
    }).catch(() => undefined);
  } catch { /* Módulo nativo indisponível nesta build. */ }
}

export type PermissionState = 'granted' | 'denied' | 'undetermined' | 'unsupported';

export async function notificationPermission(): Promise<PermissionState> {
  if (!notificationsSupported) return 'unsupported';
  try {
    const current = await Notifications.getPermissionsAsync();
    if (current.granted) return 'granted';
    if (current.canAskAgain === false) return 'denied';
    const requested = await Notifications.requestPermissionsAsync();
    return requested.granted ? 'granted' : 'denied';
  } catch { return 'denied'; }
}

/** Consulta sem solicitar permissão; usado pela sincronização automática. */
export async function notificationPermissionSilent(): Promise<PermissionState> {
  if (!notificationsSupported) return 'unsupported';
  try {
    const current = await Notifications.getPermissionsAsync();
    if (current.granted) return 'granted';
    return current.canAskAgain === false ? 'denied' : 'undetermined';
  } catch { return 'denied'; }
}

export async function cancelAllReminders() {
  if (!notificationsSupported) return;
  try { await Notifications.cancelAllScheduledNotificationsAsync(); } catch { /* sem permissão/módulo */ }
}

/** Agenda no máximo 20 lembretes para tarefas abertas nos próximos 7 dias. */
export async function scheduleTaskReminders(tasks: Task[], leadMinutes: number): Promise<number> {
  if (!notificationsSupported) return 0;
  try {
    const now = Date.now();
    const today = dayKey();
    const limit = addDays(today, 7);
    const due = tasks.filter(task => task.status !== 'CONCLUIDA' && !!task.dataPrazo &&
      task.dataPrazo >= today && task.dataPrazo <= limit)
      .sort((a, b) => (a.dataPrazo || '').localeCompare(b.dataPrazo || ''));
    await Notifications.cancelAllScheduledNotificationsAsync();
    let scheduled = 0;
    for (const task of due.slice(0, 20)) {
      const minutes = timeToMinutes(task.detalhes?.horario || '') ?? 9 * 60;
      const [year, month, day] = task.dataPrazo!.split('-').map(Number);
      const date = new Date(year, month - 1, day, Math.floor(minutes / 60), minutes % 60, 0, 0);
      const at = date.getTime() - Math.max(0, leadMinutes) * 60000;
      if (at <= now) continue;
      await Notifications.scheduleNotificationAsync({
        content: { title: 'Tarefa se aproximando', body: task.titulo, data: { taskId: task.id } },
        trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: new Date(at) },
      });
      scheduled++;
    }
    return scheduled;
  } catch { return 0; }
}

export async function scheduleFocusEnd(endAt: number, taskTitle?: string): Promise<string | null> {
  if (!notificationsSupported || endAt <= Date.now()) return null;
  try {
    return await Notifications.scheduleNotificationAsync({
      content: { title: 'Sessão de foco concluída',
        body: taskTitle ? `Você focou em “${taskTitle}”. Faça uma pausa.` : 'Hora de fazer uma pausa.', data: { focus: true } },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: new Date(endAt) },
    });
  } catch { return null; }
}

export async function cancelReminder(id: string | null) {
  if (!notificationsSupported || !id) return;
  try { await Notifications.cancelScheduledNotificationAsync(id); } catch { /* já disparado */ }
}
