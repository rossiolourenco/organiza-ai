import React, { useState } from 'react';
import { Linking, View } from 'react-native';
import { useRouter } from 'expo-router';
import Feather from '@expo/vector-icons/Feather';
import {
  Button, Card, ErrorState, Input, Label, PasswordInput, PremiumCard, Row, Screen, Sheet,
} from '../../components/ui';
import { DataFeedback } from '../../components/DataFeedback';
import { useAuth } from '../../state/AuthProvider';
import { tokens, useTheme } from '../../theme/ThemeProvider';

export default function SecurityScreen() {
  const auth = useAuth();
  const router = useRouter();
  const { colors } = useTheme();
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [excluirAberto, setExcluirAberto] = useState(false);
  const [senhaExclusao, setSenhaExclusao] = useState('');
  const [confirmacaoExclusao, setConfirmacaoExclusao] = useState('');
  const [excluindo, setExcluindo] = useState(false);
  const [erroExclusao, setErroExclusao] = useState<string | null>(null);

  const excluirConta = async () => {
    if (excluindo) return;
    setErroExclusao(null);
    if (!senhaExclusao) { setErroExclusao('Informe sua senha.'); return; }
    if (confirmacaoExclusao.trim().toUpperCase() !== 'EXCLUIR') {
      setErroExclusao('Digite EXCLUIR para confirmar.'); return;
    }
    setExcluindo(true);
    try {
      await auth.deleteAccount(senhaExclusao);
      router.replace({ pathname: '/', params: { conta: 'excluida' } });
    } catch (e) {
      setErroExclusao(e instanceof Error ? e.message : 'Não foi possível excluir a conta.');
    } finally { setExcluindo(false); }
  };

  const submit = async () => {
    if (busy) return;
    setError(null);
    if (!current) { setError('Informe sua senha atual.'); return; }
    if (next.length < 8) { setError('A nova senha deve ter pelo menos 8 caracteres.'); return; }
    if (next.length > 72) { setError('A nova senha deve ter até 72 caracteres.'); return; }
    if (next !== confirmation) { setError('A confirmação não confere com a nova senha.'); return; }
    if (next === current) { setError('A nova senha deve ser diferente da senha atual.'); return; }
    setBusy(true);
    try {
      await auth.changePassword(current, next);
      setCurrent(''); setNext(''); setConfirmation('');
      setDone(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Não foi possível alterar a senha.');
    } finally { setBusy(false); }
  };

  const leave = async () => {
    await auth.clear();
    router.replace({ pathname: '/', params: { senha: 'alterada' } });
  };

  if (done) return <Screen title="Senha alterada." subtitle="Sua conta está protegida."
    onBack={() => { void leave(); }}>
    <DataFeedback />
    <PremiumCard tone="success" style={{ gap: tokens.space.sm }}>
      <Row style={{ flexWrap: 'nowrap' }}>
        <View style={{ width: 44, height: 44, borderRadius: 14, alignItems: 'center',
          justifyContent: 'center', backgroundColor: colors.successSoft }}>
          <Feather name="check" size={22} color={colors.success} />
        </View>
        <View style={{ flex: 1, minWidth: 0 }}>
          <Label size="subtitle" weight="bold">Senha atualizada com sucesso.</Label>
          <Label muted size="caption">Todas as sessões foram revogadas por segurança.</Label>
        </View>
      </Row>
      <Label muted size="caption">
        Entre novamente com a nova senha. A credencial anterior não funciona mais.
      </Label>
      <Button title="Entrar novamente" icon="log-in" onPress={() => { void leave(); }} />
    </PremiumCard>
  </Screen>;

  return <Screen title="Segurança" subtitle="Sua senha protege todos os seus dados."
    onBack={() => router.back()}>
    <DataFeedback />
    <PremiumCard tone="primary" style={{ gap: tokens.space.xs }}>
      <Row style={{ flexWrap: 'nowrap' }}>
        <Feather name="shield" size={18} color={colors.primary} />
        <Label size="caption" weight="semibold" style={{ flex: 1 }}>
          A troca exige a senha atual e revoga todas as sessões, inclusive neste aparelho.
        </Label>
      </Row>
    </PremiumCard>

    <Card style={{ gap: tokens.space.md }}>
      <Label size="subtitle" weight="bold">Alterar senha</Label>
      <PasswordInput label="Senha atual" value={current} onChangeText={setCurrent}
        autoComplete="current-password" />
      <PasswordInput label="Nova senha" value={next} onChangeText={setNext}
        autoComplete="new-password" hint="Mínimo de 8 caracteres. A política do servidor também é aplicada." />
      <PasswordInput label="Confirmar nova senha" value={confirmation} onChangeText={setConfirmation}
        autoComplete="new-password" />
      <ErrorState message={error} />
      <Button title="Alterar minha senha" icon="lock" loading={busy} onPress={() => { void submit(); }} />
    </Card>

    <Card style={{ gap: tokens.space.xs }}>
      <Label size="subtitle">Por que sair de todas as sessões?</Label>
      <Label muted size="caption">
        Se outra pessoa tiver acesso ao seu token, ele deixa de funcionar assim que a senha é alterada.
        Você precisará entrar novamente neste e em qualquer outro aparelho.
      </Label>
    </Card>

    <Card style={{ gap: tokens.space.xs }}>
      <Label size="subtitle">Privacidade e termos</Label>
      <Label muted size="caption">
        Consulte como tratamos seus dados e as regras de uso do aplicativo.
      </Label>
      <Button title="Política de Privacidade" variant="ghost" icon="shield"
        onPress={() => { void Linking.openURL('https://organizaai.evox.net.br/privacidade'); }} />
      <Button title="Termos de Uso" variant="ghost" icon="file-text"
        onPress={() => { void Linking.openURL('https://organizaai.evox.net.br/termos'); }} />
    </Card>

    <Card style={{ gap: tokens.space.sm, borderColor: colors.danger }}>
      <Label size="subtitle" weight="bold" style={{ color: colors.danger }}>Excluir minha conta</Label>
      <Label muted size="caption">
        Remove permanentemente a conta e os dados associados (tarefas, categorias, hábitos,
        planejamento e histórico de foco). Esta ação não pode ser desfeita.
      </Label>
      <Button title="Excluir minha conta" variant="danger" icon="trash-2"
        onPress={() => { setSenhaExclusao(''); setConfirmacaoExclusao(''); setErroExclusao(null); setExcluirAberto(true); }} />
    </Card>

    <Sheet visible={excluirAberto} title="Excluir conta?"
      subtitle="Todos os seus dados serão removidos. Esta ação não pode ser desfeita."
      onClose={() => { if (!excluindo) setExcluirAberto(false); }}>
      <PasswordInput label="Senha atual" value={senhaExclusao} onChangeText={setSenhaExclusao}
        autoComplete="current-password" />
      <Input label="Digite EXCLUIR para confirmar" value={confirmacaoExclusao}
        onChangeText={setConfirmacaoExclusao} autoCapitalize="characters" autoCorrect={false} />
      <ErrorState message={erroExclusao} />
      <Button title={excluindo ? 'Excluindo…' : 'Excluir definitivamente'} variant="danger"
        icon="trash-2" loading={excluindo} onPress={() => { void excluirConta(); }} />
      <Button title="Cancelar" variant="ghost" disabled={excluindo}
        onPress={() => setExcluirAberto(false)} />
    </Sheet>
  </Screen>;
}
