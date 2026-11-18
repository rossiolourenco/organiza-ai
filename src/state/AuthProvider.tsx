import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { Session } from '../types/models';
import { sessionStorage } from '../services/sessionStorage';
import { normalizeServer, request } from '../services/api';

interface Auth {
  session: Session | null; ready: boolean; error: string | null;
  login: (server: string, email: string, senha: string) => Promise<void>;
  logout: () => Promise<void>; expire: (token: string) => void;
}
const Context = createContext<Auth>(null!);
export function AuthProvider({ children }: React.PropsWithChildren) {
  const [session, setSession] = useState<Session | null>(null);
  const current = useRef<Session | null>(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    sessionStorage.read().then(value => { current.current = value; setSession(value); }).catch(() => setError('Não foi possível recuperar a sessão. Entre novamente.'))
      .finally(() => setReady(true));
  }, []);
  const expire = useCallback((token: string) => {
    if (current.current?.token !== token) return;
    current.current = null; setSession(null); setError('Sua sessão expirou. Entre novamente.');
    void sessionStorage.write(null).catch(() => setError('Falha ao limpar a sessão local. Tente sair novamente.'));
  }, []);
  const login = async (serverValue: string, email: string, senha: string) => {
    const server = normalizeServer(serverValue);
    const user = await request<Omit<Session, 'server'>>(server, '/usuarios/login',
      { method: 'POST', body: JSON.stringify({ email: email.trim(), senha }) });
    if (!user.token) throw new Error('Atualize o backend para a versão com sessões seguras.');
    const value = { ...user, server };
    await sessionStorage.write(value); current.current = value; setError(null); setSession(value);
  };
  const logout = async () => {
    // Se estiver sem rede, logout continua local; token remoto expira em sete dias.
    let revoked = true;
    if (session) await request(session.server, '/usuarios/logout', { method: 'POST' }, session.token)
      .catch(() => { revoked = false; });
    await sessionStorage.write(null); current.current = null; setSession(null);
    setError(revoked ? null : 'Você saiu deste aparelho. Sem conexão para revogar a sessão no servidor.');
  };
  return <Context.Provider value={{ session, ready, error, login, logout, expire }}>{children}</Context.Provider>;
}
export const useAuth = () => useContext(Context);
