import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';

import { useRouter } from 'expo-router';

export default function Tarefas() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Minhas Tarefas</Text>

      <Text style={styles.subtitulo}>
        Acompanhe e organize suas atividades.
      </Text>

      <View style={styles.card}>
        <View style={styles.cardTopo}>
          <Text style={styles.cardTitulo}>Estudar React Native</Text>
          <Text style={styles.prioridadeAlta}>Alta</Text>
        </View>

        <Text style={styles.descricao}>
          Revisar os conteúdos da disciplina Mobile.
        </Text>

        <Text style={styles.status}>Pendente</Text>
      </View>

      <View style={styles.card}>
        <View style={styles.cardTopo}>
          <Text style={styles.cardTitulo}>Projeto Organiza Aí</Text>
          <Text style={styles.prioridadeMedia}>Média</Text>
        </View>

        <Text style={styles.descricao}>
          Continuar o desenvolvimento do aplicativo.
        </Text>

        <Text style={styles.status}>Em andamento</Text>
      </View>

      <TouchableOpacity
        style={styles.botao}
        onPress={() => router.push('/novaTarefa')}
      >
        <Text style={styles.botaoTexto}>+ Nova Tarefa</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f6f8',
    padding: 20,
  },

  titulo: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
  },

  subtitulo: {
    fontSize: 15,
    color: '#6b7280',
    marginTop: 5,
    marginBottom: 24,
  },

  card: {
    backgroundColor: '#ffffff',
    padding: 18,
    borderRadius: 14,
    marginBottom: 14,
  },

  cardTopo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  cardTitulo: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#111827',
    flex: 1,
  },

  descricao: {
    color: '#6b7280',
    marginTop: 10,
    lineHeight: 20,
  },

  prioridadeAlta: {
    color: '#dc2626',
    fontWeight: 'bold',
  },

  prioridadeMedia: {
    color: '#d97706',
    fontWeight: 'bold',
  },

  status: {
    color: '#2563eb',
    fontWeight: 'bold',
    marginTop: 14,
  },

  botao: {
    backgroundColor: '#111827',
    padding: 17,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
  },

  botaoTexto: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});