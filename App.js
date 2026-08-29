import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';

export default function App() {
  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      <View style={styles.header}>
        <Text style={styles.logo}>Organiza Aí</Text>
        <Text style={styles.headerTexto}>
          Sua rotina mais simples e organizada.
        </Text>
      </View>

      <View style={styles.conteudo}>
        <View style={styles.cardBoasVindas}>
          <Text style={styles.saudacao}>Olá! 👋</Text>

          <Text style={styles.tituloBoasVindas}>
            O que vamos organizar hoje?
          </Text>

          <Text style={styles.descricao}>
            Acompanhe suas tarefas e mantenha seus compromissos em dia.
          </Text>
        </View>

        <Text style={styles.tituloSecao}>
          Acesso rápido
        </Text>

        <TouchableOpacity style={styles.cardMenu}>
          <View style={styles.iconeContainer}>
            <Text style={styles.icone}>📋</Text>
          </View>

          <View style={styles.textoMenuContainer}>
            <Text style={styles.tituloMenu}>
              Minhas Tarefas
            </Text>

            <Text style={styles.descricaoMenu}>
              Veja todas as suas tarefas
            </Text>
          </View>

          <Text style={styles.seta}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.cardMenu}>
          <View style={styles.iconeContainer}>
            <Text style={styles.icone}>➕</Text>
          </View>

          <View style={styles.textoMenuContainer}>
            <Text style={styles.tituloMenu}>
              Nova Tarefa
            </Text>

            <Text style={styles.descricaoMenu}>
              Adicione uma nova atividade
            </Text>
          </View>

          <Text style={styles.seta}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.cardMenu}>
          <View style={styles.iconeContainer}>
            <Text style={styles.icone}>✅</Text>
          </View>

          <View style={styles.textoMenuContainer}>
            <Text style={styles.tituloMenu}>
              Concluídas
            </Text>

            <Text style={styles.descricaoMenu}>
              Consulte suas tarefas finalizadas
            </Text>
          </View>

          <Text style={styles.seta}>›</Text>
        </TouchableOpacity>
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
    backgroundColor: '#F4F7FB',
  },

  header: {
    backgroundColor: '#2563EB',
    paddingTop: 70,
    paddingHorizontal: 24,
    paddingBottom: 34,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },

  logo: {
    fontSize: 34,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },

  headerTexto: {
    marginTop: 8,
    fontSize: 16,
    color: '#DBEAFE',
  },

  conteudo: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 24,
  },

  cardBoasVindas: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 22,
    marginBottom: 28,

    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },

  saudacao: {
    fontSize: 17,
    color: '#2563EB',
    fontWeight: '600',
  },

  tituloBoasVindas: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1E293B',
    marginTop: 8,
  },

  descricao: {
    fontSize: 15,
    color: '#64748B',
    marginTop: 8,
    lineHeight: 22,
  },

  tituloSecao: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 14,
  },

  cardMenu: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
    flexDirection: 'row',
    alignItems: 'center',

    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 3,
  },

  iconeContainer: {
    width: 52,
    height: 52,
    borderRadius: 15,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },

  icone: {
    fontSize: 25,
  },

  textoMenuContainer: {
    flex: 1,
  },

  tituloMenu: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#1E293B',
  },

  descricaoMenu: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 3,
  },

  seta: {
    fontSize: 30,
    color: '#94A3B8',
    marginLeft: 8,
  },

  rodape: {
    textAlign: 'center',
    color: '#94A3B8',
    fontSize: 12,
    paddingBottom: 25,
  },
});