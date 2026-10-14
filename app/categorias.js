import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { fetchComTimeout, obterApiUrl } from '../servicos/api';

const CORES = ['#4f46e5', '#dc2626', '#16a34a', '#f59e0b', '#0891b2', '#9333ea'];

export default function Categorias() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const usuarioId = Array.isArray(params.usuarioId) ? params.usuarioId[0] : params.usuarioId;
  const [categorias, setCategorias] = useState([]);
  const [nome, setNome] = useState('');
  const [cor, setCor] = useState(CORES[0]);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [excluindo, setExcluindo] = useState(null);

  const carregar = useCallback(async () => {
    if (!usuarioId) { Alert.alert('Erro', 'Usuário não identificado.'); setCarregando(false); return; }
    try {
      setCarregando(true);
      const resposta = await fetchComTimeout(`${obterApiUrl()}/api/categorias?usuarioId=${encodeURIComponent(usuarioId)}`);
      if (!resposta.ok) throw new Error(`HTTP ${resposta.status}`);
      const dados = await resposta.json();
      setCategorias(Array.isArray(dados) ? dados : []);
    } catch (erro) {
      Alert.alert('Erro', `Não foi possível carregar categorias. ${erro.message}`);
    } finally { setCarregando(false); }
  }, [usuarioId]);

  useFocusEffect(useCallback(() => { carregar(); }, [carregar]));

  async function cadastrar() {
    if (!nome.trim()) { Alert.alert('Atenção', 'Informe o nome da categoria.'); return; }
    if (salvando) return;
    setSalvando(true);
    try {
      const resposta = await fetchComTimeout(`${obterApiUrl()}/api/categorias?usuarioId=${encodeURIComponent(usuarioId)}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome: nome.trim(), cor }),
      });
      if (!resposta.ok) throw new Error(`HTTP ${resposta.status}`);
      setNome('');
      Alert.alert('Sucesso', 'Categoria cadastrada.');
      await carregar();
    } catch (erro) { Alert.alert('Erro', `Não foi possível cadastrar. ${erro.message}`); }
    finally { setSalvando(false); }
  }

  function confirmarExclusao(categoria) {
    if (excluindo !== null) return;
    Alert.alert('Excluir categoria', `Excluir "${categoria.nome}"? As tarefas devem permanecer sem categoria.`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Excluir', style: 'destructive', onPress: () => excluir(categoria) },
    ]);
  }

  async function excluir(categoria) {
    if (excluindo !== null) return;
    setExcluindo(categoria.id);
    try {
      const resposta = await fetchComTimeout(`${obterApiUrl()}/api/categorias/${categoria.id}?usuarioId=${encodeURIComponent(usuarioId)}`, { method: 'DELETE' });
      if (!resposta.ok) throw new Error(`HTTP ${resposta.status}`);
      await carregar();
      Alert.alert('Sucesso', 'Categoria excluída. Confira as tarefas vinculadas.');
    } catch (erro) { Alert.alert('Erro', `Não foi possível excluir. ${erro.message}`); }
    finally { setExcluindo(null); }
  }

  return <ScrollView style={styles.container} contentContainerStyle={styles.conteudo} keyboardShouldPersistTaps="handled">
    <Text style={styles.titulo}>Minhas categorias</Text>
    <Text style={styles.ajuda}>Cadastre categorias para organizar suas tarefas.</Text>
    <Text style={styles.label}>Nome da categoria</Text>
    <TextInput style={styles.input} value={nome} onChangeText={setNome} placeholder="Ex.: Estudos" maxLength={80} />
    <Text style={styles.label}>Cor</Text>
    <View style={styles.cores}>{CORES.map(item => <TouchableOpacity key={item} accessibilityLabel={`Cor ${item}`} onPress={() => setCor(item)} style={[styles.cor, { backgroundColor: item }, cor === item && styles.corAtiva]} />)}</View>
    <TouchableOpacity style={[styles.botao, salvando && styles.desabilitado]} disabled={salvando} onPress={cadastrar}>
      {salvando ? <ActivityIndicator color="#fff" /> : <Text style={styles.botaoTexto}>Cadastrar categoria</Text>}
    </TouchableOpacity>
    <Text style={styles.subtitulo}>Categorias cadastradas</Text>
    {carregando ? <ActivityIndicator color="#4f46e5" /> : categorias.length === 0 ? <Text style={styles.ajuda}>Nenhuma categoria cadastrada.</Text> : categorias.map(categoria => <View key={categoria.id} style={styles.item}>
      <View style={[styles.corPequena, { backgroundColor: categoria.cor || '#667085' }]} />
      <Text style={styles.nomeItem}>{categoria.nome}</Text>
      <TouchableOpacity disabled={excluindo !== null} onPress={() => confirmarExclusao(categoria)}>
        <Text style={styles.excluir}>{excluindo === categoria.id ? 'Excluindo...' : 'Excluir'}</Text>
      </TouchableOpacity>
    </View>)}
    <TouchableOpacity onPress={() => router.back()} style={styles.voltar}><Text style={styles.voltarTexto}>Voltar às tarefas</Text></TouchableOpacity>
  </ScrollView>;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f7f8fc' }, conteudo: { padding: 20, paddingBottom: 45 },
  titulo: { fontSize: 25, fontWeight: 'bold', color: '#182230' },
  ajuda: { color: '#667085', marginTop: 8, marginBottom: 20 },
  label: { fontWeight: 'bold', color: '#344054', marginBottom: 8 },
  input: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#d0d5dd', borderRadius: 9, padding: 13, marginBottom: 18 },
  cores: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 20 },
  cor: { width: 34, height: 34, borderRadius: 17, marginRight: 12, marginBottom: 8 },
  corAtiva: { borderWidth: 3, borderColor: '#182230' },
  botao: { backgroundColor: '#4f46e5', padding: 15, borderRadius: 9, alignItems: 'center' },
  botaoTexto: { color: '#fff', fontWeight: 'bold' }, desabilitado: { opacity: 0.65 },
  subtitulo: { fontWeight: 'bold', fontSize: 19, color: '#182230', marginTop: 30, marginBottom: 12 },
  item: { backgroundColor: '#fff', borderRadius: 9, padding: 14, flexDirection: 'row', alignItems: 'center', marginBottom: 9 },
  corPequena: { width: 13, height: 13, borderRadius: 7, marginRight: 12 },
  nomeItem: { flex: 1, color: '#344054', fontWeight: '600' },
  excluir: { color: '#b42318', fontWeight: 'bold' },
  voltar: { marginTop: 22, alignItems: 'center' }, voltarTexto: { color: '#4f46e5', fontWeight: 'bold' },
});
