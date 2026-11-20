# Padrões — Node.js / TypeScript

## Linguagem e tooling

- TypeScript obrigatório em projeto novo (`strict: true` no `tsconfig.json`). JavaScript puro só em projetos
  legados já existentes.
- Gerenciador de pacotes: usar o que já está no projeto (`package-lock.json`, `pnpm-lock.yaml`,
  `yarn.lock`); em projeto novo, preferir `pnpm`.
- Lint: ESLint com `@typescript-eslint`. Formatação: Prettier. Rodar em pre-commit (husky + lint-staged) e no
  CI.
- Node LTS ativo (não usar versão em EOL).

## Framework

- API REST: NestJS (projetos maiores, com DI e módulos) ou Fastify/Express (serviços simples/leves).
  Detectar o que já está em uso antes de sugerir outro.
- Validação de entrada: `zod` ou `class-validator` (se NestJS) — nunca confiar em `any`/`unknown` sem
  validação de runtime nas bordas (controllers, consumidores de fila).

## Estrutura

```
src/
  modules/<domínio>/
    <domínio>.controller.ts
    <domínio>.service.ts
    <domínio>.repository.ts
    dto/
    entities/
  shared/
  config/
  main.ts
```

- Um módulo por domínio de negócio. Sem "God service" que conhece tudo.
- DTOs de entrada/saída separados das entidades de domínio/persistência.

## Tipagem

- Proibido `any` sem comentário justificando; preferir `unknown` + narrowing.
- Tipos de domínio explícitos (não inferir tipos de negócio a partir do shape do banco).
- Usar `readonly` em DTOs e objetos de valor imutáveis.

## Async e erros

- `async/await` sempre; nunca misturar com `.then()` no mesmo fluxo.
- Toda Promise deve ser tratada — sem `floating promises` (regra de lint ativa).
- Erros de domínio como classes próprias (`class InsufficientBalanceError extends DomainError`), mapeadas
  para HTTP status no boundary (filtro de exceção do NestJS ou middleware equivalente).

## Testes

- Unitário: Jest ou Vitest (o que já estiver no projeto).
- Nomenclatura `*.spec.ts` colado ao arquivo testado, ou `__tests__/` conforme convenção já adotada.
- Mocks apenas para I/O externo (rede, banco, filesystem); lógica de domínio testada sem mocks quando
  possível.

## Segurança específica

- `helmet` (ou equivalente) habilitado em toda API HTTP.
- Sanitizar entradas usadas em queries dinâmicas; nunca concatenar string em SQL (usar query builder/ORM
  parametrizado — Prisma, TypeORM, Drizzle, Knex parametrizado).
- Segredos via variáveis de ambiente (`dotenv` + `.env` fora do git), nunca hardcoded.
