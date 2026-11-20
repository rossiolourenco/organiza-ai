# Padrões — .NET / C#

## Linguagem e tooling

- .NET LTS (8 em projeto novo; manter a versão já usada em projeto existente).
- Nullable reference types habilitado (`<Nullable>enable</Nullable>`).
- Formatação: `dotnet format` + `.editorconfig` no repositório (regras de estilo C# explícitas).
- Análise estática: Roslyn analyzers habilitados, tratar warnings de segurança/confiabilidade como erro no
  CI.

## Framework

- ASP.NET Core (Minimal APIs para serviços simples; Controllers + MVC para APIs maiores/mais estruturadas —
  seguir o que já está em uso).
- Entity Framework Core para relacional; Dapper quando performance de query fina for prioridade sobre
  produtividade do ORM.

## Estrutura

```
src/
  Projeto.Api/            (controllers, Program.cs, DI setup)
  Projeto.Application/    (casos de uso, DTOs, validação)
  Projeto.Domain/         (entidades, regras de negócio, interfaces)
  Projeto.Infrastructure/ (EF Core, repositórios, integrações externas)
tests/
  Projeto.UnitTests/
  Projeto.IntegrationTests/
```

- Clean Architecture / Onion: `Domain` não referencia `Infrastructure`; `Application` orquestra via
  interfaces implementadas em `Infrastructure`.

## Boas práticas

- Injeção de dependência via construtor, registrada em `Program.cs`/`Startup`.
- DTOs de request/response (records `record` são preferíveis por imutabilidade) — nunca expor entidades EF
  diretamente.
- Validação com `FluentValidation` ou DataAnnotations nos DTOs de entrada.
- Exceções de negócio como classes próprias, tratadas por middleware global de exceção, retornando
  `ProblemDetails` (RFC 7807) consistente.
- Configuração via `appsettings.{Environment}.json` + variáveis de ambiente/`IOptions<T>`; segredos nunca no
  `appsettings.json` versionado (usar User Secrets em dev, Key Vault/variáveis de ambiente em produção).

## Testes

- xUnit (padrão da comunidade .NET) + Moq/NSubstitute para unitário.
- Testcontainers (`Testcontainers.MsSql`/`Testcontainers.PostgreSql`) para integração com banco real.
- `WebApplicationFactory` para testes de integração de endpoints.

## Segurança específica

- ASP.NET Core Identity ou solução de auth já adotada; nunca hash de senha manual.
- LINQ/EF Core parametrizam queries automaticamente — nunca usar `FromSqlRaw` com concatenação de string do
  usuário (usar `FromSqlInterpolated` ou parâmetros).
