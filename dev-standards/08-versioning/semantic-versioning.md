# Versionamento Semântico (SemVer)

## Formato: `MAJOR.MINOR.PATCH`

- **MAJOR**: mudança incompatível com versões anteriores (breaking change) — remoção/mudança de contrato de
  API, mudança de schema sem compatibilidade retroativa.
- **MINOR**: nova funcionalidade compatível com versões anteriores (aditiva) — novo endpoint, novo campo
  opcional.
- **PATCH**: correção de bug compatível com versões anteriores, sem mudança de contrato.

Exemplo: `1.4.2` → correção de bug vira `1.4.3`; nova feature compatível vira `1.5.0`; breaking change vira
`2.0.0`.

## Pré-lançamento e build metadata

- `1.5.0-beta.1`, `1.5.0-rc.1` para versões de pré-lançamento (identificador após `-`).
- `1.5.0+20260731` para metadata de build (após `+`), quando necessário rastrear build específico — não
  afeta precedência de versão.

## Aplicação por tipo de artefato

- **Bibliotecas/pacotes publicados** (npm, NuGet, PyPI, Maven): SemVer estrito é obrigatório — consumidores
  dependem da previsibilidade do número de versão para decidir se podem atualizar com segurança.
- **APIs REST**: versionamento de contrato segue a mesma lógica (ver
  `03-api-design/rest-api-standards.md` seção 5) — breaking change de API implica nova versão MAJOR da API
  (`/v2`), não necessariamente do artefato/deploy inteiro.
- **Aplicações internas/serviços deployados** (não publicados como pacote): SemVer usado para tags de
  release e comunicação entre equipes, mesmo sem consumidores externos formais — ajuda a comunicar risco de
  cada deploy.

## Automação

- Quando o projeto adota commits convencionais (`08-versioning/commit-convention.md`), o bump de versão pode
  ser automatizado via `semantic-release`, `changesets`, ou `release-please`, evitando decisão manual
  divergente de humano para humano.

## Regra de ouro

- Nunca reduzir o número de versão publicado, nem reutilizar/sobrescrever uma versão já publicada — cada
  publicação é imutável.
