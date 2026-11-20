# Padrões — SQL Server

## Tipos de dado

- `UNIQUEIDENTIFIER` para UUID, ou `BIGINT IDENTITY` para chave primária auto-incremento — decidir por
  projeto conforme necessidade de geração distribuída de IDs.
- `DATETIME2` (não `DATETIME`, que tem precisão/range piores) para datas/horas; tratar timezone
  explicitamente na aplicação (persistir em UTC) já que `DATETIME2` não guarda offset — usar
  `DATETIMEOFFSET` quando o próprio offset precisa ser armazenado.
- `DECIMAL(p,s)` para valores monetários — nunca `FLOAT`/`REAL`.
- `NVARCHAR` para texto (suporte Unicode nativo) em vez de `VARCHAR`, salvo cenário controlado só-ASCII.

## Constraints e integridade

- `NOT NULL`, `FOREIGN KEY` com `ON DELETE`/`ON UPDATE` definidos conscientemente.
- `CHECK` constraints para invariantes simples; `UNIQUE` constraint para regras de unicidade de negócio.

## Índices

- Clustered index (geralmente a PK) bem escolhido — evitar GUID aleatório como clustered key em tabela de
  alto volume de escrita (fragmentação); usar `NEWSEQUENTIALID()` ou `BIGINT IDENTITY` quando esse for o
  caso.
- Nonclustered index com `INCLUDE` para covering index em queries de leitura frequente.
- `sys.dm_db_missing_index_details` e execution plan usados para orientar criação de índice — não criar por
  suposição.

## Migrations e ferramentas

- EF Core Migrations, Flyway, ou DACPAC/SSDT — nunca alteração manual direta em produção.
- Alterações em tabela grande avaliadas quanto a lock/blocking (`ONLINE = ON` em operações de índice quando
  a edição do SQL Server suportar).

## Performance

- Execution plan (`SET SHOWPLAN_XML ON` ou plano gráfico no SSMS/Azure Data Studio) antes de otimizar às
  cegas.
- Connection pooling do driver (padrão do ADO.NET/`Microsoft.Data.SqlClient`) mantido habilitado.
- `READ COMMITTED SNAPSHOT` avaliado para reduzir contenção de lock em workloads read-heavy.

## Segurança

- Login de aplicação com permissão mínima (roles de banco específicas), nunca `sa`.
- TLS (`Encrypt=True`) obrigatório em connection string de produção.
- Always Encrypted ou TDE (Transparent Data Encryption) avaliados para dado sensível em repouso.
