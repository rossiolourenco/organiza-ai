# Prompt padrão — Correção de Bug

```
Bug: <descrição do comportamento incorreto>

Comportamento esperado: <o que deveria acontecer>

Como reproduzir:
1. <passo 1>
2. <passo 2>

Contexto adicional: <logs, stack trace, versão, ambiente onde ocorre>

Instruções para o agente:
1. Primeiro, encontre a causa raiz — não aplique um patch superficial que apenas esconde o sintoma.
2. Escreva um teste que reproduz o bug (deve falhar antes da correção).
3. Corrija a causa raiz seguindo os padrões de `01-code-standards/` da linguagem do projeto.
4. Confirme que o teste novo passa e que a suíte existente continua verde.
5. Se a causa raiz revelar um problema mais amplo (mesmo padrão de bug em outro lugar), reporte isso
   separadamente em vez de expandir o escopo desta correção sem avisar.
6. Commit seguindo `08-versioning/commit-convention.md` com tipo `fix`.
```
