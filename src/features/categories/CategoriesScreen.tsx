import React, { useState } from 'react';
import { Pressable, View } from 'react-native';
import { useRouter } from 'expo-router';
import Feather from '@expo/vector-icons/Feather';
import {
  Badge, Button, Confirm, EmptyState, ErrorState, Input, Label, LoadingSkeleton, PremiumCard, Row, Screen, Sheet,
} from '../../components/ui';
import { DataFeedback } from '../../components/DataFeedback';
import { useData } from '../../state/DataProvider';
import { Category } from '../../types/models';
import { categoryColors, tokens, useTheme } from '../../theme/ThemeProvider';

export default function CategoriesScreen() {
  const { categories, tasks, loading, busy, mutate, refresh } = useData();
  const router = useRouter();
  const [sheet, setSheet] = useState(false);
  const [editing, setEditing] = useState<number | undefined>();
  const [name, setName] = useState('');
  const [color, setColor] = useState(categoryColors[0]);
  const [deleting, setDeleting] = useState<Category | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { colors } = useTheme();

  const openCreate = () => { setEditing(undefined); setName(''); setColor(categoryColors[0]); setError(null); setSheet(true); };
  const openEdit = (category: Category) => {
    setEditing(category.id); setName(category.nome); setColor(category.cor || categoryColors[0]); setError(null); setSheet(true);
  };
  const save = async () => {
    if (!name.trim()) { setError('Informe o nome da categoria.'); return; }
    try {
      setError(null);
      await mutate(api => api.saveCategory({ nome: name.trim(), cor: color }, editing),
        editing ? 'Categoria atualizada.' : 'Categoria criada.');
      setSheet(false);
    } catch (e) { setError(e instanceof Error ? e.message : 'Falha ao salvar categoria.'); }
  };
  const remove = async () => {
    if (!deleting) return;
    try {
      setError(null);
      await mutate(api => api.deleteCategory(deleting.id), 'Categoria excluída. Suas tarefas foram preservadas.');
      setDeleting(null);
    } catch (e) { setDeleting(null); setError(e instanceof Error ? e.message : 'Falha ao excluir categoria.'); }
  };

  return <Screen title="Um lugar para cada coisa." subtitle="Organize suas tarefas por áreas da vida."
    refreshing={loading} onRefresh={() => { void refresh(); }} onBack={() => router.back()}
    action={<Button title="Nova" icon="plus" compact onPress={openCreate} />}>
    <DataFeedback />
    <ErrorState message={error} />
    <Row>
      <Badge title={`${categories.length} categorias`} tone="primary" icon="folder" />
      <Badge title="Excluir preserva tarefas" tone="success" icon="shield" />
    </Row>

    {loading && !categories.length ? <LoadingSkeleton rows={3} label="Carregando categorias" />
      : !categories.length ? <EmptyState title="Sua organização, do seu jeito"
        detail="Crie categorias para dar contexto às tarefas e separar áreas da vida." icon="folder"
        action={<Button title="Criar categoria" icon="plus" variant="soft" compact onPress={openCreate} />} />
        : categories.map(category => {
          const count = tasks.filter(task => task.categoria?.id === category.id).length;
          const done = tasks.filter(task => task.categoria?.id === category.id && task.status === 'CONCLUIDA').length;
          return <PremiumCard key={category.id} style={{ gap: tokens.space.sm }}>
            <Row style={{ justifyContent: 'space-between', flexWrap: 'nowrap' }}>
              <Row style={{ flexWrap: 'nowrap', flex: 1 }}>
                <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: category.cor || colors.primary }} />
                <Label size="subtitle" weight="bold" numberOfLines={1}>{category.nome}</Label>
              </Row>
              <Badge title={`${count} tarefa(s)`} tone="neutral" />
            </Row>
            <Label muted size="micro">{done} concluída(s) · {count ? Math.round(done / count * 100) : 0}% de conclusão</Label>
            <Row>
              <Button title="Editar" icon="edit-2" variant="secondary" compact onPress={() => openEdit(category)} />
              <Button title="Excluir" icon="trash-2" variant="ghost" compact onPress={() => setDeleting(category)} />
            </Row>
          </PremiumCard>;
        })}

    <Sheet visible={sheet} title={editing ? 'Editar categoria' : 'Nova categoria'}
      subtitle="Nome curto e uma cor de identificação." onClose={() => setSheet(false)}>
      <Input label="Nome da categoria" value={name} onChangeText={setName} placeholder="Estudos, trabalho, pessoal…"
        maxLength={100} error={error} />
      <Label size="caption" weight="semibold" muted>Cor</Label>
      <Row>{categoryColors.map(value => <Pressable key={value} accessibilityRole="radio" accessibilityLabel={`Cor ${value}`}
        accessibilityState={{ selected: color === value }} onPress={() => setColor(value)}
        style={{ width: 46, height: 46, borderRadius: 15, alignItems: 'center', justifyContent: 'center',
          borderWidth: color === value ? 2 : 0, borderColor: colors.text }}>
        <View style={{ width: 28, height: 28, borderRadius: 10, backgroundColor: value }} />
      </Pressable>)}</Row>
      <Button title={editing ? 'Salvar alterações' : 'Criar categoria'} icon="check" loading={busy}
        onPress={() => { void save(); }} />
      {editing ? <Button title="Cancelar edição" variant="ghost" disabled={busy} onPress={() => setSheet(false)} /> : null}
    </Sheet>

    <Confirm visible={!!deleting} title="Excluir categoria?" confirmLabel="Excluir categoria"
      message={`“${deleting?.nome}” será removida. As tarefas continuam existindo, sem categoria.`}
      busy={busy} onCancel={() => setDeleting(null)} onConfirm={() => { void remove(); }} />

    <Row style={{ justifyContent: 'center', marginTop: tokens.space.sm }}>
      <Feather name="info" size={12} color={colors.muted} />
      <Label muted size="micro">A exclusão é transacional no servidor e não apaga tarefas.</Label>
    </Row>
  </Screen>;
}
