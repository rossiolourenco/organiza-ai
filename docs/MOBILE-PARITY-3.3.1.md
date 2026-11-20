# Mobile — auditoria de paridade e ajustes 3.3.1

## 1. Auditoria

Todas as funcionalidades de negócio do backend já estavam presentes no Mobile:

- Tarefas (CRUD, concluir, lixeira, restaurar, exclusão definitiva, filtros, recorrência, checklist).
- Categorias (CRUD).
- Hábitos (CRUD + registros).
- Planejamento, revisão e foco (derivados/preferências locais).
- Perfil, segurança, logout e expiração de sessão.

**Lacunas funcionais encontradas: nenhuma.** `WEB_MISSING = 0`, `MOBILE_MISSING = 0`.

## 2. Correções de confiabilidade

| Problema | Correção |
|---|---|
| Dados desatualizados ao voltar ao app | `RevalidateOnActive` chama `refresh()` em `AppState = active`, com janela de 10 s |
| Risco de loop de recarregamento | `shouldRevalidate` puro + teste; ignora quando `busy` |
| Atualização após CRUD | já garantida por `mutate()` (refresh após cada operação) |
| Atualização após login | `DataProvider` remonta com a nova sessão e chama `refresh()` |
| Expiração de sessão | `Api` dispara `expire` no 401 e o app volta ao login |

## 3. Preservação

- Nenhuma tela, aba, rota ou contrato foi alterado.
- Identidade Premium, 5 abas e navegação permanecem.
- Versão `3.3.1-rc.1`; app/loja `3.3.1`, build 34.

## 4. Testes

- Jest **53/53** (50 anteriores + 3 de `revalidate`).
- Typecheck, lint, Expo Doctor 18/18 e export Web/iOS/Android.
- Simulador iOS 18.1: app abriu, dashboard e hábitos renderizaram sem erro.

## 5. Pendências

- Teste em aparelho físico e build assinado (fora do escopo desta rodada).
- Checklist manual de dois dispositivos (`CROSS-PLATFORM-TESTS.md` §6).
