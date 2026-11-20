# ADR 0001: Adotar o dev-standards como padrão obrigatório

- **Status:** Aceito
- **Data:** 2026-11-20
- **Decisores:** usuário e equipe Organiza Aí

## Contexto

O Mobile 3.2 está preservado no Git, mas cópias acadêmicas e sessões Expo antigas geraram
divergência visual e risco de rodar o código errado. O projeto não tinha um padrão explícito e
versionado para orientar agentes, testes, segurança, documentação e releases.

## Decisão

Adotar o framework canônico `~/Framework-Projetos/dev-standards` como padrão obrigatório de
desenvolvimento, com:

- cópia controlada por projeto e fingerprint de conteúdo;
- `STACK.md`, `AGENTS.md` e `opencode.json` com `instructions`;
- `PROJECT-SCOPE.md` marcando o que se aplica;
- gate local de regressão;
- documentação de integração, conformidade, workflow, execução local e validação.

O framework é metodológico: não vira dependência de runtime do app.

## Alternativas consideradas

| Alternativa | Prós | Contras | Motivo do descarte |
|---|---|---|---|
| Referência global apenas | uma cópia | não versionada com o projeto; some em outro checkout | Não reproduzível |
| Submódulo Git | atualização central | complexidade operacional e de CI | Desnecessário para docs |
| Não integrar | zero esforço | repete divergências e falta de critérios | Não atende ao objetivo |

## Consequências

- Positivas: padrões explícitos, auditoria repetível, menos regressões e decisões documentadas.
- Negativas: contexto maior e atualização manual da cópia; exige disciplina de leitura.
- O que fica mais difícil: trocar stack ou padrões sem atualizar `STACK.md` e o ADR.

## Referências

- `dev-standards/AI-GUIDELINES.md`
- `dev-standards/SOURCE.md`
- `docs/DEV-STANDARDS-INTEGRATION.md`
