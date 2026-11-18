import React, { useMemo, useState } from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import Feather from '@expo/vector-icons/Feather';
import {
  Badge, Button, EmptyState, Label, MetricCard, PremiumCard, Progress, Row, Screen, SectionHeader,
} from '../../components/ui';
import { DataFeedback } from '../../components/DataFeedback';
import { useData } from '../../state/DataProvider';
import { useFocus } from '../../state/FocusProvider';
import { weekReview } from '../../domain/review';
import { addDays, dayKey, localDate, weekStart } from '../../domain/dates';
import WeeklyChart from '../analytics/WeeklyChart';
import { tokens, useTheme } from '../../theme/ThemeProvider';

export default function WeeklyReviewScreen() {
  const { tasks, habits, habitsAvailable, loading, refresh } = useData();
  const { state } = useFocus();
  const { colors } = useTheme();
  const router = useRouter();
  const today = dayKey();
  const [weekOf, setWeekOf] = useState(weekStart(today));
  const review = useMemo(() => weekReview(tasks, state.sessions, habits, weekOf, state.goals, today),
    [tasks, state.sessions, state.goals, habits, weekOf, today]);
  const isCurrent = weekOf === weekStart(today);
  const weekDays = Array.from({ length: 7 }, (_, index) => {
    const date = addDays(weekOf, index);
    return { date, count: tasks.filter(task => (task.conclusoes || []).some(value => dayKey(new Date(value)) === date)).length };
  });
  const label = `${localDate(review.start).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })} – ${localDate(review.end).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}`;

  return <Screen title="Sua semana em perspectiva." subtitle="Dados reais, sem estimativas inventadas."
    refreshing={loading} onRefresh={() => { void refresh(); }} onBack={() => router.back()}>
    <DataFeedback />
    <Row style={{ justifyContent: 'space-between' }}>
      <Button title="Semana anterior" icon="chevron-left" variant="secondary" compact
        onPress={() => setWeekOf(addDays(weekOf, -7))} />
      <View style={{ alignItems: 'center' }}>
        <Label weight="bold">{isCurrent ? 'Esta semana' : 'Semana'}</Label>
        <Label muted size="micro">{label}</Label>
      </View>
      <Button title="Próxima" icon="chevron-right" variant="secondary" compact disabled={isCurrent}
        onPress={() => setWeekOf(addDays(weekOf, 7))} />
    </Row>

    <Row style={{ alignItems: 'stretch' }}>
      <MetricCard value={review.completed} label="Concluídas" icon="check-circle" tone="success"
        hint={review.delta === 0 ? 'Igual à anterior' : `${review.delta > 0 ? '+' : ''}${review.delta} vs. anterior`} />
      <MetricCard value={review.pendingNow} label="Pendentes agora" icon="circle" tone="primary" />
      <MetricCard value={review.overdueNow} label="Atrasadas" icon="alert-circle" tone="danger" />
      <MetricCard value={`${review.rate}%`} label="Conclusão da semana" icon="pie-chart" tone="warning" />
    </Row>

    <PremiumCard>
      <Row style={{ justifyContent: 'space-between' }}>
        <Label size="subtitle" weight="bold">Prazos da semana</Label>
        <Badge title={`${review.completedDueInWeek}/${review.dueInWeek}`} tone="primary" />
      </Row>
      <Progress value={review.rate} label="Conclusão das tarefas com prazo na semana" />
      <Label muted size="micro">
        Fórmula: tarefas com prazo na semana concluídas ÷ tarefas com prazo na semana.
      </Label>
    </PremiumCard>

    <WeeklyChart days={weekDays} />

    <PremiumCard>
      <Row style={{ justifyContent: 'space-between' }}>
        <Label size="subtitle" weight="bold">Tempo de foco</Label>
        <Badge title={review.focusDelta >= 0 ? `+${review.focusDelta} min` : `${review.focusDelta} min`}
          tone={review.focusDelta >= 0 ? 'success' : 'warning'} icon="trending-up" />
      </Row>
      <Row style={{ alignItems: 'stretch' }}>
        <MetricCard value={`${review.focusMinutes} min`} label="Nesta semana" icon="clock" tone="primary" />
        <MetricCard value={`${review.focusPrevious} min`} label="Semana anterior" icon="rotate-ccw" tone="neutral" />
        <MetricCard value={`${review.goals.focus} min`} label="Meta semanal" icon="target" tone="warning" />
      </Row>
      <Progress value={review.goals.focus ? review.focusMinutes / review.goals.focus * 100 : 0}
        label="Meta semanal de foco" tone={review.goals.focusAchieved ? 'success' : 'primary'} />
      <Label muted size="micro">O histórico de foco é local deste aparelho e desta conta.</Label>
    </PremiumCard>

    <SectionHeader title="Onde seu tempo foi" subtitle="Categorias das tarefas concluídas na semana" />
    {review.topCategories.length ? review.topCategories.map(category => <Row key={category.name}
      style={{ justifyContent: 'space-between', flexWrap: 'nowrap' }}>
      <Row style={{ flexWrap: 'nowrap' }}>
        <View style={{ width: 9, height: 9, borderRadius: 5, backgroundColor: category.color || colors.primary }} />
        <Label size="caption">{category.name}</Label>
      </Row>
      <Badge title={`${category.count} tarefa(s)`} tone="neutral" />
    </Row>) : <EmptyState title="Sem conclusões nesta semana" detail="Conclua tarefas para ver a distribuição por área." icon="pie-chart" />}

    <SectionHeader title="Hábitos" subtitle={habitsAvailable ? 'Progresso contra a meta semanal' : 'Indisponíveis neste backend'} />
    {review.habits.length ? review.habits.map(habit => <View key={habit.id} style={{ gap: 4 }}>
      <Row style={{ justifyContent: 'space-between' }}>
        <Label size="caption">{habit.nome}</Label>
        <Label muted size="micro">{habit.count}/{habit.target}{habit.achieved ? ' · meta atingida' : ''}</Label>
      </Row>
      <Progress value={habit.count / habit.target * 100} label={`Meta de ${habit.nome}`}
        tone={habit.achieved ? 'success' : 'primary'} height={6} />
    </View>) : <Label muted size="caption">Nenhum hábito cadastrado.</Label>}

    <PremiumCard>
      <Label size="subtitle" weight="bold">Metas pessoais</Label>
      <Row style={{ justifyContent: 'space-between' }}>
        <Label muted size="caption">Dias com meta de tarefas atingida</Label>
        <Label size="caption" weight="semibold">{review.goals.daysMet} dia(s)</Label>
      </Row>
      <Row style={{ justifyContent: 'space-between' }}>
        <Label muted size="caption">Hábitos com meta cumprida</Label>
        <Label size="caption" weight="semibold">{review.goals.habitsAchieved}/{review.habits.length}</Label>
      </Row>
      <Row style={{ justifyContent: 'space-between' }}>
        <Label muted size="caption">Meta semanal de foco</Label>
        <Label size="caption" weight="semibold">{review.goals.focusAchieved ? 'Atingida' : 'Em andamento'}</Label>
      </Row>
      <Label muted size="micro">Meta de tarefas por dia: {review.goals.tasks} · meta de foco: {state.goals.minutes} min/dia.</Label>
    </PremiumCard>

    <SectionHeader title="Recomendações por regras" subtitle="Geradas apenas a partir dos dados acima" />
    {review.recommendations.length ? review.recommendations.map(item => <PremiumCard key={item.title}
      tone={item.tone === 'success' ? 'success' : item.tone === 'warning' ? 'warning' : 'primary'} style={{ gap: 4 }}>
      <Row style={{ flexWrap: 'nowrap' }}>
        <Feather name={item.tone === 'success' ? 'award' : item.tone === 'warning' ? 'alert-triangle' : 'info'}
          size={15} color={item.tone === 'success' ? colors.success : item.tone === 'warning' ? colors.warning : colors.primary} />
        <Label weight="semibold" style={{ flex: 1 }}>{item.title}</Label>
      </Row>
      <Label muted size="caption">{item.detail}</Label>
    </PremiumCard>) : <Label muted size="caption">Nenhum alerta: os indicadores da semana não acionaram regras.</Label>}

    <Label muted size="micro" style={{ marginTop: tokens.space.sm }}>
      Comparações usam a semana anterior completa. Tarefas sem histórico de conclusão não recebem datas inventadas.
    </Label>
  </Screen>;
}
