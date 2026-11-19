import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import Constants from 'expo-constants';
import {
  Badge, Button, Card, ErrorState, Input, Label, MetricCard, PremiumCard, Progress, Row, Screen,
  SectionHeader, ThemeToggle, ToggleRow,
} from '../../components/ui';
import { DataFeedback } from '../../components/DataFeedback';
import { useAuth } from '../../state/AuthProvider';
import { useData } from '../../state/DataProvider';
import { useFocus } from '../../state/FocusProvider';
import { useSettings } from '../../state/SettingsProvider';
import { tokens, useTheme } from '../../theme/ThemeProvider';
import { analytics } from '../../domain/tasks';
import { focusMinutes, initialFocus } from '../../domain/focus';
import { priorities, Priority } from '../../types/models';
import WeeklyChart from '../analytics/WeeklyChart';
import { exportJson } from '../../services/export';
import {
  cancelAllReminders, notificationPermission, notificationsSupported, scheduleTaskReminders,
} from '../../services/reminders';
import { dayKey } from '../../domain/dates';

export default function ProfileScreen() {
  const { session, logout, updateProfile } = useAuth();
  const { tasks, categories, habits, refresh } = useData();
  const { state, ready, update, busy, error: focusError } = useFocus();
  const { settings, plans, update: updateSettings, clearPlanDay, error: settingsError } = useSettings();
  const { preference, colors } = useTheme();
  const router = useRouter();
  const [taskGoal, setTaskGoal] = useState('3');
  const [focusGoal, setFocusGoal] = useState('50');
  const [lead, setLead] = useState(String(settings.notificationLeadMinutes));
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [nome, setNome] = useState(session?.nome ?? '');
  const [salvandoNome, setSalvandoNome] = useState(false);
  const [erroNome, setErroNome] = useState<string | null>(null);
  const [avisoNome, setAvisoNome] = useState<string | null>(null);

  useEffect(() => {
    if (ready) { setTaskGoal(String(state.goals.tasks)); setFocusGoal(String(state.goals.minutes)); }
  }, [ready, state.goals]);
  useEffect(() => { setLead(String(settings.notificationLeadMinutes)); }, [settings.notificationLeadMinutes]);
  useEffect(() => { setNome(session?.nome ?? ''); }, [session?.nome]);

  const salvarNome = async () => {
    const value = nome.trim();
    setErroNome(null); setAvisoNome(null);
    if (value.length < 2 || value.length > 100) {
      setErroNome('O nome deve ter entre 2 e 100 caracteres.'); return;
    }
    setSalvandoNome(true);
    try {
      await updateProfile(value);
      setAvisoNome('Nome atualizado com sucesso.');
    } catch (e) {
      setErroNome(e instanceof Error ? e.message : 'Não foi possível salvar seu nome.');
    } finally { setSalvandoNome(false); }
  };

  const a = analytics(tasks);
  const f = focusMinutes(state.sessions);
  const demo = session?.email.endsWith('@exposicao.invalid') ?? false;
  const version = Constants.expoConfig?.version || '3.2.0';

  const save = async () => {
    const count = Number(taskGoal), minutes = Number(focusGoal);
    if (!Number.isInteger(count) || count < 1 || count > 100 || !Number.isInteger(minutes) || minutes < 1 || minutes > 1440) {
      setError('Use de 1 a 100 tarefas e de 1 a 1440 minutos.'); return;
    }
    try { await update(current => ({ ...current, goals: { tasks: count, minutes } })); setError(null); setSaved(true); }
    catch { setError('Não foi possível salvar as metas.'); }
  };

  const toggleNotifications = async (value: boolean) => {
    try {
      setError(null);
      if (!value) {
        await updateSettings({ notificationsEnabled: false });
        await cancelAllReminders();
        return;
      }
      if (!notificationsSupported) { setError('Notificações locais não estão disponíveis na versão Web.'); return; }
      const permission = await notificationPermission();
      if (permission !== 'granted') {
        setError('Permissão de notificações não concedida. Ajuste nas configurações do sistema.'); return;
      }
      await updateSettings({ notificationsEnabled: true });
      await scheduleTaskReminders(tasks, Number(lead) || settings.notificationLeadMinutes);
    } catch { setError('Não foi possível atualizar as notificações.'); }
  };
  const saveLead = async () => {
    const value = Number(lead);
    if (!Number.isInteger(value) || value < 0 || value > 1440) { setError('Antecedência deve ficar entre 0 e 1440 minutos.'); return; }
    try { await updateSettings({ notificationLeadMinutes: value }); setError(null); }
    catch { setError('Não foi possível salvar a antecedência.'); }
  };
  const exportData = async () => {
    setExporting(true);
    try {
      await exportJson(`organiza-ai-${dayKey()}.json`, {
        exportedAt: new Date().toISOString(),
        user: { id: session?.id, nome: session?.nome, email: session?.email, server: session?.server },
        categories, tasks, habits,
        focus: { sessions: state.sessions, durations: state.durations, goals: state.goals },
        settings, plan: plans,
      });
      setError(null);
    } catch { setError('Não foi possível exportar os dados neste aparelho.'); }
    finally { setExporting(false); }
  };
  const resetDemo = async () => {
    setResetting(true);
    try {
      await update(() => ({ ...initialFocus }));
      await clearPlanDay(dayKey());
      await refresh();
      setError(null);
    } catch { setError('Não foi possível restaurar o cenário local.'); }
    finally { setResetting(false); }
  };

  return <Screen title="Seu espaço." subtitle="Uma rotina que combina com você."
    action={<Badge title={`v${version}`} tone="neutral" />}>
    <DataFeedback />
    <PremiumCard tone="primary">
      <Row style={{ flexWrap: 'nowrap' }}>
        <View style={{ width: 54, height: 54, borderRadius: 18, backgroundColor: colors.primarySoft,
          alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: `${colors.primary}33` }}>
          <Label size="title" weight="bold" style={{ color: colors.primary }}>
            {session?.nome.trim().slice(0, 1).toUpperCase()}
          </Label>
        </View>
        <View style={{ flex: 1, minWidth: 0 }}>
          <Label size="subtitle" weight="bold">{session?.nome}</Label>
          <Label muted size="caption">{session?.email}</Label>
          <Label muted size="micro">Sessão segura · API oficial com HTTPS</Label>
        </View>
        {demo ? <Badge title="DEMO" tone="warning" /> : null}
      </Row>
    </PremiumCard>

    <Card style={{ gap: tokens.space.sm }}>
      <Label size="subtitle">Dados pessoais</Label>
      <Input label="Nome" value={nome} onChangeText={value => { setNome(value); setAvisoNome(null); }}
        maxLength={100} autoComplete="name" placeholder="Seu nome" />
      <Label muted size="micro">E-mail de acesso: {session?.email}</Label>
      <ErrorState message={erroNome} />
      {avisoNome ? <Label size="caption" style={{ color: colors.success }}>{avisoNome}</Label> : null}
      <Button title="Salvar nome" icon="check" variant="secondary" loading={salvandoNome}
        onPress={() => { void salvarNome(); }} />
    </Card>

    <Row style={{ alignItems: 'stretch' }}>
      <MetricCard value={`${a.rate}%`} label="Tarefas concluídas" icon="check-circle" tone="success" />
      <MetricCard value={`${f.total} min`} label="Foco neste aparelho" icon="clock" tone="warning" />
      <MetricCard value={a.streak} label="Sequência produtiva" icon="zap" tone="primary" />
    </Row>

    <SectionHeader title="Atalhos" />
    <Row>
      <Button title="Hábitos" icon="repeat" variant="secondary" compact onPress={() => router.push('/habitos')} />
      <Button title="Revisão semanal" icon="bar-chart-2" variant="secondary" compact onPress={() => router.push('/revisao')} />
      <Button title="Lixeira" icon="trash-2" variant="secondary" compact onPress={() => router.push('/lixeira')} />
      <Button title="Categorias" icon="folder" variant="secondary" compact onPress={() => router.push('/categorias')} />
    </Row>

    <Card>
      <Label size="subtitle">Aparência</Label>
      <Label muted size="caption">Tema atual: {preference === 'system' ? 'sistema' : preference === 'dark' ? 'escuro' : 'claro'}.
        A preferência vale para este aparelho.</Label>
      <ThemeToggle />
    </Card>

    <Card style={{ gap: tokens.space.sm }}>
      <Label size="subtitle">Segurança</Label>
      <Label muted size="caption">Altere sua senha com confirmação da senha atual. Todas as sessões serão revogadas.</Label>
      <Button title="Alterar senha" icon="lock" variant="secondary" onPress={() => router.push('/seguranca')} />
    </Card>

    <Card>
      <Label size="subtitle">Notificações locais</Label>
      {notificationsSupported ? <>
        <ToggleRow label="Lembretes de tarefas" description="Avisos locais antes do prazo. Nenhum serviço de push é usado."
          value={settings.notificationsEnabled} onChange={value => { void toggleNotifications(value); }} />
        <Row style={{ alignItems: 'flex-end' }}>
          <View style={{ flex: 1, minWidth: 160 }}>
            <Input label="Antecedência (minutos)" keyboardType="number-pad" value={lead} maxLength={4}
              onChangeText={setLead} hint="Ex.: 30 minutos antes do horário." />
          </View>
          <Button title="Salvar" variant="secondary" compact onPress={() => { void saveLead(); }} />
        </Row>
        <Label muted size="micro">No Android, o sistema pode exigir permissão e canal de notificações.
          No iOS, o usuário pode limitar avisos. Sessões de foco agendam um aviso no horário de término.</Label>
      </> : <Label muted size="caption">Notificações locais estão disponíveis nas versões Android e iOS.
        Na versão Web, os lembretes ficam desativados.</Label>}
    </Card>

    <WeeklyChart days={a.week} />

    <Card>
      <Label size="subtitle">Distribuição por prioridade</Label>
      {(Object.keys(priorities) as Priority[]).map(priority => {
        const count = tasks.filter(task => task.prioridade === priority).length;
        return <React.Fragment key={priority}>
          <Row style={{ justifyContent: 'space-between' }}>
            <Label size="caption">{priorities[priority]}</Label>
            <Label muted size="micro">{count}</Label>
          </Row>
          <Progress value={tasks.length ? count / tasks.length * 100 : 0} label={`Tarefas de prioridade ${priorities[priority]}`} height={6} />
        </React.Fragment>;
      })}
    </Card>

    <Card>
      <Label size="subtitle">Por área da vida</Label>
      {[{ id: 0, nome: 'Sem categoria', cor: null }, ...categories].map(category => {
        const count = tasks.filter(task => (task.categoria?.id || 0) === category.id).length;
        return <React.Fragment key={category.id}>
          <Row style={{ justifyContent: 'space-between' }}>
            <Label size="caption">{category.nome}</Label>
            <Label muted size="micro">{count}</Label>
          </Row>
          <Progress value={tasks.length ? count / tasks.length * 100 : 0} label={`Tarefas em ${category.nome}`} height={6} />
        </React.Fragment>;
      })}
    </Card>

    <Card>
      <Label size="subtitle">Pequenas metas, progresso real</Label>
      <Row style={{ alignItems: 'flex-end' }}>
        <View style={{ flex: 1, minWidth: 140 }}>
          <Input label="Tarefas por dia" keyboardType="number-pad" value={taskGoal} maxLength={3}
            onChangeText={value => { setTaskGoal(value); setSaved(false); }} />
        </View>
        <View style={{ flex: 1, minWidth: 140 }}>
          <Input label="Minutos de foco por dia" keyboardType="number-pad" value={focusGoal} maxLength={4}
            onChangeText={value => { setFocusGoal(value); setSaved(false); }} />
        </View>
      </Row>
      <Button title="Salvar metas" icon="check" loading={busy} disabled={!ready} onPress={() => { void save(); }} />
      {saved ? <Label size="caption" style={{ color: colors.success }}>Metas salvas neste aparelho.</Label> : null}
    </Card>

    <Card>
      <Label size="subtitle">Seus dados</Label>
      <Label muted size="caption">Exporte um JSON com tarefas, categorias, hábitos, foco local, metas e preferências.
        A credencial de acesso nunca é incluída.</Label>
      <Button title="Exportar meus dados" icon="download" variant="secondary" loading={exporting}
        onPress={() => { void exportData(); }} />
    </Card>

    {demo ? <Card>
      <Row style={{ justifyContent: 'space-between' }}>
        <Label size="subtitle">Modo exposição</Label>
        <Badge title="Conta DEMO" tone="warning" />
      </Row>
      <Label muted size="caption">
        Esta conta usa o domínio reservado @exposicao.invalid. A restauração abaixo afeta apenas o foco e o plano
        salvos neste aparelho para esta conta; tarefas e hábitos permanecem no banco e podem ser recriados pelo
        script de seed local.
      </Label>
      <Label size="micro" muted>scripts/seed-demo.mjs --reset</Label>
      <Button title="Restaurar cenário local" icon="rotate-ccw" variant="secondary" loading={resetting}
        onPress={() => { void resetDemo(); }} />
      <Label muted size="micro">A operação é idempotente: repetir apenas devolve foco e plano ao estado inicial.</Label>
    </Card> : null}

    <Card>
      <Label size="subtitle">Acessibilidade e limites</Label>
      <Label muted size="caption">Áreas de toque de 48 px, rótulos de leitor de tela, contraste conferido nos dois temas,
        suporte a fonte ampliada do sistema e feedback textual em todas as ações. Não há animações contínuas.</Label>
      <Label muted size="caption">Foco e metas são locais por conta e servidor; não sincronizam entre aparelhos.
        Tarefas, categorias, checklist, recorrência e hábitos dependem do backend. Não há modo offline completo.</Label>
    </Card>

    <ErrorState message={error || focusError || settingsError} />
    <Button title="Sair da minha conta" variant="danger" icon="log-out" loading={leaving} onPress={() => {
      setLeaving(true);
      void logout().catch(() => setError('Não foi possível limpar a sessão neste aparelho. Tente novamente.'))
        .finally(() => setLeaving(false));
    }} />
    <Label muted size="micro" style={{ textAlign: 'center', marginTop: tokens.space.sm }}>
      Organiza Aí · Premium Experience · {habits.length} hábito(s) sincronizado(s)
    </Label>
  </Screen>;
}
