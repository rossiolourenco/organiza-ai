# Prompt padrão — Refatoração

```
Quero refatorar: <arquivo/módulo/área>

Motivo: <o que está ruim hoje — duplicação, complexidade, dificuldade de testar, performance, etc.>

Restrições:
- Comportamento externo observável não deve mudar (mesma entrada → mesma saída), salvo indicado abaixo.
- <qualquer exceção explícita ao comportamento que pode mudar>

Instruções para o agente:
1. Não misturar refatoração com mudança de comportamento/feature nova no mesmo commit/PR.
2. Antes de refatorar, confirmar que existe cobertura de teste suficiente sobre a área afetada — se não
   existir, escrever os testes de caracterização primeiro (capturam o comportamento atual antes de mexer).
3. Aplicar os padrões de `01-code-standards/` e `05-architecture/architecture-guidelines.md`.
4. Fazer a menor mudança possível para atingir o objetivo — não expandir escopo para "aproveitar e arrumar"
   outras partes não relacionadas sem avisar antes.
5. Rodar a suíte de testes completa ao final e confirmar que nada quebrou.
6. Commit seguindo `08-versioning/commit-convention.md` com tipo `refactor`.
```
