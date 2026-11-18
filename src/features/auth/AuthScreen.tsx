import React, { useState } from 'react';
import { View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Feather from '@expo/vector-icons/Feather';
import { Button, Card, ErrorState, IconButton, Input, Label, Row, Screen } from '../../components/ui';
import { useAuth } from '../../state/AuthProvider';
import { normalizeServer, request } from '../../services/api';
import { tokens, useTheme } from '../../theme/ThemeProvider';

export default function AuthScreen({ register = false }: { register?: boolean }) {
  const { server: receivedServer } = useLocalSearchParams<{ server?: string }>();
  const [server, setServer] = useState(receivedServer || process.env.EXPO_PUBLIC_API_URL || '');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const auth = useAuth();
  const router = useRouter();
  const { colors } = useTheme();

  const submit = async () => {
    if (busy) return;
    setError(null);
    if (!email.includes('@') || !password) { setError('Informe um e-mail válido e sua senha.'); return; }
    if (register && (!name.trim() || password.length < 4 || password !== confirmation)) {
      setError('Preencha seu nome e confirme a senha (mínimo de 4 caracteres).'); return;
    }
    setBusy(true);
    try {
      if (register) {
        await request(normalizeServer(server), '/usuarios', { method: 'POST',
          body: JSON.stringify({ nome: name.trim(), email: email.trim(), senha: password }) });
        setPassword(''); setConfirmation(''); setSuccess(true);
      } else { await auth.login(server, email, password); }
    } catch (e) { setError(e instanceof Error ? e.message : 'Não foi possível entrar.'); }
    finally { setBusy(false); }
  };

  return <Screen title={register ? 'Seu próximo capítulo.' : 'Mais clareza.\nMais espaço para você.'}
    subtitle="Estudos, trabalho e vida pessoal. Tudo encontra seu lugar."
    action={register ? <IconButton icon="arrow-left" label="Voltar ao login" onPress={() => router.replace('/')} /> : undefined}>
    <View style={{ maxWidth: 520, width: '100%', alignSelf: 'center', gap: tokens.space.lg }}>
      <View style={{ alignItems: 'flex-start', gap: tokens.space.sm }}>
        <View style={{ width: 58, height: 58, borderRadius: 20, backgroundColor: colors.primary,
          alignItems: 'center', justifyContent: 'center' }}>
          <Feather name="check-square" color={colors.onPrimary} size={26} />
        </View>
        <Label size="micro" weight="bold" style={{ letterSpacing: 2, color: colors.primary }}>PREMIUM EXPERIENCE</Label>
      </View>

      <Card>
        <Label size="title">{register ? 'Criar minha conta' : 'Bem-vindo de volta'}</Label>
        <Label muted size="caption">{register ? 'Comece a organizar o que importa.' : 'Entre para continuar de onde parou.'}</Label>
        <Input label="Servidor" value={server} onChangeText={setServer} placeholder="192.168.1.50 ou https://seu-servidor"
          autoCapitalize="none" autoCorrect={false} keyboardType="url"
          hint="Endereço do backend Spring Boot. Tarefas, categorias e hábitos precisam de conexão." />
        {register ? <Input label="Nome" value={name} onChangeText={setName} maxLength={100} autoComplete="name" /> : null}
        <Input label="E-mail" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address"
          autoComplete="email" maxLength={150} />
        <Input label="Senha" value={password} onChangeText={setPassword} secureTextEntry maxLength={72}
          autoComplete={register ? 'new-password' : 'current-password'} />
        {register ? <Input label="Confirmar senha" value={confirmation} onChangeText={setConfirmation}
          secureTextEntry maxLength={72} autoComplete="new-password" /> : null}
        <ErrorState message={error || auth.error} />
        {success ? <Row style={{ flexWrap: 'nowrap' }}>
          <Feather name="check-circle" size={16} color={colors.success} />
          <Label size="caption" style={{ color: colors.success, flex: 1 }}>Conta criada. Agora você já pode entrar.</Label>
        </Row> : null}
        <Button title={register ? 'Criar conta' : 'Entrar no meu espaço'} loading={busy}
          onPress={() => { void submit(); }} icon="arrow-right" />
        <Button title={register ? 'Já tenho uma conta' : 'Criar uma conta'} variant="ghost" disabled={busy}
          onPress={() => register ? router.replace('/') : router.push({ pathname: '/cadastro', params: { server } })} />
      </Card>

      <Row style={{ justifyContent: 'center', gap: 6 }}>
        <Feather name="shield" size={13} color={colors.muted} />
        <Label size="micro" muted style={{ textAlign: 'center' }}>Sessão protegida por token com validade de sete dias.</Label>
      </Row>
      <Label size="micro" muted style={{ textAlign: 'center' }}>Organização simples. Progresso real.</Label>
    </View>
  </Screen>;
}
