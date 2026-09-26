import React, { useEffect, useState } from "react";

import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";

import { useLocalSearchParams, useRouter } from "expo-router";

import { obterApiUrl, fetchComTimeout } from "../servicos/api";

export default function Home() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const usuarioId = Array.isArray(params.usuarioId)
    ? params.usuarioId[0]
    : params.usuarioId;

  const nome = Array.isArray(params.nome) ? params.nome[0] : params.nome;

  const [tarefas, setTarefas] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [filtroStatus, setFiltroStatus] = useState("TODAS");
  const [filtroPrioridade, setFiltroPrioridade] = useState("TODAS");

  async function carregarTarefas() {
    try {
      setCarregando(true);

      const url = obterApiUrl();

      const resposta = await fetchComTimeout(
        `${url}/api/tarefas?usuarioId=${usuarioId}`,
      );

      if (!resposta.ok) {
        Alert.alert(
          "Erro",
          `Não foi possível carregar as tarefas. Código ${resposta.status}.`,
        );
        return;
      }

      const dados = await resposta.json();
      setTarefas(dados);
    } catch (erro) {
      Alert.alert(
        "Erro de conexão",
        "Não foi possível consultar as tarefas no servidor.",
      );
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregarTarefas();
  }, []);

  const tarefasFiltradas = tarefas.filter((tarefa) => {
    const statusOk = filtroStatus === "TODAS" || tarefa.status === filtroStatus;

    const prioridadeOk =
      filtroPrioridade === "TODAS" || tarefa.prioridade === filtroPrioridade;

    return statusOk && prioridadeOk;
  });

  const totalPendentes = tarefas.filter(
    (tarefa) => tarefa.status === "PENDENTE",
  ).length;

  const totalConcluidas = tarefas.filter(
    (tarefa) => tarefa.status === "CONCLUIDA",
  ).length;

  async function concluirTarefa(tarefa) {
    try {
      const url = obterApiUrl();

      const resposta = await fetchComTimeout(
        `${url}/api/tarefas/${tarefa.id}/concluir?usuarioId=${usuarioId}`,
        {
          method: "PATCH",
        },
      );

      if (resposta.status === 404) {
        Alert.alert(
          "Tarefa não encontrada",
          "A tarefa não existe ou não pertence a este usuário.",
        );
        return;
      }

      if (!resposta.ok) {
        Alert.alert(
          "Erro",
          `Não foi possível concluir a tarefa. Código ${resposta.status}.`,
        );
        return;
      }

      await carregarTarefas();
    } catch (erro) {
      Alert.alert("Erro de conexão", "Não foi possível concluir a tarefa.");
    }
  }

  function confirmarExclusao(tarefa) {
    Alert.alert(
      "Excluir tarefa",
      `Deseja realmente excluir "${tarefa.titulo}"?`,
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Excluir",
          style: "destructive",
          onPress: () => excluirTarefa(tarefa),
        },
      ],
    );
  }

  async function excluirTarefa(tarefa) {
    try {
      const url = obterApiUrl();

      const resposta = await fetchComTimeout(
        `${url}/api/tarefas/${tarefa.id}?usuarioId=${usuarioId}`,
        {
          method: "DELETE",
        },
      );

      if (resposta.status === 404) {
        Alert.alert(
          "Tarefa não encontrada",
          "A tarefa não existe ou não pertence a este usuário.",
        );
        return;
      }

      if (!resposta.ok) {
        Alert.alert(
          "Erro",
          `Não foi possível excluir a tarefa. Código ${resposta.status}.`,
        );
        return;
      }

      await carregarTarefas();
    } catch (erro) {
      Alert.alert("Erro de conexão", "Não foi possível excluir a tarefa.");
    }
  }

  function nomePrioridade(prioridade) {
    if (prioridade === "ALTA") {
      return "Alta";
    }

    if (prioridade === "MEDIA") {
      return "Média";
    }

    return "Baixa";
  }

  function estiloPrioridade(prioridade) {
    if (prioridade === "ALTA") {
      return styles.alta;
    }

    if (prioridade === "MEDIA") {
      return styles.media;
    }

    return styles.baixa;
  }

  function formatarData(data) {
    if (!data) {
      return "Sem prazo";
    }

    const partes = data.split("-");

    if (partes.length !== 3) {
      return data;
    }

    return `${partes[2]}/${partes[1]}/${partes[0]}`;
  }

  if (carregando) {
    return (
      <View style={styles.carregando}>
        <ActivityIndicator size="large" color="#4f46e5" />

        <Text style={styles.carregandoTexto}>Carregando tarefas...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.conteudo}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.topo}>
          <View>
            <Text style={styles.saudacao}>
              Olá{nome ? `, ${nome}` : ""}! 👋
            </Text>

            <Text style={styles.subtitulo}>Organize suas tarefas de hoje.</Text>
          </View>

          <TouchableOpacity onPress={() => router.replace("/")}>
            <Text style={styles.sair}>Sair</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.resumo}>
          <View style={styles.resumoItem}>
            <Text style={styles.numero}>{totalPendentes}</Text>

            <Text style={styles.resumoTexto}>Pendentes</Text>
          </View>

          <View style={styles.divisor} />

          <View style={styles.resumoItem}>
            <Text style={styles.numero}>{totalConcluidas}</Text>

            <Text style={styles.resumoTexto}>Concluídas</Text>
          </View>
        </View>

        <View style={styles.acoes}>
          <Text style={styles.tituloSecao}>Minhas tarefas</Text>

          <TouchableOpacity
            style={styles.botaoNova}
            onPress={() =>
              router.push({
                pathname: "/novaTarefa",
                params: {
                  usuarioId,
                  nome,
                },
              })
            }
          >
            <Text style={styles.botaoNovaTexto}>+ Nova</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.filtroTitulo}>Status</Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filtros}
        >
          {["TODAS", "PENDENTE", "CONCLUIDA"].map((status) => (
            <TouchableOpacity
              key={status}
              style={[
                styles.filtro,
                filtroStatus === status && styles.filtroAtivo,
              ]}
              onPress={() => setFiltroStatus(status)}
            >
              <Text
                style={[
                  styles.filtroTexto,
                  filtroStatus === status && styles.filtroTextoAtivo,
                ]}
              >
                {status === "TODAS"
                  ? "Todas"
                  : status === "PENDENTE"
                    ? "Pendentes"
                    : "Concluídas"}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <Text style={styles.filtroTitulo}>Prioridade</Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filtros}
        >
          {["TODAS", "BAIXA", "MEDIA", "ALTA"].map((prioridade) => (
            <TouchableOpacity
              key={prioridade}
              style={[
                styles.filtro,
                filtroPrioridade === prioridade && styles.filtroAtivo,
              ]}
              onPress={() => setFiltroPrioridade(prioridade)}
            >
              <Text
                style={[
                  styles.filtroTexto,
                  filtroPrioridade === prioridade && styles.filtroTextoAtivo,
                ]}
              >
                {prioridade === "TODAS" ? "Todas" : nomePrioridade(prioridade)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.resultadoLinha}>
          <Text style={styles.resultado}>
            {tarefasFiltradas.length}{" "}
            {tarefasFiltradas.length === 1 ? "tarefa" : "tarefas"}
          </Text>

          <TouchableOpacity onPress={carregarTarefas}>
            <Text style={styles.atualizar}>Atualizar</Text>
          </TouchableOpacity>
        </View>

        {tarefasFiltradas.map((tarefa) => (
          <View style={styles.card} key={tarefa.id}>
            <View style={styles.cardTopo}>
              <Text style={styles.cardTitulo}>{tarefa.titulo}</Text>

              <Text style={estiloPrioridade(tarefa.prioridade)}>
                {nomePrioridade(tarefa.prioridade)}
              </Text>
            </View>

            {tarefa.descricao ? (
              <Text style={styles.cardDescricao}>{tarefa.descricao}</Text>
            ) : null}

            <View style={styles.detalhes}>
              {tarefa.categoria ? (
                <Text style={styles.categoria}>{tarefa.categoria.nome}</Text>
              ) : (
                <Text style={styles.semCategoria}>Sem categoria</Text>
              )}

              <Text style={styles.prazo}>{formatarData(tarefa.dataPrazo)}</Text>
            </View>

            <View style={styles.cardRodape}>
              <View>
                <Text
                  style={
                    tarefa.status === "CONCLUIDA"
                      ? styles.statusConcluida
                      : styles.statusPendente
                  }
                >
                  {tarefa.status === "CONCLUIDA" ? "✓ Concluída" : "Pendente"}
                </Text>
              </View>

              <View style={styles.acoesTarefa}>
                {tarefa.status !== "CONCLUIDA" && (
                  <TouchableOpacity onPress={() => concluirTarefa(tarefa)}>
                    <Text style={styles.concluir}>Concluir</Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  onPress={() =>
                    router.push({
                      pathname: "/editarTarefa",
                      params: {
                        id: tarefa.id,
                        usuarioId,
                        nome,
                      },
                    })
                  }
                >
                  <Text style={styles.editar}>Editar</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => confirmarExclusao(tarefa)}>
                  <Text style={styles.excluir}>Excluir</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ))}

        {tarefasFiltradas.length === 0 && (
          <View style={styles.vazio}>
            <Text style={styles.vazioTitulo}>Nenhuma tarefa encontrada</Text>

            <Text style={styles.vazioTexto}>
              Não existem tarefas para os filtros selecionados.
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f7f8fc",
  },

  conteudo: {
    padding: 20,
    paddingBottom: 40,
  },

  carregando: {
    flex: 1,
    backgroundColor: "#f7f8fc",
    justifyContent: "center",
    alignItems: "center",
  },

  carregandoTexto: {
    color: "#667085",
    marginTop: 12,
  },

  topo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 22,
  },

  saudacao: {
    color: "#182230",
    fontSize: 23,
    fontWeight: "bold",
  },

  subtitulo: {
    color: "#667085",
    marginTop: 4,
  },

  sair: {
    color: "#b42318",
    fontWeight: "bold",
  },

  resumo: {
    backgroundColor: "#ffffff",
    borderRadius: 13,
    padding: 18,
    flexDirection: "row",
    marginBottom: 25,
  },

  resumoItem: {
    flex: 1,
    alignItems: "center",
  },

  divisor: {
    width: 1,
    backgroundColor: "#e4e7ec",
  },

  numero: {
    color: "#4f46e5",
    fontSize: 25,
    fontWeight: "bold",
  },

  resumoTexto: {
    color: "#667085",
    marginTop: 3,
  },

  acoes: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 18,
  },

  tituloSecao: {
    color: "#182230",
    fontSize: 20,
    fontWeight: "bold",
  },

  botaoNova: {
    backgroundColor: "#4f46e5",
    paddingVertical: 9,
    paddingHorizontal: 15,
    borderRadius: 9,
  },

  botaoNovaTexto: {
    color: "#ffffff",
    fontWeight: "bold",
  },

  filtroTitulo: {
    color: "#344054",
    fontWeight: "bold",
    marginBottom: 8,
  },

  filtros: {
    marginBottom: 16,
  },

  filtro: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#d0d5dd",
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 14,
    marginRight: 8,
  },

  filtroAtivo: {
    backgroundColor: "#eef2ff",
    borderColor: "#4f46e5",
  },

  filtroTexto: {
    color: "#667085",
    fontWeight: "600",
  },

  filtroTextoAtivo: {
    color: "#4f46e5",
  },

  resultadoLinha: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },

  resultado: {
    color: "#667085",
  },

  atualizar: {
    color: "#4f46e5",
    fontWeight: "bold",
  },

  card: {
    backgroundColor: "#ffffff",
    padding: 17,
    borderRadius: 13,
    marginBottom: 13,
  },

  cardTopo: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  cardTitulo: {
    color: "#182230",
    fontSize: 16,
    fontWeight: "bold",
    flex: 1,
    marginRight: 10,
  },

  cardDescricao: {
    color: "#667085",
    marginTop: 8,
    lineHeight: 19,
  },

  detalhes: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
  },

  categoria: {
    color: "#4f46e5",
    backgroundColor: "#eef2ff",
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 10,
    fontWeight: "600",
  },

  semCategoria: {
    color: "#667085",
    fontSize: 12,
  },

  prazo: {
    color: "#667085",
    fontSize: 12,
  },

  cardRodape: {
    borderTopWidth: 1,
    borderTopColor: "#eef0f3",
    paddingTop: 13,
    marginTop: 13,
    flexDirection: "row",
    justifyContent: "space-between",
  },

  statusPendente: {
    color: "#b54708",
    fontWeight: "bold",
  },

  statusConcluida: {
    color: "#15803d",
    fontWeight: "bold",
  },

  editar: {
    color: "#4f46e5",
    fontWeight: "bold",
    marginLeft: 16,
  },

  alta: {
    color: "#b42318",
    fontWeight: "bold",
  },

  media: {
    color: "#b54708",
    fontWeight: "bold",
  },

  baixa: {
    color: "#175cd3",
    fontWeight: "bold",
  },

  vazio: {
    backgroundColor: "#ffffff",
    padding: 25,
    borderRadius: 13,
    alignItems: "center",
  },

  vazioTitulo: {
    color: "#182230",
    fontWeight: "bold",
    fontSize: 16,
  },

  vazioTexto: {
    color: "#667085",
    marginTop: 6,
    textAlign: "center",
  },
  acoesTarefa: {
    flexDirection: "row",
    alignItems: "center",
  },

  concluir: {
    color: "#15803d",
    fontWeight: "bold",
    marginLeft: 16,
  },

  excluir: {
    color: "#b42318",
    fontWeight: "bold",
    marginLeft: 16,
  },
});
