# Conformidade com o dev-standards — Mobile

Data: 2026-11-20. Classificação: **Conforme**, **Parcialmente conforme**, **Não conforme**,
**Não aplicável**. Nenhuma refatoração ampla foi feita.

## 1. Resumo

| Camada | Classificação | Evidência |
|---|---|---|
| React Native/TypeScript | Conforme com ressalvas | `strict`, features separadas, typecheck/lint limpos; sem Prettier |
| Expo Router | Conforme | 5 abas, stack, `/seguranca`, wrappers de rota |
| Design System | Conforme | `src/components/ui.tsx`, tokens/temas |
| API/HTTPS | Conforme | `src/services/config.ts`, HTTPS, sem campo de IP |
| Sessão/segurança | Conforme | SecureStore nativo; sem token em log; senha não persiste em texto |
| Testes | Conforme | 50/50 Jest/Testing Library |
| Documentação | Conforme | docs 3.2 + ADR + integração + validação |
| Distribuição | Parcial | bundles exportados; sem build assinado em loja |

## 2. Prioridades

### P0 — Crítico

Nenhum achado.

### P1 — Alto

Nenhuma falha funcional no código atual. A divergência visual observada era ambiental:

- cópia acadêmica `organiza-ai - cópia` em `5bb727f`, com app 1.0.0 e IP;
- cache do Metro/Expo podendo reutilizar configuração antiga.

O uso do repositório oficial e `expo start -c` elimina o sintoma.

### P2 — Médio (não corrigido nesta fase)

1. README mantém seções históricas da entrega acadêmica.
2. Sem Prettier configurado; ESLint e typecheck existem.
3. Sem build EAS/APK/IPA assinado ou pipeline de distribuição.
4. Sem teste em aparelho físico nesta execução.
5. Sem modo offline completo; comportamento documentado.
6. Sem testes E2E de UI (Detox/Maestro).

### P3 — Baixo

- `App.backup.js`, `index.js` legado e diretórios vazios (`componentes/`, `servicos/`) são resíduos
  acadêmicos; remover em limpeza autorizada.
- Texto “Prioridade media” sem acentuação em um cartão.

## 3. Correções realizadas

- Integração do framework canônico, com fingerprint e escopo.
- `AGENTS.md` ampliado, `STACK.md`, `opencode.json` e `.editorconfig`.
- PR template, ADR e gate `npm run verify`.
- Documentação de integração/conformidade/workflow/regressão/execução/validação.
- Nenhuma alteração de UI, API ou banco.

## 4. Plano separado para P2/P3

1. Limpar arquivos acadêmicos mortos e atualizar o README para 3.2.
2. Adicionar Prettier e rodar no gate/CI.
3. Configurar EAS/build assinado e testar em dispositivo físico.
4. Avaliar Detox/Maestro para o golden path.
5. Revisar o texto “Prioridade media”.
6. Planejar suporte offline explícito, se for requisito de produto.
