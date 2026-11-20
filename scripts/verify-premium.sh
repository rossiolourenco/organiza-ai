#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"
CANON="/Users/rossiolourenco/Framework-Projetos/dev-standards"

fail() { echo "FAIL: $*" >&2; exit 1; }
ok() { echo "OK: $*"; }

echo "== Organiza Aí Mobile — premium gate =="
echo "commit: $(git rev-parse --short HEAD 2>/dev/null || echo 'sem git')"
echo "branch: $(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo 'sem git')"

# Framework e versão.
[ -f dev-standards/AI-GUIDELINES.md ] || fail "dev-standards/AI-GUIDELINES.md ausente"
[ -f STACK.md ] || fail "STACK.md ausente"
[ -f AGENTS.md ] || fail "AGENTS.md ausente"
[ -f opencode.json ] || fail "opencode.json ausente"
node -e "JSON.parse(require('fs').readFileSync('opencode.json','utf8'))" || fail "opencode.json inválido"
node -e "const p=require('./package.json'); if(p.version!=='3.2.0') process.exit(1)" || fail "versão Mobile diferente de 3.2.0"
if [ -d "$CANON" ]; then
  while IFS= read -r file; do
    cmp -s "$CANON/$file" "dev-standards/$file" || fail "dev-standards divergente: $file"
  done < <(cd "$CANON" && find . -type f -not -name '.DS_Store' | sed 's#^\./##' | sort)
  ok "dev-standards idêntico à fonte canônica"
fi

# Rotas e componentes Premium.
[ -f src/features/profile/SecurityScreen.tsx ] || fail "SecurityScreen ausente"
[ -f app/'(main)'/seguranca.tsx ] || fail "rota /seguranca ausente"
[ -f src/features/dashboard/DashboardScreen.tsx ] || fail "DashboardScreen ausente"
[ -f src/features/tasks/TasksScreen.tsx ] || fail "TasksScreen ausente"
grep -q "Sua senha protege" src/features/profile/SecurityScreen.tsx || fail "marcador de segurança ausente"
grep -q "Seu dia, com mais intenção" src/features/dashboard/DashboardScreen.tsx || fail "marcador do dashboard ausente"
grep -q "Seu espaço" src/features/profile/ProfileScreen.tsx || fail "marcador do perfil ausente"
ok "rotas e componentes premium presentes"

# Não aceitar o app acadêmico (IP) no código ativo.
if grep -Rq "IP do servidor\|Organização simples para o seu dia" app src 2>/dev/null; then
  fail "marcador do app acadêmico encontrado no código ativo"
fi
ok "sem marcadores do app acadêmico no código ativo"

git diff --check || fail "whitespace/erro de diff"

echo "== Typecheck =="
npm run typecheck
echo "== Lint =="
npm run lint
echo "== Testes =="
npm test -- --silent
echo "== Export =="
npm run export

ok "gate Mobile concluído"
