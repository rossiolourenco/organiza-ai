# STACK.md — Organiza Aí Mobile

- **Projeto:** Organiza Aí Mobile 3.3 RC
- **Data da decisão:** 2026-11-20
- **Responsável:** decisão do usuário no prompt 3.2 (projeto existente)
- **Situação:** projeto em desenvolvimento; stack detectada e preservada. Release Candidate 3.3
  (`3.3.0-rc.1`) preparado; publicação em loja pendente de build assinado.

## Stack

| Camada | Escolha | Justificativa |
|---|---|---|
| Mobile | React Native 0.81.5 + Expo SDK 54 | app existente iOS/Android |
| Navegação | Expo Router (tabs + stack) | estrutura atual |
| Linguagem | TypeScript 5.9 (`strict: true`) | código existente |
| Backend | API REST Java/Spring Boot compartilhada | mesma API do Web |
| Banco | PostgreSQL via API; nenhum banco local no app | dados no servidor |
| Sessão | Expo SecureStore (nativo); memória na prévia Web | segurança de credencial |
| API | `https://organizaai.evox.net.br/api` por padrão | produção |
| Testes | Jest + Testing Library; ESLint; typecheck; Expo Doctor | suíte existente |
| Distribuição | Expo/EAS; build assinado pendente de credenciais Apple/Google | pendência de release |

## Alternativas consideradas

Não aplicável: o projeto já existe. Não foi introduzida uma segunda abordagem mobile nem troca de
navegador/estado.

## Confirmação

- [x] Stack existente apresentada e confirmada pelo usuário
- [x] Nenhuma migração de tecnologia nesta intervenção

## Observações

- A API é centralizada em `src/services/config.ts`; o campo de IP não deve voltar.
- Preferências de foco, metas e tema são locais por aparelho.
- Hábitos, tarefas, categorias e revisão dependem do backend.
- Não há modo offline completo.
- Não publicar em loja sem build assinado e autorização.
- Versão centralizada em `VERSION`; o gate valida `package.json` e `app.json`.
- Artefato de homologação em `dist-release/` (fora do Git) via `scripts/build-release.sh`.
- Dependências com advisories de DoS (deep link/build) exigem upgrade do Expo SDK — P0 do 3.4.
- 3.3.1: revalidação ao retomar o app (`RevalidateOnActive`, throttle de 10 s) sem alterar telas.
- Teste em aparelho físico e build assinado continuam pendentes.

## Referências

- `dev-standards/AI-GUIDELINES.md`
- `dev-standards/PROJECT-SCOPE.md`
- `docs/DEV-STANDARDS-COMPLIANCE.md`
