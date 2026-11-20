# Organiza Aí Mobile — Release Candidate 3.3

- **Versão (package):** `3.3.0-rc.1` (`VERSION`)
- **Versão de loja (`app.json`):** `3.3.0` · iOS build `33` · Android `versionCode` `33`
- **Expo SDK:** 54 · React Native 0.81.5 · Expo Router ~6.0.24
- **API:** `https://organizaai.evox.net.br/api`
- **Branch:** `release/3.3-rc`
- **Status:** homologado por automação; **não publicado em loja**

## 1. Escopo

O RC do Mobile **não altera funcionalidades**. A release:

1. versiona o app para `3.3.0-rc.1` / loja `3.3.0`;
2. adiciona `VERSION` e faz o gate validar `package.json` × `app.json` × `VERSION`;
3. gera artefato de homologação com checksum (`scripts/build-release.sh`);
4. documenta aceitação, prontidão e handoff.

Nenhuma tela, rota, aba, provider ou chamada de API foi removida ou renomeada.

## 2. Funcionalidades preservadas

Cinco abas (`home`, `tarefas`, `planejamento`, `foco`, `perfil`) e as telas `novaTarefa`,
`editarTarefa`, `categorias`, `habitos`, `lixeira`, `revisao`, `concentracao` e `seguranca`;
login/cadastro sem campo de IP; dashboard Premium; tema claro/escuro; notificações locais.

## 3. Validação executada

| Verificação | Resultado |
|---|---|
| `npm run typecheck` | OK |
| `npm run lint` | OK |
| `npm test` | **50/50** em 11 suítes |
| `npm run doctor` (Expo Doctor) | **18/18** |
| `npm run export` (Web/iOS/Android) | OK |
| Gate `bash scripts/verify-premium.sh` (full) | OK |
| Bundles exportados | Web `.js`, iOS `.hbc`, Android `.hbc` presentes |

## 4. Artefato

```bash
bash scripts/build-release.sh
# dist-release/3.3.0-rc.1/organiza-ai-mobile-3.3.0-rc.1.tar.gz
# dist-release/3.3.0-rc.1/SHA256SUMS
```

`dist-release/` não é versionado. Os checksums homologados ficam em `docs/RELEASE-HANDOFF.md`.

## 5. Configuração de distribuição

- **EAS/Expo:** projeto sem `eas.json` versionado. O build assinado exige credenciais
  (Apple Developer / Google Play) que **não** existem neste repositório.
- **iOS:** `buildNumber` = `33`. Requer certificado e provisioning profile.
- **Android:** `versionCode` = `33`. Requer keystore de release.
- O CI **não** usa credenciais de loja; apenas valida qualidade e export.

## 6. Limitações conhecidas

- Sem teste em aparelho físico nesta rodada (requer hardware).
- Sem build assinado `.ipa`/`.aab` (requer credenciais).
- Sem E2E de UI (Detox/Maestro) — roadmap P2.
- Vulnerabilidades altas de dependência são DoS em deep link/build (ver
  `../organiza-ai-web/docs/SECURITY-REVIEW.md` §3).
- Sem modo offline completo.

## 7. Critérios de aceitação

1. Gate Mobile completo verde.
2. CI remoto `mobile-quality` e `mobile-bundle` verdes.
3. Export dos três alvos presente.
4. Versão consistente em `package.json`, `app.json` e `VERSION`.
5. Documentação de release e handoff atualizada.

## 8. Próximo passo

Publicação em loja **não** faz parte desta rodada. O Prompt 2 trata do deploy Web/Admin; a
publicação Mobile depende de build assinado e autorização específica (ver `RELEASE-HANDOFF.md`).
