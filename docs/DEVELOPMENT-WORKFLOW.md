# Workflow de desenvolvimento — Mobile

## 1. Antes de implementar

1. Ler `AGENTS.md`, `STACK.md` e `dev-standards/PROJECT-SCOPE.md`.
2. Detectar a stack existente: Expo SDK 54, RN 0.81.5, TypeScript 5.9, Expo Router.
3. Para feature nova, percorrer `dev-standards/00-bootstrap/discovery-checklist.md`.
4. Preservar as cinco abas, o Design System e a API oficial HTTPS.
5. Não publicar em loja sem build assinado e autorização.

## 2. Branch

```bash
git switch -c feature/nome-curto
git switch -c fix/nome-curto
git switch -c chore/nome-curto
```

Branches curtas; sem commit direto em `main`; sem push/merge automático.

## 3. Implementação

- Menor mudança possível.
- Manter `src/features/` por domínio e componentes reutilizáveis.
- Não reintroduzir campo de IP; API em `src/services/config.ts`.
- Sessão em SecureStore; não logar tokens/senhas.
- Tratar loading/erro/vazio em toda chamada.
- Respeitar Safe Area, teclado, contraste e áreas de toque.

## 4. Testes

```bash
npm run typecheck
npm run lint
npm test -- --silent
npm run doctor
npm run export
```

Gate completo:

```bash
npm run verify
```

## 5. Segurança

Revisar `dev-standards/04-security/security-checklist.md`. Em especial: HTTPS, SecureStore,
expiração/revogação de sessão, não expor segredo em `EXPO_PUBLIC_*`, autorização no backend e
mensagens de erro sem detalhe interno.

## 6. Documentação

- Execução local: `docs/LOCAL-EXECUTION.md`.
- Decisão arquitetural: `docs/adr/NNNN-*.md`.
- Contrato de API: referência no Web/backend.
- Mudança de comportamento: atualizar validação e docs.

## 7. Commit e PR

Conventional Commits, ex.:

```text
feat(seguranca): adiciona alteração de senha
fix(api): corrige tratamento de sessão expirada
docs(dev-standards): registra integração
```

PR pequeno, checklist do template, testes verdes e revisão.

## 8. Release

- `npm run verify` e `npm run export`.
- Incrementar versão SemVer (atual 3.2.0).
- Gerar build assinado (EAS/APK/AAB/IPA) somente após autorização.
- Testar em aparelho físico; validar login sem IP, dashboard, 5 abas, perfil e segurança.
- Não publicar em loja sem autorização.
