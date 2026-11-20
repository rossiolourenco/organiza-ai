import React, { useEffect, useMemo, useState } from 'react';
import { ScrollView, View, useWindowDimensions } from 'react-native';
import { useRouter } from 'expo-router';
import Feather from '@expo/vector-icons/Feather';
import {
  Badge, Button, CalendarGrid, Card, Choices, EmptyState, FilterChip, Input, Label, MetricCard, PremiumCard,
  Progress, Row, Screen, SectionHeader, Segmented, Sheet,
} from '../../components/ui';
import { DataFeedback } from '../../components/DataFeedback';
import { addDays, dayKey, formatLongDate, localDate, minutesToTime, monthLabel, shortWeekday, timeToMinutes, weekStart } from '../../domain/dates';
import { useData } from '../../state/DataProvider';
import { useSettings } from '../../state/SettingsProvider';
import { statuses, Status } from '../../types/models';
import { isOverdue, sortTasks, taskProgress } from '../../domain/tasks';
import { matrix, quadrants, suggestQuadrant, type Quadrant } from '../../domain/eisenhower';
import { estimateMinutes, planDay } from '../../domain/planning';
import TaskCard from '../tasks/TaskCard';
import { tokens, useTheme } from '../../theme/ThemeProvider';

type Mode = 'calendar' | 'kanban' | 'smart' | 'matrix';
type CalendarMode = 'month' | 'week' | 'day';

