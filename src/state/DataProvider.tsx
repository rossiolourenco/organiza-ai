import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { View } from 'react-native';
import { Api, ApiError, isNetworkError } from '../services/api';
import { Category, Habit, Task } from '../types/models';
import { useAuth } from './AuthProvider';
import { Toast } from '../components/ui';

export interface Notice {
  message: string;
  actionLabel?: string;
  action?: () => Promise<void>;
}
interface Data {
  tasks: Task[]; categories: Category[]; habits: Habit[]; habitsAvailable: boolean;
  loading: boolean; loaded: boolean; busy: boolean; online: boolean | null;
  error: string | null; notice: Notice | null; api: Api;
  refresh: () => Promise<void>;
  mutate: <T>(operation: (api: Api) => Promise<T>, message: string,
    undo?: (api: Api) => Promise<unknown>) => Promise<T>;
  clearNotice: () => void;
  runNoticeAction: () => Promise<void>;
}
const Context = createContext<Data>(null!);

export function DataProvider({ children }: React.PropsWithChildren) {
  const { session, expire } = useAuth();
  const api = useMemo(() => new Api(session!, () => expire(session!.token)), [session, expire]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [habitsAvailable, setHabitsAvailable] = useState(true);
  const [loading, setLoading] = useState(true);
  const [loaded, setLoaded] = useState(false);
  const [busy, setBusy] = useState(false);
  const [online, setOnline] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<Notice | null>(null);
  useEffect(() => {
    if (!notice) return;
    const timeout = setTimeout(() => setNotice(null), notice.action ? 9000 : 6000);
    return () => clearTimeout(timeout);
  }, [notice]);
  const lock = useRef(false);
  const generation = useRef(0);

  const refresh = useCallback(async () => {
    const version = ++generation.current;
    setLoading(true);
    try {
      const [t, c] = await Promise.all([api.tasks(), api.categories()]);
      if (!Array.isArray(t) || !Array.isArray(c)) throw new Error('Resposta inesperada do servidor.');
      let h: Habit[] = [];
      let available = true;
      try {
        h = await api.habits();
        if (!Array.isArray(h)) { h = []; available = false; }
      } catch (habitError) {
        // Backend anterior à 3.0 ainda funciona: hábitos ficam indisponíveis, não derrubam o app.
        if (habitError instanceof ApiError && habitError.status === 404) { h = []; available = false; }
        else throw habitError;
      }
      if (generation.current === version) {
        setTasks(t); setCategories(c); setHabits(h); setHabitsAvailable(available);
        setError(null); setLoaded(true); setOnline(true);
      }
    } catch (e) {
      if (generation.current === version) {
        setError(e instanceof Error ? e.message : 'Falha ao atualizar os dados.');
        if (isNetworkError(e)) setOnline(false);
      }
    } finally { if (generation.current === version) setLoading(false); }
  }, [api]);
  useEffect(() => {
    const counter = generation;
    void refresh();
    return () => { counter.current++; };
  }, [refresh]);

  const mutate = async <T,>(operation: (api: Api) => Promise<T>, message: string,
    undo?: (api: Api) => Promise<unknown>): Promise<T> => {
    if (lock.current) throw new Error('Aguarde a operação em andamento.');
    lock.current = true; setBusy(true); setNotice(null); generation.current++;
    try {
      const result = await operation(api);
      await refresh();
      setNotice({ message, actionLabel: undo ? 'Desfazer' : undefined,
        action: undo ? async () => { await undo(api); await refresh(); } : undefined });
      return result;
    } catch (e) {
      if (isNetworkError(e)) setOnline(false);
      throw e;
    } finally { lock.current = false; setBusy(false); }
  };

  const runNoticeAction = async () => {
    const action = notice?.action;
    if (!action || lock.current) return;
    lock.current = true; setBusy(true);
    try {
      await action();
      setNotice({ message: 'Ação desfeita.' });
    } catch (e) {
      setNotice({ message: e instanceof Error ? e.message : 'Não foi possível desfazer.' });
    } finally { lock.current = false; setBusy(false); }
  };

  return <Context.Provider value={{ tasks, categories, habits, habitsAvailable, loading, loaded, busy,
    online, error, notice, api, refresh, mutate, clearNotice: () => setNotice(null), runNoticeAction }}>
    <View style={{ flex: 1 }}>{children}
      <Toast notice={notice} onDismiss={() => setNotice(null)} onAction={() => { void runNoticeAction(); }} />
    </View>
  </Context.Provider>;
}
export const useData = () => useContext(Context);
