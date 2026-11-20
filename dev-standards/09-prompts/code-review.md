# Prompt padrão — Revisão de Código

```
Revise <o diff atual / PR #<n> / arquivo(s) especificado(s)> usando como critério:

1. Correção: a lógica faz o que deveria? Há caso de borda não tratado?
2. Segurança: checar contra `04-security/security-checklist.md` — especialmente injeção, controle de
   acesso, exposição de dado sensível.
3. Padrões de código: aderência a `01-code-standards/<linguagem>.md`.
4. Banco de dados (se aplicável): aderência a `02-database/<sgbd>.md` — migrations, índices, N+1.
5. API (se aplicável): aderência a `03-api-design/rest-api-standards.md`.
6. Arquitetura: a mudança respeita as camadas descritas em `05-architecture/architecture-guidelines.md`?
7. Testes: cobertura adequada conforme `06-testing/testing-strategy.md` — não só presença de teste, mas se
   o teste realmente valida o comportamento.
8. Simplicidade: há complexidade desnecessária, abstração prematura, ou duplicação que deveria ser extraída?

Formato de saída esperado:
- Lista de achados, do mais crítico ao menos crítico, cada um com: arquivo/linha, o problema, e por que
  importa (não apenas "isso está errado", mas o cenário concreto que quebra).
- Não fabricar achado para preencher a lista — se o código está bem, dizer isso.
```
