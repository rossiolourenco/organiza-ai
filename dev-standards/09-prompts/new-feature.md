# Prompt padrão — Nova Feature

> Copiar, preencher os campos entre `< >` e enviar ao agente. Ele deve carregar `dev-standards/AI-GUIDELINES.md`
> como contexto antes de responder.

```
Contexto do projeto: <descrição curta ou "ver AI-GUIDELINES.md e código existente">

Quero implementar: <descrição da feature em 2-4 frases, incluindo objetivo de negócio>

Requisitos funcionais:
- <requisito 1>
- <requisito 2>

Casos de borda a considerar:
- <caso 1>

Antes de implementar:
1. Rode o `00-bootstrap/discovery-checklist.md` — se algo sobre a stack ou requisitos estiver ambíguo,
   pergunte antes de codar.
2. Aplique os padrões relevantes de `01-code-standards/`, `02-database/`, `03-api-design/`,
   `04-security/security-checklist.md`, `05-architecture/` e `06-testing/testing-strategy.md`.
3. Apresente um plano curto (arquivos afetados, abordagem) antes de escrever código, se a mudança tocar mais
   de ~3 arquivos ou envolver decisão de arquitetura.

Entregáveis esperados:
- [ ] Implementação seguindo os padrões do projeto
- [ ] Testes cobrindo o caminho principal e os casos de borda relevantes
- [ ] Atualização de documentação se o comportamento público mudar (README/OpenAPI/ADR se for decisão
      arquitetural)
- [ ] Commit(s) seguindo `08-versioning/commit-convention.md`
```
