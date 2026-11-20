# Roadmap 3.3 — Mobile

Status: **execução parcial no RC 3.3**. Versão, artefato e gate foram fechados; o app não teve
mudança funcional nesta rodada.
Base: 3.2.0 em produção; dev-standards integrado; CI em `.github/workflows/ci.yml`.

## Guardrails

- Sem publicação em loja sem build assinado e autorização.
- Toda mudança em branch + PR; checks obrigatórios.
- Preservar login sem IP, cinco abas, dashboard, perfil e segurança.
- Não remover funcionalidades; não trocar stack sem ADR.

## Status de execução (RC 3.3)

**Concluído neste RC:** versão `3.3.0-rc.1`/loja `3.3.0`, gate validando `package.json` ×
`app.json` × `VERSION`, script de artefato com checksum, documentação de release/prontidão/handoff
e reexecução completa da qualidade (Jest 50/50, typecheck, lint, Expo Doctor 18/18, export).

**Pendente (ordem recomendada):** upgrade do Expo SDK/expo-router (P0 de plataforma), build
assinado e teste em aparelho físico (P0 para loja), refresh token/MFA/recuperação (P1),
Detox/Maestro (P2), Prettier (P2), offline explícito (P3).

## P0 — Segurança crítica

| Item | Justificativa | Impacto / risco | Dependências | Testes / aceite | Ordem |
|---|---|---|---|---|---|
| Auditoria de dependências | Detectar CVEs no app | Alto; risco de exploração | `npm audit`/OSV no CI | CVEs críticas/altas tratadas | 1 |
| Revisão de armazenamento de sessão | SecureStore é usado; validar migração/limpeza | Alto; vazamento de token | Teste em dispositivo | Nenhum token em log/localStorage na prévia nativa | 2 |
| Revogação/expiração de sessão | Token comprometido deve falhar | Alto; sequestro | Backend atual | 401 limpa sessão e volta ao login | 3 |

## P1 — Autenticação e confiabilidade

| Item | Justificativa | Impacto / risco | Dependências | Testes / aceite | Ordem |
|---|---|---|---|---|---|
| Refresh token | Sessão longa sem token eterno | Médio/alto; rotação | Backend/refresh | Renovação e revogação testadas | 1 |
| MFA administrativo | Contas ADMIN no app? não há Admin; avaliar política | Alto se habilitado | Decisão de produto | Login não-admin preservado | 2 |
| Recuperação de senha | Fluxo autoatendido ausente | Médio; suporte | SMTP/backend | Token único/expirável; senha antiga rejeitada | 3 |
| Perda de conexão/retry | Melhorar confiabilidade | Médio; UX offline | Cliente HTTP central | Timeout/erro/retry sem duplicar operação | 4 |

## P2 — Qualidade e arquitetura

| Item | Justificativa | Impacto / risco | Dependências | Testes / aceite | Ordem |
|---|---|---|---|---|---|
| Prettier | Padronizar TS/TSX | Baixo; reformatação | Config/baseline | CI de format sem erros | 1 |
| E2E Detox/Maestro | Proteger login/dashboard/perfil | Médio; manutenção | Runner/dispositivo | Golden path verde | 2 |
| Contrato OpenAPI compartilhado | Evitar divergência Web/Mobile | Médio | OpenAPI do backend | Cliente validado contra schema | 3 |
| Estratégia offline explícita | Não há offline completo | Médio; conflitos | Produto + backend | sync/merge documentado e testado | 4 |

## P3 — Experiência e manutenção

| Item | Justificativa | Impacto / risco | Dependências | Testes / aceite | Ordem |
|---|---|---|---|---|---|
| Limpar arquivos acadêmicos mortos | Reduzir confusão | Baixo | Autorização | `App.backup.js`/`index.js` removidos; build/testes verdes | 1 |
| Corrigir “Prioridade media” | Consistência de copy | Baixo | Nenhuma | Texto acentuado; snapshot/teste | 2 |
| Acessibilidade e Safe Area | Uso real em dispositivos | Baixo/médio | Auditoria | Contraste, foco, toque, teclado | 3 |
| Build assinado + aparelho físico | Validar distribuição | Alto para release | EAS/credenciais | APK/IPA assinado; golden path em iOS/Android | 4 |

## Critério de saída da 3.3

- P0/P1 concluídos com testes.
- CI obrigatório verde em PR e `main`.
- Nenhuma regressão de login, navegação, perfil ou tarefas.
- Publicação somente com build assinado e autorização.
