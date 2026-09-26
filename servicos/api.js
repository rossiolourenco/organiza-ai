let apiUrl = '';

export function configurarApi(ip) {
  const ipLimpo = ip
    .trim()
    .replace(/^https?:\/\//, '')
    .replace(/\/$/, '');

  apiUrl = `http://${ipLimpo}:8080`;

  return apiUrl;
}

export function obterApiUrl() {
  return apiUrl;
}

export function apiConfigurada() {
  return apiUrl !== '';
}

export async function fetchComTimeout(
  url,
  opcoes = {},
  tempo = 5000
) {
  const controller = new AbortController();

  const timeout = setTimeout(() => {
    controller.abort();
  }, tempo);

  try {
    const resposta = await fetch(url, {
      ...opcoes,
      signal: controller.signal,
    });

    return resposta;
  } catch (erro) {
    if (erro.name === 'AbortError') {
      throw new Error('TIMEOUT');
    }

    throw erro;
  } finally {
    clearTimeout(timeout);
  }
}