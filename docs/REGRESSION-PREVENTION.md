# Proteção contra regressões — Mobile

## 1. Gate local

```bash
cd /Users/rossiolourenco/ProjetosFaama/organiza-ai
npm run verify
```

O script `scripts/verify-premium.sh` cobre:

1. commit e branch atuais;
2. `dev-standards`, `STACK.md`, `AGENTS.md` e `opencode.json` válido;
3. versão do app exatamente `3.2.0`;
4. integridade do framework contra a fonte canônica;
5. `SecurityScreen`, rota `/seguranca`, `DashboardScreen`, `TasksScreen`;
6. marcadores `Sua senha protege`, `Seu dia, com mais intenção` e `Seu espaço`;
7. ausência de `IP do servidor` e do slogan acadêmico no código ativo;
8. `git diff --check`;
9. typecheck;
10. lint;
11. testes Jest (50);
12. export Web/Android/iOS.

## 2. O que não cobre

- Teste em aparelho físico.
- Build assinado/EAS.
- Teste E2E de UI (Detox/Maestro).
- Teste de acessibilidade com leitor de tela.
- Publicação em loja.

## 3. Verificações manuais antes de release

- Login sem IP.
- Dashboard “Seu dia, com mais intenção.”.
- Cinco abas visíveis e navegáveis.
- Perfil com `v3.2.0`.
- Segurança com três campos e mostrar/ocultar.
- Troca de senha → login com a nova → senha antiga rejeitada.
- Safe Area, teclado e listas em iPhone pequeno/grande e Android.
- Console sem erros.

## 4. CI futuro

Pipeline sugerido:

```text
checkout → setup Node → npm ci → npm run typecheck → npm run lint → npm test → npm run doctor → npm run export
```

Adicionar EAS/build e Detox em etapa separada. O gate atual já é compatível com CI.
