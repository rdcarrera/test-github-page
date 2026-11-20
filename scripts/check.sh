#!/bin/zsh
# Comprueba que todo está bien antes de subir y regenera manifest.json.
set -euo pipefail
cd "${0:A:h}/.."
exec python3 -B dev/check.py "$@"
