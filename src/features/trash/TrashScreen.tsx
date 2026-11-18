import React, { useCallback, useEffect, useState } from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import {
  Badge, Button, Confirm, EmptyState, ErrorState, Label, LoadingSkeleton, PremiumCard, Row, Screen,
} from '../../components/ui';
import { useData } from '../../state/DataProvider';
import { Task } from '../../types/models';
import { formatDate } from '../../domain/dates';
import { tokens, useTheme } from '../../theme/ThemeProvider';

export default function TrashScreen() {
  const { api, mutate, busy } = useData();
  const router = useRouter();
  const { colors } = useTheme();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [purging, setPurging] = useState<Task | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try { setTasks(await api.trash()); setError(null); }
    catch (e) { setError(e instanceof Error ? e.message : 'Falha ao carregar a lixeira.'); }
    finally { setLoading(false); }
  }, [api]);
  useEffect(() => { void load(); }, [load]);

  const restore = async (task: Task) => {
    try { await mutate(current => current.restoreTask(task.id), 'Tarefa restaurada.'); await load(); }
    catch (e) { setError(e instanceof Error ? e.message : 'Falha ao restaurar.'); }
  };
  const purge = async () => {
    if (!purging) return;
    try {
      await mutate(current => current.purgeTask(purging.id), 'Tarefa excluída definitivamente.');
      setPurging(null); await load();
    } catch (e) { setPurging(null); setError(e instanceof Error ? e.message : 'Falha ao excluir.'); }
  };

  return <Screen title="Lixeira" subtitle="Nada é excluído para sempre sem sua confirmação."
    refreshing={loading} onRefresh={() => { void load(); }} onBack={() => router.back()}>
    <ErrorState message={error} retry={() => { void load(); }} />
    <PremiumCard tone="warning" style={{ gap: 4 }}>
      <Label weight="semibold">Exclusão reversível</Label>
      <Label muted size="caption">
        Tarefas excluídas ficam aqui e podem ser restauradas. A exclusão definitiva remove também o checklist,
        etiquetas e histórico de conclusões, e não pode ser desfeita.
      </Label>
    </PremiumCard>

    {loading ? <LoadingSkeleton rows={3} label="Carregando lixeira" />
      : !tasks.length ? <EmptyState title="Lixeira vazia" detail="Tarefas excluídas aparecem aqui antes da remoção definitiva."
        icon="trash-2" action={<Button title="Voltar às tarefas" icon="arrow-right" variant="soft" compact
          onPress={() => router.replace('/tarefas')} />} />
        : tasks.map(task => <View key={task.id} style={{ backgroundColor: colors.surface, borderRadius: tokens.radius.lg,
          borderWidth: 1, borderColor: colors.border, padding: tokens.space.md, gap: 6 }}>
          <Row style={{ justifyContent: 'space-between', flexWrap: 'nowrap' }}>
            <Label weight="semibold" numberOfLines={2} style={{ flex: 1 }}>{task.titulo}</Label>
            <Badge title={formatDate(task.dataPrazo)} tone="neutral" />
          </Row>
          <Label muted size="micro">
            {task.categoria?.nome || 'Sem categoria'} · {task.detalhes?.subtarefas?.length || 0} etapa(s) · {task.conclusoes.length} conclusão(ões)
          </Label>
          <Row>
            <Button title="Restaurar" icon="rotate-ccw" variant="soft" compact loading={busy}
              onPress={() => { void restore(task); }} />
            <Button title="Excluir definitivamente" icon="trash-2" variant="ghost" compact
              onPress={() => setPurging(task)} />
          </Row>
        </View>)}

    <Confirm visible={!!purging} title="Excluir definitivamente?" confirmLabel="Excluir para sempre"
      message={`“${purging?.titulo}” será removida junto com seu checklist e histórico. Esta ação não pode ser desfeita.`}
      busy={busy} onCancel={() => setPurging(null)} onConfirm={() => { void purge(); }} />
  </Screen>;
}
