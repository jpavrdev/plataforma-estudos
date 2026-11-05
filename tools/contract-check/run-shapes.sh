#!/usr/bin/env bash
# Runs the backend integration suite with the shape recorder.
# Usage: bash run-shapes.sh <backend dir> <output file>
set -euo pipefail
BACKEND="$(cd "$1" && pwd)"
OUT="$2"
TOOLS="$(cd "$(dirname "$0")" && pwd)"
rm -f "$OUT.raw"
cd "$BACKEND"
export NODE_OPTIONS="--import $TOOLS/record-shapes.mjs"
export SHAPES_OUT="$OUT.raw"
export SHAPES_BACKEND="$BACKEND"
bash tests/run-integration.sh > "$OUT.log" 2>&1 || { echo "suite failed, see $OUT.log"; tail -20 "$OUT.log"; exit 1; }
grep -E "^ℹ (tests|pass|fail)" "$OUT.log"
sort -u "$OUT.raw" > "$OUT"
echo "shapes: $(wc -l < "$OUT") lines"
