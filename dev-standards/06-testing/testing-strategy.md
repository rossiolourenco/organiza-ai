# Estratégia de Testes

## 1. Pirâmide de testes

```
        /\
       /E2E\          poucos, cobrindo fluxos críticos de ponta a ponta
      /------\
     /Integração\      moderados, cobrindo integração real com banco/API/fila
    /------------\
   / Unitários     \   muitos, rápidos, cobrindo regra de negócio isolada
  /------------------\
```

- Testes unitários são a base: rápidos (ms), sem I/O real, cobrindo lógica de domínio.
- Testes de integração validam a colaboração entre componentes reais (banco real via Testcontainers,
  cliente HTTP real contra um servidor de teste) — não mockar o que se quer efetivamente testar.
- Testes E2E (ponta a ponta, via UI ou API pública) cobrem os fluxos de negócio críticos (golden path),
  não a totalidade de combinações — são caros e lentos, usados com parcimônia.

## 2. O que testar sempre

- Toda regra de negócio nova ou alterada tem teste unitário cobrindo o caso principal e os casos de borda
  relevantes (entrada inválida, limite, concorrência quando aplicável).
- Todo bugfix vem acompanhado de um teste que falha sem a correção e passa com ela (evita regressão do mesmo
  bug).
- Todo endpoint novo tem ao menos um teste de integração cobrindo o caminho feliz e os principais erros
  (validação, autorização).

## 3. O que não testar em excesso

- Não testar detalhe de implementação que pode mudar sem alterar o comportamento observável (evitar teste
  frágil acoplado a estrutura interna).
- Não escrever teste trivial para getter/setter sem lógica.
- Mock apenas fronteiras externas reais (rede, tempo, aleatoriedade, sistema de arquivos) — não mockar
  excessivamente colaboradores internos ao ponto do teste não validar nada de real.

## 4. Cobertura

- Cobertura de código é um indicador, não uma meta em si — 100% de cobertura com asserts fracos vale menos
  que 70% com testes que realmente capturam regressão.
- Meta prática sugerida (ajustável por projeto, registrar a meta acordada em `STACK.md`/README do projeto):
  ≥ 80% em lógica de domínio/serviço; sem meta rígida para código de infraestrutura/boilerplate gerado.

## 5. Dados de teste

- Fixtures/factories para criar dados de teste de forma consistente (Faker/builders), evitando dado
  "mágico" hardcoded repetido em vários testes.
- Testes independentes entre si (sem depender de ordem de execução ou estado deixado por outro teste) —
  cada teste prepara e limpa seu próprio estado.

## 6. CI

- Todo PR roda a suíte de testes automaticamente; PR não é mesclado com teste quebrando (ver
  `08-versioning/git-workflow.md`).
- Testes de integração/E2E rodam em ambiente isolado (container, banco efêmero) — nunca contra
  ambiente de produção ou compartilhado sem isolamento.
- Tempo de execução da suíte monitorado; suíte lenta demais é sinal de reorganizar a pirâmide (testes que
  deveriam ser unitários mas viraram integração).

## 7. Testes de performance e carga (quando aplicável)

- Endpoints/fluxos críticos com requisito de SLA têm teste de carga (k6, Gatling, JMeter) executado antes de
  ir para produção e após mudanças estruturais relevantes.

## 8. Testes de segurança

- Dependência auditada no CI (ver `04-security/security-checklist.md` item 7).
- Testes automatizados para os cenários de autorização (usuário sem permissão não acessa recurso de
  outro) fazem parte da suíte padrão, não são "extra opcional".
