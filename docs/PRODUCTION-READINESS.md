# Production Readiness — Mobile 3.3 RC

## 1. Critérios

| # | Critério | Evidência | Status |
|---|---|---|---|
| 1 | Versão consistente | `VERSION` × `package.json` × `app.json` validados no gate | ✅ |
| 2 | Qualidade | typecheck, lint, Jest 50/50 | ✅ |
| 3 | Saúde do projeto Expo | Expo Doctor 18/18 | ✅ |
| 4 | Bundles dos três alvos | export Web/iOS/Android verificado | ✅ |
| 5 | Gate dev-standards | `verify-premium.sh` full verde | ✅ |
| 6 | CI | `mobile-quality`, `mobile-bundle` | ⏳ remoto no PR |
| 7 | Segurança de sessão | SecureStore no nativo; sem token em log | ✅ (teste) |
| 8 | Sem regressão funcional | nenhuma tela/rota alterada | ✅ |
| 9 | Artefato reproduzível | `scripts/build-release.sh` + checksum | ✅ |
| 10 | Build assinado | requer credenciais | ❌ externo |
| 11 | Teste em aparelho físico | requer hardware | ❌ externo |

## 2. Dependências vulneráveis (resumo)

- 0 críticas, 6 altas em produção; todas de **DoS** (deep link/build) ou não aplicáveis
  (`image-size` só processa assets do bundle).
- Correção definitiva exige atualização do Expo SDK (major) — P0 do roadmap 3.4.
- Detalhes em `../organiza-ai-web/docs/SECURITY-REVIEW.md`.

## 3. Dívidas registradas

| Item | Prioridade |
|---|---|
| Upgrade Expo SDK / `expo-router` | P0 (plataforma) |
| Build assinado + aparelho físico | P0 para publicação em loja |
| E2E Detox/Maestro | P2 |
| Prettier | P2 |
| Estratégia offline | P3 |

## 4. Classificação

**GO condicional** para homologação e para o deploy Web/Admin do Prompt 2 (que não publica o app).

**NO-GO para publicação em loja** até existir build assinado e teste em aparelho físico com
autorização explícita.
