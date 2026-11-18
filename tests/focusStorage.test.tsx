import React from 'react';
import { act, renderHook, waitFor } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FocusProvider, useFocus } from '../src/state/FocusProvider';
import { decodeFocus, initialFocus } from '../src/domain/focus';

let mockUser = 1;
jest.mock('../src/state/AuthProvider', () => ({ useAuth: () => ({ session: { id: mockUser, server: 'https://demo.invalid' } }) }));
const wrapper = ({ children }: React.PropsWithChildren) => <FocusProvider>{children}</FocusProvider>;
beforeEach(async () => { await AsyncStorage.clear(); mockUser = 1; });
test('recupera sessão encerrada, persiste uma vez e isola contas', async () => {
  const state = { ...initialFocus, timer: { id: 'session-1', duration: 60000, remaining: 60000,
    mode: 'focus', startedAt: 1000, endAt: 61000, taskId: null } };
  await AsyncStorage.setItem('organiza.focus.v2:https://demo.invalid:1', JSON.stringify(state));
  const first = renderHook(useFocus, { wrapper });
  await waitFor(() => expect(first.result.current.ready).toBe(true));
  expect(first.result.current.state.sessions).toHaveLength(1);
  first.unmount();
  const restored = renderHook(useFocus, { wrapper });
  await waitFor(() => expect(restored.result.current.ready).toBe(true));
  expect(restored.result.current.state.sessions).toHaveLength(1);
  restored.unmount();
  mockUser = 2;
  const other = renderHook(useFocus, { wrapper });
  await waitFor(() => expect(other.result.current.ready).toBe(true));
  expect(other.result.current.state.sessions).toHaveLength(0);
});
test('falha de armazenamento não anuncia estado salvo nem substitui histórico', async () => {
  const hook = renderHook(useFocus, { wrapper });
  await waitFor(() => expect(hook.result.current.ready).toBe(true));
  jest.mocked(AsyncStorage.setItem).mockRejectedValueOnce(new Error('disk full'));
  await act(async () => {
    await expect(hook.result.current.update(s => ({ ...s, goals: { tasks: 8, minutes: 60 } }))).rejects.toThrow();
  });
  expect(hook.result.current.state.goals.tasks).toBe(3);
  expect(hook.result.current.error).toBeTruthy();
});
test('dados corrompidos são rejeitados antes de calcular ou sobrescrever', () => {
  expect(() => decodeFocus(JSON.stringify({ ...initialFocus, durations: { focus: -1, short: 5, long: 15 } }))).toThrow();
  expect(() => decodeFocus(JSON.stringify({ ...initialFocus, sessions: [null] }))).toThrow();
});
