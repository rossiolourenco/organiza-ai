import React from 'react';
import { Stack } from 'expo-router';
import { DataProvider } from '../../src/state/DataProvider';
import { FocusProvider } from '../../src/state/FocusProvider';
import { SettingsProvider } from '../../src/state/SettingsProvider';
import { ReminderSync } from '../../src/features/notifications/ReminderSync';
import { useTheme } from '../../src/theme/ThemeProvider';
import { useAuth } from '../../src/state/AuthProvider';

export const unstable_settings = { initialRouteName: '(tabs)' };

export default function MainLayout() {
  const { colors } = useTheme();
  const { session } = useAuth();
  if (!session) return null;
  return <DataProvider key={`${session.server}:${session.id}`}>
    <SettingsProvider>
      <FocusProvider>
        <ReminderSync />
        <Stack initialRouteName="(tabs)" screenOptions={{ headerShown: false,
          contentStyle: { backgroundColor: colors.background } }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="novaTarefa" />
          <Stack.Screen name="editarTarefa" />
          <Stack.Screen name="categorias" />
          <Stack.Screen name="habitos" />
          <Stack.Screen name="revisao" />
          <Stack.Screen name="lixeira" />
          <Stack.Screen name="concentracao" options={{ animation: 'fade' }} />
        </Stack>
      </FocusProvider>
    </SettingsProvider>
  </DataProvider>;
}
