# Convenção de Commits (Conventional Commits)

## Formato

```
<tipo>(<escopo opcional>): <descrição curta no imperativo>

<corpo opcional — o porquê da mudança>

<rodapé opcional — BREAKING CHANGE, referências a issue>
```

## Tipos

| Tipo | Uso |
|---|---|
| `feat` | Nova funcionalidade |
| `fix` | Correção de bug |
| `docs` | Mudança só de documentação |
| `style` | Formatação, sem mudança de lógica (espaço, ponto e vírgula) |
| `refactor` | Mudança de código que não corrige bug nem adiciona feature |
| `perf` | Melhoria de performance |
| `test` | Adição/correção de testes |
| `build` | Mudança em build, dependências, ferramentas de build |
| `ci` | Mudança em configuração de CI/CD |
| `chore` | Manutenção geral que não se encaixa nas outras categorias |
| `revert` | Reversão de commit anterior |

## Regras

- Descrição curta em minúsculas, no imperativo (`adiciona`, não `adicionado`/`adicionando`), sem ponto final,
  até ~72 caracteres.
- Escopo opcional entre parênteses indica o módulo/domínio afetado: `feat(orders): adiciona cancelamento de pedido`.
- Mudança que quebra compatibilidade: rodapé `BREAKING CHANGE: <explicação>` (aciona bump de versão MAJOR —
  ver `semantic-versioning.md`).
- Referenciar issue quando existir: `Refs #123` ou `Closes #123` no rodapé.
- Um commit, uma intenção — não misturar `feat` e `fix` não relacionados no mesmo commit.

## Exemplos

```
feat(auth): adiciona login via OAuth2 com Google

fix(orders): corrige cálculo de frete para pedidos com múltiplos itens

Refs #123

refactor(payments): extrai validação de cartão para classe própria

docs: atualiza README com instruções de deploy

feat(api)!: remove campo legado `userId` em favor de `customerId`

BREAKING CHANGE: clients que ainda enviam `userId` precisam migrar para `customerId`.
```

## Relação com versionamento automático

Se o projeto usa release automatizado a partir de commits (semantic-release, changesets), o tipo do commit
determina o bump de versão: `fix` → PATCH, `feat` → MINOR, `BREAKING CHANGE`/`!` → MAJOR. Ver
`semantic-versioning.md`.
