import React, { useMemo, useRef, useState } from 'react';
import { Pressable, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Feather from '@expo/vector-icons/Feather';
import {
  Badge, Button, EmptyState, ErrorState, IconButton, Label, ProgressRing, Row, Screen, Sheet,
} from '../../components/ui';
import { useFocus } from '../../state/FocusProvider';
import { useData } from '../../state/DataProvider';
import { defaultDetails } from '../../types/models';
import { taskInput, taskProgress } from '../../domain/tasks';
import { finishEarly, pauseTimer, remaining, resumeTimer } from '../../domain/focus';
import { cancelReminder, scheduleFocusEnd } from '../../services/reminders';
import { tokens, useTheme } from '../../theme/ThemeProvider';

export default function ConcentrationScreen() {
  const { taskId } = useLocalSearchParams<{ taskId?: string }>();
  const router = useRouter();
  const { colors, dark } = useTheme();
  const { tasks, mutate, busy } = useData();
  const { state, now, ready, error: focusError, update } = useFocus();
  const [message, setMessage] = useState<string | null>(null);
  const [confirmDone, setConfirmDone] = useState(false);
  const reminder = useRef<string | null>(null);
  const task = tasks.find(item => item.id === Number(taskId));
  const details = useMemo(() => ({ ...defaultDetails(), ...task?.detalhes }), [task]);
  const timer = state.timer;
  const sameSession = timer?.taskId === task?.id;

  const start = () => {
    if (!task) return;
    if (state.timer) { setMessage('Encerre a sessão atual na aba Foco antes de iniciar outra.'); return; }
    const endAt = Date.now() + state.durations.focus * 60000;
    void update(current => {
      if (current.timer) return current;
      const duration = current.durations.focus * 60000;
      return { ...current, timer: { id: `${Date.now()}-${Math.random().toString(36).slice(2)}`, mode: 'focus',
        duration, remaining: duration, startedAt: Date.now(), endAt: Date.now() + duration, taskId: task.id } };
    }).then(async () => { reminder.current = await scheduleFocusEnd(endAt, task.titulo); })
      .catch(e => setMessage(e instanceof Error ? e.message : 'Falha ao iniciar.'));
  };
  const pauseOrResume = () => {
    if (!timer) return;
    if (timer.endAt) {
      void cancelReminder(reminder.current).then(() => { reminder.current = null; });
    } else {
      void scheduleFocusEnd(Date.now() + timer.remaining, task?.titulo).then(id => { reminder.current = id; });
    }
    void update(current => ({ ...current, timer: current.timer
      ? current.timer.endAt ? pauseTimer(current.timer, Date.now()) : resumeTimer(current.timer, Date.now()) : null }))
      .catch(() => setMessage('Falha ao atualizar o cronômetro.'));
  };
  const stop = async (record: boolean) => {
    void cancelReminder(reminder.current).then(() => { reminder.current = null; });
    try {
      await update(current => {
        if (!current.timer) return current;
        if (!record) return { ...current, timer: null };
        const session = finishEarly(current.timer, Date.now());
        return { ...current, timer: null, sessions: session && !current.sessions.some(item => item.id === session.id)
          ? [...current.sessions, session] : current.sessions };
      });
    } catch (e) { setMessage(e instanceof Error ? e.message : 'Falha ao encerrar.'); }
  };
  const complete = async () => {
    if (!task) return;
    try { setMessage(null); await mutate(api => api.saveTask({ ...taskInput(task), status: 'CONCLUIDA' }, task.id), 'Tarefa concluída.');
      if (timer) await stop(true);
      setConfirmDone(false);
      if (router.canGoBack()) router.back(); else router.replace('/foco');
    } catch (e) { setMessage(e instanceof Error ? e.message : 'Falha ao concluir.'); }
  };
  const toggleStep = (stepId: string, value: boolean) => {
    if (!task) return;
    void mutate(api => api.saveTask({ ...taskInput(task), detalhes: { ...details,
      subtarefas: details.subtarefas.map(step => step.id === stepId ? { ...step, concluida: value } : step) } }, task.id),
      'Checklist atualizado.').catch(e => setMessage(e instanceof Error ? e.message : 'Falha ao salvar checklist.'));
  };

  if (!task) return <Screen title="Modo concentração" onBack={() => router.back()} subtitle="Escolha uma tarefa por vez.">
    <EmptyState title="Escolha uma tarefa para focar" detail="O modo concentração funciona com uma tarefa por vez."
      icon="target" />
    {tasks.filter(item => item.status !== 'CONCLUIDA').slice(0, 8).map(item => <Button key={item.id}
      title={item.titulo} icon="arrow-right" variant="secondary"
      onPress={() => router.replace({ pathname: '/concentracao', params: { taskId: String(item.id) } })} />)}
    <Button title="Ver todas as tarefas" icon="list" variant="ghost" onPress={() => router.replace('/tarefas')} />
  </Screen>;

  const time = timer && sameSession ? remaining(timer, now) : state.durations.focus * 60000;
  const seconds = Math.ceil(time / 1000);
  const progress = timer && sameSession ? (1 - time / timer.duration) * 100 : 0;
  const stepProgress = taskProgress(task);

  return <View style={{ flex: 1, backgroundColor: dark ? colors.background : colors.surfaceSecondary }}>
    <Screen title="Concentração" header={false} scroll contentStyle={{ gap: tokens.space.lg, paddingBottom: 40 }}>
      <Row style={{ justifyContent: 'space-between' }}>
        <IconButton icon="arrow-left" label="Sair do modo concentração" onPress={() => router.back()} />
        <Badge title="MODO CONCENTRAÇÃO" tone="primary" icon="maximize" />
        <IconButton icon="more-horizontal" label="Mais opções" onPress={() => setConfirmDone(true)} />
      </Row>

      <View style={{ alignItems: 'center', gap: 6 }}>
        <Label muted size="micro" style={{ letterSpacing: 1.4 }}>AGORA</Label>
        <Label size="heading" style={{ textAlign: 'center' }}>{task.titulo}</Label>
        {details.notas ? <Label muted size="caption" style={{ textAlign: 'center', maxWidth: 520 }} numberOfLines={3}>
          {details.notas}
        </Label> : <Label muted size="caption" style={{ textAlign: 'center' }}>Sem objetivo escrito. Use as notas da tarefa para registrar sua intenção.</Label>}
      </View>

      <View style={{ alignItems: 'center', gap: tokens.space.md }}>
        <ProgressRing size={252} stroke={12} value={progress} label="Progresso da sessão de concentração">
          <Label size="display" weight="bold" style={{ fontVariant: ['tabular-nums'] }}>
            {String(Math.floor(seconds / 60)).padStart(2, '0')}:{String(seconds % 60).padStart(2, '0')}
          </Label>
          <Label muted size="caption">{timer && sameSession ? timer.endAt ? 'Em foco' : 'Pausado' : 'Pronto para começar'}</Label>
        </ProgressRing>
        <Row style={{ justifyContent: 'center' }}>
          {!timer || !sameSession ? <Button title="Iniciar foco" icon="play" loading={busy} disabled={!ready}
            onPress={start} /> : <>
            <Button title={timer.endAt ? 'Pausar' : 'Retomar'} icon={timer.endAt ? 'pause' : 'play'}
              onPress={pauseOrResume} />
            <Button title="Encerrar" variant="secondary" icon="square" onPress={() => { void stop(true); }} />
          </>}
        </Row>
        {timer && !sameSession ? <Label size="caption" style={{ color: colors.warning, textAlign: 'center' }}>
          Existe uma sessão associada a outra tarefa. Encerre-a na aba Foco antes de iniciar esta.
        </Label> : null}
      </View>

      <View style={{ gap: 8 }}>
        <Row style={{ justifyContent: 'space-between' }}>
          <Label size="subtitle" weight="bold">Subtarefas</Label>
          <Label muted size="caption">{stepProgress}%</Label>
        </Row>
        {details.subtarefas.length ? details.subtarefas.map((step, index) => (
          <Pressable key={step.id} accessibilityRole="checkbox" accessibilityLabel={`Etapa ${index + 1}: ${step.titulo}`}
            accessibilityState={{ checked: step.concluida, disabled: busy }} disabled={busy}
            onPress={() => toggleStep(step.id, !step.concluida)}
            style={({ pressed }) => ({ flexDirection: 'row', alignItems: 'center', gap: 10, minHeight: 48,
              paddingHorizontal: 14, borderRadius: tokens.radius.md, opacity: pressed ? 0.7 : 1,
              backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border })}>
            <Feather name={step.concluida ? 'check-circle' : 'circle'} size={19}
              color={step.concluida ? colors.success : colors.muted} />
            <Label numberOfLines={2} style={{ flex: 1, textDecorationLine: step.concluida ? 'line-through' : 'none',
              color: step.concluida ? colors.muted : colors.text }}>{step.titulo}</Label>
          </Pressable>
        )) : <Label muted size="caption">Esta tarefa não tem checklist. Você pode adicionar etapas nos detalhes.</Label>}
      </View>

      <ErrorState message={message || focusError} />

      <Row>
        <Button title="Concluir tarefa" icon="check" variant="soft" disabled={busy} onPress={() => setConfirmDone(true)} />
        <Button title="Abrir detalhes" icon="edit-2" variant="secondary"
          onPress={() => router.push({ pathname: '/editarTarefa', params: { id: task.id } })} />
      </Row>
    </Screen>

    <Sheet visible={confirmDone} title="Concluir esta tarefa?" subtitle="O tempo de foco decorrido será registrado."
      onClose={() => setConfirmDone(false)}>
      <Label muted>“{task.titulo}” será marcada como concluída. Se houver recorrência, a próxima ocorrência será criada pelo servidor.</Label>
      <Button title="Concluir e sair" icon="check" loading={busy} onPress={() => { void complete(); }} />
      <Button title="Continuar focando" variant="ghost" onPress={() => setConfirmDone(false)} />
      {details.subtarefas.some(step => !step.concluida) ? <Label size="caption" style={{ color: colors.warning }}>
        Ainda há etapas abertas no checklist. Você pode concluir mesmo assim.
      </Label> : null}
    </Sheet>
  </View>;
}
