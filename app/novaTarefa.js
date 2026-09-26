import React, { useState } from 'react';

import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';

import { useRouter } from 'expo-router';

export default function NovaTarefa() {
  const router = useRouter();

  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');

  function salvarTarefa() {
    if (titulo === '') {
      Alert.alert('Atenção', 'Informe o título da tarefa.');
      return;
    }

    Alert.alert(
      'Tarefa salva',
      'A tarefa foi cadastrada com sucesso.',
      [
        {
          text: 'OK',
          onPress: () => router.navigate('/tarefas'),
        },
      ]
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Nova Tarefa</Text>

      <Text style={styles.subtitulo}>
        Informe os dados da sua tarefa.
      </Text>

      <Text style={styles.label}>Título</Text>

      <TextInput
        style={styles.input}
        placeholder="Digite o título da tarefa"
        value={titulo}
        onChangeText={setTitulo}
      />

      <Text style={styles.label}>Descrição</Text>

      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Digite uma descrição"
        value={descricao}
        onChangeText={setDescricao}
        multiline
      />

      <TouchableOpacity
        style={styles.botao}
        onPress={salvarTarefa}
      >
        <Text style={styles.botaoTexto}>Salvar Tarefa</Text>
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

  label: {
    color: '#374151',
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: 8,
  },

  input: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
    marginBottom: 20,
  },

  textArea: {
    height: 120,
    textAlignVertical: 'top',
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