import React, { useEffect, useState } from "react";

import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  ActivityIndicator,
} from "react-native";

import { useLocalSearchParams, useRouter } from "expo-router";

import { obterApiUrl, fetchComTimeout } from "../servicos/api";

export default function NovaTarefa() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const usuarioId = Array.isArray(params.usuarioId)
    ? params.usuarioId[0]
    : params.usuarioId;

  const nome = Array.isArray(params.nome) ? params.nome[0] : params.nome;

  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [prioridade, setPrioridade] = useState("MEDIA");
  const [dataPrazo, setDataPrazo] = useState("");

  const [categorias, setCategorias] = useState([]);
  const [categoriaId, setCategoriaId] = useState(null);

  const [carregandoCategorias, setCarregandoCategorias] = useState(true);

  const [salvando, setSalvando] = useState(false);

  async function carregarCategorias() {
    try {
      setCarregandoCategorias(true);

      const url = obterApiUrl();

      const resposta = await fetchComTimeout(
        `${url}/api/categorias?usuarioId=${usuarioId}`,
      );

      if (!resposta.ok) {
        Alert.alert(
          "Erro",
          `Não foi possível carregar as categorias. Código ${resposta.status}.`,
        );
        return;
      }

      const dados = await resposta.json();

      setCategorias(dados);
    } catch (erro) {
      Alert.alert(
        "Erro de conexão",
        "Não foi possível consultar as categorias.",
      );
    } finally {
      setCarregandoCategorias(false);
    }
  }

  useEffect(() => {
    carregarCategorias();
  }, []);

  async function salvar() {
    if (titulo.trim() === "") {
      Alert.alert("Atenção", "Informe o título da tarefa.");
      return;
    }

    if (dataPrazo.trim() !== "") {
      const formatoData = /^\d{4}-\d{2}-\d{2}$/;

      if (!formatoData.test(dataPrazo.trim())) {
        Alert.alert("Data inválida", "Informe a data no formato AAAA-MM-DD.");
        return;
      }
    }

    try {
      setSalvando(true);

      const url = obterApiUrl();

      const novaTarefa = {
        titulo: titulo.trim(),
        descricao: descricao.trim(),
        prioridade: prioridade,
        status: "PENDENTE",
        dataPrazo: dataPrazo.trim() === "" ? null : dataPrazo.trim(),
        categoria: categoriaId
          ? {
              id: Number(categoriaId),
            }
          : null,
      };

      const resposta = await fetchComTimeout(
        `${url}/api/tarefas?usuarioId=${usuarioId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(novaTarefa),
        },
      );

      if (!resposta.ok) {
        Alert.alert(
          "Erro",
          `Não foi possível criar a tarefa. Código ${resposta.status}.`,
        );
        return;
      }

      const tarefaCriada = await resposta.json();

      Alert.alert(
        "Tarefa criada",
        `"${tarefaCriada.titulo}" foi cadastrada com sucesso.`,
        [
          {
            text: "OK",
            onPress: () =>
              router.replace({
                pathname: "/home",
                params: {
                  usuarioId,
                  nome,
                },
              }),
          },
        ],
      );
    } catch (erro) {
      Alert.alert(
        "Erro de conexão",
        "Não foi possível salvar a tarefa no servidor.",
      );
    } finally {
      setSalvando(false);
    }
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.conteudo}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.titulo}>Nova tarefa</Text>

      <Text style={styles.descricaoPagina}>
        Preencha os dados da nova atividade.
      </Text>

      <Text style={styles.label}>Título</Text>

      <TextInput
        style={styles.input}
        placeholder="Título da tarefa"
        value={titulo}
        onChangeText={setTitulo}
      />

      <Text style={styles.label}>Descrição</Text>

      <TextInput
        style={[styles.input, styles.area]}
        placeholder="Descrição da tarefa"
        value={descricao}
        onChangeText={setDescricao}
        multiline
      />

      <Text style={styles.label}>Prioridade</Text>

      <View style={styles.opcoes}>
        {["BAIXA", "MEDIA", "ALTA"].map((item) => (
          <TouchableOpacity
            key={item}
            style={[styles.opcao, prioridade === item && styles.opcaoAtiva]}
            onPress={() => setPrioridade(item)}
          >
            <Text
              style={[
                styles.opcaoTexto,
                prioridade === item && styles.opcaoTextoAtiva,
              ]}
            >
              {item === "MEDIA" ? "MÉDIA" : item}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Data de prazo</Text>

      <TextInput
        style={styles.input}
        placeholder="AAAA-MM-DD"
        value={dataPrazo}
        onChangeText={setDataPrazo}
        autoCapitalize="none"
      />

      <Text style={styles.label}>Categoria</Text>

      {carregandoCategorias ? (
        <View style={styles.carregandoCategorias}>
          <ActivityIndicator color="#4f46e5" />

          <Text style={styles.carregandoTexto}>Carregando categorias...</Text>
        </View>
      ) : (
        <>
          <TouchableOpacity
            style={[
              styles.categoria,
              categoriaId === null && styles.categoriaAtiva,
            ]}
            onPress={() => setCategoriaId(null)}
          >
            <Text
              style={[
                styles.categoriaTexto,
                categoriaId === null && styles.categoriaTextoAtiva,
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
                categoriaId === categoria.id && styles.categoriaAtiva,
              ]}
              onPress={() => setCategoriaId(categoria.id)}
            >
              <View style={styles.categoriaLinha}>
                <View
                  style={[
                    styles.corCategoria,
                    {
                      backgroundColor: categoria.cor || "#667085",
                    },
                  ]}
                />

                <Text
                  style={[
                    styles.categoriaTexto,
                    categoriaId === categoria.id && styles.categoriaTextoAtiva,
                  ]}
                >
                  {categoria.nome}
                </Text>
              </View>
            </TouchableOpacity>
          ))}

          {categorias.length === 0 && (
            <Text style={styles.semCategorias}>
              Você ainda não possui categorias cadastradas.
            </Text>
          )}
        </>
      )}

      <TouchableOpacity
        style={[styles.botao, salvando && styles.botaoDesabilitado]}
        onPress={salvar}
        disabled={salvando}
      >
        {salvando ? (
          <ActivityIndicator color="#ffffff" />
        ) : (
          <Text style={styles.botaoTexto}>Salvar tarefa</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f7f8fc",
  },

  conteudo: {
    padding: 20,
    paddingBottom: 50,
  },

  titulo: {
    color: "#182230",
    fontSize: 27,
    fontWeight: "bold",
  },

  descricaoPagina: {
    color: "#667085",
    marginTop: 5,
    marginBottom: 22,
  },

  label: {
    color: "#344054",
    fontWeight: "bold",
    marginBottom: 7,
  },

  input: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#d0d5dd",
    borderRadius: 9,
    padding: 13,
    fontSize: 15,
    marginBottom: 16,
  },

  area: {
    height: 85,
    textAlignVertical: "top",
  },

  opcoes: {
    flexDirection: "row",
    marginBottom: 18,
  },

  opcao: {
    flex: 1,
    padding: 11,
    borderWidth: 1,
    borderColor: "#d0d5dd",
    alignItems: "center",
    marginRight: 6,
    borderRadius: 9,
    backgroundColor: "#ffffff",
  },

  opcaoAtiva: {
    backgroundColor: "#eef2ff",
    borderColor: "#4f46e5",
  },

  opcaoTexto: {
    color: "#667085",
    fontWeight: "bold",
    fontSize: 12,
  },

  opcaoTextoAtiva: {
    color: "#4f46e5",
  },

  carregandoCategorias: {
    backgroundColor: "#ffffff",
    padding: 18,
    borderRadius: 9,
    alignItems: "center",
    marginBottom: 18,
  },

  carregandoTexto: {
    color: "#667085",
    marginTop: 8,
  },

  categoria: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#d0d5dd",
    borderRadius: 9,
    padding: 12,
    marginBottom: 8,
  },

  categoriaAtiva: {
    borderColor: "#4f46e5",
    backgroundColor: "#eef2ff",
  },

  categoriaLinha: {
    flexDirection: "row",
    alignItems: "center",
  },

  corCategoria: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 9,
  },

  categoriaTexto: {
    color: "#475467",
    fontWeight: "600",
  },

  categoriaTextoAtiva: {
    color: "#4f46e5",
    fontWeight: "bold",
  },

  semCategorias: {
    color: "#667085",
    marginBottom: 16,
  },

  botao: {
    backgroundColor: "#4f46e5",
    padding: 15,
    borderRadius: 9,
    alignItems: "center",
    marginTop: 14,
  },

  botaoDesabilitado: {
    opacity: 0.7,
  },

  botaoTexto: {
    color: "#ffffff",
    fontWeight: "bold",
    fontSize: 16,
  },
});
