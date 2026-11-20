#!/bin/zsh
# Arranca el simulador local de GitHub Pages.
#
#   ./scripts/dev.sh                  → http://localhost:8000/
#   ./scripts/dev.sh --pages          → http://localhost:8000/<repo>/  (igual que usuario.github.io/<repo>/)
#   ./scripts/dev.sh --rate-limit     → la API de GitHub responde 403 (prueba el respaldo manifest.json)
#   ./scripts/dev.sh --latency 800    → simula una red lenta
#   PORT=9000 ./scripts/dev.sh
set -euo pipefail
cd "${0:A:h}/.."

args=()
for a in "$@"; do
  if [[ $a == --pages ]]; then
    repo=$(sed -nE 's/^[[:space:]]*repo:[[:space:]]*"([^"]+)".*/\1/p' assets/js/config.js | head -1)
    args+=(--base "/${repo}/")
  else
    args+=("$a")
  fi
done

if [[ -z "$(ls photos 2>/dev/null)" ]]; then
  print -P "%F{yellow}No hay fotos en photos/. Ejecuta ./scripts/seed.sh para descargar fotos de ejemplo.%f"
fi

exec python3 -B dev/server.py --port "${PORT:-8000}" "${args[@]}"
