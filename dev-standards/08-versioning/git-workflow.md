# Fluxo de Git (Trunk-Based / GitHub Flow)

## 1. Modelo de branch

- `main` (ou `master`) é sempre deployável. Nenhum commit direto nela — tudo via Pull Request.
- Branches de trabalho curtas, nomeadas por tipo/escopo: `feature/nome-curto`, `fix/nome-curto`,
  `chore/nome-curto`, `hotfix/nome-curto`.
- Preferir trunk-based (branches de vida curta, poucos dias) a Git Flow completo (`develop`, `release/*`)
  salvo necessidade real de suportar múltiplas versões em produção simultaneamente — nesse caso, adotar Git
  Flow explicitamente e documentar em `STACK.md`.

## 2. Pull Requests

- PR pequeno e focado em uma mudança coesa — mais fácil de revisar, menos risco.
- Descrição do PR explica o "porquê", não só o "o quê" (o diff já mostra o quê).
- Todo PR passa por: CI verde (lint, testes, build) + revisão de ao menos 1 pessoa (ou do próprio usuário,
  quando trabalhando sozinho, revisando o diff gerado pela IA antes de aprovar).
- PR não é mesclado com teste quebrando, warning de segurança alto/crítico, ou cobertura caindo abaixo do
  acordado sem justificativa.

## 3. Commits

- Ver `commit-convention.md` para o padrão de mensagem (Conventional Commits).
- Commits atômicos: cada commit representa uma mudança logicamente coesa e, idealmente, compila/passa
  testes isoladamente.
- Nunca commitar segredo, arquivo de build gerado, ou dependência instalada localmente (`node_modules`,
  `.venv`, `bin/obj`) — usar `.gitignore` adequado por stack.

## 4. Merge

- Squash merge para PRs de feature (histórico de `main` limpo, um commit por PR) — ou merge commit
  preservando histórico, conforme convenção já adotada no projeto.
- Rebase (não merge de `main` para dentro da branch) para manter a branch de trabalho atualizada, evitando
  merge commits desnecessários — usar com cautela em branch compartilhada.

## 5. Hotfix

- Bug crítico em produção: branch `hotfix/` a partir de `main`, PR expresso com revisão mínima viável, merge
  e deploy imediato, seguido de release com bump de versão PATCH.

## 6. Tags e releases

- Toda versão publicada em produção recebe uma tag Git correspondente à versão semântica (ver
  `semantic-versioning.md`), ex.: `v1.4.2`.
- Release notes geradas a partir do `CHANGELOG.md` (ver `07-documentation/changelog-template.md`).

## 7. Proteção de branch

- `main` protegida: exige PR, exige CI verde, proíbe force-push, proíbe deleção.
- Nunca usar `git push --force` em branch compartilhada; `--force-with-lease` apenas na própria branch de
  trabalho pessoal, com cautela.