export default function PlanningScreen() {
  const { tasks, loading, refresh } = useData();
  const { settings, plans, update, acceptPlan, dismissSuggestion, clearPlanDay, syncPlan, error: settingsError } = useSettings();
  const [mode, setMode] = useState<Mode>('calendar');
  const [calendarMode, setCalendarMode] = useState<CalendarMode>('month');
  const [quadrantFilter, setQuadrantFilter] = useState<Quadrant | ''>('');
  const [date, setDate] = useState(dayKey());
  const [limit, setLimit] = useState(40);
  const [planOpen, setPlanOpen] = useState(false);
  const [availability, setAvailability] = useState('');
  const [dayStart, setDayStart] = useState(settings.dayStart);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { colors } = useTheme();
  const { width } = useWindowDimensions();

  const today = dayKey();
  const start = calendarMode === 'month' ? `${date.slice(0, 7)}-01` : calendarMode === 'week' ? weekStart(date) : date;
  const end = calendarMode === 'month' ? dayKey(new Date(localDate(date).getFullYear(), localDate(date).getMonth() + 1, 0, 12))
    : calendarMode === 'week' ? addDays(start, 6) : date;
  const calendarList = sortTasks(tasks.filter(task => task.dataPrazo && task.dataPrazo >= start && task.dataPrazo <= end));
  const counts = tasks.reduce<Record<string, number>>((result, task) => {
    if (task.dataPrazo) result[task.dataPrazo] = (result[task.dataPrazo] || 0) + 1;
    return result;
  }, {});
  const overdueDates = [...new Set(tasks.filter(task => isOverdue(task, today)).map(task => task.dataPrazo!))];

  const move = (delta: number) => {
    setLimit(40);
    if (calendarMode === 'month') {
      const current = localDate(date);
      setDate(dayKey(new Date(current.getFullYear(), current.getMonth() + delta, 1, 12)));
    } else setDate(addDays(date, delta * (calendarMode === 'week' ? 7 : 1)));
  };

  const plan = useMemo(() => planDay(tasks, today, settings.availabilityMinutes, timeToMinutes(settings.dayStart) ?? 480),
    [tasks, today, settings.availabilityMinutes, settings.dayStart]);
  const acceptedIds = plans.accepted[today] || [];
  const dismissedIds = plans.dismissed[today] || [];
  const acceptedTasks = acceptedIds.map(id => tasks.find(task => task.id === id)).filter(Boolean)
    .filter(task => task!.status !== 'CONCLUIDA') as typeof tasks;
  const acceptedMinutes = acceptedTasks.reduce((sum, task) => sum + estimateMinutes(task), 0);
  const suggestions = plan.items.filter(item => !acceptedIds.includes(item.task.id) && !dismissedIds.includes(item.task.id));

  const openPlanSettings = () => {
    setAvailability(String(settings.availabilityMinutes)); setDayStart(settings.dayStart);
    setPlanOpen(true); setError(null);
  };
  const savePlanSettings = async () => {
    try {
      setError(null);
      await update({ availabilityMinutes: Number(availability), dayStart });
      setPlanOpen(false);
    } catch { setError('Não foi possível salvar as preferências.'); }
  };

  // Re-sincroniza o plano ao abrir a tela (outro aparelho pode ter alterado).
  useEffect(() => { void syncPlan(dayKey()); }, [syncPlan]);

  const eisenhower = matrix(tasks);
  const columns: Status[] = ['PENDENTE', 'EM_ANDAMENTO', 'CONCLUIDA'];

  return <Screen title="Planeje com clareza." subtitle="Calendário, Kanban, plano inteligente e matriz."
    refreshing={loading} onRefresh={() => { void refresh(); void syncPlan(dayKey()); }}
    action={<Button title="Ajustes" icon="sliders" variant="secondary" compact onPress={openPlanSettings} />}>
    <DataFeedback />
    <Segmented value={mode} onChange={value => setMode(value)} options={[
      { value: 'calendar', label: 'Calendário', icon: 'calendar' },
      { value: 'kanban', label: 'Kanban', icon: 'columns' },
      { value: 'smart', label: 'Plano', icon: 'zap' },
      { value: 'matrix', label: 'Matriz', icon: 'grid' },
    ]} />

    {mode === 'calendar' ? <>
      <Choices value={calendarMode} onChange={value => { setCalendarMode(value); setLimit(40); }} options={[
        { value: 'month', label: 'Mês' }, { value: 'week', label: 'Semana' }, { value: 'day', label: 'Dia' }]} />
      <Card>
        <Row style={{ justifyContent: 'space-between' }}>
          <Label size="subtitle" weight="bold" style={{ textTransform: 'capitalize' }}>
            {calendarMode === 'month' ? monthLabel(date) : calendarMode === 'week'
              ? `${localDate(weekStart(date)).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })} – ${localDate(addDays(weekStart(date), 6)).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}`
              : formatLongDate(date)}
          </Label>
          <Button title="Hoje" variant="ghost" compact onPress={() => setDate(today)} />
        </Row>
        <Row style={{ justifyContent: 'space-between' }}>
          <Button title="Anterior" icon="chevron-left" variant="secondary" compact onPress={() => move(-1)} />
          <Button title="Próximo" icon="chevron-right" variant="secondary" compact onPress={() => move(1)} />
        </Row>
        {calendarMode === 'month' ? <CalendarGrid month={date} selected={date} counts={counts} overdue={overdueDates}
          onSelect={value => { setDate(value); setCalendarMode('day'); }} />
          : calendarMode === 'week' ? <View style={{ flexDirection: 'row', gap: 6 }}>
            {Array.from({ length: 7 }, (_, index) => {
              const day = addDays(weekStart(date), index);
              const selected = day === date;
              return <View key={day} style={{ flex: 1 }}>
                <Button title={`${shortWeekday(day)} ${localDate(day).getDate()}`} compact
                  variant={selected ? 'primary' : 'secondary'} onPress={() => { setDate(day); }}
                  icon={counts[day] ? 'circle' : undefined} />
                <Label muted size="micro" style={{ textAlign: 'center' }}>{counts[day] || 0}</Label>
              </View>;
            })}
          </View> : <PremiumCard tone="primary" style={{ alignItems: 'center' }}>
            <Label size="display" weight="bold">{localDate(date).getDate()}</Label>
            <Label muted style={{ textTransform: 'capitalize' }}>{formatLongDate(date)}</Label>
            <Label muted size="caption">{counts[date] || 0} tarefa(s) neste dia</Label>
          </PremiumCard>}
        <Row style={{ justifyContent: 'space-between' }}>
          <Row>
            <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: colors.primary }} />
            <Label muted size="micro">Com tarefas</Label>
            <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: colors.danger }} />
            <Label muted size="micro">Atrasadas</Label>
          </Row>
          <Button title="Criar nesta data" icon="plus" compact onPress={() => router.push({ pathname: '/novaTarefa', params: { date } })} />
        </Row>
      </Card>
      <SectionHeader title={calendarMode === 'month' ? 'Agenda do mês' : calendarMode === 'week' ? 'Agenda da semana' : 'Agenda do dia'}
        subtitle={`${calendarList.length} tarefa(s)`} />
      {calendarList.length ? calendarList.slice(0, limit).map(task => <TaskCard key={task.id} task={task} />)
        : <EmptyState title="Um período tranquilo" detail="Nenhuma tarefa com prazo neste período." icon="calendar" />}
      {calendarList.length > limit ? <Button title="Mostrar mais" variant="secondary"
        onPress={() => setLimit(value => value + 40)} /> : null}
    </> : null}

    {mode === 'kanban' ? <>
      <Label muted size="caption">Use o menu de cada tarefa para mover entre colunas. O status é persistido no servidor.</Label>
      <ScrollView horizontal showsHorizontalScrollIndicator contentContainerStyle={{ gap: tokens.space.md, paddingBottom: tokens.space.md }}>
        {columns.map(status => {
          const column = sortTasks(tasks.filter(task => task.status === status));
          return <View key={status} style={{ width: Math.min(320, width - 56), gap: tokens.space.sm }}>
            <Row style={{ justifyContent: 'space-between' }}>
              <Label size="subtitle" weight="bold">{statuses[status]}</Label>
              <Badge title={String(column.length)} tone={status === 'CONCLUIDA' ? 'success' : status === 'EM_ANDAMENTO' ? 'warning' : 'neutral'} />
            </Row>
            <View style={{ height: 3, borderRadius: 2, backgroundColor: status === 'CONCLUIDA' ? colors.success
              : status === 'EM_ANDAMENTO' ? colors.warning : colors.border }} />
            <View style={{ gap: 8 }}>
              {column.length ? column.slice(0, limit).map(task => <TaskCard key={task.id} task={task} compact />)
                : <EmptyState title="Coluna livre" detail="As tarefas neste status aparecem aqui." icon="inbox" />}
            </View>
            {column.length > limit ? <Button title="Mostrar mais" variant="secondary" compact
              onPress={() => setLimit(value => value + 40)} /> : null}
          </View>;
        })}
      </ScrollView>
    </> : null}

    {mode === 'smart' ? <>
      <PremiumCard tone="primary">
        <Row style={{ justifyContent: 'space-between' }}>
          <View style={{ flex: 1, gap: 2 }}>
            <Label size="subtitle" weight="bold">Plano de hoje</Label>
            <Label muted size="caption">
              {settings.availabilityMinutes} min disponíveis · início {settings.dayStart} · {acceptedMinutes} min aceitos
            </Label>
          </View>
          <Button title="Ajustar" variant="soft" compact onPress={openPlanSettings} />
        </Row>
        <Progress value={settings.availabilityMinutes ? acceptedMinutes / settings.availabilityMinutes * 100 : 0}
          label="Ocupação do plano aceito" />
        <Row>
          <Button title="Aceitar todas as sugestões" icon="check" compact disabled={!suggestions.length}
            onPress={() => { void acceptPlan(today, [...acceptedIds, ...suggestions.map(item => item.task.id)]).catch(() => undefined); }} />
          <Button title="Limpar plano" variant="ghost" compact disabled={!acceptedIds.length && !dismissedIds.length}
            onPress={() => { void clearPlanDay(today).catch(() => undefined); }} />
        </Row>
      </PremiumCard>

      <SectionHeader title="Seu dia em sequência" subtitle={acceptedTasks.length ? `${acceptedTasks.length} tarefa(s) aceita(s)` : 'Nenhuma tarefa aceita ainda'}
        action={<Badge title={`${plan.overflow.length} fora do tempo`} tone={plan.overflow.length ? 'warning' : 'success'} />} />
      {acceptedTasks.length ? <Card>
        {(() => {
          let cursor = timeToMinutes(settings.dayStart) || 480;
          return acceptedTasks.map((task, index) => {
            const minutes = estimateMinutes(task);
            const from = cursor; cursor += minutes;
            const done = taskProgress(task);
            return <Row key={task.id} style={{ flexWrap: 'nowrap', alignItems: 'flex-start', gap: 12 }}>
              <View style={{ width: 52, alignItems: 'flex-end' }}>
                <Label size="caption" weight="bold">{minutesToTime(from)}</Label>
                <Label muted size="micro">{minutes} min</Label>
              </View>
              <View style={{ width: 2, alignSelf: 'stretch', backgroundColor: colors.border, borderRadius: 1 }} />
              <View style={{ flex: 1, gap: 4 }}>
                <Row style={{ justifyContent: 'space-between' }}>
                  <Label weight="semibold" numberOfLines={2} style={{ flex: 1 }}>{index + 1}. {task.titulo}</Label>
                  <Button title="Abrir" variant="ghost" compact
                    onPress={() => router.push({ pathname: '/editarTarefa', params: { id: task.id } })} />
                </Row>
                <Row>
                  <Badge title={task.prioridade} tone={task.prioridade === 'ALTA' ? 'danger' : task.prioridade === 'MEDIA' ? 'warning' : 'primary'} />
                  {task.detalhes?.horario ? <Badge title={task.detalhes.horario} tone="neutral" icon="clock" /> : null}
                  {done > 0 ? <Badge title={`${done}% do checklist`} tone="success" /> : null}
                </Row>
              </View>
            </Row>;
          });
        })()}
      </Card> : <EmptyState title="Monte seu plano do dia" detail="Aceite sugestões abaixo. Nada é alterado nas tarefas sem sua confirmação."
        icon="zap" />}

      <SectionHeader title="Sugestões determinísticas" subtitle="Ordenadas por prazo, prioridade, urgência e duração." />
      {suggestions.length ? suggestions.slice(0, 10).map(item => <PremiumCard key={item.task.id} style={{ gap: 6 }}>
        <Row style={{ justifyContent: 'space-between' }}>
          <Label weight="semibold" style={{ flex: 1 }} numberOfLines={2}>{item.task.titulo}</Label>
          <Badge title={`${item.score} pts`} tone="primary" />
        </Row>
        <Label muted size="caption">{item.reasons.join(' · ')} · {item.minutes} min</Label>
        <Row>
          <Button title="Aceitar" icon="plus" compact
            onPress={() => { void acceptPlan(today, [...acceptedIds, item.task.id]).catch(() => undefined); }} />
          <Button title="Ignorar" variant="ghost" compact
            onPress={() => { void dismissSuggestion(today, item.task.id).catch(() => undefined); }} />
          <Button title="Focar" variant="soft" compact icon="target"
            onPress={() => router.push({ pathname: '/concentracao', params: { taskId: String(item.task.id) } })} />
        </Row>
      </PremiumCard>) : <EmptyState title="Sem sugestões pendentes" detail="Todas as tarefas abertas já estão no plano, foram ignoradas ou não cabem no tempo disponível."
        icon="check-circle" />}

      {plan.overflow.length ? <>
        <SectionHeader title="Fora do tempo disponível" subtitle="Considere renegociar prazos ou aumentar a disponibilidade." />
        {plan.overflow.slice(0, 5).map(item => <Row key={item.task.id} style={{ justifyContent: 'space-between' }}>
          <Label muted size="caption" style={{ flex: 1 }} numberOfLines={1}>{item.task.titulo}</Label>
          <Badge title={`${item.minutes} min`} tone="warning" />
        </Row>)}
      </> : null}
      <Label muted size="micro">
        Algoritmo documentado: atraso +50, vence hoje +30, amanhã +15, semana +8, prioridade +24/+12/+4,
        importante +10, urgente +12, favorita +5, fixada +4 e bônus por tarefa curta. Empates são resolvidos pelo id.
        Não há promessa de agenda ótima. Dependências não fazem parte do contrato atual.
      </Label>
      {settingsError ? <Label size="caption" style={{ color: colors.danger }}>{settingsError}</Label> : null}
    </> : null}

    {mode === 'matrix' ? <>
      <Label muted size="caption">
        A matriz usa dois atributos explícitos por tarefa. A sugestão considera prioridade, prazo e fixação,
        mas só é aplicada quando você confirma.
      </Label>
      <Row style={{ alignItems: 'stretch' }}>
        <MetricCard value={eisenhower.unclassified.length} label="Sem classificação" icon="help-circle" tone="warning" />
        <MetricCard value={eisenhower.groups.get('DO')?.length || 0} label="Fazer agora" icon="zap" tone="danger" />
        <MetricCard value={eisenhower.groups.get('PLAN')?.length || 0} label="Planejar" icon="calendar" tone="primary" />
        <MetricCard value={eisenhower.groups.get('DELEGATE')?.length || 0} label="Reduzir" icon="shuffle" tone="neutral" />
      </Row>
      <Row>
        <FilterChip title="Todos" selected={!quadrantFilter} onPress={() => setQuadrantFilter('')} />
        {quadrants.map(quadrant => <FilterChip key={quadrant.key} title={quadrant.title}
          selected={quadrantFilter === quadrant.key} onPress={() => setQuadrantFilter(quadrant.key)} />)}
      </Row>
      <View style={{ flexDirection: width > 760 ? 'row' : 'column', flexWrap: 'wrap', gap: tokens.space.md }}>
        {(quadrantFilter ? quadrants.filter(quadrant => quadrant.key === quadrantFilter) : quadrants).map(quadrant => {
          const list = sortTasks(eisenhower.groups.get(quadrant.key) || []);
          return <View key={quadrant.key} style={{ flexGrow: 1, flexBasis: width > 760 ? '46%' : '100%',
            minWidth: 260, gap: 6 }}>
            <PremiumCard tone={quadrant.tone === 'muted' ? 'neutral' : quadrant.tone} style={{ gap: 4 }}>
              <Row style={{ justifyContent: 'space-between' }}>
                <Row><Feather name={quadrant.icon as keyof typeof Feather.glyphMap} size={15} color={colors.primary} />
                  <Label weight="bold">{quadrant.title}</Label></Row>
                <Badge title={String(list.length)} tone={quadrant.tone === 'muted' ? 'neutral' : quadrant.tone} />
              </Row>
              <Label muted size="micro">{quadrant.subtitle}</Label>
            </PremiumCard>
            {list.length ? list.slice(0, quadrantFilter ? 20 : 6).map(task => <TaskCard key={task.id} task={task} compact />)
              : <Label muted size="micro" style={{ paddingHorizontal: 4 }}>Nenhuma tarefa neste quadrante.</Label>}
          </View>;
        })}
      </View>
      {!quadrantFilter ? <>
        <SectionHeader title="Sem classificação" subtitle="Abra o menu da tarefa e escolha “Classificar na matriz”." />
        {eisenhower.unclassified.length ? eisenhower.unclassified.slice(0, 8).map(task => <TaskCard key={task.id} task={task} compact />)
          : <Label muted size="caption">Todas as tarefas abertas já estão classificadas.</Label>}
        {eisenhower.unclassified.length ? <Label muted size="micro">
          Sugestão para a primeira: {suggestQuadrant(eisenhower.unclassified[0]).reason}
        </Label> : null}
        {eisenhower.unclassified.length > 8 ? <Label muted size="caption">
          Exibindo 8 de {eisenhower.unclassified.length} tarefas sem classificação.
        </Label> : null}
      </> : null}
    </> : null}

    <Sheet visible={planOpen} title="Como é seu dia?" subtitle="Disponibilidade usada apenas para sugerir, nunca para alterar tarefas."
      onClose={() => setPlanOpen(false)}>
      <Input label="Minutos disponíveis por dia" keyboardType="number-pad" value={availability}
        onChangeText={setAvailability} maxLength={4} hint="Entre 30 e 1440 minutos." />
      <Input label="Horário de início do plano" value={dayStart} onChangeText={setDayStart} maxLength={5}
        placeholder="08:00" hint="Formato HH:MM." />
      <Button title="Salvar preferências" icon="check" onPress={() => { void savePlanSettings(); }} />
      <Label muted size="micro">As preferências valem para este aparelho. O plano aceito fica salvo por conta e data.</Label>
      {error ? <Label size="caption" style={{ color: colors.danger }}>{error}</Label> : null}
    </Sheet>
  </Screen>;
}
