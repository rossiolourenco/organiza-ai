import { RESUME_REVALIDATE_MS, shouldRevalidate } from '../src/domain/revalidate';

describe('shouldRevalidate', () => {
  it('atualiza na primeira retomada', () => {
    expect(shouldRevalidate(0, Date.now())).toBe(true);
  });

  it('não repete a atualização dentro da janela', () => {
    const agora = 1_000_000;
    expect(shouldRevalidate(agora - 3_000, agora)).toBe(false);
    expect(shouldRevalidate(agora - RESUME_REVALIDATE_MS, agora)).toBe(true);
  });

  it('atualiza depois da janela e ignora valores inválidos', () => {
    const agora = 5_000_000;
    expect(shouldRevalidate(agora - RESUME_REVALIDATE_MS - 1, agora)).toBe(true);
    expect(shouldRevalidate(Number.NaN, agora)).toBe(true);
  });
});
