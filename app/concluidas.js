import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';

import { useRouter } from 'expo-router';

export default function Concluidas() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Tarefas Concluídas</Text>

      <Text style={styles.subtitulo}>
        Veja as atividades que você já finalizou.
      </Text>

      <View style={styles.card}>
        <Text style={styles.cardTitulo}>Criar projeto no GitHub</Text>

        <Text style={styles.descricao}>
          Repositório do Organiza Aí criado.
        </Text>

        <Text style={styles.concluida}>✓ Concluída</Text>
      </View>

      <TouchableOpacity
        style={styles.botao}
        onPress={() => router.navigate('/tarefas')}
      >
        <Text style={styles.botaoTexto}>Ver Minhas Tarefas</Text>
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
    color: '#6b7280',
    fontSize: 15,
    marginTop: 5,
    marginBottom: 25,
  },

  card: {
    backgroundColor: '#ffffff',
    padding: 18,
    borderRadius: 14,
    marginBottom: 20,
  },

  cardTitulo: {
    color: '#111827',
    fontSize: 17,
    fontWeight: 'bold',
  },

  descricao: {
    color: '#6b7280',
    marginTop: 8,
  },

  concluida: {
    color: '#16a34a',
    fontWeight: 'bold',
    marginTop: 14,
  },

  botao: {
    backgroundColor: '#111827',
    padding: 17,
    borderRadius: 12,
    alignItems: 'center',
  },

  botaoTexto: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});