/**
 * Configuração central da API.
 *
 * Produção: sempre HTTPS oficial.
 * Desenvolvimento: EXPO_PUBLIC_API_URL pode apontar para localhost.
 * Nunca há downgrade silencioso de HTTPS para HTTP em host remoto.
 */
const PRODUCTION_ORIGIN = 'https://organizaai.evox.net.br';

export function resolveApiOrigin(raw?: string | null): string {
  const value = raw?.trim();
  if (!value) return PRODUCTION_ORIGIN;
  try {
    const url = new URL(/^https?:\/\//i.test(value) ? value : `https://${value}`);
    const local = ['localhost', '127.0.0.1', '::1'].includes(url.hostname);
    if (url.username || url.password || url.search || url.hash) throw new Error('URL inválida');
    if (url.protocol !== 'https:' && !local) throw new Error('HTTPS obrigatório');
    // Aceita tanto a origem quanto a URL terminada em /api.
    const path = url.pathname.replace(/\/+$/, '');
    if (path !== '' && path !== '/api') throw new Error('Caminho inválido');
    return url.origin;
  } catch {
    if (typeof console !== 'undefined') console.warn('EXPO_PUBLIC_API_URL inválida; usando produção.');
    return PRODUCTION_ORIGIN;
  }
}

export const API_ORIGIN = resolveApiOrigin(process.env.EXPO_PUBLIC_API_URL);
export const API_BASE = `${API_ORIGIN}/api`;
export const IS_PRODUCTION_API = API_ORIGIN === PRODUCTION_ORIGIN;

/** Apenas para diagnóstico local; não deve ser exibido ao usuário final. */
export const API_HOST_LABEL = (() => {
  try { return new URL(API_ORIGIN).host; } catch { return 'organizaai.evox.net.br'; }
})();
