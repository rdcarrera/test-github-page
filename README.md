# Porfolio fotográfico

> 📖 **¿No eres técnico?** Empieza por el [**MANUAL.md**](MANUAL.md): explica paso a paso cómo personalizar la web,
> optimizar las fotos, publicarla en GitHub y usar tu propio dominio.

Web estática para un fotógrafo profesional, pensada para publicarse **gratis en GitHub Pages**.
No necesita base de datos ni compilación. Las categorías y las fotos se descubren solas listando el
repositorio con la API de GitHub. **Para publicar fotos nuevas basta con subirlas a una carpeta.**

## Arranque rápido (en local)

```zsh
./scripts/seed.sh        # (opcional) descarga fotos de ejemplo para ver el diseño
./scripts/dev.sh         # http://localhost:8000/
```

En macOS solo necesitas `python3` y las herramientas del sistema (`sips`, `curl`). No hace falta instalar nada más.

### Ubuntu / WSL

```bash
sudo apt update && sudo apt install -y zsh imagemagick python3 curl git
git clone git@github.com:TU-USUARIO/portfolio-fotografia.git ~/portfolio-fotografia
cd ~/portfolio-fotografia
./scripts/optimize.sh    # detecta que no hay 'sips' y usa ImageMagick
./scripts/dev.sh         # ábrelo desde el navegador de Windows: http://localhost:8000/
```

- En WSL, trabaja dentro de la carpeta de Linux (`~/…`), **no** en `/mnt/c/…`: es mucho más lento y
  no distingue mayúsculas, igual que macOS.
- `.gitattributes` fuerza finales de línea LF en los scripts. Sin eso, al clonar desde Windows fallarían
  con `zsh: bad interpreter` o `$'\r': command not found`.
- `BACKEND=imagemagick ./scripts/optimize.sh` fuerza ImageMagick también en macOS.

## El entorno de desarrollo simula GitHub Pages

`./scripts/dev.sh` levanta un servidor que se comporta como producción para detectar los fallos antes de subir:

| Producción | Simulador local |
|---|---|
| `api.github.com/repos/…/git/trees/main` | Responde con el **mismo JSON**, generado a partir de tus ficheros (si hay git, solo los que git subiría) |
| Rutas que **distinguen mayúsculas/minúsculas** | Igual. macOS no las distingue, así que `Foto.JPG` ≠ `foto.jpg` da 404 y lo avisa en la terminal |
| Página de proyecto en `usuario.github.io/<repo>/` | `./scripts/dev.sh --pages` sirve en `/<repo>/` |
| `404.html` para rutas inexistentes | Igual |
| Formspree recibe el formulario | El mensaje se imprime en la terminal |

Más opciones:

```zsh
./scripts/dev.sh --rate-limit     # la API devuelve 403 → comprueba que la web tira de manifest.json
./scripts/dev.sh --latency 800    # red lenta: ver esqueletos de carga y fundidos
PORT=9000 ./scripts/dev.sh
```

## Añadir tu trabajo

```
photos/
  01-retrato/            ← una carpeta por categoría; el número fija el orden
    01-maria.jpg         ← las fotos se ordenan por nombre
    02-estudio.jpg
    info.json            ← opcional: título, descripción, portada, pies de foto
    videos.json          ← opcional: vídeos de YouTube
    thumbs/              ← miniaturas (las genera optimize.sh)
  02-bodas/
```

`info.json` (todos los campos son opcionales):

```json
{
  "title": "Bodas",
  "description": "Historias de boda contadas sin poses forzadas.",
  "cover": "03-baile.jpg",
  "captions": { "01-maria.jpg": "María, Lisboa 2026" }
}
```

Sin `info.json`, el título sale del nombre de la carpeta (`02-bodas-y-eventos` → «Bodas y eventos»)
y la portada es la primera foto.

### Vídeos (YouTube): `videos.json`

Cada categoría puede tener un `videos.json` con sus vídeos de YouTube. Aparecen en la galería
mezclados con las fotos y se reproducen en el mismo visor:

