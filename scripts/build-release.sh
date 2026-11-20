#!/usr/bin/env bash
# Gera o artefato de homologação do Mobile (export Expo) fora do Git.
# Não publica em loja e não usa credenciais EAS.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

VERSION="$(tr -d '[:space:]' < VERSION)"
OUT="dist-release/$VERSION"
SHA="sha256sum"
command -v sha256sum >/dev/null 2>&1 || SHA="shasum -a 256"

echo "== Mobile $VERSION =="
rm -rf "$OUT"
mkdir -p "$OUT"

echo "== Qualidade =="
npm run typecheck
npm run lint
npm test -- --silent

echo "== Export =="
rm -rf dist
npm run export
[ -f dist/metadata.json ] || { echo "metadata do export ausente" >&2; exit 1; }

tar -czf "$OUT/organiza-ai-mobile-$VERSION.tar.gz" -C dist .
cp package.json "$OUT/package-metadata.json"
(cd "$OUT" && $SHA organiza-ai-mobile-"$VERSION".tar.gz package-metadata.json > SHA256SUMS)
cat "$OUT/SHA256SUMS"
echo "OK: artefato em $OUT (não versionado)"
