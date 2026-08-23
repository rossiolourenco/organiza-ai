import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';

export default function App() {
  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      <View style={styles.cabecalho}>
        <Text style={styles.logo}>Organiza Aí</Text>
        <Text style={styles.subtitulo}>
          Organize suas tarefas. Simplifique seu dia.
        </Text>
      </View>

      <View style={styles.conteudo}>
        <Text style={styles.saudacao}>Olá! 👋</Text>
        <Text style={styles.pergunta}>
          O que vamos organizar hoje?
        </Text>

        <View style={styles.menu}>
          <View style={styles.botao}>
            <Text style={styles.icone}>📋</Text>
            <Text style={styles.textoBotao}>Minhas Tarefas</Text>
          </View>

          <View style={styles.botao}>
            <Text style={styles.icone}>➕</Text>
            <Text style={styles.textoBotao}>Nova Tarefa</Text>
          </View>

          <View style={styles.botao}>
            <Text style={styles.icone}>✅</Text>
            <Text style={styles.textoBotao}>Concluídas</Text>
          </View>
        </View>
      </View>

      <Text style={styles.rodape}>
        Organiza Aí • Projeto Mobile
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
    paddingHorizontal: 24,
    paddingTop: 70,
    paddingBottom: 30,
  },

  cabecalho: {
    marginBottom: 50,
  },

  logo: {
    fontSize: 34,
    fontWeight: 'bold',
    color: '#2563EB',
  },

  subtitulo: {
    fontSize: 16,
    color: '#64748B',
    marginTop: 8,
  },

  conteudo: {
    flex: 1,
  },

  saudacao: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#1E293B',
  },

  pergunta: {
    fontSize: 17,
    color: '#64748B',
    marginTop: 6,
    marginBottom: 30,
  },

  menu: {
    gap: 16,
  },

  botao: {
    backgroundColor: '#FFFFFF',
    padding: 22,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },

  icone: {
    fontSize: 25,
    marginRight: 16,
  },

  textoBotao: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
  },

  rodape: {
    textAlign: 'center',
    fontSize: 13,
    color: '#94A3B8',
  },
});
