import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Design System 3.0 — Premium Productivity.
 * Paleta e escala são a fonte única de verdade visual. Nenhuma tela deve
 * declarar cores literais; todas usam os tokens semânticos abaixo.
 */
export interface ThemeColors {
  background: string; surface: string; surfaceSecondary: string; elevated: string;
  text: string; muted: string; border: string;
  primary: string; primaryHover: string; secondary: string; onPrimary: string;
  primarySoft: string; success: string; successSoft: string; warning: string;
  warningSoft: string; danger: string; dangerSoft: string;
  overlay: string; skeleton: string; shadow: string;
}

const light: ThemeColors = {
  background: '#F7F8FC', surface: '#FFFFFF', surfaceSecondary: '#F0F2F8', elevated: '#EEF0FF',
  text: '#172033', muted: '#667085', border: '#E5E7EF',
  primary: '#635BFF', primaryHover: '#5148E5', secondary: '#8B83FF', onPrimary: '#FFFFFF',
  primarySoft: '#ECEAFF', success: '#16A34A', successSoft: '#E7F6EC',
  warning: '#B45309', warningSoft: '#FEF3E2', danger: '#DC2626', dangerSoft: '#FDECEC',
  overlay: 'rgba(11, 16, 32, 0.55)', skeleton: '#E9ECF5', shadow: 'rgba(23, 32, 51, 0.08)',
};

const dark: ThemeColors = {
  background: '#0B1020', surface: '#151C2E', surfaceSecondary: '#101728', elevated: '#1C2538',
  text: '#F8FAFC', muted: '#94A3B8', border: '#2A3448',
  primary: '#8B83FF', primaryHover: '#A29BFF', secondary: '#B7B2FF', onPrimary: '#0B1020',
  primarySoft: '#232A47', success: '#4ADE80', successSoft: '#12301F',
  warning: '#FBBF24', warningSoft: '#33260C', danger: '#FDA4AF', dangerSoft: '#3A1620',
  overlay: 'rgba(0, 0, 0, 0.66)', skeleton: '#1E2839', shadow: 'rgba(0, 0, 0, 0.35)',
};

export const tokens = {
  space: { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 36, huge: 48 },
  radius: { xs: 8, sm: 12, md: 16, lg: 22, xl: 28, pill: 999 },
  font: {
    micro: 11, caption: 12, body: 15, subtitle: 17, title: 21, heading: 28, display: 40,
  },
  weight: {
    regular: '400' as const, medium: '500' as const, semibold: '600' as const,
    bold: '700' as const, heavy: '800' as const,
  },
  touch: 48,
  motion: { quick: 120, normal: 220 },
  lineHeight: 1.45,
} as const;

export const categoryColors = ['#635BFF', '#DC2626', '#16A34A', '#D97706', '#0891B2', '#9333EA', '#DB2777', '#475569'];

export type ThemePreference = 'system' | 'light' | 'dark';
interface Theme {
  colors: ThemeColors; dark: boolean; preference: ThemePreference;
  setPreference: (value: ThemePreference) => Promise<void>;
}
const Context = createContext<Theme>(null!);

export function ThemeProvider({ children }: React.PropsWithChildren) {
  const system = useColorScheme();
  const [preference, setValue] = useState<ThemePreference>('system');
  useEffect(() => {
    void AsyncStorage.getItem('organiza.theme').then(value => {
      if (value === 'light' || value === 'dark' || value === 'system') setValue(value);
    }).catch(() => { /* Sem preferência recuperável: segue o tema do sistema. */ });
  }, []);
  const setPreference = async (value: ThemePreference) => {
    await AsyncStorage.setItem('organiza.theme', value);
    setValue(value);
  };
  const value = useMemo(() => {
    const isDark = preference === 'dark' || (preference === 'system' && system === 'dark');
    return { colors: isDark ? dark : light, dark: isDark, preference, setPreference };
  }, [preference, system]);
  return <Context.Provider value={value}>{children}</Context.Provider>;
}

export const useTheme = () => useContext(Context);
