# Padrões — Python

## Linguagem e tooling

- Python 3.11+ em projeto novo (manter a versão já usada em projeto existente).
- Gerenciamento de dependências: `poetry` ou `uv` em projeto novo; respeitar `requirements.txt`/`Pipfile` se
  já existente no projeto.
- Type hints obrigatórios em funções públicas/de domínio; checagem com `mypy` ou `pyright` no CI.
- Lint/formatação: `ruff` (lint + format) — substitui flake8/isort/black em projetos novos.

## Framework

- API REST: FastAPI (async, validação nativa via Pydantic) para projeto novo; Django REST Framework se o
  projeto já usa Django (admin, ORM, auth prontos). Detectar o que já está em uso.
- Pydantic (v2) para schemas de entrada/saída — nunca aceitar `dict` cru em endpoint sem validação.

## Estrutura

```
src/projeto/
  <dominio>/
    router.py       (ou views.py em Django)
    service.py
    repository.py
    schemas.py       (Pydantic)
    models.py         (ORM)
  core/
  config.py
tests/
```

- Separação de camadas: router/view (HTTP) → service (regra de negócio) → repository (persistência).
- Schemas Pydantic de entrada/saída distintos dos modelos ORM.

## Boas práticas

- Async/await no caminho de I/O quando o framework suportar (FastAPI); nunca misturar chamada bloqueante
  (`requests`, driver síncrono de banco) dentro de handler async sem executor dedicado.
- Exceções de negócio como classes próprias (`class SaldoInsuficienteError(Exception)`), tratadas por
  exception handler central, retornando formato de erro consistente.
- Configuração via `pydantic-settings` lendo variáveis de ambiente; segredos nunca hardcoded ou versionados.
- Evitar estado mutável global fora de contexto de aplicação (DI via `Depends` no FastAPI).

## Testes

- `pytest` + `pytest-asyncio` para async. Fixtures para setup de dados de teste.
- `httpx.AsyncClient`/`TestClient` para testes de integração de endpoints.
- Cobertura mínima acordada com o time (ver `06-testing/testing-strategy.md`), medida com `coverage.py`.

## Segurança específica

- ORM (SQLAlchemy/Django ORM) parametriza queries automaticamente — nunca montar SQL com f-string a partir
  de entrada do usuário.
- Hash de senha com `passlib`/`argon2-cffi` — nunca `hashlib.md5`/`sha1` para senha.
- Evitar `eval`/`exec`/`pickle.loads` sobre dado não confiável (vetor clássico de RCE em Python).
