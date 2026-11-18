import React, { useMemo } from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import Feather from '@expo/vector-icons/Feather';
import {
  Badge, Button, EmptyState, FloatingActionButton, IconButton, Label, MetricCard, PremiumCard, Progress,
  ProgressRing, QuickAction, Row, Screen, SectionHeader, SmartSuggestionCard,
} from '../../components/ui';
import { DataFeedback } from '../../components/DataFeedback';
import { useAuth } from '../../state/AuthProvider';
import { useData } from '../../state/DataProvider';
import { useFocus } from '../../state/FocusProvider';
import { useSettings } from '../../state/SettingsProvider';
import { analytics, isDueToday, sortTasks } from '../../domain/tasks';
import { dayKey, formatLongDate } from '../../domain/dates';
import { focusMinutes } from '../../domain/focus';
import { planDay } from '../../domain/planning';
import { habitStreak, isDoneOn, weeklyProgress } from '../../domain/habits';
import TaskCard from '../tasks/TaskCard';
import WeeklyChart from '../analytics/WeeklyChart';
import { tokens, useTheme } from '../../theme/ThemeProvider';

export default function DashboardScreen() {
  const { session } = useAuth();
  const { tasks, habits, habitsAvailable, loading, loaded, refresh, mutate, busy } = useData();
  const { state } = useFocus();
  const { settings, plans, acceptPlan, dismissSuggestion } = useSettings();
  const { colors } = useTheme();
  const router = useRouter();
  const today = dayKey();
  const a = analytics(tasks, today);
  const minutes = focusMinutes(state.sessions, today);
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite';
  const firstName = session?.nome.split(' ')[0] || 'você';

  const plan = useMemo(() => planDay(tasks, today, settings.availabilityMinutes), [tasks, today, settings.availabilityMinutes]);
  const accepted = plans.accepted[today] || [];
  const dismissed = plans.dismissed[today] || [];
  const suggestion = plan.items.find(item => !accepted.includes(item.task.id) && !dismissed.includes(item.task.id));

  const todayTasks = sortTasks(tasks.filter(task => isDueToday(task, today)));
  const upcoming = sortTasks(tasks.filter(task => task.status !== 'CONCLUIDA' && !!task.dataPrazo &&
    task.dataPrazo > today && task.dataPrazo <= dayKey(new Date(Date.now() + 7 * 86400000)))).slice(0, 3);
  const activeHabits = habits.filter(habit => habit.ativo).slice(0, 4);
  const dailyPercent = a.today ? Math.round(a.todayDone / a.today * 100) : (a.completedToday ? 100 : 0);

  const toggleHabit = (id: number, date: string, done: boolean) => {
    void mutate(api => api.setHabitRecord(id, date, done), done ? 'Hábito registrado.' : 'Registro removido.')
      .catch(() => undefined);
  };

  if (!loaded) {
    return <Screen title={`${greeting}, ${firstName}.`} subtitle="Preparando sua visão do dia.">
      <DataFeedback /><EmptyState title="Organizando seu dia" detail="Carregando tarefas, categorias e hábitos." icon="loader" />
    </Screen>;
  }

  return <Screen
    title={`${greeting}, ${firstName}.`}
    subtitle={formatLongDate(today)}
    refreshing={loading} onRefresh={() => { void refresh(); }}
    action={<IconButton icon="settings" label="Abrir perfil e preferências" onPress={() => router.push('/perfil')} />}
    fab={<FloatingActionButton label="Nova tarefa" onPress={() => router.push('/novaTarefa')} bottom={16} />}>
    <DataFeedback />

    <PremiumCard tone="primary" style={{ padding: tokens.space.xl }}>
      <Row style={{ justifyContent: 'space-between', flexWrap: 'nowrap', alignItems: 'center' }}>
        <View style={{ flex: 1, gap: tokens.space.sm, minWidth: 180 }}>
          <Badge title="UM PASSO DE CADA VEZ" tone="primary" />
          <Label size="title">Seu dia, com mais intenção.</Label>
          <Label muted size="caption">
            {a.today ? `${a.todayDone} de ${a.today} tarefas com prazo hoje estão concluídas.`
              : 'Sua agenda de hoje está livre. Que tal planejar o próximo passo?'}
          </Label>
          <Row>
            <Button title="Planejar meu dia" icon="calendar" compact onPress={() => router.push('/planejamento')} />
            <Button title="Focar agora" icon="play" variant="soft" compact onPress={() => router.push('/foco')} />
          </Row>
        </View>
        <ProgressRing size={116} stroke={10} value={dailyPercent} label="Progresso das tarefas com prazo hoje">
          <Label size="title" weight="bold">{dailyPercent}%</Label>
          <Label muted size="micro">hoje</Label>
        </ProgressRing>
      </Row>
    </PremiumCard>

    <Row style={{ alignItems: 'stretch' }}>
      <MetricCard value={a.pending} label="Em aberto" icon="circle" tone="primary" />
      <MetricCard value={a.done} label="Concluídas" icon="check-circle" tone="success" />
      <MetricCard value={a.overdue} label="Atrasadas" icon="alert-circle" tone="danger" />
      <MetricCard value={`${minutes.today} min`} label="Foco hoje" icon="clock" tone="warning" />
    </Row>

    <SectionHeader title="Próxima melhor ação" subtitle="Sugestão determinística, sem alterar suas tarefas."
      action={<Button title="Ver plano" variant="ghost" compact onPress={() => router.push('/planejamento')} />} />
    {suggestion ? <SmartSuggestionCard
      title={suggestion.task.titulo}
      detail={suggestion.reasons.join(' · ') + `. Estimativa: ${suggestion.minutes} min.`}
      meta={`Prioridade ${suggestion.task.prioridade.toLowerCase()}${suggestion.task.dataPrazo ? ` · prazo ${suggestion.task.dataPrazo}` : ''}`}
      accepted={accepted.includes(suggestion.task.id)}
      onAccept={() => { void acceptPlan(today, [...accepted, suggestion.task.id]).catch(() => undefined); }}
      onDismiss={() => { void dismissSuggestion(today, suggestion.task.id).catch(() => undefined); }}
    /> : <PremiumCard style={{ alignItems: 'center', gap: 6 }}>
      <Feather name="sun" size={22} color={colors.primary} />
      <Label weight="semibold">Nada urgente para hoje</Label>
      <Label muted size="caption" style={{ textAlign: 'center' }}>
        Sem sugestões pendentes. Você pode revisar o plano ou descansar com tranquilidade.
      </Label>
    </PremiumCard>}

    <Row>
      <QuickAction icon="plus" label="Nova tarefa" onPress={() => router.push('/novaTarefa')} />
      <QuickAction icon="repeat" label="Hábitos" tone="success" onPress={() => router.push('/habitos')} />
      <QuickAction icon="bar-chart-2" label="Revisão" tone="warning" onPress={() => router.push('/revisao')} />
      <QuickAction icon="grid" label="Matriz" tone="danger" onPress={() => router.push('/planejamento')} />
    </Row>

    <SectionHeader title="Agenda do dia" subtitle={todayTasks.length ? `${todayTasks.length} tarefa(s) com prazo hoje` : undefined}
      action={<Button title="Ver tarefas" variant="ghost" compact onPress={() => router.push('/tarefas')} />} />
    {todayTasks.length ? todayTasks.slice(0, 4).map(task => <TaskCard key={task.id} task={task} />) :
      <EmptyState title="Espaço para o que importa" detail="Nenhuma tarefa com prazo hoje. Crie uma ou antecipe o próximo passo."
        icon="coffee" action={<Button title="Criar tarefa" icon="plus" compact variant="soft" onPress={() => router.push('/novaTarefa')} />} />}

    {habitsAvailable && activeHabits.length > 0 ? <>
      <SectionHeader title="Hábitos de hoje" subtitle="Constância importa mais que intensidade."
        action={<Button title="Todos" variant="ghost" compact onPress={() => router.push('/habitos')} />} />
      <PremiumCard style={{ gap: tokens.space.xs }}>
        {activeHabits.map(habit => {
          const done = isDoneOn(habit, today);
          const progress = weeklyProgress(habit, today);
          return <Row key={habit.id} style={{ flexWrap: 'nowrap', justifyContent: 'space-between' }}>
            <Row style={{ flexWrap: 'nowrap', flex: 1 }}>
              <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: habit.cor || colors.primary }} />
              <View style={{ flex: 1 }}>
                <Label weight="semibold" numberOfLines={1}>{habit.nome}</Label>
                <Label muted size="micro">
                  {habitStreak(habit, today)} sequência · {progress.count}/{progress.target} na semana
                </Label>
              </View>
            </Row>
            <Button title={done ? 'Feito' : 'Marcar'} icon={done ? 'check' : 'plus'} compact
              variant={done ? 'secondary' : 'soft'} disabled={busy}
              onPress={() => toggleHabit(habit.id, today, !done)} />
          </Row>;
        })}
      </PremiumCard>
    </> : null}

    <WeeklyChart days={a.week} />

    <Row style={{ alignItems: 'stretch' }}>
      <MetricCard value={`${a.rate}%`} label="Conclusão geral" icon="pie-chart" tone="success" />
      <MetricCard value={a.streak} label="Dias produtivos seguidos" icon="zap" tone="warning" />
      <MetricCard value={a.checklistPending} label="Checklists em aberto" icon="list" tone="primary" />
    </Row>

    <PremiumCard>
      <Row style={{ justifyContent: 'space-between' }}>
        <Label size="title">Suas metas de hoje</Label>
        <Button title="Ajustar" variant="ghost" compact onPress={() => router.push('/perfil')} />
      </Row>
      <View style={{ gap: 4 }}>
        <Row style={{ justifyContent: 'space-between' }}>
          <Label muted size="caption">Tarefas concluídas</Label>
          <Label size="caption" weight="semibold">{a.completedToday}/{state.goals.tasks}</Label>
        </Row>
        <Progress value={a.completedToday / state.goals.tasks * 100} label="Meta diária de tarefas" tone="success" />
      </View>
      <View style={{ gap: 4 }}>
        <Row style={{ justifyContent: 'space-between' }}>
          <Label muted size="caption">Minutos de foco</Label>
          <Label size="caption" weight="semibold">{minutes.today}/{state.goals.minutes}</Label>
        </Row>
        <Progress value={minutes.today / state.goals.minutes * 100} label="Meta diária de foco" tone="warning" />
      </View>
    </PremiumCard>

    {upcoming.length > 0 ? <>
      <SectionHeader title="No horizonte" subtitle="Próximos sete dias" />
      {upcoming.map(task => <TaskCard key={task.id} task={task} compact />)}
    </> : null}

    <Row>
      <Button title="Minhas categorias" icon="folder" variant="secondary" compact onPress={() => router.push('/categorias')} />
      <Button title="Lixeira" icon="trash-2" variant="secondary" compact onPress={() => router.push('/lixeira')} />
    </Row>
  </Screen>;
}
