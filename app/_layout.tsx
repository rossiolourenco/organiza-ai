import React, { useEffect } from 'react';
import { router, Stack, usePathname, useRootNavigationState } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider, useAuth } from '../src/state/AuthProvider';
import { ThemeProvider, useTheme } from '../src/theme/ThemeProvider';
import { Loading, Screen } from '../src/components/ui';

function Navigation() {
  const { session, ready } = useAuth();
  const { colors, dark } = useTheme();
  const pathname = usePathname();
  const navigation = useRootNavigationState();
  useEffect(() => {
    if (navigation?.key && ready && session && (pathname === '/' || pathname === '/cadastro'))
      router.replace('/home');
  }, [navigation?.key, pathname, ready, session]);
  if (!ready) return <Screen title="Preparando seu espaço"><Loading /></Screen>;
  return <>
    <StatusBar style={dark ? 'light' : 'dark'} />
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }}>
      <Stack.Protected guard={!session}>
        <Stack.Screen name="index" /><Stack.Screen name="cadastro" />
      </Stack.Protected>
      <Stack.Protected guard={!!session}><Stack.Screen name="(main)" /></Stack.Protected>
    </Stack>
  </>;
}
export default function Layout() {
  return <SafeAreaProvider><ThemeProvider><AuthProvider><Navigation /></AuthProvider></ThemeProvider></SafeAreaProvider>;
}
