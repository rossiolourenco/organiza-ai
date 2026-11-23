import React from 'react';
import { Tabs } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Feather from '@expo/vector-icons/Feather';
import { useTheme } from '../../../src/theme/ThemeProvider';

export const unstable_settings = { initialRouteName: 'home' };

export default function TabLayout() {
  const { colors, dark } = useTheme();
  const insets = useSafeAreaInsets();
  const screens = [
    { name: 'home', title: 'Início', icon: 'home' },
    { name: 'tarefas', title: 'Tarefas', icon: 'check-square' },
    { name: 'planejamento', title: 'Planejar', icon: 'calendar' },
    { name: 'foco', title: 'Foco', icon: 'clock' },
    { name: 'perfil', title: 'Perfil', icon: 'user' },
  ] as const;
  return <Tabs initialRouteName="home" screenOptions={{ headerShown: false,
    tabBarActiveTintColor: colors.primary, tabBarInactiveTintColor: colors.muted,
    tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.border, borderTopWidth: 1,
      height: 64 + insets.bottom, paddingTop: 8, paddingBottom: Math.max(insets.bottom, 8),
      ...(dark ? {} : { shadowColor: colors.shadow, shadowOpacity: 0.08, shadowRadius: 16,
        shadowOffset: { width: 0, height: -4 } }) },
    tabBarItemStyle: { paddingVertical: 2 },
    tabBarLabelStyle: { fontSize: 11, fontWeight: '600' } }}>
    {screens.map(screen => <Tabs.Screen key={screen.name} name={screen.name}
      options={{ title: screen.title, tabBarAccessibilityLabel: `${screen.title} — aba`,
        tabBarIcon: ({ color, focused }) => <Feather accessible={false} name={screen.icon} color={color}
          size={focused ? 23 : 21} /> }} />)}
  </Tabs>;
}
