# Princípios Gerais de Banco de Dados (agnósticos de SGBD)

## 1. Modelagem

- Normalizar até 3FN por padrão; desnormalizar apenas com justificativa explícita de performance, registrada
  em ADR (ver `07-documentation/adr-template.md`).
- Toda tabela tem chave primária explícita (evitar depender só de `rowid` implícito).
- Chaves estrangeiras declaradas no schema (constraint real), não apenas "por convenção" na aplicação —
  exceto em bancos de documento, onde a integridade referencial é responsabilidade explícita da aplicação.
- Nomes de tabelas/colunas em `snake_case`, no idioma definido para o projeto (recomendação: inglês, para
  compatibilidade com ferramentas e bibliotecas).
- Campos de auditoria padrão em toda tabela: `created_at`, `updated_at` (e `deleted_at` se soft delete for
  adotado).

## 2. Migrations

- Toda alteração de schema é feita via arquivo de migration versionado (Flyway, Liquibase, Prisma Migrate,
  EF Core Migrations, Alembic, Django Migrations — conforme a stack) — nunca alteração manual direta em
  produção.
- Migrations são incrementais e idempotentes quando possível; nunca editar uma migration já aplicada em
  produção — criar uma nova.
- Migration que altera/remove coluna em tabela com dados existentes considera plano de rollback e impacto em
  deploys anteriores (backward compatibility durante rolling deploy).

## 3. Índices

- Toda coluna usada em `WHERE`, `JOIN` ou `ORDER BY` com frequência relevante tem índice avaliado.
- Chaves estrangeiras são indexadas.
- Evitar índice redundante (dois índices que se sobrepõem sem necessidade) — cada índice tem custo de escrita
  e espaço.
- Índices compostos seguem a ordem de seletividade e do padrão de query real, não uma ordem arbitrária.

## 4. Transações e consistência

- Operações que precisam ser atômicas (múltiplas escritas relacionadas) ficam dentro de uma transação
  explícita.
- Nível de isolamento default do banco é aceito, salvo necessidade documentada de nível diferente.
- Em sistemas distribuídos, preferir consistência eventual explícita (evento, outbox pattern) a transação
  distribuída (2PC) sempre que possível.

## 5. Performance e escalabilidade

- Paginação obrigatória em qualquer listagem que pode crescer sem limite (nunca `SELECT *` sem `LIMIT` em
  endpoint público).
- N+1 query é tratado como bug — usar eager loading/joins/dataloader conforme o ORM.
- Consultas custosas identificadas via `EXPLAIN`/`EXPLAIN ANALYZE` antes de ir para produção em funcionalidade
  crítica.
- Cache (Redis ou equivalente) considerado para leituras repetidas e caras, com estratégia de invalidação
  explícita — nunca cache "for ever" sem TTL ou invalidação por evento.

## 6. Segurança de dados

- Toda query parametrizada — nunca concatenação de string de entrada do usuário em SQL (ver
  `04-security/security-checklist.md`).
- Dados sensíveis (senha, dado financeiro, PII) nunca em texto plano: hash para senha, criptografia em
  repouso para PII sensível, mascaramento em logs.
- Backups regulares e testados (restore testado periodicamente, não só backup "assumido" como funcional).
- Acesso ao banco de produção via usuário com privilégio mínimo necessário — aplicação não usa usuário
  `root`/`sa`/superuser.

## 7. Escolha do SGBD

- Projeto já existente: manter o banco já em uso.
- Projeto novo: relacional (PostgreSQL/MySQL/SQL Server) é o padrão default para dados transacionais com
  relações claras; documento (MongoDB) é justificado quando o modelo é naturalmente hierárquico/schema
  variável e as consultas não dependem de joins complexos. A escolha é sempre confirmada com o usuário (ver
  `AI-GUIDELINES.md` seção 0).
