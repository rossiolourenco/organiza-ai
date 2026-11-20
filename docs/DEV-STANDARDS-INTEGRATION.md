# Integração do dev-standards — Mobile

## 1. Origem

- **Fonte canônica:** `/Users/rossiolourenco/Framework-Projetos/dev-standards`
- **Integração:** 2026-11-20
- **Fingerprint SHA-256 (sem `.DS_Store`):**
  `37a59b23899aa564e9cf67e351f73c6dda7198b6dff2ffc3bc2fc2361e7fa32f`
- **Cópia no projeto:** `dev-standards/`, idêntica à fonte canônica.
- **Metadados:** `dev-standards/SOURCE.md` e `dev-standards/PROJECT-SCOPE.md`.

O framework é **metodológico**: não é dependência de runtime do app Expo.

## 2. Estrutura adotada

```text
organiza-ai/
├── AGENTS.md
├── STACK.md
├── opencode.json
├── .editorconfig
├── .github/pull_request_template.md
├── dev-standards/            # cópia canônica + SOURCE/PROJECT-SCOPE
├── docs/
│   ├── adr/0001-adopt-dev-standards.md
│   ├── DEV-STANDARDS-INTEGRATION.md
│   ├── DEV-STANDARDS-COMPLIANCE.md
│   ├── DEVELOPMENT-WORKFLOW.md
│   ├── REGRESSION-PREVENTION.md
│   ├── LOCAL-EXECUTION.md
│   └── VALIDATION-REPORT.md
├── scripts/verify-premium.sh
├── app/
└── src/
```

A cópia versionada com fingerprint é reproduzível; não foi usado submódulo.

## 3. Configuração do OpenCode

- `AGENTS.md` na raiz é descoberto automaticamente. Ele preserva a instrução específica do Expo SDK 54
  e adiciona as regras do dev-standards.
- `opencode.json` declara `instructions`:
  `STACK.md`, `AI-GUIDELINES.md`, general principles, TypeScript, REST, security, mobile
  architecture, testing, ADR template, commits e git workflow.
- Não há dependência de runtime adicionada.

### Evidência de carregamento

Uma nova sessão `opencode run` iniciada em `/Users/rossiolourenco/ProjetosFaama/organiza-ai`
respondeu:

```text
MOBILE_STACK_OK
```

A pergunta era se o `AGENTS.md` e o `STACK.md` do Organiza Aí Mobile estavam carregados. A resposta
confirma o carregamento efetivo.

## 4. Escopo

`PROJECT-SCOPE.md` marca o que se aplica. Os arquivos de Java/Spring/banco não são carregados no
Mobile; a API é consumida por contrato REST.

## 5. Atualização

```bash
diff -rq --exclude=.DS_Store \
  /Users/rossiolourenco/Framework-Projetos/dev-standards \
  /Users/rossiolourenco/ProjetosFaama/organiza-ai/dev-standards
```

Atualize `SOURCE.md`/fingerprint após a atualização e rode `npm run verify`.

## 6. Limitações

- O framework não tem tag semântica; o fingerprint é a referência.
- A cópia é manual; exige revisão de diff.
- A integração não altera o comportamento do app.

## 7. Consolidação

- Commit: `8e2d0ec`
- Branch: `chore/dev-standards-3.2`
- PR: https://github.com/rossiolourenco/organiza-ai/pull/1
- Merge/publicação em loja: não executados; aguardando revisão.
