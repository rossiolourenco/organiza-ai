# Organiza Aí Mobile — instruções para agentes

# Expo HAS CHANGED

Read the exact versioned docs at https://docs.expo.dev/versions/v54.0.0/ before writing any code.

> O `dev-standards` é obrigatório neste repositório. Antes de alterar código, leia
> `dev-standards/AI-GUIDELINES.md`, `STACK.md` e `dev-standards/PROJECT-SCOPE.md`.

## Stack e regras

- React Native 0.81.5, Expo SDK 54, Expo Router, TypeScript 5.9 `strict`.
- Preserve as cinco abas, as telas Premium, a navegação e os fluxos existentes.
- A API é centralizada em `src/services/config.ts` e usa HTTPS oficial; nunca reintroduza campo de IP.
- Sessão nativa em SecureStore. Não registre tokens nem senhas em logs.
- Nunca coloque segredo em `EXPO_PUBLIC_*`; essas variáveis são públicas.
- Preferências locais (tema, foco, metas) continuam locais por aparelho.
- Não publique em App Store/Google Play sem build assinado e autorização.

## Comandos

```bash
npm start                 # Expo
npm run typecheck
npm run lint
npm test -- --silent
npm run doctor
npm run export            # bundles Web/Android/iOS
```

## Estrutura

- `app/` — wrappers de rota do Expo Router.
- `src/features/` — auth, dashboard, tasks, planning, focus, habits, review, trash, categories, profile.
- `src/components/` — Design System e componentes compartilhados.
- `src/state/` — Auth, Data, Focus e Settings providers.
- `src/services/` — API, configuração central, sessão e exportação.

## Qualidade

- Toda mudança de comportamento exige teste; bugfix exige teste de regressão.
- Mantenha acessibilidade, Safe Area, teclado e contraste.
- Atualize `docs/`, `STACK.md` e o relatório de conformidade quando a decisão mudar.
- Origem/fingerprint do framework: `dev-standards/SOURCE.md`.
- Gate local: `npm run verify`.
