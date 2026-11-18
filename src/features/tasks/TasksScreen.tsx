import React, { useMemo, useState } from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import {
  Badge, Button, Card, Choices, DateSelector, EmptyState, FilterChip, FloatingActionButton,
  Label, LoadingSkeleton, Row, Screen, SearchBar, SectionHeader, Segmented, Sheet,
} from '../../components/ui';
import { DataFeedback } from '../../components/DataFeedback';
import { useData } from '../../state/DataProvider';
import {
  emptyFilters, filterError, filterTasks, Filters, GroupMode, groupTasks, sortTasks,
} from '../../domain/tasks';
import { priorities, statuses } from '../../types/models';
import TaskCard from './TaskCard';
import { useTheme } from '../../theme/ThemeProvider';

type SortMode = 'prazo' | 'prioridade' | 'personalizada';

export default function TasksScreen() {
  const { tasks, categories, loading, refresh } = useData();
  const [filters, setFilters] = useState<Filters>(emptyFilters);
  const [show, setShow] = useState(false);
  const [sort, setSort] = useState<SortMode>('prazo');
  const [group, setGroup] = useState<GroupMode>('date');
  const [limit, setLimit] = useState(40);
  const router = useRouter();
  const { colors } = useTheme();

  const update = <K extends keyof Filters>(key: K, value: Filters[K]) => {
    setFilters(current => ({ ...current, [key]: value })); setLimit(40);
  };
  const filtered = useMemo(() => sortTasks(filterTasks(tasks, filters), sort), [tasks, filters, sort]);
  const groups = useMemo(() => groupTasks(filtered, group), [filtered, group]);
  const activeCount = Object.entries(filters).filter(([, value]) => !!value).length;
  const error = filterError(filters);

  return <Screen title="Suas tarefas" subtitle="Menos ruído. Mais intenção."
    refreshing={loading} onRefresh={() => { void refresh(); }}
    action={<Button title="Nova" icon="plus" compact onPress={() => router.push('/novaTarefa')} />}
    fab={<FloatingActionButton label="Nova tarefa" onPress={() => router.push('/novaTarefa')} bottom={16} />}>
    <DataFeedback />
    <SearchBar value={filters.search} onChangeText={value => update('search', value)}
      placeholder="Buscar título, descrição, nota ou etiqueta" />

    <Row>
      <FilterChip title="Todas" selected={!filters.status} onPress={() => update('status', '')} />
      {(Object.keys(statuses) as (keyof typeof statuses)[]).map(status => (
        <FilterChip key={status} title={statuses[status]} selected={filters.status === status}
          onPress={() => update('status', status === filters.status ? '' : status)} />
      ))}
    </Row>

    <Row style={{ justifyContent: 'space-between' }}>
      <Row>
        <Button title={`Filtros${activeCount ? ` · ${activeCount}` : ''}`} icon="sliders" variant="secondary" compact
          onPress={() => setShow(true)} />
        {activeCount > 0 ? <Button title="Limpar" variant="ghost" compact onPress={() => setFilters(emptyFilters)} /> : null}
      </Row>
      <Button title="Categorias" icon="folder" variant="ghost" compact onPress={() => router.push('/categorias')} />
    </Row>

    <Segmented value={group} onChange={value => setGroup(value)} options={[
      { value: 'date', label: 'Por data', icon: 'calendar' },
      { value: 'category', label: 'Por área', icon: 'folder' },
      { value: 'none', label: 'Lista', icon: 'list' },
    ]} />
    <Row>
      <Label muted size="caption">Ordenar</Label>
      <Choices value={sort} onChange={value => setSort(value)} options={[
        { value: 'prazo', label: 'Prazo' }, { value: 'prioridade', label: 'Prioridade' },
        { value: 'personalizada', label: 'Minha ordem' }]} />
    </Row>

    <SectionHeader title="Lista de tarefas" subtitle={`${filtered.length} resultado(s)`}
      action={<Badge title={`${filtered.filter(t => t.status !== 'CONCLUIDA').length} abertas`} tone="primary" />} />

    {loading && !tasks.length ? <LoadingSkeleton rows={4} label="Carregando tarefas" />
      : !filtered.length ? <EmptyState title="Nenhuma tarefa por aqui"
        detail={activeCount || filters.search ? 'Ajuste os filtros para encontrar outras tarefas.' : 'Adicione sua primeira tarefa para começar.'}
        icon={activeCount || filters.search ? 'search' : 'check-circle'}
        action={<Button title="Nova tarefa" icon="plus" variant="soft" compact onPress={() => router.push('/novaTarefa')} />} />
        : <View style={{ gap: 8 }}>
          {groups.map(section => <View key={section.key} style={{ gap: 8 }}>
            <Row style={{ justifyContent: 'space-between', marginTop: 4 }}>
              <Label size="subtitle" weight="bold">{section.title}</Label>
              <Badge title={String(section.tasks.length)} tone="neutral" />
            </Row>
            {section.tasks.slice(0, limit).map(task => <TaskCard key={task.id} task={task} />)}
          </View>)}
          {filtered.length > limit ? <Button title="Mostrar mais tarefas" variant="secondary"
            onPress={() => setLimit(value => value + 40)} /> : null}
        </View>}

    <Sheet visible={show} title="Encontre o que importa" subtitle="Filtros combinados com lógica E." onClose={() => setShow(false)}>
      <Label size="subtitle">Prioridade</Label>
      <Choices value={filters.priority} onChange={value => update('priority', value)} options={[{ value: '', label: 'Todas' },
        ...Object.entries(priorities).map(([value, label]) => ({ value: value as Filters['priority'], label }))]} />
      <Label size="subtitle">Categoria</Label>
      <Choices value={filters.category} onChange={value => update('category', value)} options={[
        { value: '', label: 'Todas' }, { value: 'none', label: 'Sem categoria' },
        ...categories.map(category => ({ value: String(category.id), label: category.nome }))]} />
      <Card>
        <DateSelector label="Prazo a partir de" value={filters.start} onChange={value => update('start', value)} />
        <DateSelector label="Prazo até" value={filters.end} onChange={value => update('end', value)} />
      </Card>
      <Row>
        <FilterChip title="Somente atrasadas" selected={filters.overdue} onPress={() => update('overdue', !filters.overdue)} />
        <FilterChip title="Favoritas" selected={filters.favorites} onPress={() => update('favorites', !filters.favorites)} />
      </Row>
      {error ? <Label size="caption" style={{ color: colors.danger }}>{error}</Label> : null}
      <Button title={`Ver ${filtered.length} tarefas`} disabled={!!error} onPress={() => setShow(false)} />
      <Button title="Limpar filtros" variant="ghost" onPress={() => setFilters(emptyFilters)} />
    </Sheet>
  </Screen>;
}
