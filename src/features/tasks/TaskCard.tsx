import React, { useState } from 'react';
import { Pressable, View } from 'react-native';
import { useRouter } from 'expo-router';
import Feather from '@expo/vector-icons/Feather';
import {
  Badge, Button, Confirm, Label, PriorityBadge, Progress, Row, Sheet, StatusBadge, ToggleRow,
} from '../../components/ui';
import { defaultDetails, Status, Task, statuses } from '../../types/models';
import { formatDate } from '../../domain/dates';
import { isOverdue, taskInput, taskProgress } from '../../domain/tasks';
import { quadrantOf, quadrants, suggestQuadrant } from '../../domain/eisenhower';
import { useData } from '../../state/DataProvider';
import { tokens, useTheme } from '../../theme/ThemeProvider';
import { InlineError } from '../../components/DataFeedback';

export default function TaskCard({ task, compact = false }: { task: Task; compact?: boolean }) {
  const router = useRouter();
  const { colors } = useTheme();
  const { mutate, busy } = useData();
  const [menu, setMenu] = useState(false);
  const [classify, setClassify] = useState(false);
  const [draft, setDraft] = useState({ importante: false, urgente: false });
  const [confirm, setConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const details = { ...defaultDetails(), ...task.detalhes };
  const progress = taskProgress(task);
  const steps = details.subtarefas;
  const done = task.status === 'CONCLUIDA';
  const edit = () => router.push({ pathname: '/editarTarefa', params: { id: task.id } });
  const accent = task.prioridade === 'ALTA' ? colors.danger : task.prioridade === 'MEDIA' ? colors.warning : colors.primary;
  const q = quadrantOf(task);

  const run = async (operation: Parameters<typeof mutate>[0], message: string, undo?: Parameters<typeof mutate>[2]) => {
    try { setError(null); await mutate(operation, message, undo); setMenu(false); setConfirm(false); }
    catch (e) { setError(e instanceof Error ? e.message : 'Falha na operação.'); }
  };
  const status = (value: Status) => run(api => api.saveTask({ ...taskInput(task), status: value }, task.id), 'Status atualizado.');
  const saveDetails = (patch: Partial<typeof details>, message: string) =>
    run(api => api.saveTask({ ...taskInput(task), detalhes: { ...details, ...patch } }, task.id), message);

  return <View style={{ flexDirection: 'row', backgroundColor: colors.surface, borderRadius: tokens.radius.lg,
    borderWidth: 1, borderColor: colors.border, overflow: 'hidden' }}>
    <View style={{ width: 4, backgroundColor: done ? colors.success : accent }} />
    <View style={{ flex: 1, padding: compact ? tokens.space.md : tokens.space.lg, gap: tokens.space.sm }}>
      <Row style={{ flexWrap: 'nowrap', alignItems: 'flex-start' }}>
        <Pressable accessibilityRole="checkbox" accessibilityLabel={`Concluir ${task.titulo}`}
          accessibilityState={{ checked: done, disabled: busy }} disabled={busy}
          style={{ width: 34, height: 34, alignItems: 'center', justifyContent: 'center' }}
          onPress={() => { void status(done ? 'PENDENTE' : 'CONCLUIDA'); }}>
          <Feather name={done ? 'check-circle' : 'circle'} size={22}
            color={done ? colors.success : colors.muted} />
        </Pressable>
        <Pressable accessibilityRole="button" accessibilityLabel={`Editar ${task.titulo}`} onPress={edit}
          style={{ flex: 1, gap: 3, paddingTop: 4 }}>
          <Label weight="semibold" numberOfLines={2}
            style={{ textDecorationLine: done ? 'line-through' : 'none', color: done ? colors.muted : colors.text }}>
            {task.titulo}
          </Label>
          {!compact && task.descricao ? <Label muted size="caption" numberOfLines={2}>{task.descricao}</Label> : null}
          <Row style={{ gap: 6 }}>
            <PriorityBadge priority={task.prioridade} />
            <StatusBadge status={task.status} />
            {details.favorita ? <Badge title="Favorita" tone="warning" icon="star" /> : null}
            {details.fixada ? <Badge title="Fixada" tone="neutral" icon="bookmark" /> : null}
            {details.recorrencia !== 'NENHUMA' ? <Badge title="Recorrente" tone="primary" icon="repeat" /> : null}
          </Row>
        </Pressable>
        <Pressable accessibilityRole="button" accessibilityLabel={`Ações de ${task.titulo}`}
          onPress={() => setMenu(true)} style={{ width: 38, height: 38, alignItems: 'center', justifyContent: 'center' }}>
          <Feather name="more-horizontal" size={20} color={colors.muted} />
        </Pressable>
      </Row>

      {steps.length > 0 ? <View style={{ gap: 5, paddingLeft: 34 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Label muted size="micro">{steps.filter(s => s.concluida).length}/{steps.length} etapas</Label>
          <Label muted size="micro">{progress}%</Label>
        </View>
        <Progress value={progress} label={`Progresso do checklist de ${task.titulo}`} height={5} />
      </View> : null}

      <Row style={{ justifyContent: 'space-between', paddingLeft: 34 }}>
        <Row style={{ gap: 5 }}>
          {task.categoria ? <>
            <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: task.categoria.cor || colors.primary }} />
            <Label muted size="micro">{task.categoria.nome}</Label>
          </> : <Label muted size="micro">Sem categoria</Label>}
        </Row>
        <Row style={{ gap: 4 }}>
          {q ? <Label size="micro" style={{ color: colors.primary }}>
            {quadrants.find(item => item.key === q)?.title}
          </Label> : null}
          <Feather name="calendar" size={11} color={isOverdue(task) ? colors.danger : colors.muted} />
          <Label size="micro" style={{ color: isOverdue(task) ? colors.danger : colors.muted }}>
            {isOverdue(task) ? 'Atrasada · ' : ''}{formatDate(task.dataPrazo)}{details.horario ? ` · ${details.horario}` : ''}
          </Label>
        </Row>
      </Row>

      <InlineError message={error} />

      <Sheet visible={menu} title={task.titulo} subtitle="Organize sem sair da lista." onClose={() => setMenu(false)}>
        <InlineError message={error} />
        <Row>
          <Button title="Abrir detalhes" icon="edit-2" variant="secondary" compact onPress={() => { setMenu(false); edit(); }} />
          <Button title="Focar nela" icon="target" variant="soft" compact
            onPress={() => { setMenu(false); router.push({ pathname: '/concentracao', params: { taskId: String(task.id) } }); }} />
        </Row>
        <Label size="caption" weight="semibold" muted>Mover para</Label>
        {(Object.keys(statuses) as Status[]).map(value => <Button key={value}
          title={value === task.status ? `${statuses[value]} · atual` : `Mover para ${statuses[value]}`}
          variant="secondary" compact disabled={busy || task.status === value} onPress={() => { void status(value); }} />)}
        <Label size="caption" weight="semibold" muted>Preferências</Label>
        <Row>
          <Button title={details.favorita ? 'Remover favorito' : 'Favoritar'} icon="star" variant="secondary" compact disabled={busy}
            onPress={() => { void saveDetails({ favorita: !details.favorita }, 'Favorito atualizado.'); }} />
          <Button title={details.fixada ? 'Desafixar' : 'Fixar no topo'} icon="bookmark" variant="secondary" compact disabled={busy}
            onPress={() => { void saveDetails({ fixada: !details.fixada }, 'Fixação atualizada.'); }} />
        </Row>
        <Button title="Classificar na matriz" icon="grid" variant="secondary" compact
          onPress={() => {
            const suggestion = suggestQuadrant(task);
            setDraft({ importante: details.importante ?? suggestion.importante, urgente: details.urgente ?? suggestion.urgente });
            setMenu(false); setClassify(true);
          }} />
        <Button title="Duplicar tarefa" icon="copy" variant="secondary" compact disabled={busy}
          onPress={() => { void run(api => api.saveTask({ ...taskInput(task), titulo: `${task.titulo.slice(0, 140)} (cópia)`,
            status: 'PENDENTE', detalhes: { ...details, recorrencia: 'NENHUMA',
              subtarefas: details.subtarefas.map(s => ({ ...s, concluida: false })) } }), 'Cópia criada, sem recorrência.'); }} />
        <Button title="Excluir tarefa" variant="danger" icon="trash-2" compact disabled={busy}
          onPress={() => { setMenu(false); setConfirm(true); }} />
      </Sheet>

      <Sheet visible={classify} title="Matriz de Eisenhower" subtitle="Classificação explícita, sem inferência automática."
        onClose={() => setClassify(false)}>
        <Label muted size="caption">
          {suggestQuadrant(task).reason} A sugestão não é aplicada sem sua confirmação.
        </Label>
        <ToggleRow label="Importante" description="Tem impacto real no seu objetivo."
          value={draft.importante} onChange={value => setDraft(current => ({ ...current, importante: value }))} />
        <ToggleRow label="Urgente" description="Exige atenção imediata."
          value={draft.urgente} onChange={value => setDraft(current => ({ ...current, urgente: value }))} />
        <Button title="Salvar classificação" icon="check" disabled={busy} onPress={() => {
          void saveDetails({ importante: draft.importante, urgente: draft.urgente }, 'Classificação atualizada.');
          setClassify(false);
        }} />
        <Button title="Usar sugestão" icon="zap" variant="soft" disabled={busy} onPress={() => {
          const suggestion = suggestQuadrant(task);
          void saveDetails({ importante: suggestion.importante, urgente: suggestion.urgente }, 'Sugestão aplicada.');
          setClassify(false);
        }} />
      </Sheet>

      <Confirm visible={confirm} title="Mover para a lixeira?" confirmLabel="Mover para a lixeira"
        message={`“${task.titulo}” poderá ser restaurada na lixeira.`}
        busy={busy} onCancel={() => setConfirm(false)}
        onConfirm={() => { void run(api => api.deleteTask(task.id), 'Tarefa movida para a lixeira.',
          api => api.restoreTask(task.id)); }} />
    </View>
  </View>;
}
