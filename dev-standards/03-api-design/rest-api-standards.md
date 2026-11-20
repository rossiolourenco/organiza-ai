# Padrões de API REST

## 1. Recursos e URLs

- Substantivos no plural para coleções: `/orders`, `/users/{id}/orders`. Sem verbo na URL (`/getOrders` é
  proibido).
- `kebab-case` em segmentos de URL com múltiplas palavras: `/order-items`.
- Hierarquia reflete relação real do domínio, sem aninhar mais de 2 níveis (`/users/{id}/orders/{id}/items`
  no limite; preferir `/order-items?orderId=...` para evitar URLs profundas).

## 2. Métodos HTTP e status codes

| Método | Uso | Sucesso típico |
|---|---|---|
| GET | Leitura, sem efeito colateral | 200 |
| POST | Criação, ou ação que não é idempotente | 201 (com `Location`) |
| PUT | Substituição completa de um recurso | 200/204 |
| PATCH | Atualização parcial | 200/204 |
| DELETE | Remoção | 204 |

- 400: entrada inválida (validação). 401: não autenticado. 403: autenticado mas sem permissão. 404: recurso
  não existe. 409: conflito (ex.: violação de unicidade). 422: entidade semanticamente inválida. 429: rate
  limit. 500: erro inesperado do servidor (nunca vaza stack trace).
- Idempotência: `PUT`/`DELETE` devem ser idempotentes de fato (repetir a chamada não muda o resultado além da
  primeira vez).

## 3. Contrato de request/response

- Envelope de erro consistente em toda a API, por exemplo:
  ```json
  {
    "error": {
      "code": "INSUFFICIENT_BALANCE",
      "message": "Saldo insuficiente para completar a operação.",
      "details": []
    }
  }
  ```
- Datas em ISO 8601 / RFC 3339 (`2026-07-31T14:00:00Z`), sempre UTC no payload — conversão de timezone é
  responsabilidade do client.
- Nomes de campo em `camelCase` no JSON (convenção mais comum entre clients), independente do `snake_case`
  usado no banco.
- Nunca expor campos internos de infraestrutura (IDs de sequência interna sensíveis, stack trace, nomes de
  tabela) na resposta.

## 4. Paginação, filtro e ordenação

- Paginação obrigatória em toda listagem: `?page=1&pageSize=20` (offset-based) ou `?cursor=...` (keyset,
  preferível para coleções grandes/de alta escrita).
- Resposta paginada inclui metadados: total (quando viável computar), página atual, indicação de próxima
  página.
- Filtros via query string (`?status=active`), nunca via body em `GET`.

## 5. Versionamento de API

- Versionar por path (`/v1/orders`) ou por header (`Accept: application/vnd.empresa.v1+json`) — escolher um
  padrão por projeto e manter consistente.
- Mudança breaking (remover campo, mudar tipo, mudar semântica) exige nova versão major da API; mudança
  aditiva (novo campo opcional) não exige.
- Depreciação comunicada com header (`Deprecation`, `Sunset`) e prazo mínimo antes de remoção.

## 6. Autenticação e autorização

- OAuth2/OIDC ou JWT para autenticação — nunca autenticação básica em produção sem TLS+contexto controlado.
- Autorização verificada no backend sempre, mesmo que o front-end já esconda a opção na UI (nunca confiar
  só em controle de UI).
- Escopos/permissões explícitos por endpoint, documentados.

## 7. Documentação

- Toda API pública documentada com OpenAPI/Swagger, gerado a partir do código quando possível (anotações no
  framework) para evitar divergência entre doc e implementação real.
- Exemplos de request/response reais no doc, não só o schema abstrato.

## 8. Observabilidade

- Todo endpoint logga: método, rota, status, latência, id de correlação (`traceId`/`requestId`) — sem logar
  corpo com dado sensível.
- Header de correlação (`X-Request-Id` ou `traceparent` do W3C Trace Context) propagado entre serviços.
