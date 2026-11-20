import { useEffect, useRef } from 'react';
import { AppState } from 'react-native';

import { shouldRevalidate } from '../domain/revalidate';
import { useData } from '../state/DataProvider';

/**
 * Atualiza os dados quando o app volta ao primeiro plano (outro dispositivo pode ter mudado algo).
 * A atualização é limitada por tempo e não interfere em operações em andamento.
 */
export function RevalidateOnActive() {
  const { refresh, busy } = useData();
  const last = useRef(0);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => {
      if (state !== 'active') return;
      const now = Date.now();
      if (busy || !shouldRevalidate(last.current, now)) return;
      last.current = now;
      void refresh();
    });
    return () => subscription.remove();
  }, [refresh, busy]);

  return null;
}
