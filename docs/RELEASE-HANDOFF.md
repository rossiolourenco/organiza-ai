# Release Handoff — Mobile 3.3 RC

> Documento de passagem para a publicação. Base: `main` `b9515fc`; branch `release/3.3-rc`.

## 1. Identificação

| Item | Valor |
|---|---|
| Versão | `3.3.0-rc.1` (app/loja `3.3.0`) |
| Branch | `release/3.3-rc` |
| Commit do RC | `8fd49e4b80bda31927df70d7e4eebec0490ff166` |
| PR | https://github.com/rossiolourenco/organiza-ai/pull/2 |
| Artefato | `dist-release/3.3.0-rc.1/organiza-ai-mobile-3.3.0-rc.1.tar.gz` (3,1 MB) |
| SHA-256 do artefato | `ce8f4696b8dfce672a2781bdbad6fc62a31f4acf3762759116a1e1bb0a0b8c41` |

## 2. O que foi validado

- `npm run typecheck`, `npm run lint`, `npm test` (50/50), `npm run doctor` (18/18).
- `npm run export` com bundles Web/iOS/Android.
- Gate `bash scripts/verify-premium.sh` completo.
- Versão consistente (`VERSION` × `package.json` × `app.json`).

## 3. O que **não** foi feito

- Build assinado `.ipa`/`.aab` — requer credenciais Apple/Google e `eas.json`, que não existem no
  repositório.
- Publicação em App Store/Google Play.
- Teste em aparelho físico.

## 4. Como gerar o build de distribuição (quando autorizado)

Pré-requisitos: conta Expo/EAS, Apple Developer Program, Google Play Console.

```bash
npm i -g eas-cli
eas login
eas build:configure          # cria eas.json (não versionado nesta rodada)
eas build -p android --profile production
eas build -p ios --profile production
```

Checklist antes de submeter:

1. `VERSION` = `3.3.0-rc.1` e `app.json` = `3.3.0`, build `33`.
2. API apontando para `https://organizaai.evox.net.br/api`.
3. Login, sessão, tarefas, perfil e segurança testados no aparelho.
4. Notificações solicitando permissão corretamente.
5. Sem crash em rotação/tema escuro/telas pequenas.
6. Política de privacidade e screenshots atualizadas na loja.

## 5. Checklist em aparelho físico (obrigatório antes da loja)

| Item | iOS | Android |
|---|---|---|
| Instalar build assinado | | |
| Login e persistência de sessão | | |
| Logout | | |
| Criar/editar/concluir/excluir tarefa | | |
| Lixeira e restauração | | |
| Categorias e hábitos | | |
| Planejamento, foco e revisão | | |
| Perfil e alteração de senha | | |
| Tema claro/escuro | | |
| Notificações | | |
| Layout em tela pequena/grande | | |

## 6. Relação com o Prompt 2

O Prompt 2 trata da **publicação Web/Admin**. O Mobile **não** é publicado nesta etapa; este
documento existe para que a publicação em loja seja feita depois, com build assinado e
autorização específica, sem novas alterações de código.
