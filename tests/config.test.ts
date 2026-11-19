import { resolveApiOrigin } from '../src/services/config';

describe('configuração central da API', () => {
  test('usa a API oficial HTTPS por padrão', () => {
    expect(resolveApiOrigin()).toBe('https://organizaai.evox.net.br');
    expect(resolveApiOrigin('')).toBe('https://organizaai.evox.net.br');
  });

  test('aceita origem ou URL terminada em /api sem duplicar o caminho', () => {
    expect(resolveApiOrigin('https://organizaai.evox.net.br')).toBe('https://organizaai.evox.net.br');
    expect(resolveApiOrigin('https://organizaai.evox.net.br/api')).toBe('https://organizaai.evox.net.br');
    expect(resolveApiOrigin('https://organizaai.evox.net.br/api/')).toBe('https://organizaai.evox.net.br');
  });

  test('mantém desenvolvimento local, mas não permite downgrade HTTP remoto', () => {
    expect(resolveApiOrigin('http://localhost:8080')).toBe('http://localhost:8080');
    expect(resolveApiOrigin('http://127.0.0.1:8080/api')).toBe('http://127.0.0.1:8080');
    expect(resolveApiOrigin('http://api.example.org')).toBe('https://organizaai.evox.net.br');
  });

  test('ignora URLs com credenciais, query ou caminho inválido', () => {
    expect(resolveApiOrigin('https://user:pass@example.org')).toBe('https://organizaai.evox.net.br');
    expect(resolveApiOrigin('https://example.org/outro')).toBe('https://organizaai.evox.net.br');
  });
});
