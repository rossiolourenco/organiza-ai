import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";

import { useRouter } from "expo-router";
import { configurarApi, obterApiUrl, fetchComTimeout } from "../servicos/api";

export default function Login() {
  const router = useRouter();

  const [ip, setIp] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [carregando, setCarregando] = useState(false);

  async function entrar() {
    if (ip.trim() === "") {
      Alert.alert(
        "Servidor não informado",
        "Informe o IP do computador que está executando o backend.",
      );
      return;
    }

    if (email.trim() === "" || senha === "") {
      Alert.alert("Atenção", "Informe o e-mail e a senha.");
      return;
    }

    configurarApi(ip);

    const url = obterApiUrl();

    try {
      setCarregando(true);

      const resposta = await fetchComTimeout(`${url}/api/usuarios/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim(),
          senha: senha,
        }),
      });

      if (resposta.status === 401) {
        Alert.alert("Login inválido", "E-mail ou senha incorretos.");
        return;
      }

      if (!resposta.ok) {
        Alert.alert(
          "Erro",
          `O servidor respondeu com o código ${resposta.status}.`,
        );
        return;
      }

      const usuario = await resposta.json();

      router.replace({
        pathname: "/home",
        params: {
          usuarioId: usuario.id,
          nome: usuario.nome,
        },
      });
    } catch (erro) {
      if (erro.message === "TIMEOUT") {
        Alert.alert(
          "Servidor não encontrado",
          "Não foi possível conectar ao servidor. Verifique o IP informado e se o backend está em execução.",
        );
      } else {
        Alert.alert(
          "Erro de conexão",
          "Não foi possível conectar ao servidor.",
        );
      }
    } finally {
      setCarregando(false);
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.logoArea}>
        <View style={styles.logo}>
          <Text style={styles.logoTexto}>✓</Text>
        </View>

        <Text style={styles.nome}>Organiza Aí</Text>

        <Text style={styles.slogan}>Organização simples para o seu dia</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.titulo}>Entrar</Text>

        <Text style={styles.descricao}>
          Conecte-se ao servidor e acesse sua conta.
        </Text>

        <Text style={styles.label}>IP do servidor</Text>

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
          IP do computador que está executando o backend.
        </Text>

        <Text style={styles.label}>E-mail</Text>

        <TextInput
          style={styles.input}
          placeholder="seu@email.com"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="email-address"
        />

        <Text style={styles.label}>Senha</Text>

        <TextInput
          style={styles.input}
          placeholder="Digite sua senha"
          value={senha}
          onChangeText={setSenha}
          secureTextEntry
        />

        <TouchableOpacity
          style={[styles.botao, carregando && styles.botaoDesabilitado]}
          onPress={entrar}
          disabled={carregando}
        >
          {carregando ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.botaoTexto}>Entrar</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() =>
            router.push({
              pathname: "/cadastro",
              params: { ip: ip },
            })
          }
          disabled={carregando}
        >
          <Text style={styles.link}>Ainda não possui conta? Cadastre-se</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f7f8fc",
    justifyContent: "center",
    padding: 24,
  },

  logoArea: {
    alignItems: "center",
    marginBottom: 24,
  },

  logo: {
    width: 58,
    height: 58,
    borderRadius: 16,
    backgroundColor: "#4f46e5",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },

  logoTexto: {
    color: "#ffffff",
    fontSize: 30,
    fontWeight: "bold",
  },

  nome: {
    color: "#182230",
    fontSize: 30,
    fontWeight: "bold",
  },

  slogan: {
    color: "#667085",
    marginTop: 5,
  },

  card: {
    backgroundColor: "#ffffff",
    padding: 22,
    borderRadius: 18,
  },

  titulo: {
    color: "#182230",
    fontSize: 24,
    fontWeight: "bold",
  },

  descricao: {
    color: "#667085",
    marginTop: 6,
    marginBottom: 20,
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
    fontSize: 16,
    marginBottom: 14,
  },

  ajuda: {
    color: "#667085",
    fontSize: 12,
    marginTop: -7,
    marginBottom: 16,
  },

  botao: {
    backgroundColor: "#4f46e5",
    padding: 15,
    borderRadius: 9,
    alignItems: "center",
    marginTop: 4,
  },

  botaoDesabilitado: {
    opacity: 0.7,
  },

  botaoTexto: {
    color: "#ffffff",
    fontWeight: "bold",
    fontSize: 16,
  },

  link: {
    color: "#4f46e5",
    textAlign: "center",
    marginTop: 20,
    fontWeight: "600",
  },
});
