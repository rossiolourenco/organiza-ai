import React, { useEffect, useRef, useState } from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import {
  Badge, Button, Card, Choices, EmptyState, ErrorState, IconButton, Input, Label, LoadingSkeleton,
  MetricCard, PremiumCard, ProgressRing, Row, Screen, Sheet,
} from '../../components/ui';
import { useFocus } from '../../state/FocusProvider';
import { useData } from '../../state/DataProvider';
import { finishEarly, FocusMode, focusMinutes, pauseTimer, remaining, resumeTimer } from '../../domain/focus';
import { cancelReminder, scheduleFocusEnd } from '../../services/reminders';
import { tokens, useTheme } from '../../theme/ThemeProvider';

const labels: Record<FocusMode, string> = { focus: 'Foco', short: 'Pausa curta', long: 'Pausa longa' };

export default function FocusScreen() {
  const { state, now, ready, busy, error, update, syncSessions } = useFocus();
  const { tasks } = useData();
  const router = useRouter();
  const [mode, setMode] = useState<FocusMode>('focus');
  const [taskId, setTaskId] = useState('');
  const [settings, setSettings] = useState(false);
  const [picker, setPicker] = useState(false);
  const [durations, setDurations] = useState({ focus: '25', short: '5', long: '15' });
  const [message, setMessage] = useState<string | null>(null);
  const [cancel, setCancel] = useState(false);
  const { colors } = useTheme();
  const reminder = useRef<string | null>(null);

  // Re-sincroniza as sessões concluídas (outro aparelho pode ter registrado).
  useEffect(() => { void syncSessions(); }, [syncSessions]);

  useEffect(() => {
    if (ready) setDurations({ focus: String(state.durations.focus), short: String(state.durations.short),
      long: String(state.durations.long) });
  }, [ready, state.durations]);

  const run = async (fn: Parameters<typeof update>[0]) => {
    try { setMessage(null); await update(fn); } catch (e) { setMessage(e instanceof Error ? e.message : 'Falha ao salvar foco.'); }
  };
  const timer = state.timer;
  const time = timer ? remaining(timer, now) : state.durations[mode] * 60000;
  const seconds = Math.ceil(time / 1000);
  const progress = timer ? (1 - time / timer.duration) * 100 : 0;
  const minutes = focusMinutes(state.sessions);
  const selectedTask = tasks.find(task => task.id === Number(taskId));
  const activeTask = timer?.taskId ? tasks.find(task => task.id === timer.taskId) : undefined;

  const start = () => run(current => {
    if (current.timer) return current;
    const duration = current.durations[mode] * 60000;
    return { ...current, timer: { id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      mode, duration, remaining: duration, startedAt: Date.now(), endAt: Date.now() + duration,
      taskId: taskId ? Number(taskId) : null } };
  });
  const saveSettings = async () => {
    const values = { focus: Number(durations.focus), short: Number(durations.short), long: Number(durations.long) };
    if (Object.values(values).some(value => !Number.isInteger(value) || value < 1 || value > 180)) {
      setMessage('Use durações inteiras entre 1 e 180 minutos.'); return;
    }
    try { await update(current => ({ ...current, durations: values })); setSettings(false); setMessage(null); }
    catch { setMessage('Não foi possível salvar as durações.'); }
  };
  const end = (discard: boolean) => {
    void cancelReminder(reminder.current).then(() => { reminder.current = null; });
    void run(current => {
      if (!current.timer) return current;
      if (discard) return { ...current, timer: null };
      const session = finishEarly(current.timer, Date.now());
      return { ...current, timer: null,
        sessions: session && !current.sessions.some(item => item.id === session.id)
          ? [...current.sessions, session] : current.sessions };
    }).then(() => setCancel(false));
  };
  const startWithReminder = () => {
    const endAt = Date.now() + state.durations[mode] * 60000;
    void start().then(async () => {
      reminder.current = await scheduleFocusEnd(endAt, selectedTask?.titulo);
    });
  };
  const pauseOrResume = () => {
    if (!timer) return;
    if (timer.endAt) {
      void cancelReminder(reminder.current).then(() => { reminder.current = null; });
    } else {
      const endAt = Date.now() + timer.remaining;
      void scheduleFocusEnd(endAt, activeTask?.titulo).then(id => { reminder.current = id; });
    }
    void run(current => ({ ...current, timer: current.timer
      ? current.timer.endAt ? pauseTimer(current.timer, Date.now()) : resumeTimer(current.timer, Date.now()) : null }));
  };

  return <Screen title="Uma coisa de cada vez." subtitle="Proteja sua atenção. Faça uma pausa. Recomece."
    refreshing={false} onRefresh={() => { void syncSessions(); }}
    action={<IconButton icon="sliders" label="Durações das sessões" onPress={() => setSettings(true)} />}>
    <ErrorState message={message || error} />
    {!ready ? <LoadingSkeleton rows={2} label="Preparando seu foco" /> : <>
      {!timer ? <Choices value={mode} onChange={setMode} options={(Object.keys(labels) as FocusMode[]).map(value => ({ value, label: labels[value] }))} /> : null}

      <PremiumCard style={{ alignItems: 'center', paddingVertical: tokens.space.xl, gap: tokens.space.sm }}>
        <Badge title={labels[timer?.mode || mode]} tone={timer?.mode === 'focus' ? 'primary' : 'success'} />
        <ProgressRing size={248} stroke={13} value={progress} label="Progresso da sessão de foco">
          <Label size="display" weight="bold" style={{ fontVariant: ['tabular-nums'] }}>
            {String(Math.floor(seconds / 60)).padStart(2, '0')}:{String(seconds % 60).padStart(2, '0')}
          </Label>
          <Label muted size="caption">
            {timer ? timer.endAt ? 'Encontre seu ritmo' : 'Pausado' : 'Seu momento de atenção'}
          </Label>
          {activeTask ? <Label size="micro" style={{ color: colors.primary, maxWidth: 170, textAlign: 'center' }}
            numberOfLines={2}>{activeTask.titulo}</Label> : null}
        </ProgressRing>
        <Row style={{ justifyContent: 'center' }}>
          {!timer ? <>
            <Button title="Iniciar sessão" icon="play" loading={busy} onPress={startWithReminder} />
            <Button title={selectedTask ? 'Trocar tarefa' : 'Associar tarefa'} icon="target" variant="secondary"
              onPress={() => setPicker(true)} />
          </> : <>
            <Button title={timer.endAt ? 'Pausar' : 'Retomar'} icon={timer.endAt ? 'pause' : 'play'} loading={busy}
              onPress={pauseOrResume} />
            <Button title="Encerrar" variant="secondary" icon="square" disabled={busy} onPress={() => setCancel(true)} />
          </>}
        </Row>
        {selectedTask && !timer ? <Label muted size="caption">Associada a: {selectedTask.titulo}</Label> : null}
        <Row>
          <Button title="Modo concentração" icon="maximize" variant="soft" compact
            onPress={() => { setPicker(false); setSettings(false);
              router.push(activeTask ? { pathname: '/concentracao', params: { taskId: String(activeTask.id) } }
                : selectedTask ? { pathname: '/concentracao', params: { taskId: String(selectedTask.id) } } : '/concentracao'); }} />
          {timer ? <Button title="Durações" icon="sliders" variant="ghost" compact onPress={() => setSettings(true)} /> : null}
        </Row>
      </PremiumCard>

      <Row style={{ alignItems: 'stretch' }}>
        <MetricCard value={`${minutes.today} min`} label="Hoje" icon="sun" tone="warning" />
        <MetricCard value={`${minutes.week} min`} label="Nesta semana" icon="bar-chart-2" tone="primary" />
        <MetricCard value={state.sessions.filter(item => item.mode === 'focus').length} label="Sessões totais" icon="check-circle" tone="success" />
      </Row>

      <Label muted size="micro">
        Salvo neste aparelho, para esta conta. Ao retornar ao app, o tempo é recalculado pelo relógio.
        Pausas não contam como tempo de foco. Sessões encerradas antes de 1 minuto não entram no histórico.
      </Label>

      <Card>
        <Row style={{ justifyContent: 'space-between' }}>
          <Label size="subtitle" weight="bold">Seu histórico</Label>
          <Badge title={`${state.sessions.length} sessões`} tone="neutral" />
        </Row>
        {!state.sessions.length ? <EmptyState title="Sua primeira sessão está por vir"
          detail="Sessões completas aparecem aqui. Pausas não contam como tempo de foco." icon="clock" />
          : [...state.sessions].reverse().slice(0, 30).map(session => <Row key={session.id}
            style={{ justifyContent: 'space-between', flexWrap: 'nowrap' }}>
            <View style={{ flex: 1 }}>
              <Label size="caption" weight="semibold">
                {labels[session.mode]} · {Math.round(session.duration / 60000)} min
              </Label>
              <Label muted size="micro">{new Date(session.completedAt).toLocaleString('pt-BR')}</Label>
            </View>
            {session.taskId ? <Badge title={tasks.find(task => task.id === session.taskId)?.titulo.slice(0, 22) || 'Tarefa'}
              tone="primary" /> : <Badge title="Foco livre" tone="neutral" />}
          </Row>)}
        {state.sessions.length > 30 ? <Label muted size="micro">
          Exibindo as 30 sessões mais recentes. Os totais incluem todo o histórico.
        </Label> : null}
      </Card>
    </>}

    <Sheet visible={settings} title="Seu ritmo de foco" subtitle="As durações valem a partir da próxima sessão."
      onClose={() => setSettings(false)}>
      {(Object.keys(labels) as FocusMode[]).map(value => <Input key={value} label={`${labels[value]} (minutos)`}
        value={durations[value]} keyboardType="number-pad" maxLength={3}
        onChangeText={input => setDurations(current => ({ ...current, [value]: input }))} />)}
      <ErrorState message={message} />
      <Button title="Salvar durações" loading={busy} disabled={!ready} onPress={() => { void saveSettings(); }} />
    </Sheet>

    <Sheet visible={picker} title="Em que você vai focar?" subtitle="A tarefa fica associada apenas à sessão." onClose={() => setPicker(false)}>
      <Button title="Foco livre" icon="circle" variant={taskId ? 'secondary' : 'soft'}
        onPress={() => { setTaskId(''); setPicker(false); }} />
      {tasks.filter(task => task.status !== 'CONCLUIDA').slice(0, 30).map(task => <Button key={task.id}
        title={task.titulo} variant={String(task.id) === taskId ? 'soft' : 'secondary'} icon={String(task.id) === taskId ? 'check' : 'circle'}
        onPress={() => { setTaskId(String(task.id)); setPicker(false); }} />)}
      {!tasks.filter(task => task.status !== 'CONCLUIDA').length ? <Label muted size="caption">
        Nenhuma tarefa aberta. Inicie com foco livre.
      </Label> : null}
    </Sheet>

    <Sheet visible={cancel} title="Encerrar esta sessão?" subtitle="Escolha como registrar o tempo." onClose={() => setCancel(false)}>
      <Label>Você pode registrar apenas o tempo realmente decorrido ou descartar a sessão.</Label>
      <Button title="Registrar tempo decorrido" icon="save" variant="soft" disabled={busy} onPress={() => end(false)} />
      <Button title="Descartar sessão" icon="trash-2" variant="danger" disabled={busy} onPress={() => end(true)} />
      <Button title="Continuar focando" variant="ghost" disabled={busy} onPress={() => setCancel(false)} />
    </Sheet>
  </Screen>;
}
