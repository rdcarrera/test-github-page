# 📸 Manual del porfolio

### Tu web de fotografía, paso a paso y sin saber de informática

Este manual te acompaña desde cero hasta tener tu porfolio publicado en internet con tu propio dominio
(por ejemplo `www.tunombre.com`). No necesitas saber programar: solo seguir los pasos en orden.

> 💡 **Cómo leer este manual.** Las cajas como esta son consejos. Las que empiezan por ⚠️ son
> avisos importantes: léelos siempre. Los textos `con este formato` son cosas que hay que escribir
> o pulsar tal cual.

---

## Índice

1. [Antes de empezar: cómo funciona todo esto](#1-antes-de-empezar-cómo-funciona-todo-esto)
2. [Lo que necesitas instalar (una sola vez)](#2-lo-que-necesitas-instalar-una-sola-vez)
3. [La terminal sin miedo](#3-la-terminal-sin-miedo)
4. [Personaliza tu web](#4-personaliza-tu-web)
5. [Añade tus fotos y vídeos](#5-añade-tus-fotos-y-vídeos)
6. [Optimiza las imágenes](#6-optimiza-las-imágenes)
7. [Pruébalo en tu ordenador](#7-pruébalo-en-tu-ordenador)
8. [Sube la web a GitHub](#8-sube-la-web-a-github)
9. [Publícala en internet con GitHub Pages](#9-publícala-en-internet-con-github-pages)
10. [Usa tu propio dominio](#10-usa-tu-propio-dominio)
11. [El día a día: añadir trabajo nuevo](#11-el-día-a-día-añadir-trabajo-nuevo)
12. [Si algo no funciona](#12-si-algo-no-funciona)
13. [Pequeño diccionario](#13-pequeño-diccionario)

---

## 1. Antes de empezar: cómo funciona todo esto

Imagina tu porfolio como **una exposición de fotografía**:

| En la vida real | En tu web | Qué es |
|---|---|---|
| 🗂️ Tu archivo de copias | La carpeta `photos/` de tu ordenador | Donde guardas el trabajo que quieres enseñar |
| 🏛️ El almacén de la galería | **GitHub** | Un servicio gratuito que guarda una copia de tu web en internet |
| 🪟 El escaparate a la calle | **GitHub Pages** | La función de GitHub que enseña esa copia como página web |
| 📮 La dirección de la galería | **Tu dominio** (`tunombre.com`) | El nombre que la gente escribe para llegar a ti |

El camino siempre es el mismo:

```
 Tus fotos  →  Optimizar  →  Probar en tu ordenador  →  Subir a GitHub  →  ¡En internet!
```

**Lo mejor:** no hay que tocar código para añadir fotos. Cada carpeta dentro de `photos/` es una
categoría (Bodas, Retrato…) y la web las descubre sola.

**Lo que cuesta:**
- GitHub y GitHub Pages: **gratis**.
- Dominio propio: **unos 10 € al año** (opcional, pero muy recomendable para un profesional).

---

## 2. Lo que necesitas instalar (una sola vez)

### Si tienes Mac 🍎

| Programa | Para qué | Dónde |
|---|---|---|
| **Visual Studio Code** | Editar textos de la web sin estropearlos | https://code.visualstudio.com |
| **GitHub Desktop** | Subir la web a internet con botones, sin comandos | https://desktop.github.com |
| Herramientas de desarrollo de Apple | Las pide el Mac solo la primera vez | Se instalan solas (ver abajo) |

La primera vez que uses la terminal (capítulo 3), el Mac puede decir *«El comando python3 necesita
las herramientas de desarrollo»*. Pulsa **Instalar** y espera unos minutos. Solo pasa una vez.

> ⚠️ **No uses TextEdit para editar los ficheros de la web.** TextEdit cambia las comillas rectas
> `"` por comillas tipográficas `“ ”` y eso rompe la web. Usa siempre **Visual Studio Code**.

### Si tienes Windows 🪟

Windows necesita un «Linux por dentro» llamado **WSL**. Es gratis y oficial de Microsoft:

1. Pulsa la tecla **Windows**, escribe `PowerShell`, haz clic derecho → **Ejecutar como administrador**.
2. Escribe `wsl --install` y pulsa **Enter**.
3. Reinicia el ordenador. Al volver se abrirá **Ubuntu** y te pedirá crear un usuario y contraseña
   (apúntalos: los necesitarás).
4. En esa ventana de Ubuntu, copia y pega esto y pulsa **Enter**:
   ```bash
   sudo apt update && sudo apt install -y zsh imagemagick python3 curl git
   ```
   Te pedirá la contraseña que acabas de crear. Al escribirla **no se ve nada**: es normal, escríbela
   y pulsa Enter.
5. Instala también **Visual Studio Code** desde https://code.visualstudio.com.

> ⚠️ **En Windows, guarda el proyecto dentro de Ubuntu** (en tu carpeta personal, `~`), no en el
> escritorio de Windows ni en `C:`. Desde Ubuntu, la ruta de Windows `/mnt/c/...` funciona mucho
> más lento y oculta errores que luego sí aparecerían en internet.

### Crea tu cuenta de GitHub

1. Entra en https://github.com/signup.
2. Elige bien el **nombre de usuario**: aparecerá en la dirección de tu web
   (`tu-usuario.github.io`). Algo como `portfolio-foto` está bien.
3. Confirma el correo electrónico.

---

## 3. La terminal sin miedo

La **terminal** es una ventana donde, en lugar de hacer clic, escribes órdenes. Suena a película
de hackers, pero aquí solo vas a usar **cuatro órdenes**, siempre las mismas.

### Abrirla

- **Mac:** pulsa `Cmd ⌘ + Espacio`, escribe `Terminal` y pulsa Enter.
- **Windows:** pulsa la tecla Windows, escribe `Ubuntu` y pulsa Enter.

### Entrar en la carpeta del proyecto

Antes de cualquier orden, hay que «entrar» en la carpeta del porfolio:

- **Mac (truco fácil):** escribe `cd ` (con un espacio al final), **arrastra la carpeta del
  porfolio desde el Finder a la ventana de la terminal** y pulsa Enter.
- **Windows:** escribe `cd ~/portfolio-fotografia` y pulsa Enter.

### Las cuatro órdenes que vas a usar

| Orden | Qué hace | Cuándo |
|---|---|---|
| `./scripts/optimize.sh` | Prepara las fotos para la web | Cada vez que añadas fotos |
| `./scripts/dev.sh` | Abre la web en tu ordenador para verla | Para revisar antes de publicar |
| `./scripts/check.sh` | Revisa que todo esté bien | Siempre antes de subir |
| `./scripts/seed.sh` | Descarga fotos de ejemplo | Solo para probar el diseño |

> 💡 **Trucos:**
> - Puedes **copiar y pegar** las órdenes de este manual. No hace falta escribirlas a mano.
> - La tecla **↑** recupera la última orden que escribiste.
> - Para **parar** algo que se ha quedado funcionando, pulsa `Ctrl + C`.

---

## 4. Personaliza tu web

Todos tus datos están en **un único fichero**: `assets/js/config.js`.

1. Abre **Visual Studio Code** → menú **File → Open Folder…** → elige la carpeta del porfolio.
2. En la columna de la izquierda, abre `assets` → `js` → `config.js`.
3. Cambia **solo lo que está entre comillas**:

```js
name: "Pepe Botika",                          ← tu nombre
role: "Fotógrafo profesional",                ← tu profesión
tagline: "Luz, gesto y momento. ...",         ← tu frase de presentación
location: "Madrid · Disponible para viajar",
```

Más abajo encontrarás tu email, teléfono, redes sociales, el texto de «Sobre mí» y las cifras
(años de experiencia, proyectos…).

4. Guarda con `Cmd ⌘ + S` (Mac) o `Ctrl + S` (Windows).

> ⚠️ **Las tres reglas para no romper nada:**
> 1. Cambia solo el texto **dentro** de las comillas `"…"`.
> 2. No borres las comas `,` del final de las líneas.
> 3. Si tu texto lleva comillas, usa las simples: `"Mi lema es 'luz natural'"`.

**Tu foto de «Sobre mí»:** sustituye el fichero `assets/img/about.jpg` por tu retrato, con el mismo
nombre. Se mostrará en blanco y negro automáticamente.

### El formulario de contacto

Tu web no tiene un «buzón» propio, así que hay dos opciones:

- **Sencilla (ya funciona):** al pulsar «Enviar», se abre el programa de correo del visitante
  con el mensaje ya escrito, dirigido a tu email.
- **Profesional (recomendada):** los mensajes te llegan directamente al correo con **Formspree**,
  gratis hasta 50 mensajes al mes:
  1. Crea una cuenta en https://formspree.io y pulsa **New Form**.
  2. Te dará una dirección como `https://formspree.io/f/xyzabcde`. Copia **solo el final**:
     `xyzabcde`.
  3. En `config.js`, pégalo aquí: `formspreeId: "xyzabcde",`

---

## 5. Añade tus fotos y vídeos

### Cómo se organizan

Dentro de la carpeta `photos/` hay **una carpeta por categoría**:

```
photos/
├── 01-retrato/
├── 02-bodas/
├── 03-paisaje/
└── 04-arquitectura/
```

- **El número del principio decide el orden** en la web: `01` sale primero.
- El nombre se convierte en el título: `02-bodas-y-eventos` → «Bodas y eventos».
- **Para crear una categoría**, crea una carpeta nueva. **Para quitarla**, bórrala.

Dentro de cada categoría, pon las fotos. **También se ordenan por el nombre**, así que numéralas:

```
02-bodas/
├── 01-preparativos.jpg
├── 02-ceremonia.jpg
└── 03-primer-baile.jpg
```

> ⚠️ **Nombres de fichero seguros:** solo **minúsculas, números y guiones**. Sin espacios, sin
> tildes, sin ñ.
>
> | ❌ Mal | ✅ Bien |
> |---|---|
> | `Boda María.JPG` | `01-boda-maria.jpg` |
> | `IMG 2034 (copia).jpg` | `02-ceremonia.jpg` |
>
> En tu ordenador `Foto.JPG` y `foto.jpg` parecen iguales, pero **en internet son distintos** y la
> foto no se vería. El paso de revisión (capítulo 7) te avisa si esto pasa.

**Formato:** exporta desde Lightroom o Capture One en **JPEG, espacio de color sRGB**. Los HEIC del
iPhone no se ven en los navegadores.

> ⚠️ **Sube solo copias para web, nunca tus originales ni tus RAW.** El paso de optimizar reduce
> las fotos y **sobrescribe** lo que haya en `photos/`. Guarda siempre tus masters en otro sitio.

### Títulos, portada y pies de foto (opcional): `info.json`

Si quieres un título distinto al de la carpeta, una descripción o elegir la foto de portada, crea
un fichero llamado `info.json` dentro de la categoría con Visual Studio Code:

```json
{
  "title": "Bodas",
  "description": "Historias de boda contadas sin poses forzadas.",
  "cover": "03-primer-baile.jpg",
  "captions": {
    "01-preparativos.jpg": "Lucía, Toledo 2026"
  }
}
```

### Vídeos de YouTube: `videos.json`

Los vídeos se suben a **YouTube** (gratis y sin límite) y se muestran en tu galería mezclados con
las fotos.

**En YouTube:**
1. Sube el vídeo y, en **Visibilidad**, elige **Oculto**. Así no aparece en búsquedas, pero tu
   web sí puede mostrarlo. ⚠️ No elijas «Privado»: con «Privado» no se vería en tu web.
2. Copia el enlace del vídeo (botón **Compartir**), por ejemplo `https://youtu.be/WhWc3b3KhnY`.

**En tu porfolio**, crea un fichero `videos.json` dentro de la categoría:

```json
[
  {
    "youtube": "https://youtu.be/WhWc3b3KhnY",
    "title": "Película de boda — Lucía y Pablo",
    "after": "02-ceremonia.jpg"
  },
  {
    "youtube": "https://youtu.be/eRsGyueVLvQ",
    "title": "Tráiler de la temporada",
    "poster": "03-primer-baile.jpg"
  }
]
```

| Campo | ¿Obligatorio? | Para qué sirve |
|---|---|---|
| `youtube` | Sí | El enlace del vídeo |
| `title` | Recomendado | El título que se ve sobre el vídeo |
| `after` | No | Coloca el vídeo justo **después** de esa foto. Si no lo pones, va al final |
| `poster` | No | Usa una de **tus fotos** como imagen de portada del vídeo |

> 💡 Fíjate en la **coma** que separa un vídeo del siguiente (`},` + `{`) y en que el último no
> lleva coma. Si te equivocas, el paso de revisión te dirá exactamente dónde.

---

## 6. Optimiza las imágenes

Una foto recién exportada puede pesar 15 MB. En un móvil con 4G eso tarda una eternidad en cargar y
el visitante se va. Este paso deja tus fotos **listas para internet**:

- 📐 **Reduce** las fotos grandes a 2400 píxeles por el lado largo: se siguen viendo perfectas en
  una pantalla grande.
- 🖼️ **Crea miniaturas** de 900 píxeles para la galería, que carga al instante. Al hacer clic se
  abre la foto grande.
- 🔄 **Respeta la orientación**: las fotos verticales no salen giradas.
- ⚡ **Solo procesa lo nuevo**: si ya optimizaste antes, no repite el trabajo.

### Cómo hacerlo

1. Abre la terminal y entra en la carpeta del porfolio (capítulo 3).
2. Escribe:
   ```
   ./scripts/optimize.sh
   ```
3. Verás algo así:
   ```
   Motor: sips · máx 2400px · miniaturas 900px
   ↘ photos/02-bodas/01-preparativos.jpg  6000×4000 → máx 2400px
   ✔ 1 foto(s) reducida(s), 12 miniatura(s) generada(s)
   ```

Las miniaturas se guardan en una carpeta `thumbs` dentro de cada categoría. **No las toques**: se
crean y se borran solas.

> 💡 **Mac o Windows, da igual.** En Mac se usa una herramienta que ya trae el sistema (`sips`). En
> Windows/Ubuntu se usa ImageMagick, que instalaste en el capítulo 2. El programa elige solo.

**Para usuarios avanzados**, se puede cambiar el tamaño:
```
MAX=3000 THUMB=1000 ./scripts/optimize.sh
```

---

## 7. Pruébalo en tu ordenador

Antes de publicar, mira cómo queda. Lo que veas aquí es **exactamente** lo que verá el mundo.

### Arrancar la vista previa

```
./scripts/dev.sh
```

Abre el navegador (Chrome, Safari…) y entra en **http://localhost:8000**.

> 💡 «localhost» significa «este ordenador». **Nadie más puede ver esta web**: es tu ensayo privado.

Mientras está funcionando, **deja la terminal abierta**. Para apagarla, ve a la terminal y pulsa
`Ctrl + C`.

### Qué revisar

- [ ] La **portada**: el pase de fotos, tu nombre y tu frase.
- [ ] Cada **categoría**: que estén todas las fotos y en el orden correcto.
- [ ] Haz clic en una foto: se abre en grande y puedes moverte con las flechas `←` `→` del teclado.
- [ ] Los **vídeos** se reproducen.
- [ ] **Contacto**: envía un mensaje de prueba. Aparecerá escrito en la terminal (✉️), lo que confirma
  que el formulario funciona.
- [ ] **En el móvil:** en Chrome pulsa `Cmd ⌥ I` (Mac) o `F12` (Windows) y luego el icono del
  móvil 📱 para ver cómo queda en un teléfono.

¿Has cambiado algo? Solo **recarga la página** (`Cmd ⌘ + R` o `F5`).

### La revisión final: imprescindible antes de subir

```
./scripts/check.sh
```

Es tu **revisor de confianza**. Comprueba nombres de ficheros, fotos demasiado pesadas, enlaces
rotos, que los vídeos de YouTube existan y se puedan mostrar, los límites de GitHub…

- ✖ en **rojo** = error. Hay que arreglarlo antes de subir; te dice qué y dónde.
- ⚠ en **amarillo** = aviso. Puedes subir igualmente, pero conviene leerlo.
- **✔ Listo para subir** = adelante 🎉

---

## 8. Sube la web a GitHub

Usaremos **GitHub Desktop**: todo con botones.

> 🪟 **En Windows** (con el proyecto dentro de Ubuntu) es más fácil hacerlo desde la terminal: ve
> directamente a [la versión con terminal](#alternativa-con-la-terminal-mac-y-windows).

### Primera vez: conecta GitHub Desktop con tu cuenta

1. Abre **GitHub Desktop**.
2. Pulsa **Sign in to GitHub.com** e inicia sesión. Se abrirá el navegador para confirmar.
3. Si pregunta por tu nombre y email para «Git», pon tu nombre y el email de GitHub.

### Sube el proyecto

1. Menú **File → Add Local Repository…**
2. Pulsa **Choose…** y elige la carpeta del porfolio.
3. Aparecerá un aviso en rojo: *«This directory does not appear to be a Git repository»*. Es normal:
   pulsa el enlace **create a repository** que aparece en ese mensaje.
4. En la ventana que se abre, deja todo como está y pulsa **Create Repository**.
5. Arriba pulsa el botón azul **Publish repository**.
6. En la ventana:
   - **Name:** `portfolio-fotografia`
   - ⚠️ **Desmarca «Keep this code private»**. La web tiene que ser pública para que GitHub Pages
     funcione gratis y para que la web pueda listar tus fotos.
   - Pulsa **Publish Repository**.

¡Listo! Tu porfolio ya está guardado en GitHub. Puedes verlo en
`https://github.com/TU-USUARIO/portfolio-fotografia`.

> 💡 **¿Por qué ese nombre?** La dirección de tu web será
> `https://TU-USUARIO.github.io/portfolio-fotografia/`. Si en vez de eso llamas al repositorio
> exactamente `TU-USUARIO.github.io`, la web quedará en `https://TU-USUARIO.github.io/`, sin nada
> detrás. Si vas a usar dominio propio (capítulo 10), el nombre da igual.

### Alternativa con la terminal (Mac y Windows)

1. En https://github.com/new crea un repositorio llamado `portfolio-fotografia`, **Public**, y **sin
   marcar** ninguna casilla (README, .gitignore, licencia).
2. En la terminal, dentro de la carpeta del porfolio, pega esto cambiando `TU-USUARIO`:
   ```bash
   git init -b main
   git add -A
   git commit -m "Porfolio inicial"
   git remote add origin https://github.com/TU-USUARIO/portfolio-fotografia.git
   git push -u origin main
   ```
3. Te pedirá **usuario** y **contraseña**. ⚠️ **No sirve la contraseña de tu cuenta**: hay que crear
   una «llave» (token):
   - En GitHub: tu foto (arriba a la derecha) → **Settings** → **Developer settings** →
     **Personal access tokens** → **Fine-grained tokens** → **Generate new token**.
   - Ponle un nombre, en **Repository access** elige tu repositorio, y en **Permissions →
     Contents** elige **Read and write**.
   - Copia el token y pégalo cuando te pida la contraseña. **Guárdalo en un sitio seguro**: GitHub
     no te lo volverá a mostrar.

---

## 9. Publícala en internet con GitHub Pages

Ahora encendemos el escaparate:

1. Entra en tu repositorio en GitHub: `https://github.com/TU-USUARIO/portfolio-fotografia`.
2. Pulsa **⚙️ Settings** (arriba a la derecha, en la barra del repositorio).
3. En la columna izquierda, pulsa **Pages**.
4. En **Build and deployment**:
   - **Source:** `Deploy from a branch`
   - **Branch:** `main` y al lado `/ (root)`
   - Pulsa **Save**.
5. Espera **uno o dos minutos** y recarga la página. Arriba aparecerá:

   > ✅ **Your site is live at** `https://TU-USUARIO.github.io/portfolio-fotografia/`

6. Pulsa **Visit site**. 🎉 **¡Tu porfolio está en internet!** Mándaselo a quien quieras.

> 💡 La pestaña **Actions** del repositorio muestra el progreso de cada publicación. Un círculo
> amarillo significa «publicando…» y una ✅ verde significa «publicado».

---

## 10. Usa tu propio dominio

`tu-usuario.github.io/portfolio-fotografia` funciona, pero **`www.tunombre.com`** transmite mucha
más confianza a un cliente. Vamos a ello.

### Las piezas, explicadas con una analogía

- **El dominio** (`tunombre.com`) es como **tu número de teléfono**: lo compras y es tuyo
  mientras lo renueves cada año.
- **Los registros DNS** son como **la guía telefónica**: dicen «quien marque `tunombre.com`, que
  vaya a GitHub».
- **El certificado HTTPS** es **el candado 🔒** del navegador: indica que la web es segura. GitHub
  te lo da **gratis**.

### Paso 1 — Compra el dominio

Recomendación: **Cloudflare** (https://dash.cloudflare.com → **Domain Registration → Register
Domains**). Cobra el precio de coste, sin subidas al renovar, y si en el futuro necesitas guardar
muchas fotos fuera de GitHub, ese servicio también está en Cloudflare.

> 💡 Si ya tienes un dominio en otra empresa (GoDaddy, IONOS, Namecheap…), también sirve. Los
> pasos son los mismos; solo cambia dónde están los menús.

### Paso 2 — Demuestra a GitHub que el dominio es tuyo (recomendado)

Esto impide que otra persona pueda usar tu dominio para su propia web.

1. En GitHub: tu foto (arriba a la derecha) → **Settings** → **Pages** (columna izquierda) →
   **Add a domain**.
2. Escribe `tunombre.com` y pulsa **Add domain**.
3. GitHub te muestra un registro de tipo **TXT** con un nombre y un valor. Cópialos.
4. En **Cloudflare**: entra en tu dominio → **DNS → Records → Add record**:
   - **Type:** `TXT`
   - **Name:** lo que te dio GitHub (empieza por `_github-pages-challenge-`)
   - **Content:** el valor que te dio GitHub
   - **Save**
5. Vuelve a GitHub y pulsa **Verify**. Si no funciona a la primera, espera 10 minutos y repite.

### Paso 3 — La guía telefónica: registros DNS

En **Cloudflare → tu dominio → DNS → Records**, añade estos registros uno a uno con **Add record**:

| Type | Name | Content (IPv4 / IPv6 / Target) |
|---|---|---|
| `A` | `@` | `185.199.108.153` |
| `A` | `@` | `185.199.109.153` |
| `A` | `@` | `185.199.110.153` |
| `A` | `@` | `185.199.111.153` |
| `AAAA` | `@` | `2606:50c0:8000::153` |
| `AAAA` | `@` | `2606:50c0:8001::153` |
| `AAAA` | `@` | `2606:50c0:8002::153` |
| `AAAA` | `@` | `2606:50c0:8003::153` |
| `CNAME` | `www` | `TU-USUARIO.github.io` |

- `@` significa «el dominio sin nada delante» (`tunombre.com`).
- En el `CNAME`, pon **solo** `TU-USUARIO.github.io`, sin el nombre del repositorio detrás.

> ⚠️ **MUY IMPORTANTE en Cloudflare:** en cada registro verás una **nube naranja** («Proxied»).
> Haz clic para que quede **gris** («DNS only»). Con la nube naranja, GitHub no puede darte el
> candado 🔒 y la web dará errores de seguridad.

### Paso 4 — Dile a GitHub cuál es tu dominio

1. En tu **repositorio** → **⚙️ Settings → Pages**.
2. En **Custom domain**, escribe `www.tunombre.com` y pulsa **Save**.
3. GitHub comprobará los registros DNS. Puede tardar de unos minutos a unas horas; si sale un aviso,
   ten paciencia y vuelve más tarde.
4. Cuando la comprobación salga bien, marca la casilla **Enforce HTTPS** ✅. Si aparece gris y no
   se puede marcar, GitHub aún está preparando el candado: vuelve en una hora.

> ⚠️ **Al guardar el dominio, GitHub añade un fichero llamado `CNAME` a tu repositorio.** Antes de
> volver a subir cambios desde tu ordenador, tráete ese fichero:
> - **GitHub Desktop:** pulsa **Fetch origin** y después **Pull origin**.
> - **Terminal:** `git pull`
>
> Si no lo haces, al subir te aparecerá un error de «rejected». No se rompe nada: haz el *pull* y
> vuelve a subir.

### Paso 5 — Un último ajuste en tu web (¡no te lo saltes!)

Con la dirección `github.io`, la web averigua sola dónde están tus fotos. **Con tu dominio no puede
adivinarlo**, así que hay que decírselo. En `assets/js/config.js`:

```js
github: {
  owner: "TU-USUARIO",              ← tu usuario de GitHub
  repo: "portfolio-fotografia",     ← el nombre del repositorio
  branch: "main",
},
```

Guarda, revisa con `./scripts/check.sh` y súbelo (capítulo 11).

### Comprueba que todo está bien

- [ ] `https://tunombre.com` abre tu porfolio, con el candado 🔒.
- [ ] `https://www.tunombre.com` también.
- [ ] La dirección antigua `TU-USUARIO.github.io/portfolio-fotografia` te lleva a la nueva.
- [ ] Las categorías muestran sus fotos y vídeos.

---

## 11. El día a día: añadir trabajo nuevo

Una vez montado, publicar un trabajo nuevo son **cinco minutos**:

1. 📂 **Copia** las fotos exportadas a su carpeta dentro de `photos/` (o crea una categoría nueva).
2. 🎬 Si hay vídeo, súbelo a YouTube como **Oculto** y añádelo al `videos.json` de la categoría.
3. ⚙️ **Optimiza:** `./scripts/optimize.sh`
4. 👀 **Mira cómo queda:** `./scripts/dev.sh` → http://localhost:8000 (y `Ctrl + C` para cerrar)
5. ✅ **Revisa:** `./scripts/check.sh` → tiene que decir **Listo para subir**.
6. 🚀 **Sube:**
   - **GitHub Desktop:** abajo a la izquierda escribe un resumen (por ejemplo, «Boda Lucía y
     Pablo»), pulsa **Commit to main** y después **Push origin**.
   - **Terminal:**
     ```bash
     git add -A && git commit -m "Boda Lucía y Pablo" && git push
     ```

En uno o dos minutos estará en internet. Las personas que ya hubieran visitado tu web verán lo
nuevo en un máximo de 15 minutos.

---

## 12. Si algo no funciona

| Lo que pasa | Por qué | Solución |
|---|---|---|
| La terminal dice `permission denied` al ejecutar un script | El fichero perdió el permiso para ejecutarse | `chmod +x scripts/*.sh` |
| La terminal dice `command not found: python3` (Mac) | Faltan las herramientas de Apple | Escribe `xcode-select --install` y acepta |
| `No se encuentra ni 'sips' ni ImageMagick` (Windows) | Falta ImageMagick | `sudo apt install imagemagick` |
| `Address already in use` al abrir la vista previa | Ya hay otra vista previa abierta | Ciérrala con `Ctrl + C` o usa `PORT=9000 ./scripts/dev.sh` |
| Una foto no aparece en la web | Nombre con mayúsculas, espacios o tildes | `./scripts/check.sh` te dice cuál; renómbrala |
| Una categoría no aparece | No tiene fotos ni vídeos | Añade al menos una foto |
| Un vídeo no se ve | Está en «Privado» o no permite insertarse | En YouTube Studio: visibilidad **Oculto** y **Permitir insertar** activado |
| La web dice «No se ha podido cargar el porfolio» | `config.js` tiene mal el usuario o el repositorio | Revisa `owner` y `repo` (capítulo 10, paso 5) |
| Has editado `config.js` y la web sale en blanco | Falta una coma o unas comillas | Deshaz el último cambio (`Cmd ⌘ + Z`) y vuelve a intentarlo con cuidado |
| Al subir sale `rejected` | GitHub tiene un cambio que tú no tienes (el `CNAME`) | **Pull origin** en GitHub Desktop, o `git pull` |
| El dominio no carga | Los DNS aún no se han propagado | Espera unas horas; revisa la tabla del capítulo 10 |
| No puedo marcar «Enforce HTTPS» | El candado aún se está preparando, o la nube de Cloudflare está naranja | Pon la nube **gris** y espera una hora |
| Las fotos tardan mucho en cargar | Fotos sin optimizar | `./scripts/optimize.sh` y vuelve a subir |

> 💡 **Para pedir ayuda**, abre la web, pulsa `Cmd ⌥ J` (Mac) o `F12` (Windows) y haz una captura
> de lo que salga en rojo. Junto con lo que diga `./scripts/check.sh`, es todo lo que un técnico
> necesita para ayudarte.

---

## 13. Pequeño diccionario

| Palabra | En cristiano |
|---|---|
| **Repositorio (repo)** | Una carpeta guardada en GitHub que recuerda todos sus cambios |
| **Commit** | Una «foto» del estado de tu proyecto en un momento dado, con una nota de qué cambiaste |
| **Push** | Enviar tus *commits* desde tu ordenador a GitHub |
| **Pull** | Traer a tu ordenador los cambios que haya en GitHub |
| **GitHub Pages** | El servicio gratuito de GitHub que convierte tu repositorio en una web |
| **Dominio** | Tu dirección en internet: `tunombre.com` |
| **DNS** | La «guía telefónica» de internet que traduce tu dominio a la dirección de un servidor |
| **HTTPS / certificado** | El candado 🔒 que indica que la conexión con la web es segura |
| **Terminal** | La ventana donde se escriben órdenes en lugar de hacer clic |
| **localhost** | «Este ordenador». La vista previa que solo ves tú |
| **Miniatura (thumb)** | Versión pequeña de una foto para que la galería cargue rápido |
| **JSON** | El formato de los ficheros `info.json` y `videos.json`: texto con llaves `{ }`, corchetes `[ ]` y comillas |
| **sRGB** | El espacio de color estándar de internet; exporta siempre en él |

---

<p align="center"><em>Hecho con cariño para que tu trabajo luzca como merece. 📷</em></p>
