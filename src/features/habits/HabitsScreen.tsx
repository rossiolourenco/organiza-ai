import React, { useState } from 'react';
import { Pressable, View } from 'react-native';
import { useRouter } from 'expo-router';
import Feather from '@expo/vector-icons/Feather';
import {
  Button, Choices, Confirm, EmptyState, ErrorState, Input, Label, LoadingSkeleton, MetricCard,
  PremiumCard, Progress, Row, Screen, Sheet, ToggleRow,
} from '../../components/ui';
import { DataFeedback } from '../../components/DataFeedback';
import { useData } from '../../state/DataProvider';
import { frequencies, Frequency, Habit, HabitInput } from '../../types/models';
import {
  bestStreak, consistency, habitCompletion, habitStreak, isDoneOn, validateHabit, weeklyProgress,
} from '../../domain/habits';
import { dayKey, formatLongDate } from '../../domain/dates';
import { categoryColors, tokens, useTheme } from '../../theme/ThemeProvider';

const emptyHabit: HabitInput = { nome: '', descricao: '', frequencia: 'DIARIA', metaSemanal: 7, cor: categoryColors[0], ativo: true };

export default function HabitsScreen() {
  const { habits, habitsAvailable, loading, busy, mutate, refresh } = useData();
  const { colors } = useTheme();
  const router = useRouter();
  const today = dayKey();
  const [sheet, setSheet] = useState(false);
  const [editing, setEditing] = useState<Habit | null>(null);
  const [form, setForm] = useState<HabitInput>(emptyHabit);
  const [deleting, setDeleting] = useState<Habit | null>(null);
  const [error, setError] = useState<string | null>(null);

  const openCreate = () => { setEditing(null); setForm(emptyHabit); setError(null); setSheet(true); };
  const openEdit = (habit: Habit) => {
    setEditing(habit);
    setForm({ nome: habit.nome, descricao: habit.descricao || '', frequencia: habit.frequencia,
      metaSemanal: habit.metaSemanal, cor: habit.cor || categoryColors[0], ativo: habit.ativo });
    setError(null); setSheet(true);
  };
  const save = async () => {
    const validation = validateHabit(form);
    if (validation) { setError(validation); return; }
    try {
      setError(null);
      await mutate(api => api.saveHabit({ ...form, nome: form.nome.trim() }, editing?.id),
        editing ? 'Hábito atualizado.' : 'Hábito criado.');
      setSheet(false);
    } catch (e) { setError(e instanceof Error ? e.message : 'Falha ao salvar hábito.'); }
  };
  const toggle = (habit: Habit) => {
    const done = isDoneOn(habit, today);
    void mutate(api => api.setHabitRecord(habit.id, today, !done), done ? 'Registro removido.' : 'Hábito registrado.')
      .catch(e => setError(e instanceof Error ? e.message : 'Falha ao registrar.'));
  };
  const remove = async () => {
    if (!deleting) return;
    try { await mutate(api => api.deleteHabit(deleting.id), 'Hábito excluído.'); setDeleting(null); }
    catch (e) { setError(e instanceof Error ? e.message : 'Falha ao excluir hábito.'); setDeleting(null); }
  };

  const active = habits.filter(habit => habit.ativo);
  const doneToday = active.filter(habit => isDoneOn(habit, today)).length;
  const best = habits.reduce((value, habit) => Math.max(value, bestStreak(habit)), 0);

  return <Screen title="Hábitos que sustentam o resto." subtitle={formatLongDate(today)}
    refreshing={loading} onRefresh={() => { void refresh(); }} onBack={() => router.back()}
    action={<Button title="Novo" icon="plus" compact onPress={openCreate} />}>
    <DataFeedback />
    {!habitsAvailable ? <EmptyState title="Hábitos indisponíveis neste servidor"
      detail="Atualize o backend para a versão 3.0. Tarefas, categorias e foco continuam funcionando normalmente."
      icon="server" /> : <>
      <Row style={{ alignItems: 'stretch' }}>
        <MetricCard value={active.length} label="Hábitos ativos" icon="repeat" tone="primary" />
        <MetricCard value={`${doneToday}/${active.length}`} label="Cumpridos hoje" icon="check-circle" tone="success" />
        <MetricCard value={`${best}`} label="Melhor sequência" icon="zap" tone="warning" />
      </Row>

      <Label muted size="caption">Sequências usam datas civis do aparelho. Hábitos semanais contam semanas com meta atingida.
        Para hábitos diários, a sequência continua se o dia atual ainda não foi marcado.</Label>

      <ErrorState message={error} />

      {loading && !habits.length ? <LoadingSkeleton rows={3} label="Carregando hábitos" />
        : !active.length ? <EmptyState title="Comece com um hábito simples" detail="Escolha algo pequeno e repetível. Constância vence intensidade."
          icon="repeat" action={<Button title="Criar hábito" icon="plus" variant="soft" compact onPress={openCreate} />} />
          : active.map(habit => {
            const done = isDoneOn(habit, today);
            const progress = weeklyProgress(habit, today);
            return <PremiumCard key={habit.id} style={{ gap: tokens.space.sm }}>
              <Row style={{ justifyContent: 'space-between', flexWrap: 'nowrap' }}>
                <Row style={{ flexWrap: 'nowrap', flex: 1 }}>
                  <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: habit.cor || colors.primary }} />
                  <View style={{ flex: 1 }}>
                    <Label weight="bold" numberOfLines={1}>{habit.nome}</Label>
                    <Label muted size="micro">
                      {frequencies[habit.frequencia]} · meta {habit.metaSemanal}/semana · sequência {habitStreak(habit, today)}
                    </Label>
                  </View>
                </Row>
                <Row style={{ flexWrap: 'nowrap', gap: 6 }}>
                  <Button title={done ? 'Feito' : 'Marcar'} icon={done ? 'check' : 'plus'} compact
                    variant={done ? 'secondary' : 'primary'} disabled={busy} onPress={() => toggle(habit)} />
                  <Pressable accessibilityRole="button" accessibilityLabel={`Editar ${habit.nome}`} onPress={() => openEdit(habit)}
                    style={{ width: 38, height: 38, alignItems: 'center', justifyContent: 'center' }}>
                    <Feather name="more-horizontal" size={18} color={colors.muted} />
                  </Pressable>
                </Row>
              </Row>
              {habit.descricao ? <Label muted size="caption" numberOfLines={2}>{habit.descricao}</Label> : null}
              <View style={{ gap: 4 }}>
                <Row style={{ justifyContent: 'space-between' }}>
                  <Label muted size="micro">{progress.count}/{progress.target} nesta semana</Label>
                  <Label muted size="micro">{habitCompletion(habit, today).rate30}% em 30 dias</Label>
                </Row>
                <Progress value={progress.percent} label={`Meta semanal de ${habit.nome}`} tone={progress.percent >= 100 ? 'success' : 'primary'} />
              </View>
              <View style={{ flexDirection: 'row', gap: 3, flexWrap: 'wrap' }}>
                {consistency(habit, 28, today).map(day => <View key={day.date} accessibilityLabel={`${day.date}: ${day.done ? 'cumprido' : 'não cumprido'}`}
                  style={{ width: 14, height: 14, borderRadius: 4,
                    backgroundColor: day.done ? (habit.cor || colors.primary) : colors.surfaceSecondary,
                    borderWidth: 1, borderColor: day.done ? 'transparent' : colors.border }} />)}
              </View>
              <Row>
                <Button title="Editar" icon="edit-2" variant="secondary" compact onPress={() => openEdit(habit)} />
                <Button title="Excluir" icon="trash-2" variant="ghost" compact onPress={() => setDeleting(habit)} />
              </Row>
            </PremiumCard>;
          })}

      {habits.some(habit => !habit.ativo) ? <>
        <Label size="subtitle" weight="bold">Arquivados</Label>
        {habits.filter(habit => !habit.ativo).map(habit => <Row key={habit.id} style={{ justifyContent: 'space-between' }}>
          <Label muted>{habit.nome}</Label>
          <Button title="Reativar" variant="secondary" compact
            onPress={() => { void mutate(api => api.saveHabit({ nome: habit.nome, descricao: habit.descricao,
              frequencia: habit.frequencia, metaSemanal: habit.metaSemanal, cor: habit.cor, ativo: true }, habit.id),
              'Hábito reativado.').catch(e => setError(e instanceof Error ? e.message : 'Falha ao reativar.')); }} />
        </Row>)}
      </> : null}
    </>}

    <Sheet visible={sheet} title={editing ? 'Editar hábito' : 'Novo hábito'}
      subtitle="Pequeno o bastante para caber no seu dia." onClose={() => setSheet(false)}>
      <Input label="Nome do hábito" value={form.nome} maxLength={100}
        onChangeText={value => setForm(current => ({ ...current, nome: value }))} placeholder="Ler 10 páginas, caminhar…" />
      <Input label="Descrição" value={form.descricao || ''} maxLength={500} multiline
        onChangeText={value => setForm(current => ({ ...current, descricao: value }))} placeholder="Por que isso importa?" />
      <Label size="caption" weight="semibold" muted>Frequência</Label>
      <Choices value={form.frequencia} onChange={value => setForm(current => ({ ...current, frequencia: value as Frequency }))}
        options={Object.entries(frequencies).map(([value, label]) => ({ value: value as Frequency, label }))} />
      <Input label="Meta de dias por semana" keyboardType="number-pad" value={String(form.metaSemanal)} maxLength={1}
        onChangeText={value => setForm(current => ({ ...current, metaSemanal: Math.max(1, Math.min(7, Number(value.replace(/\D/g, '')) || 1)) }))} />
      <Label size="caption" weight="semibold" muted>Cor</Label>
      <Row>{categoryColors.map(color => <Pressable key={color} accessibilityRole="radio" accessibilityLabel={`Cor ${color}`}
        accessibilityState={{ selected: form.cor === color }} onPress={() => setForm(current => ({ ...current, cor: color }))}
        style={{ width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center',
          borderWidth: form.cor === color ? 2 : 0, borderColor: colors.text }}>
        <View style={{ width: 26, height: 26, borderRadius: 9, backgroundColor: color }} />
      </Pressable>)}</Row>
      <ToggleRow label="Hábito ativo" description="Inativos ficam arquivados e não aparecem no dia."
        value={form.ativo} onChange={value => setForm(current => ({ ...current, ativo: value }))} />
      <ErrorState message={error} />
      <Button title={editing ? 'Salvar alterações' : 'Criar hábito'} icon="check" loading={busy} onPress={() => { void save(); }} />
    </Sheet>

    <Confirm visible={!!deleting} title="Excluir hábito?" confirmLabel="Excluir hábito"
      message={`“${deleting?.nome}” e todo o histórico de registros serão removidos. Esta ação não pode ser desfeita.`}
      busy={busy} onCancel={() => setDeleting(null)} onConfirm={() => { void remove(); }} />
  </Screen>;
}
