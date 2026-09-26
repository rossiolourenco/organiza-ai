import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
} from 'react-native';

import { useRouter } from 'expo-router';

export default function Inicio() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      <View style={styles.cabecalho}>
        <Text style={styles.logo}>Organiza Aí</Text>
        <Text style={styles.subtitulo}>
          Organização simples para o seu dia
        </Text>
      </View>

      <View style={styles.conteudo}>
        <View style={styles.boasVindas}>
          <Text style={styles.titulo}>Olá! 👋</Text>

          <Text style={styles.descricao}>
            Organize suas tarefas e acompanhe o que precisa ser feito.
          </Text>
        </View>

        <Text style={styles.tituloSecao}>O que você deseja fazer?</Text>

        <TouchableOpacity
          style={styles.card}
          onPress={() => router.push('/tarefas')}
        >
          <View>
            <Text style={styles.cardTitulo}>Minhas Tarefas</Text>
            <Text style={styles.cardDescricao}>
              Visualize e organize suas tarefas
            </Text>
          </View>

          <Text style={styles.seta}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.card}
          onPress={() => router.push('/novaTarefa')}
        >
          <View>
            <Text style={styles.cardTitulo}>Nova Tarefa</Text>
            <Text style={styles.cardDescricao}>
              Adicione uma nova tarefa
            </Text>
          </View>

          <Text style={styles.seta}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.card}
          onPress={() => router.push('/concluidas')}
        >
          <View>
            <Text style={styles.cardTitulo}>Concluídas</Text>
            <Text style={styles.cardDescricao}>
              Consulte as tarefas finalizadas
            </Text>
          </View>

          <Text style={styles.seta}>›</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.rodape}>Organiza Aí</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f6f8',
  },

  cabecalho: {
    backgroundColor: '#111827',
    paddingTop: 70,
    paddingBottom: 32,
    paddingHorizontal: 24,
  },

  logo: {
    color: '#ffffff',
    fontSize: 30,
    fontWeight: 'bold',
  },

  subtitulo: {
    color: '#d1d5db',
    fontSize: 15,
    marginTop: 5,
  },

  conteudo: {
    flex: 1,
    padding: 20,
  },

  boasVindas: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 16,
    marginBottom: 25,
  },

  titulo: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },

  descricao: {
    fontSize: 15,
    color: '#6b7280',
    lineHeight: 22,
  },

  tituloSecao: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 12,
  },

  card: {
    backgroundColor: '#ffffff',
    padding: 18,
    borderRadius: 14,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',

    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
    shadowOffset: {
      width: 0,
      height: 2,
    },

    elevation: 2,
  },

  cardTitulo: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#111827',
  },

  cardDescricao: {
    fontSize: 13,
    color: '#6b7280',
    marginTop: 4,
  },

  seta: {
    fontSize: 30,
    color: '#9ca3af',
  },

  rodape: {
    textAlign: 'center',
    color: '#9ca3af',
    paddingBottom: 25,
  },
});