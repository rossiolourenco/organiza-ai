import React, { useEffect, useRef, useState } from 'react';
import { Pressable, Switch, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Feather from '@expo/vector-icons/Feather';
import {
  Button, Card, Choices, DateSelector, ErrorState, Input, Label, LoadingSkeleton, Row, Screen,
} from '../../components/ui';
import { useData } from '../../state/DataProvider';
import {
  defaultDetails, priorities, Priority, Recurrence, Status, statuses, TaskInput,
} from '../../types/models';
import { taskInput, validateTask } from '../../domain/tasks';
import { suggestQuadrant } from '../../domain/eisenhower';
import { DataFeedback } from '../../components/DataFeedback';
import { tokens, useTheme } from '../../theme/ThemeProvider';

function Disclosure({ title, subtitle, children, defaultOpen = false, icon }: React.PropsWithChildren<{
  title: string; subtitle?: string; defaultOpen?: boolean; icon: keyof typeof Feather.glyphMap;
}>) {
  const { colors } = useTheme();
  const [open, setOpen] = useState(defaultOpen);
  return <Card style={{ padding: 0, gap: 0 }}>
    <Pressable accessibilityRole="button" accessibilityLabel={`${open ? 'Recolher' : 'Abrir'} ${title}`}
      accessibilityState={{ expanded: open }} onPress={() => setOpen(value => !value)}
      style={{ flexDirection: 'row', alignItems: 'center', gap: 10, padding: tokens.space.lg, minHeight: 56 }}>
      <View style={{ width: 32, height: 32, borderRadius: 11, backgroundColor: colors.primarySoft,
        alignItems: 'center', justifyContent: 'center' }}>
        <Feather name={icon} size={15} color={colors.primary} />
      </View>
      <View style={{ flex: 1, gap: 1 }}>
        <Label weight="semibold">{title}</Label>
        {subtitle ? <Label muted size="micro">{subtitle}</Label> : null}
      </View>
      <Feather name={open ? 'chevron-up' : 'chevron-down'} size={18} color={colors.muted} />
    </Pressable>
    {open ? <View style={{ paddingHorizontal: tokens.space.lg, paddingBottom: tokens.space.lg,
      gap: tokens.space.md }}>{children}</View> : null}
  </Card>;
}

export default function TaskFormScreen() {
  const { id, date } = useLocalSearchParams<{ id?: string; date?: string }>();
  const taskId = id ? Number(id) : undefined;
  const { tasks, categories, loading, loaded: dataLoaded, busy, mutate } = useData();
  const original = tasks.find(task => task.id === taskId);
  const [form, setForm] = useState<TaskInput>({ titulo: '', descricao: '', prioridade: 'MEDIA', status: 'PENDENTE',
    dataPrazo: date || null, categoria: null, detalhes: defaultDetails() });
  const loaded = useRef(false);
  const submitted = useRef(false);
  const [error, setError] = useState<string | null>(null);
  const [tagText, setTagText] = useState('');
  const router = useRouter();
  const { colors } = useTheme();

  useEffect(() => {
    if (original && !loaded.current) {
      const next = { ...taskInput(original), detalhes: { ...defaultDetails(), ...original.detalhes } };
      setForm(next); setTagText((next.detalhes?.etiquetas || []).join(', ')); loaded.current = true;
    }
  }, [original]);

  const details = { ...defaultDetails(), ...form.detalhes };
  const suggestion = suggestQuadrant(form);
  const change = <K extends keyof TaskInput>(key: K, value: TaskInput[K]) => setForm(current => ({ ...current, [key]: value }));
  const changeDetails = (value: Partial<typeof details>) =>
    setForm(current => ({ ...current, detalhes: { ...defaultDetails(), ...current.detalhes, ...value } }));

  const save = async () => {
    if (submitted.current) return;
    const etiquetas = tagText.split(',').map(tag => tag.trim()).filter(Boolean);
    const input = { ...form, detalhes: { ...details, etiquetas } };
    const validation = validateTask(input);
    if (validation) { setError(validation); return; }
    submitted.current = true;
    try {
      setError(null);
      await mutate(api => api.saveTask({ ...input, titulo: form.titulo.trim(),
        categoria: form.categoria && categories.some(category => category.id === form.categoria?.id) ? form.categoria : null }, taskId),
        taskId ? 'Tarefa atualizada.' : 'Tarefa criada.');
      if (router.canGoBack()) router.back(); else router.replace('/tarefas');
    } catch (e) { setError(e instanceof Error ? e.message : 'Falha ao salvar.'); submitted.current = false; }
  };

  if (taskId && !loaded.current && loading) return <Screen title="Abrindo tarefa"><LoadingSkeleton /></Screen>;
  if (id && (!taskId || (!original && !loading))) return <Screen title="Tarefa indisponível">
    <DataFeedback /><Label muted>Atualize a lista de tarefas e tente novamente.</Label>
  </Screen>;

  return <Screen title={taskId ? 'Cada detalhe conta.' : 'O próximo passo.'}
    subtitle="Transforme uma intenção em algo realizável." onBack={() => router.back()}>
    <DataFeedback />
    <Card>
      <Input label="Título" placeholder="O que você quer realizar?" value={form.titulo}
        onChangeText={value => change('titulo', value)} maxLength={150} />
      <Input label="Descrição" placeholder="Adicione contexto à sua tarefa" value={form.descricao || ''}
        onChangeText={value => change('descricao', value)} multiline maxLength={10000} />
      <Label size="caption" weight="semibold" muted>Prioridade</Label>
      <Choices value={form.prioridade} onChange={value => change('prioridade', value)}
        options={Object.entries(priorities).map(([value, label]) => ({ value: value as Priority, label }))} />
      <Row>
        <View style={{ flex: 1, minWidth: 220 }}>
          <DateSelector label="Prazo" value={form.dataPrazo || ''} onChange={value => change('dataPrazo', value || null)} />
        </View>
        <View style={{ flex: 1, minWidth: 130 }}>
          <Input label="Horário" placeholder="HH:MM" value={details.horario}
            onChangeText={value => changeDetails({ horario: value })} maxLength={5} keyboardType="numbers-and-punctuation" />
        </View>
      </Row>
      <Label size="caption" weight="semibold" muted>Status</Label>
      <Choices value={form.status} onChange={value => change('status', value)}
        options={Object.entries(statuses).map(([value, label]) => ({ value: value as Status, label }))} />
      <Label size="caption" weight="semibold" muted>Categoria</Label>
      <Choices value={String(form.categoria?.id || '')} onChange={value => change('categoria', value ? { id: Number(value) } : null)}
        options={[{ value: '', label: 'Sem categoria' }, ...categories.map(category => ({ value: String(category.id), label: category.nome }))]} />
      <Button title="Gerenciar categorias" variant="ghost" compact icon="folder" onPress={() => router.push('/categorias')} />
    </Card>

    <Disclosure title="Planejar melhor" icon="sliders" subtitle="Estimativa, etiquetas e preferências">
      <Input label="Duração estimada (minutos)" placeholder="30" keyboardType="number-pad" maxLength={4}
        value={details.duracaoEstimada == null ? '' : String(details.duracaoEstimada)}
        onChangeText={value => {
          const digits = value.replace(/\D/g, '');
          changeDetails({ duracaoEstimada: digits ? Math.min(1440, Number(digits)) : null });
        }}
        hint="Usada pelo planejamento diário. Sem valor, assume 30 minutos." />
      <Input label="Etiquetas (separadas por vírgula)" placeholder="faculdade, projeto" value={tagText}
        onChangeText={setTagText} maxLength={800} />
      <Row style={{ justifyContent: 'space-between' }}>
        <Label>Favorita</Label>
        <Switch accessibilityLabel="Favorita" value={details.favorita}
          onValueChange={value => changeDetails({ favorita: value })} />
      </Row>
      <Row style={{ justifyContent: 'space-between' }}>
        <Label>Fixar no topo</Label>
        <Switch accessibilityLabel="Fixar no topo" value={details.fixada}
          onValueChange={value => changeDetails({ fixada: value })} />
      </Row>
      <Input label="Ordem personalizada" value={String(details.ordem)} keyboardType="number-pad"
        onChangeText={value => changeDetails({ ordem: Math.max(0, Math.min(99999, Number(value.replace(/\D/g, '')) || 0)) })}
        hint="Menor número aparece primeiro." />
    </Disclosure>

    <Disclosure title="Checklist e notas" icon="list" subtitle={`${details.subtarefas.length} etapa(s)`} defaultOpen={!!taskId}>
      {details.subtarefas.map((step, index) => <Card key={step.id} style={{ backgroundColor: colors.surfaceSecondary }}>
        <Row style={{ justifyContent: 'space-between' }}>
          <Row>
            <Switch accessibilityLabel={`Concluir etapa ${index + 1}`} value={step.concluida}
              onValueChange={value => changeDetails({ subtarefas: details.subtarefas.map(item =>
                item.id === step.id ? { ...item, concluida: value } : item) })} />
            <Label size="caption" weight="semibold">Etapa {index + 1}</Label>
          </Row>
          <Button title={`Remover etapa ${index + 1}`} variant="ghost" compact icon="trash-2"
            onPress={() => changeDetails({ subtarefas: details.subtarefas.filter(item => item.id !== step.id) })} />
        </Row>
        <Input label={`Título da etapa ${index + 1}`} value={step.titulo} maxLength={150}
          onChangeText={value => changeDetails({ subtarefas: details.subtarefas.map(item =>
            item.id === step.id ? { ...item, titulo: value } : item) })} />
      </Card>)}
      <Button title="Adicionar etapa" variant="secondary" icon="plus" disabled={details.subtarefas.length >= 100}
        onPress={() => changeDetails({ subtarefas: [...details.subtarefas, {
          id: `${Date.now()}-${Math.random().toString(36).slice(2)}`, titulo: '', concluida: false }] })} />
      <Input label="Notas" placeholder="Ideias, referências e próximos passos" multiline value={details.notas}
        onChangeText={value => changeDetails({ notas: value })} maxLength={10000} />
    </Disclosure>

    <Disclosure title="Repetição" icon="repeat" subtitle={details.recorrencia === 'NENHUMA' ? 'Não repete' : details.recorrencia.toLowerCase()}>
      <Choices value={details.recorrencia} onChange={value => changeDetails({ recorrencia: value })} options={[
        { value: 'NENHUMA' as Recurrence, label: 'Não repetir' }, { value: 'DIARIA', label: 'Diariamente' },
        { value: 'SEMANAL', label: 'Semanalmente' }, { value: 'MENSAL', label: 'Mensalmente' }]} />
      <Label muted size="micro">
        Uma próxima ocorrência é criada ao concluir, a partir do prazo atual. Não há geração em segundo plano.
      </Label>
      <Label muted size="micro">Fuso: {details.fusoHorario}.</Label>
      {original?.proximaGerada ? <Label muted size="micro">Esta ocorrência já gerou a próxima. Reabri-la não cria outra cópia.</Label> : null}
    </Disclosure>

    <Disclosure title="Matriz de Eisenhower" icon="grid"
      subtitle={details.importante == null || details.urgente == null ? 'Ainda não classificada' : 'Classificada'}>
      <Label muted size="caption">{suggestion.reason} A sugestão não é aplicada sem sua confirmação.</Label>
      <Row style={{ justifyContent: 'space-between' }}>
        <Label>Importante</Label>
        <Switch accessibilityLabel="Tarefa importante" value={details.importante ?? false}
          onValueChange={value => changeDetails({ importante: value, urgente: details.urgente ?? suggestion.urgente })} />
      </Row>
      <Row style={{ justifyContent: 'space-between' }}>
        <Label>Urgente</Label>
        <Switch accessibilityLabel="Tarefa urgente" value={details.urgente ?? false}
          onValueChange={value => changeDetails({ urgente: value, importante: details.importante ?? suggestion.importante })} />
      </Row>
      <Button title="Usar sugestão" variant="soft" compact icon="zap"
        onPress={() => changeDetails({ importante: suggestion.importante, urgente: suggestion.urgente })} />
    </Disclosure>

    {!!original?.conclusoes?.length ? <Card>
      <Label size="subtitle">Histórico de conclusão</Label>
      {original.conclusoes.map((value, index) => <Label key={index} muted size="caption">
        {new Date(value).toLocaleString('pt-BR')}
      </Label>)}
    </Card> : null}

    <ErrorState message={error} />
    <Button title="Salvar tarefa" icon="check" loading={busy} disabled={loading || !dataLoaded}
      onPress={() => { void save(); }} />
    {!dataLoaded ? <Label muted size="caption">Aguarde o carregamento das categorias.</Label> : null}
  </Screen>;
}
