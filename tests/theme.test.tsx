import React from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemeProvider, useTheme } from '../src/theme/ThemeProvider';
import { Button, Label } from '../src/components/ui';

function Probe() {
  const { colors, preference, setPreference } = useTheme();
  return <><Label>{colors.background}</Label><Label>{preference}</Label>
    <Button title="Escuro" onPress={() => { void setPreference('dark'); }} />
    <Button title="Claro" onPress={() => { void setPreference('light'); }} /></>;
}
test('tema claro/escuro persiste e restaura a preferência', async () => {
  await AsyncStorage.clear();
  const first = render(<ThemeProvider><Probe /></ThemeProvider>);
  fireEvent.press(first.getByLabelText('Escuro'));
  await first.findByText('#0B1020');
  expect(await AsyncStorage.getItem('organiza.theme')).toBe('dark');
  first.unmount();
  const second = render(<ThemeProvider><Probe /></ThemeProvider>);
  await waitFor(() => expect(second.getByText('dark')).toBeTruthy());
  fireEvent.press(second.getByLabelText('Claro'));
  await second.findByText('#F7F8FC');
  expect(await AsyncStorage.getItem('organiza.theme')).toBe('light');
});
