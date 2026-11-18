import { useEffect, useRef } from 'react';
import { useData } from '../../state/DataProvider';
import { useSettings } from '../../state/SettingsProvider';
import { cancelAllReminders, notificationPermissionSilent, notificationsSupported, scheduleTaskReminders } from '../../services/reminders';

/** Mantém os lembretes locais alinhados às tarefas e preferências. */
export function ReminderSync() {
  const { tasks, loaded } = useData();
  const { settings } = useSettings();
  const previous = useRef<boolean | null>(null);

  useEffect(() => {
    if (!loaded || !notificationsSupported) return;
    if (!settings.notificationsEnabled) {
      if (previous.current === true) { void cancelAllReminders(); previous.current = false; }
      return;
    }
    previous.current = true;
    let alive = true;
    void notificationPermissionSilent().then(state => {
      if (!alive || state !== 'granted') return;
      return scheduleTaskReminders(tasks, settings.notificationLeadMinutes);
    }).catch(() => undefined);
    return () => { alive = false; };
  }, [tasks, loaded, settings.notificationsEnabled, settings.notificationLeadMinutes]);

  return null;
}
