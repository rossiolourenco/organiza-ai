# Padrões — MySQL / MariaDB

## Engine e configuração

- InnoDB sempre (suporte a transação e FK) — nunca MyISAM para dado transacional.
- Charset `utf8mb4` (não `utf8`, que no MySQL não cobre o BMP completo) com collation `utf8mb4_unicode_ci` (ou
  `_0900_ai_ci` no MySQL 8+).

## Tipos de dado

- `BIGINT` para chave primária auto-incremento, ou `CHAR(36)`/`BINARY(16)` para UUID (avaliar trade-off de
  performance de índice).
- `DATETIME` com timezone tratado explicitamente na aplicação (MySQL não tem `timestamptz` nativo) — persistir
  sempre em UTC.
- `DECIMAL(p,s)` para valores monetários — nunca `FLOAT`/`DOUBLE`.
- `JSON` nativo (MySQL 5.7+) para dados semiestruturados, com índice funcional (`generated column` +
  índice) para campos consultados com frequência.

## Constraints e integridade

- `NOT NULL` explícito, `FOREIGN KEY` com `ON DELETE`/`ON UPDATE` definidos conscientemente (`CASCADE`,
  `RESTRICT`, `SET NULL` conforme a regra de negócio).
- `UNIQUE KEY` para regras de unicidade de negócio.

## Índices

- `BTREE` padrão. Índice composto na ordem de seletividade/uso real da query.
- Cuidado com `SELECT *` em tabela larga — preferir listar colunas para permitir covering index.

## Migrations e ferramentas

- Flyway, Liquibase ou ferramenta nativa do ORM (Laravel Migrations, EF Core, etc.) — nunca alteração manual
  direta em produção.
- `ALTER TABLE` em tabela grande avaliado quanto a lock (usar `pt-online-schema-change`/`gh-ost` ou
  `ALGORITHM=INSTANT`/`INPLACE` quando disponível, para evitar downtime).

## Performance

- `EXPLAIN` antes de otimizar às cegas.
- Connection pooling configurado (o driver/ORM ou proxy como ProxySQL).
- Réplicas de leitura consideradas para workloads read-heavy antes de escalar verticalmente.

## Segurança

- Usuário de aplicação com `GRANT` mínimo necessário, nunca root.
- `require_secure_transport=ON` em produção (TLS obrigatório).
- `sql_mode` estrito (`STRICT_TRANS_TABLES` no mínimo) para evitar truncamento silencioso de dado inválido.
