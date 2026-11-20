# Origem e integridade do dev-standards

- **Fonte canônica:** `/Users/rossiolourenco/Framework-Projetos/dev-standards`
- **Integrado em:** 2026-11-20
- **Projeto:** Organiza Aí Mobile
- **Versão explícita:** o framework não possui tag/version; a referência é o fingerprint abaixo.
- **Fingerprint SHA-256 (conteúdo, sem `.DS_Store`):**
  `37a59b23899aa564e9cf67e351f73c6dda7198b6dff2ffc3bc2fc2361e7fa32f`
- **Integridade:** a cópia local é idêntica à fonte canônica (`diff -rq` sem diferenças, excluindo
  `.DS_Store`). O arquivo `MANIFEST.sha256` contém os hashes por arquivo; seu hash é verificado
  contra `FINGERPRINT` no gate e não depende de caminho absoluto.

## Como atualizar

1. Atualize primeiro a fonte canônica em `Framework-Projetos/dev-standards`.
2. Compare com a cópia local:
   `diff -rq --exclude=.DS_Store /Users/rossiolourenco/Framework-Projetos/dev-standards dev-standards`
3. Aplique as mudanças, revise o `PROJECT-SCOPE.md` e atualize o fingerprint.
4. Rode os gates locais (`npm run verify`).

Não edite regras diretamente nesta cópia; qualquer adaptação do projeto deve ficar em `STACK.md`,
`AGENTS.md`, `PROJECT-SCOPE.md` ou `docs/`.
