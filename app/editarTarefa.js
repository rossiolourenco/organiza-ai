import React, { useEffect, useState } from 'react';

import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  ActivityIndicator,
} from 'react-native';

import {
  useLocalSearchParams,
  useRouter,
} from 'expo-router';

import {
  obterApiUrl,
  fetchComTimeout,
} from '../servicos/api';

export default function EditarTarefa() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const id = Array.isArray(params.id)
    ? params.id[0]
    : params.id;

  const usuarioId = Array.isArray(params.usuarioId)
    ? params.usuarioId[0]
    : params.usuarioId;

  const nome = Array.isArray(params.nome)
    ? params.nome[0]
    : params.nome;

  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [prioridade, setPrioridade] = useState('MEDIA');
  const [status, setStatus] = useState('PENDENTE');
  const [dataPrazo, setDataPrazo] = useState('');

  const [categorias, setCategorias] = useState([]);
  const [categoriaId, setCategoriaId] = useState(null);

  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);

  async function carregarDados() {
    try {
      setCarregando(true);

      const url = obterApiUrl();

      const [respostaTarefa, respostaCategorias] =
        await Promise.all([
          fetchComTimeout(
            `${url}/api/tarefas/${id}?usuarioId=${usuarioId}`
          ),
          fetchComTimeout(
            `${url}/api/categorias?usuarioId=${usuarioId}`
          ),
        ]);

      if (!respostaTarefa.ok) {
        Alert.alert(
          'Erro',
          'Não foi possível carregar a tarefa.'
        );
        return;
      }

      if (!respostaCategorias.ok) {
        Alert.alert(
          'Erro',
          'Não foi possível carregar as categorias.'
        );
        return;
      }

      const tarefa = await respostaTarefa.json();
      const listaCategorias =
        await respostaCategorias.json();

      setTitulo(tarefa.titulo || '');
      setDescricao(tarefa.descricao || '');
      setPrioridade(tarefa.prioridade || 'MEDIA');
      setStatus(tarefa.status || 'PENDENTE');
      setDataPrazo(tarefa.dataPrazo || '');

      setCategoriaId(
        tarefa.categoria
          ? tarefa.categoria.id
          : null
      );

      setCategorias(listaCategorias);
    } catch (erro) {
      Alert.alert(
        'Erro de conexão',
        'Não foi possível consultar os dados no servidor.'
      );
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregarDados();
  }, []);

  async function salvar() {
    if (titulo.trim() === '') {
      Alert.alert(
        'Atenção',
        'Informe o título da tarefa.'
      );
      return;
    }

    if (dataPrazo.trim() !== '') {
      const formatoData = /^\d{4}-\d{2}-\d{2}$/;

      if (!formatoData.test(dataPrazo.trim())) {
        Alert.alert(
          'Data inválida',
          'Informe a data no formato AAAA-MM-DD.'
        );
        return;
      }
    }

    try {
      setSalvando(true);

      const url = obterApiUrl();

      const tarefaAtualizada = {
        titulo: titulo.trim(),
        descricao: descricao.trim(),
        prioridade,
        status,
        dataPrazo:
          dataPrazo.trim() === ''
            ? null
            : dataPrazo.trim(),
        categoria: categoriaId
          ? {
              id: Number(categoriaId),
            }
          : null,
      };

      const resposta = await fetchComTimeout(
        `${url}/api/tarefas/${id}?usuarioId=${usuarioId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(tarefaAtualizada),
        }
      );

      if (resposta.status === 404) {
        Alert.alert(
          'Tarefa não encontrada',
          'A tarefa não existe ou não pertence a este usuário.'
        );
        return;
      }

      if (!resposta.ok) {
        Alert.alert(
          'Erro',
          `Não foi possível atualizar a tarefa. Código ${resposta.status}.`
        );
        return;
      }

      const tarefaSalva = await resposta.json();

      Alert.alert(
        'Tarefa atualizada',
        `"${tarefaSalva.titulo}" foi atualizada com sucesso.`,
        [
          {
            text: 'OK',
            onPress: () =>
              router.replace({
                pathname: '/home',
                params: {
                  usuarioId,
                  nome,
                },
              }),
          },
        ]
      );
    } catch (erro) {
      Alert.alert(
        'Erro de conexão',
        'Não foi possível atualizar a tarefa no servidor.'
      );
    } finally {
      setSalvando(false);
    }
  }

  if (carregando) {
    return (
      <View style={styles.carregando}>
        <ActivityIndicator
          size="large"
          color="#4f46e5"
        />

        <Text style={styles.carregandoTexto}>
          Carregando tarefa...
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.conteudo}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.titulo}>
        Editar tarefa
      </Text>

      <Text style={styles.subtitulo}>
        Altere as informações e salve.
      </Text>

      <Text style={styles.label}>
        Título
      </Text>

      <TextInput
        style={styles.input}
        value={titulo}
        onChangeText={setTitulo}
        placeholder="Título da tarefa"
      />

      <Text style={styles.label}>
        Descrição
      </Text>

      <TextInput
        style={[styles.input, styles.area]}
        value={descricao}
        onChangeText={setDescricao}
        placeholder="Descrição da tarefa"
        multiline
      />

      <Text style={styles.label}>
        Prioridade
      </Text>

      <View style={styles.opcoes}>
        {['BAIXA', 'MEDIA', 'ALTA'].map((item) => (
          <TouchableOpacity
            key={item}
            style={[
              styles.opcao,
              prioridade === item &&
                styles.opcaoAtiva,
            ]}
            onPress={() =>
              setPrioridade(item)
            }
          >
            <Text
              style={[
                styles.opcaoTexto,
                prioridade === item &&
                  styles.opcaoTextoAtiva,
              ]}
            >
              {item === 'MEDIA'
                ? 'MÉDIA'
                : item}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>
        Data de prazo
      </Text>

      <TextInput
        style={styles.input}
        value={dataPrazo}
        onChangeText={setDataPrazo}
        placeholder="AAAA-MM-DD"
        autoCapitalize="none"
      />

      <Text style={styles.label}>
        Categoria
      </Text>

      <TouchableOpacity
        style={[
          styles.categoria,
          categoriaId === null &&
            styles.categoriaAtiva,
        ]}
        onPress={() =>
          setCategoriaId(null)
        }
      >
        <Text
          style={[
            styles.categoriaTexto,
            categoriaId === null &&
              styles.categoriaTextoAtiva,
          ]}
        >
          Sem categoria
        </Text>
      </TouchableOpacity>

      {categorias.map((categoria) => (
        <TouchableOpacity
          key={categoria.id}
          style={[
            styles.categoria,
            categoriaId === categoria.id &&
              styles.categoriaAtiva,
          ]}
          onPress={() =>
            setCategoriaId(categoria.id)
          }
        >
          <View style={styles.categoriaLinha}>
            <View
              style={[
                styles.corCategoria,
                {
                  backgroundColor:
                    categoria.cor || '#667085',
                },
              ]}
            />

            <Text
              style={[
                styles.categoriaTexto,
                categoriaId === categoria.id &&
                  styles.categoriaTextoAtiva,
              ]}
            >
              {categoria.nome}
            </Text>
          </View>
        </TouchableOpacity>
      ))}

      <TouchableOpacity
        style={[
          styles.botao,
          salvando &&
            styles.botaoDesabilitado,
        ]}
        onPress={salvar}
        disabled={salvando}
      >
        {salvando ? (
          <ActivityIndicator
            color="#ffffff"
          />
        ) : (
          <Text style={styles.botaoTexto}>
            Salvar alterações
          </Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f8fc',
  },

  conteudo: {
    padding: 20,
    paddingBottom: 50,
  },

  carregando: {
    flex: 1,
    backgroundColor: '#f7f8fc',
    justifyContent: 'center',
    alignItems: 'center',
  },

  carregandoTexto: {
    color: '#667085',
    marginTop: 12,
  },

  titulo: {
    color: '#182230',
    fontSize: 27,
    fontWeight: 'bold',
  },

  subtitulo: {
    color: '#667085',
    marginTop: 5,
    marginBottom: 24,
  },

  label: {
    color: '#344054',
    fontWeight: 'bold',
    marginBottom: 7,
  },

  input: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#d0d5dd',
    borderRadius: 9,
    padding: 13,
    fontSize: 15,
    marginBottom: 17,
  },

  area: {
    height: 100,
    textAlignVertical: 'top',
  },

  opcoes: {
    flexDirection: 'row',
    marginBottom: 20,
  },

  opcao: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#d0d5dd',
    borderRadius: 9,
    padding: 11,
    alignItems: 'center',
    marginRight: 6,
  },

  opcaoAtiva: {
    borderColor: '#4f46e5',
    backgroundColor: '#eef2ff',
  },

  opcaoTexto: {
    color: '#667085',
    fontSize: 12,
    fontWeight: 'bold',
  },

  opcaoTextoAtiva: {
    color: '#4f46e5',
  },

  categoria: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#d0d5dd',
    borderRadius: 9,
    padding: 12,
    marginBottom: 8,
  },

  categoriaAtiva: {
    borderColor: '#4f46e5',
    backgroundColor: '#eef2ff',
  },

  categoriaLinha: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  corCategoria: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 9,
  },

  categoriaTexto: {
    color: '#475467',
    fontWeight: '600',
  },

  categoriaTextoAtiva: {
    color: '#4f46e5',
    fontWeight: 'bold',
  },

  botao: {
    backgroundColor: '#4f46e5',
    padding: 15,
    borderRadius: 9,
    alignItems: 'center',
    marginTop: 18,
  },

  botaoDesabilitado: {
    opacity: 0.7,
  },

  botaoTexto: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});