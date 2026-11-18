import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { Session } from '../types/models';

let webSession: Session | null = null;
const key = 'organiza.session.v2';
// Na prévia Web, a credencial permanece somente em memória.
export const sessionStorage = {
  async read(): Promise<Session | null> {
    if (Platform.OS === 'web') return webSession;
    const raw = await SecureStore.getItemAsync(key);
    if (!raw) return null;
    const value = JSON.parse(raw) as Session;
    return value.token && value.server && Number.isSafeInteger(value.id) ? value : null;
  },
  async write(value: Session | null) {
    if (Platform.OS === 'web') { webSession = value; return; }
    if (value) await SecureStore.setItemAsync(key, JSON.stringify(value));
    else await SecureStore.deleteItemAsync(key);
  },
};
