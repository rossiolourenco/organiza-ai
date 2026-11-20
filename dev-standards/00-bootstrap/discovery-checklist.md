# Checklist de Descoberta — antes de iniciar qualquer implementação

O agente de IA deve percorrer este checklist **antes** de escrever código para uma tarefa nova. Perguntas já
respondidas em contexto anterior (memória, CLAUDE.md do projeto) não precisam ser repetidas — mas devem ser
confirmadas se houver ambiguidade.

## 1. Contexto do projeto

- [ ] O projeto já existe? Se sim, qual stack, estrutura de pastas e convenções já estão em uso?
- [ ] Existe algum documento de arquitetura (ADR, README, diagrama) a ser lido antes?
- [ ] Qual o objetivo de negócio da tarefa (não só o técnico)?

## 2. Stack (ver regra de ouro em `AI-GUIDELINES.md`)

- [ ] Linguagem/framework de backend definidos ou a definir?
- [ ] Banco de dados definido ou a definir?
- [ ] Front-end (se aplicável): framework, gerenciador de estado?
- [ ] Mobile (se aplicável): nativo, React Native, Flutter?
- [ ] Se algo estiver indefinido, **apresentar recomendação e pedir confirmação explícita antes de prosseguir.**

## 3. Requisitos funcionais

- [ ] Qual o comportamento esperado, com exemplos de entrada/saída?
- [ ] Quais são os critérios de aceite / definition of done?
- [ ] Há casos de borda relevantes (dados vazios, concorrência, permissões diferentes)?

## 4. Requisitos não-funcionais

- [ ] Volume de dados/tráfego esperado (define índices, cache, paginação)?
- [ ] Requisitos de latência ou SLA?
- [ ] Requisitos de auditoria/compliance (LGPD, GDPR, PCI, HIPAA)?
- [ ] Multi-tenant? Multi-idioma? Multi-região?

## 5. Segurança e dados sensíveis

- [ ] A funcionalidade lida com dados pessoais, financeiros ou credenciais?
- [ ] Quem pode acessar o quê (perfis, permissões, RBAC/ABAC)?
- [ ] Precisa de rate limiting, WAF, ou proteção extra?

## 6. Integração

- [ ] Depende de APIs externas ou serviços internos? Quais contratos?
- [ ] Precisa de eventos assíncronos / filas / webhooks?

## 7. Saída esperada

- [ ] O agente deve implementar direto ou apresentar um plano antes (ver `ExitPlanMode`/plan mode da IDE)?
- [ ] Testes são esperados junto com a implementação (via de regra: sim, sempre — ver `06-testing/`)?
- [ ] Documentação (README/ADR/changelog) deve ser atualizada junto?

> Regra prática: para tarefas triviais (bugfix pontual, ajuste de texto, mudança de 1 arquivo), pular direto
> para a implementação é aceitável. Para features novas, mudanças de schema, novos endpoints ou decisões de
> arquitetura, este checklist é obrigatório.
