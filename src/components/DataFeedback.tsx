import React from 'react';
import { View } from 'react-native';
import Feather from '@expo/vector-icons/Feather';
import { ErrorState, Label, Row } from './ui';
import { useData } from '../state/DataProvider';
import { useTheme } from '../theme/ThemeProvider';

export function DataFeedback() {
  const { error, refresh, online } = useData();
  const { colors } = useTheme();
  return <>
    {online === false ? <View accessibilityRole="alert" style={{ flexDirection: 'row', alignItems: 'center',
      gap: 8, paddingHorizontal: 12, paddingVertical: 10, borderRadius: 12,
      backgroundColor: colors.warningSoft, borderWidth: 1, borderColor: `${colors.warning}33` }}>
      <Feather name="wifi-off" size={14} color={colors.warning} />
      <Label size="caption" style={{ color: colors.warning, flex: 1 }}>
        Sem conexão com o servidor. As alterações não foram enviadas.
      </Label>
    </View> : null}
    <ErrorState message={error ? `${error} Os dados exibidos podem estar desatualizados.` : null}
      retry={() => { void refresh(); }} />
  </>;
}

export function InlineError({ message }: { message: string | null }) {
  const { colors } = useTheme();
  if (!message) return null;
  return <Row style={{ flexWrap: 'nowrap' }}>
    <Feather name="alert-circle" size={14} color={colors.danger} />
    <Label size="caption" style={{ color: colors.danger, flex: 1 }}>{message}</Label>
  </Row>;
}
