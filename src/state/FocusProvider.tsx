import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppState } from 'react-native';
import { decodeFocus, FocusState, initialFocus, mergeFocusSessions, recoverFocus, RemoteFocusSession } from '../domain/focus';
import { request } from '../services/api';
import { dayKey } from '../domain/dates';
import { useAuth } from './AuthProvider';

interface Focus {
  state: FocusState; now: number; ready: boolean; busy: boolean; error: string | null;
  update: (fn: (current: FocusState) => FocusState) => Promise<void>;
  syncSessions: () => Promise<void>;
}
const Context = createContext<Focus>(null!);
export function FocusProvider({ children }: React.PropsWithChildren) {
  const { session } = useAuth();
  const key = `organiza.focus.v2:${session!.server}:${session!.id}`;
  const [state, setState] = useState<FocusState>(initialFocus);
  const current = useRef(state);
  const [now, setNow] = useState(Date.now());
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const lock = useRef(false);
  const sentRemote = useRef<Set<string>>(new Set());
  const syncSessions = useCallback(async () => {
    try {
      const remote = await request<RemoteFocusSession[]>(session!.server,
        `/produtividade/foco?data=${dayKey()}`, {}, session!.token);
      // Reconstrói a partir das sessões locais (sem cópias remotas antigas) + remotas deduplicadas.
      const locais = current.current.sessions.filter(s => !s.id.startsWith('r'));
      const merged = { ...current.current, sessions: mergeFocusSessions(locais, remote) };
      current.current = merged; setState(merged);
      await AsyncStorage.setItem(key, JSON.stringify(merged));
    } catch { /* sem conexão: mantém o histórico local */ }
  }, [session, key]);
  useEffect(() => {
    let alive = true;
    AsyncStorage.getItem(key).then(async raw => {
      const parsed = decodeFocus(raw);
      const recovered = recoverFocus(parsed, Date.now());
      if (recovered !== parsed) await AsyncStorage.setItem(key, JSON.stringify(recovered));
      if (alive) { current.current = recovered; setState(recovered); setReady(true); await syncSessions(); }
    }).catch(e => { if (alive) setError(e instanceof Error ? e.message : 'Falha ao recuperar o foco local.'); });
    return () => { alive = false; };
  }, [key, session, syncSessions]);
  // Envia ao backend cada sessão concluída (idempotente: marca antes de enviar e reverte em falha).
  useEffect(() => {
    const toPush = state.sessions.filter(s => !s.id.startsWith('r') && !sentRemote.current.has(s.id));
    for (const s of toPush) {
      sentRemote.current.add(s.id);
      const minutos = Math.max(1, Math.round(s.duration / 60000));
      void request(session!.server, '/produtividade/foco',
        { method: 'POST', body: JSON.stringify({ minutos, tarefaId: s.taskId, data: dayKey(new Date(s.completedAt)) }) },
        session!.token).catch(() => { sentRemote.current.delete(s.id); });
    }
  }, [state.sessions, session]);
  const update = async (fn: (value: FocusState) => FocusState) => {
    if (!ready || lock.current) throw new Error('Aguarde a gravação local.');
    lock.current = true; setBusy(true);
    try {
      const next = fn(recoverFocus(current.current, Date.now()));
      await AsyncStorage.setItem(key, JSON.stringify(next));
      current.current = next; setState(next); setError(null);
    } catch (e) {
      setError('Não foi possível gravar o foco neste aparelho. Tente novamente.'); throw e;
    } finally { lock.current = false; setBusy(false); }
  };
  useEffect(() => {
    const tick = () => {
      const time = Date.now();
      // Sem sessão ativa não há contagem para atualizar; evita re-render global ocioso.
      if (current.current.timer) setNow(time);
      if (!ready || lock.current) return;
      const recovered = recoverFocus(current.current, time);
      if (recovered !== current.current) {
        lock.current = true;
        AsyncStorage.setItem(key, JSON.stringify(recovered)).then(() => {
          current.current = recovered; setState(recovered); setError(null);
        }).catch(() => setError('Sessão encerrada, mas a gravação local falhou. Mantenha o app aberto para tentar novamente.'))
          .finally(() => { lock.current = false; });
      }
    };
    const interval = setInterval(tick, 1000);
    const subscription = AppState.addEventListener('change', s => { if (s === 'active') tick(); });
    return () => { clearInterval(interval); subscription.remove(); };
  }, [key, ready]);
  return <Context.Provider value={{ state, now, ready, busy, error, update, syncSessions }}>{children}</Context.Provider>;
}
export const useFocus = () => useContext(Context);
