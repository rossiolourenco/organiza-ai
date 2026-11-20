# Padrões — PostgreSQL

## Tipos de dado

- `uuid` (com `gen_random_uuid()`, extensão `pgcrypto`/`pgcrypto` nativo no PG13+) ou `bigint` identity para
  chave primária — decidir por projeto e manter consistente; UUID facilita sistemas distribuídos, `bigint`
  identity é mais compacto e performático para índice.
- `timestamptz` sempre para datas/horas (nunca `timestamp` sem timezone) — evita bugs de fuso horário.
- `numeric(p,s)` para valores monetários — nunca `float`/`double precision`.
- `jsonb` (não `json`) para dados semiestruturados que precisam ser indexados/consultados.
- `text` em vez de `varchar(n)` salvo necessidade real de limite rígido de tamanho.

## Constraints e integridade

- `NOT NULL` explícito em toda coluna que não deveria aceitar nulo — não confiar só na aplicação.
- `CHECK` constraints para invariantes simples (ex.: `preco >= 0`).
- `UNIQUE` constraint (não só índice único "solto") para regras de negócio de unicidade.
- Enum de domínio: `ENUM` do Postgres ou tabela de referência + FK — evitar `varchar` livre para valores
  fechados.

## Índices

- `btree` é o padrão. `GIN` para `jsonb`/full-text search. `GiST`/`BRIN` para casos geoespaciais/dados
  sequenciais muito grandes.
- Índice parcial (`WHERE deleted_at IS NULL`) quando soft delete é usado e a maioria das queries filtra
  registros ativos.

## Migrations e ferramentas

- Flyway, Liquibase, Prisma Migrate ou a ferramenta nativa do ORM em uso — nunca `ALTER TABLE` manual direto
  em produção.
- `pg_dump`/point-in-time recovery (WAL archiving) configurados em produção.

## Performance

- `EXPLAIN (ANALYZE, BUFFERS)` para investigar query lenta antes de adicionar índice às cegas.
- `autovacuum` habilitado e monitorado (tabelas com alto churn de update/delete precisam de atenção especial).
- Connection pooling (PgBouncer ou pool do próprio driver/ORM) — nunca uma conexão nova por request sem pool
  em ambiente de alta concorrência.

## Segurança

- Roles com privilégio mínimo (`GRANT` específico por schema/tabela, não `GRANT ALL`).
- `sslmode=require` (ou superior) em conexões de produção.
- Row-Level Security (RLS) avaliado para cenários multi-tenant onde isolamento no nível de linha é crítico.
