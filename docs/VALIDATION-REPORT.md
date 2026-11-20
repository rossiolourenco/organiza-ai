# Relatório de validação — Mobile 3.2 / dev-standards

Data: 2026-11-20.

## 1. Estado inicial

- Repositório: `/Users/rossiolourenco/ProjetosFaama/organiza-ai`
- Branch inicial: `main` em `b6f5070`
- Branch desta intervenção: `chore/dev-standards-3.2`
- Árvore limpa; cópia acadêmica `organiza-ai - cópia` preservada em `5bb727f`.

## 2. Framework

- Fonte: `/Users/rossiolourenco/Framework-Projetos/dev-standards`
- Fingerprint: `37a59b23899aa564e9cf67e351f73c6dda7198b6dff2ffc3bc2fc2361e7fa32f`
- Cópia local idêntica à fonte.
- OpenCode: `AGENTS.md` + `opencode.json.instructions`.
- Evidência de carregamento: nova sessão no diretório Mobile respondeu `MOBILE_STACK_OK`.

## 3. Testes e build

| Verificação | Resultado |
|---|---|
| Typecheck | Sucesso |
| ESLint | Sucesso |
| Jest | **50/50** em 11 suítes |
| Expo Doctor | **18/18** |
| Expo export Web | 1,32 MB |
| Expo export Android | 3,3 MB |
| Expo export iOS | 3,3 MB |
| Gate `npm run verify` | Sucesso |

## 4. Validação visual

- `docs/assets/dev-standards-mobile-home.jpg` — dashboard “Seu dia, com mais intenção.”, cinco abas.
- `docs/assets/dev-standards-mobile-profile.jpg` — perfil, **v3.2.0**, edição de nome.
- `docs/assets/dev-standards-mobile-security.jpg` — alteração de senha com três campos.
- Sem erros de console.

## 5. Achado de cache

Na primeira execução da prévia Web (porta 8083, API local), o Perfil exibiu `v1.0.0`. O manifesto
e `package.json`/`app.json` estavam em 3.2.0. Após `npx expo start -c`, o badge passou a `v3.2.0`.
Conclusão: cache do Metro pode reproduzir configuração antiga; não é regressão de código.

## 6. Causa da divergência visual

- `organiza-ai - cópia` em `5bb727f` contém `app/index.js` com `IP do servidor` e bundle iOS 1.0.0.
- ZIPs de setembro/outubro em `~/Downloads` contêm o mesmo app acadêmico.
- O repositório oficial e a produção entregam 3.2; a tela antiga vinha de cópia/cache/cliente
  antigo.

## 7. Limitações

- Sem aparelho físico iOS/Android nesta execução.
- Sem build assinado em loja.
- Sem teste E2E de UI (Detox/Maestro).
- CI GitHub Actions configurado; o resultado remoto é registrado no PR/relatório final.
- Sem publicação em produção/loja.
- A cópia acadêmica foi preservada, não removida/renomeada.
- Consolidação: commit **8e2d0ec** na branch `chore/dev-standards-3.2`; PR [#1](https://github.com/rossiolourenco/organiza-ai/pull/1) aberto. Nenhuma publicação em loja foi feita.

## 8. Conclusão

O Mobile 3.2 está funcional, com a API oficial, sem campo de IP, com perfil/segurança e cinco abas.
O dev-standards está integrado e carregado. A divergência visual é ambiental (cópia/cache), não uma
regressão do código. A integração foi consolidada no GitHub via PR; build assinado e publicação em loja seguem pendentes de autorização.
