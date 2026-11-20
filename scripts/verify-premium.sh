#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"
CANON="/Users/rossiolourenco/Framework-Projetos/dev-standards"
MODE="${1:-full}"
MODE="${MODE#--}"

fail() { echo "FAIL: $*" >&2; exit 1; }
ok() { echo "OK: $*"; }

case "$MODE" in
  full|static) ;;
  *) echo "uso: $0 [full|static]" >&2; exit 2 ;;
esac

echo "== Organiza Aí Mobile — premium gate ($MODE) =="
echo "commit: $(git rev-parse --short HEAD 2>/dev/null || echo 'sem git')"
echo "branch: $(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo 'sem git')"

# Framework: arquivos essenciais, manifesto e fingerprint portáveis.
[ -f dev-standards/AI-GUIDELINES.md ] || fail "dev-standards/AI-GUIDELINES.md ausente"
[ -f dev-standards/MANIFEST.sha256 ] || fail "dev-standards/MANIFEST.sha256 ausente"
[ -f dev-standards/FINGERPRINT ] || fail "dev-standards/FINGERPRINT ausente"
[ -f STACK.md ] || fail "STACK.md ausente"
[ -f AGENTS.md ] || fail "AGENTS.md ausente"
[ -f opencode.json ] || fail "opencode.json ausente"
node -e "JSON.parse(require('fs').readFileSync('opencode.json','utf8'))" || fail "opencode.json inválido"

# Versão única e rastreável do release.
[ -f VERSION ] || fail "VERSION ausente"
RELEASE_VERSION="$(tr -d '[:space:]' < VERSION)"
[ -n "$RELEASE_VERSION" ] || fail "VERSION vazio"
BASE_VERSION="${RELEASE_VERSION%%-*}"
RELEASE_VERSION="$RELEASE_VERSION" BASE_VERSION="$BASE_VERSION" node -e "
  const p = require('./package.json');
  const a = require('./app.json');
  if (p.version !== process.env.RELEASE_VERSION) {
    console.error('package.json=' + p.version + ' VERSION=' + process.env.RELEASE_VERSION);
    process.exit(1);
  }
  if (a.expo.version !== process.env.BASE_VERSION) {
    console.error('app.json=' + a.expo.version + ' esperado=' + process.env.BASE_VERSION);
    process.exit(1);
  }
" || fail "versão do Mobile divergente de VERSION"
ok "versão de release consistente ($RELEASE_VERSION, app $BASE_VERSION)"

EXPECTED="$(tr -d '[:space:]' < dev-standards/FINGERPRINT)"
if command -v sha256sum >/dev/null 2>&1; then
  ACTUAL="$(sha256sum dev-standards/MANIFEST.sha256 | awk '{print $1}')"
  [ "$ACTUAL" = "$EXPECTED" ] || fail "fingerprint do manifesto divergente"
  (cd dev-standards && sha256sum -c MANIFEST.sha256 >/dev/null) || fail "manifesto do dev-standards inválido"
else
  ACTUAL="$(shasum -a 256 dev-standards/MANIFEST.sha256 | awk '{print $1}')"
  [ "$ACTUAL" = "$EXPECTED" ] || fail "fingerprint do manifesto divergente"
  (cd dev-standards && shasum -a 256 -c MANIFEST.sha256 >/dev/null) || fail "manifesto do dev-standards inválido"
fi
ok "dev-standards íntegro pelo manifesto/fingerprint"

if [ -d "$CANON" ]; then
  diff -rq --exclude=.DS_Store --exclude=SOURCE.md --exclude=PROJECT-SCOPE.md \
    --exclude=MANIFEST.sha256 --exclude=FINGERPRINT "$CANON" dev-standards >/dev/null \
    || fail "dev-standards divergente da fonte canônica"
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

if [ "$MODE" = "full" ]; then
  echo "== Export =="
  npm run export
  [ -f dist/metadata.json ] || fail "metadata do export ausente"
  find dist/_expo/static/js/web -name '*.js' | grep -q . || fail "bundle Web ausente"
  find dist/_expo/static/js/ios -name '*.hbc' | grep -q . || fail "bundle iOS ausente"
  find dist/_expo/static/js/android -name '*.hbc' | grep -q . || fail "bundle Android ausente"
  ok "bundles Web/iOS/Android exportados"
fi

ok "gate Mobile concluído ($MODE)"
