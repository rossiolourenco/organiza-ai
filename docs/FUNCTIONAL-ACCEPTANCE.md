# Functional Acceptance — Mobile 3.3 RC

> Verificado por automação nesta rodada. Teste em aparelho físico **não** executado.

## 1. Suíte automatizada

| Suíte | Testes | Resultado |
|---|---|---|
| `tests/config.test.ts` | configuração de API/HTTPS | ✅ |
| `tests/auth` (via provider) | login, sessão, logout | ✅ |
| `tests/tasks.test.ts` | tarefas | ✅ |
| `tests/planning.test.ts` | planejamento | ✅ |
| `tests/focus.test.ts` | foco | ✅ |
| `tests/eisenhower.test.ts` | priorização | ✅ |
| `tests/review.test.ts` | revisão | ✅ |
| `tests/session` / storage | persistência segura | ✅ |
| Demais suítes | utilitários e tema | ✅ |
| **Total** | **50/50** | ✅ |

Complementos: `npm run typecheck` OK, `npm run lint` OK, Expo Doctor **18/18**, export
Web/iOS/Android OK.

## 2. Fluxos cobertos por teste

| Fluxo | Evidência |
|---|---|
| Login com e-mail/senha | teste de `AuthProvider` |
| Persistência de sessão | teste de `SecureStore`/storage |
| Logout limpa sessão | teste de `AuthProvider` |
| Alterar senha | teste de chamada autenticada |
| Criar/editar/concluir tarefa | testes de `tasks` |
| Lixeira e restauração | testes de `tasks` |
| Categorias | testes de `tasks`/`planning` |
| Planejamento e Eisenhower | testes dedicados |
| Foco/Pomodoro | teste de `focus` |
| Revisão | teste de `review` |
| Tema e configurações | testes de `config` |
| URL da API e HTTPS | `config.test.ts` |

## 3. Não verificado nesta rodada

| Item | Motivo |
|---|---|
| Execução em iPhone/Android físico | Requer aparelho |
| Simulador iOS/Android | Não disponível no ambiente |
| Build assinado `.ipa`/`.aab` | Requer credenciais Apple/Google |
| Notificação push em dispositivo | Requer build nativo e permissão |
| Layout em telas físicas variadas | Requer dispositivo/simulador |

## 4. Riscos associados às lacunas

- Falha específica de plataforma (permissão, layout, teclado) só aparece em dispositivo.
- Mitigação: export validado, versões fixadas, Expo Doctor e suíte Jest; o Prompt 2 **não**
  publica em loja, então a lacuna não bloqueia o deploy Web/Admin.
- Antes de publicar em loja: executar `docs/RELEASE-HANDOFF.md` §5 em aparelho físico.
