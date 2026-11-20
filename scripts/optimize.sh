#!/bin/zsh
# Prepara las fotos para la web:
#   · reduce los originales a un máximo de $MAX px en el lado largo (los SOBRESCRIBE: guarda tus RAW/masters aparte)
#   · genera miniaturas JPEG de $THUMB px en <categoría>/thumbs/ para que la galería cargue rápido
# Es incremental: solo procesa lo nuevo o modificado.
#
# Funciona en macOS (usa 'sips', incluido en el sistema) y en Linux/WSL (usa ImageMagick:
# sudo apt install imagemagick).
#
#   ./scripts/optimize.sh
#   MAX=3000 THUMB=1000 ./scripts/optimize.sh
#   BACKEND=imagemagick ./scripts/optimize.sh     # forzar ImageMagick también en macOS
set -euo pipefail
setopt null_glob extended_glob
cd "${0:A:h}/.."

MAX=${MAX:-2400}
THUMB=${THUMB:-900}
QUALITY=${QUALITY:-82}
THUMB_QUALITY=76
photos=$(sed -nE 's/^[[:space:]]*photosDir:[[:space:]]*"([^"]+)".*/\1/p' assets/js/config.js | head -1)
photos=${photos:-photos}

# --- Motor de imagen ---------------------------------------------------------
if [[ -z ${BACKEND:-} ]]; then
  if (( $+commands[sips] )); then BACKEND=sips
  elif (( $+commands[magick] || $+commands[convert] )); then BACKEND=imagemagick
  else
    print -P "%F{red}✖ No se encuentra ni 'sips' (macOS) ni ImageMagick.%f"
    print "  Ubuntu / WSL:  sudo apt install imagemagick"
    exit 1
  fi
fi

if [[ $BACKEND == imagemagick ]]; then
  # ImageMagick 7 usa 'magick <cmd>'; ImageMagick 6 (Ubuntu ≤ 24.04) usa los comandos sueltos
  if (( $+commands[magick] )); then im=(magick); identify=(magick identify); mogrify=(magick mogrify)
  else im=(convert); identify=(identify); mogrify=(mogrify)
  fi
fi

# Escribe "ancho alto" de la imagen
dimensions() {
  if [[ $BACKEND == sips ]]; then
    sips -g pixelWidth -g pixelHeight "$1" | awk '/pixelWidth/ {w=$2} /pixelHeight/ {h=$2} END {print w, h}'
  else
    $identify -format '%w %h\n' "$1[0]" | head -1
  fi
}

# Reduce en el sitio, conservando los metadatos EXIF (autoría, cámara…)
shrink() {
  if [[ $BACKEND == sips ]]; then
    sips -Z $MAX -s formatOptions $QUALITY "$1" >/dev/null
  else
    $mogrify -auto-orient -resize "${MAX}x${MAX}>" -quality $QUALITY "$1"
  fi
}

# Genera la miniatura JPEG
make_thumb() {
  if [[ $BACKEND == sips ]]; then
    sips -Z $THUMB -s format jpeg -s formatOptions $THUMB_QUALITY "$1" --out "$2" >/dev/null
  else
    # jpeg:size acelera mucho la lectura de JPEG grandes; -strip quita metadatos de la miniatura
    $im -define jpeg:size=$(( THUMB * 2 ))x$(( THUMB * 2 )) "$1[0]" -auto-orient \
      -resize "${THUMB}x${THUMB}>" -strip -sampling-factor 4:2:0 -interlace JPEG \
      -colorspace sRGB -quality $THUMB_QUALITY "$2"
  fi
}

print -P "%F{8}Motor: $BACKEND · máx ${MAX}px · miniaturas ${THUMB}px%f"

# --- Proceso -----------------------------------------------------------------
resized=0; thumbs=0
for img in $photos/*/*.(#i)(jpg|jpeg|png|webp|heic); do
  dir=${img:h}; name=${img:t}; stem=${name:r}; ext=${name:e:l}

  if [[ $ext == heic ]]; then
    print -P "%F{yellow}⚠ $img es HEIC: los navegadores no lo muestran. Expórtalo a JPEG.%f"
    continue
  fi

  read -r w h <<< "$(dimensions "$img")"
  long=$(( w > h ? w : h ))
  if (( long > MAX )) && [[ $ext != webp ]]; then
    shrink "$img"
    print "↘ $img  ${w}×${h} → máx ${MAX}px"
    (( ++resized ))
  fi

  mkdir -p "$dir/thumbs"
  thumb="$dir/thumbs/$stem.jpg"
  if [[ ! -f $thumb || $img -nt $thumb ]]; then
    make_thumb "$img" "$thumb"
    (( ++thumbs ))
  fi
done

# Miniaturas huérfanas (de fotos que ya no existen)
for t in $photos/*/thumbs/*.jpg; do
  matches=(${t:h:h}/${t:t:r}.*(.N))
  if (( ${#matches} == 0 )); then rm "$t"; print "✖ miniatura huérfana eliminada: $t"; fi
done

print -P "%F{green}✔ $resized foto(s) reducida(s), $thumbs miniatura(s) generada(s)%f"