```json
[
  { "youtube": "https://www.youtube.com/watch?v=eRsGyueVLvQ", "title": "Película de boda", "after": "02-ceremonia.jpg" },
  { "youtube": "https://youtu.be/WhWc3b3KhnY", "title": "Tráiler 2026", "poster": "05-baile.jpg" },
  { "youtube": "R6MlUcmOul8", "title": "Backstage" }
]
```

| Campo | Obligatorio | Qué hace |
|---|---|---|
| `youtube` | sí | ID de 11 caracteres o cualquier URL de YouTube (watch, youtu.be, shorts, embed) |
| `title` | recomendado | Texto sobre la miniatura y en el visor |
| `after` | no | Coloca el vídeo justo después de esa foto; si no se indica, va al final |
| `poster` | no | Usa una de tus fotos como miniatura en lugar de la de YouTube |

- En YouTube, sube los vídeos como **«Oculto»** (no «Privado») y deja activado **«Permitir insertar»**.
- Se insertan con `youtube-nocookie.com`, y YouTube no recibe nada hasta que el visitante pulsa *play*.
- `./scripts/check.sh` consulta YouTube y avisa si un vídeo no existe, es privado o no permite insertarse
  (`--offline` para saltarse esa comprobación).
- Una categoría puede tener solo vídeos, sin fotos.

Después de añadir fotos:

```zsh
./scripts/optimize.sh    # reduce a 2400 px y crea miniaturas de 900 px (SOBRESCRIBE los originales)
./scripts/check.sh       # comprobaciones previas + regenera manifest.json
```

Recomendaciones: nombres en minúsculas, sin espacios ni tildes. Exporta en JPEG sRGB. Los HEIC no se ven en el navegador.

## Personalizar

Todo el texto (nombre, bio, cifras, email, redes) está en **`assets/js/config.js`**.
Los colores y las tipografías son variables CSS al principio de `assets/css/styles.css`.

### Formulario de contacto

GitHub Pages no tiene servidor. Tienes dos opciones:
- **Formspree** (gratis hasta 50 mensajes al mes): crea un formulario en <https://formspree.io> y pon su ID en `contact.formspreeId`.
- **Sin configurar**: el botón abre el cliente de correo del visitante con el mensaje ya redactado (`mailto`).

## Publicar en GitHub Pages

```zsh
./scripts/check.sh                       # debe terminar en «✔ Listo para subir»
git init && git add -A && git commit -m "Porfolio inicial"
git branch -M main
git remote add origin git@github.com:TU-USUARIO/portfolio-fotografia.git
git push -u origin main
```

En GitHub, ve a **Settings → Pages → Source: Deploy from a branch → `main` / `(root)`**.
La web quedará en `https://TU-USUARIO.github.io/portfolio-fotografia/`.
Si nombras el repo `TU-USUARIO.github.io`, la web estará en la raíz del dominio.

Usuario, repositorio y rama se detectan solos en `*.github.io`. Con un dominio propio, rellena `github` en `config.js`.

## Cómo funciona el listado

1. `assets/js/content.js` pide `GET /repos/{owner}/{repo}/git/trees/{branch}?recursive=1`: **una sola petición** devuelve todo el árbol.
2. Filtra lo que hay en `photos/` y construye las categorías.
3. Guarda el resultado en `localStorage` durante 15 minutos. La API pública permite 60 peticiones por hora a cada visitante.
4. Si la API falla (límite superado, caída…), usa la caché aunque esté caducada y, si no hay caché, `manifest.json`.

Las imágenes se sirven desde el propio GitHub Pages (CDN). La API solo se usa para listar.

**Límites de GitHub:** 100 MB por fichero y 1 GB por sitio publicado. `check.sh` los vigila.

## Estructura

```
index.html  categoria.html  contacto.html  404.html
assets/css/styles.css
assets/js/config.js      ← configuración
assets/js/content.js     ← listado del repo (API → caché → manifest)
assets/js/layout.js      ← cabecera, pie, animaciones
assets/js/home.js  gallery.js  lightbox.js  contact.js
photos/                  ← tu trabajo
dev/                     ← simulador local y comprobaciones (Python, sin dependencias)
scripts/                 ← dev.sh, check.sh, optimize.sh, seed.sh (zsh)
```
