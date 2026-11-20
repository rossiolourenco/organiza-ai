# Padrões — Java / Spring

## Linguagem e tooling

- Java LTS (17 ou 21 em projeto novo; manter a versão já usada em projeto existente).
- Build: Maven ou Gradle — usar o que já está no projeto.
- Lint/formatação: Checkstyle ou Spotless + Google Java Format/Palantir, rodando no build (`mvn verify` /
  `gradle check`).
- Análise estática: SpotBugs/SonarQube quando disponível no pipeline.

## Framework

- Spring Boot para APIs REST. Injeção de dependência via construtor (não `@Autowired` em campo).
- Spring Data JPA para persistência relacional; Spring Data MongoDB se o banco for documento.

## Estrutura

```
src/main/java/com/empresa/projeto/
  <dominio>/
    controller/
    service/
    repository/
    dto/
    entity/
    exception/
  config/
  shared/
```

- Camadas separadas: Controller (HTTP) → Service (regra de negócio) → Repository (persistência).
- DTOs de request/response distintos das entidades JPA — nunca expor `@Entity` diretamente na API.

## Boas práticas de Spring

- `@Transactional` no nível de serviço, com escopo mínimo necessário (evitar transações longas).
- Bean validation (`jakarta.validation`) nos DTOs de entrada (`@NotNull`, `@Size`, etc.), validados no
  controller com `@Valid`.
- Exceções de negócio como classes próprias, tratadas por `@ControllerAdvice`/`@ExceptionHandler`
  centralizado, retornando um formato de erro consistente (ver `03-api-design/rest-api-standards.md`).
- Configuração via `application.yml` + profiles (`dev`, `test`, `prod`); segredos via variáveis de ambiente
  ou vault, nunca no `application.yml` versionado.

## Testes

- JUnit 5 + Mockito para unitário.
- Testcontainers para testes de integração com banco real (preferível a H2 em memória quando o banco de
  produção é PostgreSQL/MySQL, pois evita divergência de comportamento SQL).
- `@SpringBootTest` reservado a testes de integração — testes unitários de service não devem subir o
  contexto Spring inteiro.

## Segurança específica

- Spring Security para autenticação/autorização; nunca implementar hashing de senha manualmente (usar
  `BCryptPasswordEncoder` ou Argon2).
- Queries com JPQL/Criteria API ou `@Query` parametrizado — nunca concatenação de string para SQL dinâmico.
