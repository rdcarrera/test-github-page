#!/bin/zsh
# Descarga fotos de ejemplo (Unsplash vía picsum.photos) para probar el diseño en local.
# Las categorías son ficticias: sustituye el contenido de photos/ por tu trabajo real.
#
#   ./scripts/seed.sh          → solo si photos/ está vacía
#   ./scripts/seed.sh --force  → borra photos/ y vuelve a descargar
set -euo pipefail
cd "${0:A:h}/.."

if [[ ${1:-} == --force ]]; then
  rm -rf photos
elif [[ -n "$(ls photos 2>/dev/null)" ]]; then
  print "photos/ ya tiene contenido; usa --force para reemplazarlo."
  exit 0
fi

typeset -A categories=(
  01-retrato      "Retrato|Retratos de autor en estudio y luz natural.|portrait"
  02-bodas        "Bodas|Historias de boda contadas sin poses forzadas, de los preparativos al último baile.|mixed"
  03-paisaje      "Paisaje|Territorios, horas azules y silencio.|landscape"
  04-arquitectura "Arquitectura|Líneas, volúmenes y luz para estudios de arquitectura e interiorismo.|mixed"
  05-editorial    "Editorial|Moda y campañas para marcas y revistas.|portrait"
)
sizes_portrait=(1600x2000 1600x2400 1600x2000 1600x2000 1600x2400 1600x2000 1600x2000)
sizes_landscape=(2400x1600 2400x1350 2400x1600 2400x1600 2400x1350 2400x1600 2400x1600)
sizes_mixed=(1600x2000 2400x1600 1600x2400 2400x1600 1600x2000 1800x1800 2400x1600)

download() {  # url destino
  curl -fsSL --retry 2 -o "$2" "$1" || print -P "%F{red}✖ fallo al descargar $2%f"
}

print "Descargando fotos de ejemplo…"
for folder in ${(k)categories}; do
  IFS='|' read -r title desc kind <<< "${categories[$folder]}"
  mkdir -p "photos/$folder"
  sizes=(${(P)${:-sizes_$kind}})
  n=0
  for size in $sizes; do
    (( ++n ))
    download "https://picsum.photos/seed/${folder}-${n}/${size/x//}.jpg" "photos/$folder/$(printf '%02d' $n)-${folder#*-}.jpg" &
  done
  cat > "photos/$folder/info.json" <<JSON
{
  "title": "$title",
  "description": "$desc",
  "captions": {
    "01-${folder#*-}.jpg": "Fotografía de ejemplo — sustitúyela por tu trabajo"
  }
}
JSON
done
# Vídeos de ejemplo (películas abiertas de Blender en YouTube)
cat > photos/02-bodas/videos.json <<'JSON'
[
  { "youtube": "https://www.youtube.com/watch?v=eRsGyueVLvQ", "title": "Película de boda — ejemplo", "after": "02-bodas.jpg" },
  { "youtube": "https://youtu.be/WhWc3b3KhnY", "title": "Tráiler de la temporada — ejemplo", "poster": "05-bodas.jpg" }
]
JSON
cat > photos/05-editorial/videos.json <<'JSON'
[
  { "youtube": "R6MlUcmOul8", "title": "Backstage de campaña — ejemplo", "after": "03-editorial.jpg" }
]
JSON

mkdir -p assets/img
download "https://picsum.photos/seed/about-portrait/1200/1500.jpg" assets/img/about.jpg &
wait

print -P "%F{green}✔ Fotos de ejemplo descargadas.%f Generando miniaturas…"
./scripts/optimize.sh
