import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from './AuthProvider';
import { request } from '../services/api';
import { Planejamento, PlanejamentoItem } from '../types/models';
import { dayKey } from '../domain/dates';

export interface Settings {
  availabilityMinutes: number;
  dayStart: string;
  notificationLeadMinutes: number;
  notificationsEnabled: boolean;
}
export const defaultSettings: Settings = {
  availabilityMinutes: 240, dayStart: '08:00', notificationLeadMinutes: 30, notificationsEnabled: false,
};
interface PlanPreferences { accepted: Record<string, number[]>; dismissed: Record<string, number[]> }
const emptyPlans: PlanPreferences = { accepted: {}, dismissed: {} };

interface SettingsValue {
  settings: Settings; plans: PlanPreferences; ready: boolean; error: string | null;
  update: (patch: Partial<Settings>) => Promise<void>;
  acceptPlan: (date: string, ids: number[]) => Promise<void>;
  dismissSuggestion: (date: string, id: number) => Promise<void>;
  clearPlanDay: (date: string) => Promise<void>;
  syncPlan: (date: string) => Promise<void>;
}
const Context = createContext<SettingsValue>(null!);

export function clampSettings(value: Partial<Settings>): Settings {
  const minutes = Number(value.availabilityMinutes);
  const lead = Number(value.notificationLeadMinutes);
  return {
    availabilityMinutes: Number.isFinite(minutes) ? Math.max(30, Math.min(1440, Math.round(minutes))) : defaultSettings.availabilityMinutes,
    dayStart: /^([01]\d|2[0-3]):[0-5]\d$/.test(value.dayStart || '') ? value.dayStart! : defaultSettings.dayStart,
    notificationLeadMinutes: Number.isFinite(lead) ? Math.max(0, Math.min(1440, Math.round(lead))) : defaultSettings.notificationLeadMinutes,
    notificationsEnabled: value.notificationsEnabled === true,
  };
}

export function SettingsProvider({ children }: React.PropsWithChildren) {
  const { session } = useAuth();
  const settingsKey = 'organiza.settings.v1';
  const planKey = useMemo(() => `organiza.plan.v1:${session?.server}:${session?.id}`, [session?.server, session?.id]);
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [plans, setPlans] = useState<PlanPreferences>(emptyPlans);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    Promise.all([AsyncStorage.getItem(settingsKey), AsyncStorage.getItem(planKey)])
      .then(([rawSettings, rawPlans]) => {
        if (!alive) return;
        if (rawSettings) {
          try { setSettings(clampSettings({ ...defaultSettings, ...JSON.parse(rawSettings) })); }
          catch { setError('Preferências locais inválidas foram ignoradas.'); }
        }
        if (rawPlans) {
          try {
            const parsed = JSON.parse(rawPlans) as PlanPreferences;
            if (parsed && typeof parsed === 'object' && parsed.accepted && parsed.dismissed)
              setPlans({ accepted: parsed.accepted, dismissed: parsed.dismissed });
          } catch { setError('Plano local inválido foi ignorado.'); }
        }
      })
      .catch(() => setError('Não foi possível ler as preferências deste aparelho.'))
      .finally(() => { if (alive) setReady(true); });
    return () => { alive = false; };
  }, [planKey]);

  const persist = useCallback(async (key: string, value: unknown) => {
    try { await AsyncStorage.setItem(key, JSON.stringify(value)); }
    catch { setError('Não foi possível gravar as preferências neste aparelho.'); throw new Error('Falha ao gravar preferências.'); }
  }, []);

  const update = async (patch: Partial<Settings>) => {
    const next = clampSettings({ ...settings, ...patch });
    await persist(settingsKey, next);
    setSettings(next); setError(null);
  };
  const savePlans = async (next: PlanPreferences) => {
    await persist(planKey, next); setPlans(next); setError(null);
  };
  // Centraliza o plano no backend (fonte de verdade). Em falha, o plano permanece local.
  const pushRemotePlan = useCallback(async (date: string, ids: number[]) => {
    if (!session) return;
    try {
      const atual = await request<Planejamento>(session.server,
        `/produtividade/planejamento?data=${encodeURIComponent(date)}`, {}, session.token);
      const itens: PlanejamentoItem[] = ids.map((id, ordem) => ({ tarefaId: id, ordem, minutosEstimados: 30 }));
      await request<Planejamento>(session.server, '/produtividade/planejamento',
        { method: 'PUT', body: JSON.stringify({ data: date, itens, versao: atual?.versao ?? 0 }) }, session.token);
    } catch { /* mantém local */ }
  }, [session]);
  // Sincroniza o plano de uma data com o backend (fonte de verdade), sem sobrescrever ao falhar.
  const syncPlan = useCallback(async (date: string) => {
    if (!session) return;
    try {
      const remote = await request<Planejamento>(session.server,
        `/produtividade/planejamento?data=${encodeURIComponent(date)}`, {}, session.token);
      if (remote && remote.id != null) {
        const ids = remote.itens.map(item => item.tarefaId);
        setPlans(prev => ({ ...prev, accepted: { ...prev.accepted, [date]: ids } }));
      }
    } catch { /* mantém local */ }
  }, [session]);
  // Ao ficar pronto, sincroniza o plano de hoje vindo de outro aparelho.
  useEffect(() => { if (ready) { void syncPlan(dayKey()); } }, [ready, syncPlan]);
  const acceptPlan = async (date: string, ids: number[]) => {
    const unique = [...new Set(ids)];
    await savePlans({ ...plans, accepted: { ...plans.accepted, [date]: unique } });
    void pushRemotePlan(date, unique);
  };
  const dismissSuggestion = async (date: string, id: number) => {
    const current = plans.dismissed[date] || [];
    if (current.includes(id)) return;
    await savePlans({ ...plans, dismissed: { ...plans.dismissed, [date]: [...current, id] } });
  };
  const clearPlanDay = async (date: string) => {
    const accepted = { ...plans.accepted }; delete accepted[date];
    const dismissed = { ...plans.dismissed }; delete dismissed[date];
    await savePlans({ accepted, dismissed });
    void pushRemotePlan(date, []);
  };

  return <Context.Provider value={{ settings, plans, ready, error, update, acceptPlan, dismissSuggestion, clearPlanDay, syncPlan }}>
    {children}
  </Context.Provider>;
}
export const useSettings = () => useContext(Context);
