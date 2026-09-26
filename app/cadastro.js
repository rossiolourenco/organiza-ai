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
  configurarApi,
  obterApiUrl,
  fetchComTimeout,
} from '../servicos/api';

export default function Cadastro() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const ipRecebido = Array.isArray(params.ip)
    ? params.ip[0]
    : params.ip;

  const [ip, setIp] = useState(ipRecebido || '');
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    if (ipRecebido) {
      configurarApi(ipRecebido);
    }
  }, []);

  async function cadastrar() {
    if (ip.trim() === '') {
      Alert.alert(
        'Servidor não informado',
        'Informe o IP do computador que está executando o backend.'
      );
      return;
    }

    if (
      nome.trim() === '' ||
      email.trim() === '' ||
      senha === ''
    ) {
      Alert.alert(
        'Atenção',
        'Preencha nome, e-mail e senha.'
      );
      return;
    }

    if (!email.includes('@')) {
      Alert.alert(
        'E-mail inválido',
        'Informe um endereço de e-mail válido.'
      );
      return;
    }

    if (senha.length < 4) {
      Alert.alert(
        'Senha inválida',
        'A senha deve possuir pelo menos 4 caracteres.'
      );
      return;
    }

    if (senha !== confirmarSenha) {
      Alert.alert(
        'Senhas diferentes',
        'A senha e a confirmação precisam ser iguais.'
      );
      return;
    }

    try {
      setSalvando(true);

      configurarApi(ip);

      const url = obterApiUrl();

      const resposta = await fetchComTimeout(
        `${url}/api/usuarios`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            nome: nome.trim(),
            email: email.trim(),
            senha,
          }),
        }
      );

      if (!resposta.ok) {
        let mensagem =
          `Não foi possível realizar o cadastro. Código ${resposta.status}.`;

        try {
          const erro = await resposta.text();

          if (erro) {
            mensagem = erro;
          }
        } catch (erroLeitura) {
          // Mantém a mensagem padrão.
        }

        Alert.alert(
          'Erro no cadastro',
          mensagem
        );

        return;
      }

      const usuario = await resposta.json();

      Alert.alert(
        'Cadastro realizado',
        `${usuario.nome}, sua conta foi criada com sucesso.`,
        [
          {
            text: 'Entrar',
            onPress: () => router.replace('/'),
          },
        ]
      );
    } catch (erro) {
      Alert.alert(
        'Erro de conexão',
        `Não foi possível conectar ao servidor ${obterApiUrl()}.`
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
      <View style={styles.logoArea}>
        <View style={styles.logo}>
          <Text style={styles.logoTexto}>
            ✓
          </Text>
        </View>

        <Text style={styles.nomeApp}>
          Organiza Aí
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.titulo}>
          Criar conta
        </Text>

        <Text style={styles.descricao}>
          Cadastre-se para organizar suas tarefas.
        </Text>

        <Text style={styles.label}>
          IP do servidor
        </Text>

        <TextInput
          style={styles.input}
          placeholder="Ex.: 192.168.1.50"
          value={ip}
          onChangeText={setIp}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="numbers-and-punctuation"
        />

        <Text style={styles.ajuda}>
          Computador onde o backend está executando.
        </Text>

        <Text style={styles.label}>
          Nome
        </Text>

        <TextInput
          style={styles.input}
          placeholder="Seu nome"
          value={nome}
          onChangeText={setNome}
        />

        <Text style={styles.label}>
          E-mail
        </Text>

        <TextInput
          style={styles.input}
          placeholder="seu@email.com"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="email-address"
        />

        <Text style={styles.label}>
          Senha
        </Text>

        <TextInput
          style={styles.input}
          placeholder="Digite sua senha"
          value={senha}
          onChangeText={setSenha}
          secureTextEntry
        />

        <Text style={styles.label}>
          Confirmar senha
        </Text>

        <TextInput
          style={styles.input}
          placeholder="Digite novamente"
          value={confirmarSenha}
          onChangeText={setConfirmarSenha}
          secureTextEntry
        />

        <TouchableOpacity
          style={[
            styles.botao,
            salvando &&
              styles.botaoDesabilitado,
          ]}
          onPress={cadastrar}
          disabled={salvando}
        >
          {salvando ? (
            <ActivityIndicator
              color="#ffffff"
            />
          ) : (
            <Text style={styles.botaoTexto}>
              Criar conta
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.replace('/')}
          disabled={salvando}
        >
          <Text style={styles.link}>
            Já possui uma conta? Entrar
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f8fc',
  },

  conteudo: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
    paddingVertical: 40,
  },

  logoArea: {
    alignItems: 'center',
    marginBottom: 22,
  },

  logo: {
    width: 54,
    height: 54,
    borderRadius: 15,
    backgroundColor: '#4f46e5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },

  logoTexto: {
    color: '#ffffff',
    fontSize: 28,
    fontWeight: 'bold',
  },

  nomeApp: {
    color: '#182230',
    fontSize: 27,
    fontWeight: 'bold',
  },

  card: {
    backgroundColor: '#ffffff',
    padding: 22,
    borderRadius: 18,
  },

  titulo: {
    color: '#182230',
    fontSize: 24,
    fontWeight: 'bold',
  },

  descricao: {
    color: '#667085',
    marginTop: 6,
    marginBottom: 20,
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
    marginBottom: 14,
  },

  ajuda: {
    color: '#667085',
    fontSize: 12,
    marginTop: -7,
    marginBottom: 16,
  },

  botao: {
    backgroundColor: '#4f46e5',
    padding: 15,
    borderRadius: 9,
    alignItems: 'center',
    marginTop: 5,
  },

  botaoDesabilitado: {
    opacity: 0.7,
  },

  botaoTexto: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 16,
  },

  link: {
    color: '#4f46e5',
    textAlign: 'center',
    marginTop: 20,
    fontWeight: '600',
  },
});