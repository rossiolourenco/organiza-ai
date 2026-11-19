import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Feather from '@expo/vector-icons/Feather';
import {
  Button, Card, ErrorState, IconButton, Input, Label, PasswordInput, Row,
} from '../../components/ui';
import { useAuth } from '../../state/AuthProvider';
import { request } from '../../services/api';
import { API_ORIGIN } from '../../services/config';
import { tokens, useTheme } from '../../theme/ThemeProvider';

export default function AuthScreen({ register = false }: { register?: boolean }) {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const auth = useAuth();
  const router = useRouter();
  const { senha: senhaAlterada } = useLocalSearchParams<{ senha?: string }>();
  const { colors } = useTheme();

  const submit = async () => {
    if (busy) return;
    setError(null);
    if (!email.includes('@') || !password) { setError('Informe um e-mail válido e sua senha.'); return; }
    if (register && (!name.trim() || password.length < 8 || password !== confirmation)) {
      setError('Preencha seu nome e confirme a senha (mínimo de 8 caracteres).'); return;
    }
    setBusy(true);
    try {
      if (register) {
        await request(API_ORIGIN, '/usuarios', { method: 'POST',
          body: JSON.stringify({ nome: name.trim(), email: email.trim(), senha: password }) });
        setPassword(''); setConfirmation(''); setSuccess(true);
      } else { await auth.login(email, password); }
    } catch (e) { setError(e instanceof Error ? e.message : 'Não foi possível entrar.'); }
    finally { setBusy(false); }
  };

  return <SafeAreaView edges={['top', 'bottom', 'left', 'right']} style={{ flex: 1, backgroundColor: colors.background }}>
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: tokens.space.xl,
          paddingBottom: tokens.space.xxl }}>
        <View style={{ width: '100%', maxWidth: 460, alignSelf: 'center', gap: tokens.space.lg }}>
          {register ? <Row style={{ justifyContent: 'flex-start' }}>
            <IconButton icon="arrow-left" label="Voltar ao login" onPress={() => router.replace('/')} />
          </Row> : null}

          <View style={{ alignItems: 'center', gap: tokens.space.sm }}>
            <View style={{ width: 64, height: 64, borderRadius: 22, backgroundColor: colors.primary,
              alignItems: 'center', justifyContent: 'center',
              shadowColor: colors.primary, shadowOpacity: 0.28, shadowRadius: 16, shadowOffset: { width: 0, height: 8 },
              elevation: 5 }}>
              <Feather name="check-square" color={colors.onPrimary} size={29} />
            </View>
            <Label size="micro" weight="bold" style={{ letterSpacing: 2.4, color: colors.primary }}>ORGANIZA AÍ</Label>
            <Label size="heading" weight="bold" style={{ textAlign: 'center' }}>
              {register ? 'Crie seu espaço.' : 'Mais clareza. Mais espaço para você.'}
            </Label>
            <Label muted size="caption" style={{ textAlign: 'center', maxWidth: 360 }}>
              {register
                ? 'Uma conta para organizar estudos, trabalho e vida pessoal.'
                : 'Entre para continuar de onde parou. Seus dados permanecem na sua conta.'}
            </Label>
          </View>

          <Card style={{ padding: tokens.space.xl, gap: tokens.space.md }}>
            <Label size="title" weight="bold">{register ? 'Criar minha conta' : 'Bem-vindo de volta'}</Label>
            <Label muted size="caption">{register ? 'Comece a organizar o que importa.' : 'Entre para continuar de onde parou.'}</Label>

            {register ? <Input label="Nome" value={name} onChangeText={setName} maxLength={100}
              autoComplete="name" placeholder="Seu nome" /> : null}
            <Input label="E-mail" value={email} onChangeText={setEmail} autoCapitalize="none"
              keyboardType="email-address" autoComplete="email" maxLength={150}
              placeholder="voce@exemplo.com" />
            <PasswordInput label="Senha" value={password} onChangeText={setPassword}
              autoComplete={register ? 'new-password' : 'current-password'}
              hint={register ? 'Mínimo de 8 caracteres.' : undefined} />
            {register ? <PasswordInput label="Confirmar senha" value={confirmation}
              onChangeText={setConfirmation} autoComplete="new-password" /> : null}

            <ErrorState message={error || auth.error} />
            {senhaAlterada === 'alterada' ? <Row style={{ flexWrap: 'nowrap' }}>
              <Feather name="shield" size={16} color={colors.success} />
              <Label size="caption" style={{ color: colors.success, flex: 1 }}>
                Senha alterada. Entre novamente com a nova credencial.
              </Label>
            </Row> : null}
            {success ? <Row style={{ flexWrap: 'nowrap' }}>
              <Feather name="check-circle" size={16} color={colors.success} />
              <Label size="caption" style={{ color: colors.success, flex: 1 }}>
                Conta criada. Agora você já pode entrar.
              </Label>
            </Row> : null}

            <Button title={register ? 'Criar conta' : 'Entrar'} loading={busy}
              onPress={() => { void submit(); }} icon={register ? 'user-plus' : 'arrow-right'} />
            <Button title={register ? 'Já tenho uma conta' : 'Criar uma conta'} variant="ghost" disabled={busy}
              onPress={() => register ? router.replace('/') : router.push('/cadastro')} />
          </Card>

          <Row style={{ justifyContent: 'center', gap: 6 }}>
            <Feather name="lock" size={13} color={colors.muted} />
            <Label size="micro" muted style={{ textAlign: 'center' }}>
              Conexão segura HTTPS · sessão protegida por token
            </Label>
          </Row>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  </SafeAreaView>;
}
