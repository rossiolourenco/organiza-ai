# Padrões — MongoDB

## Quando usar (e quando não)

- Adequado quando o modelo é naturalmente hierárquico/documento, schema varia por registro, e as consultas
  principais não dependem de joins complexos entre múltiplas coleções.
- Não é a escolha automática só por ser "mais fácil de começar" — se o domínio é fortemente relacional
  (muitos joins, integridade referencial forte, relatórios agregados complexos), um banco relacional é
  preferível. Essa decisão é sempre confirmada com o usuário (ver `AI-GUIDELINES.md` seção 0).

## Modelagem

- Modelar em torno do padrão de acesso (query pattern), não em torno de "normalizar tudo": embutir
  (`embed`) dados lidos sempre juntos e que não crescem sem limite; referenciar (`reference`) dados
  compartilhados entre muitos documentos ou que crescem indefinidamente (evitar array não-limitado
  embutido).
- Schema validation do MongoDB (`$jsonSchema` na criação da coleção) usado para impor estrutura mínima,
  mesmo sendo um banco "schemaless" — evita documentos inconsistentes por bug de aplicação.
- Chave primária `_id` como `ObjectId` por padrão; usar valor de negócio como `_id` só com justificativa
  clara.

## Índices

- Todo campo usado em filtro (`find`), ordenação (`sort`) ou em `$lookup` tem índice avaliado.
- Índice composto segue a ordem: igualdade → range → sort (regra ESR do MongoDB).
- `explain("executionStats")` para validar uso de índice antes de considerar a query pronta.
- Evitar índice em campo de alta cardinalidade de escrita sem necessidade (custo de escrita).

## Transações e consistência

- Transações multi-documento (`session.withTransaction`) disponíveis desde MongoDB 4.0 (replica set) — usar
  quando múltiplos documentos precisam mudar atomicamente, mas preferir modelagem que minimize a necessidade
  disso.
- Write concern (`w: "majority"`) explícito para escritas críticas de negócio.

## Migrations

- Mudança de shape de documento é tratada com migração de dados versionada (script de migration) +
  compatibilidade de leitura na aplicação durante a transição (ler formato antigo e novo).

## Performance

- Paginação com `_id`-based cursor (keyset pagination) para coleções grandes, evitando `skip()` custoso em
  páginas profundas.
- Agregações complexas (`$lookup`, `$group`) avaliadas quanto a uso de índice em cada estágio do pipeline.

## Segurança

- Autenticação habilitada sempre (nunca instância sem auth, nem em dev exposta externamente).
- Usuário de aplicação com role mínima necessária (`readWrite` no banco específico, não `root`/`dbOwner`
  global).
- TLS habilitado em conexões de produção; connection string sem credencial hardcoded no código.
