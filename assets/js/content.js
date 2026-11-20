// ============================================================================
//  Proveedor de contenido: descubre categorías y fotos listando el repositorio.
//
//  Orden de resolución:
//    1. Caché del navegador (localStorage) si no ha caducado.
//    2. API de GitHub: GET /repos/{owner}/{repo}/git/trees/{branch}?recursive=1
//       (una sola petición devuelve todo el árbol del repo).
//       En local se usa el simulador del servidor de desarrollo, que responde
//       con el mismo formato JSON.
//    3. Caché caducada, si la hay (p. ej. límite de la API superado).
//    4. manifest.json generado por scripts/check.sh (mismo formato que la API).
// ============================================================================
import { config } from "./config.js";

const IMAGE_EXT = /\.(jpe?g|png|webp|avif|gif)$/i;
const THUMBS_DIR = "thumbs";
const CACHE_KEY = "portfolio:tree:v1";

// Raíz del sitio, válida tanto en usuario.github.io como en usuario.github.io/repo/
export const siteRoot = new URL("../../", import.meta.url);
export const url = (path) => new URL(path, siteRoot).href;

export const isDev = ["localhost", "127.0.0.1", "[::1]"].includes(location.hostname);

export function repoInfo() {
  const info = { ...config.github };
  const host = location.hostname;
  if (host.endsWith(".github.io")) {
    info.owner = host.split(".")[0];
    const firstSegment = siteRoot.pathname.split("/").filter(Boolean)[0];
    info.repo = firstSegment || host;
  }
  return info;
}

function apiBase() {
  return isDev ? `${location.origin}/__dev/github` : "https://api.github.com";
}

function readCache() {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function writeCache(tree) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ at: Date.now(), tree }));
  } catch {
    /* almacenamiento no disponible: seguimos sin caché */
  }
}

async function fetchJson(href) {
  const res = await fetch(href, { headers: { Accept: "application/vnd.github+json" } });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText} — ${href}`);
  return res.json();
}

async function loadTree() {
  const cached = readCache();
  const ttl = config.cacheMinutes * 60 * 1000;
  // En local no cacheamos: así ves al instante las fotos que añades.
  if (!isDev && cached && Date.now() - cached.at < ttl) return cached.tree;

  const { owner, repo, branch } = repoInfo();
  try {
    const data = await fetchJson(
      `${apiBase()}/repos/${owner}/${repo}/git/trees/${encodeURIComponent(branch)}?recursive=1`
    );
    writeCache(data.tree);
    return data.tree;
  } catch (err) {
    console.warn("[portfolio] API de GitHub no disponible:", err.message);
    if (cached) return cached.tree;
    const manifest = await fetchJson(url("manifest.json"));
    console.info("[portfolio] Usando manifest.json como respaldo");
    return manifest.tree;
  }
}

// "02-bodas-y-eventos" -> { order: 2, slug: "bodas-y-eventos", title: "Bodas y eventos" }
function parseName(name) {
  const m = name.match(/^(\d+)[-_ ]+(.*)$/);
  const order = m ? Number(m[1]) : Infinity;
  const slug = (m ? m[2] : name).toLowerCase();
  const words = slug.replace(/[-_]+/g, " ").trim();
  return { order, slug, title: words.charAt(0).toUpperCase() + words.slice(1) };
}

const stem = (file) => file.replace(/\.[^.]+$/, "");

async function loadJson(folder, file, fallback) {
  try {
    return await fetchJson(url(`${config.photosDir}/${folder}/${file}`));
  } catch (err) {
    console.warn(`[portfolio] ${folder}/${file}:`, err.message);
    return fallback;
  }
}

const YT_ID = /^[\w-]{11}$/;

/** Acepta un ID o cualquier URL de YouTube (watch, youtu.be, shorts, embed, live). */
export function youtubeId(value) {
  const v = String(value ?? "").trim();
  if (YT_ID.test(v)) return v;
  try {
    const u = new URL(v);
    const id = u.hostname.endsWith("youtu.be")
      ? u.pathname.slice(1)
      : u.searchParams.get("v") ?? u.pathname.match(/\/(?:embed|shorts|live)\/([\w-]+)/)?.[1];
    return YT_ID.test(id ?? "") ? id : null;
  } catch {
    return null;
  }
}

// videos.json: [{ "youtube": "<id o url>", "title": "...", "after": "03-foto.jpg", "poster": "05-foto.jpg" }]
function parseVideos(list, folder, photos) {
  if (!Array.isArray(list)) {
    console.warn(`[portfolio] ${folder}/videos.json debe ser una lista [ … ]`);
    return [];
  }
  return list.flatMap((v) => {
    const id = youtubeId(v?.youtube);
    if (!id) {
      console.warn(`[portfolio] ${folder}/videos.json: vídeo no válido`, v);
      return [];
    }
    const title = v.title || "Vídeo";
    const poster = v.poster && photos.find((p) => p.file === v.poster);
    return [{
      type: "youtube",
      id,
      title,
      after: v.after ?? null,
      thumb: poster ? poster.thumb : `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
      alt: title,
      caption: title,
    }];
  });
}

// Coloca cada vídeo tras la foto indicada en "after" (o al final si no se indica).
function mergeMedia(photos, videos) {
  const items = [...photos];
  for (const v of videos) {
    let i = v.after ? items.findIndex((p) => p.file === v.after) : -1;
    if (i === -1) {
      items.push(v);
      continue;
    }
    while (items[i + 1]?.type === "youtube" && items[i + 1].after === v.after) i++;
    items.splice(i + 1, 0, v);
  }
  return items;
}

let categoriesPromise;

/** Devuelve las categorías ordenadas, cada una con sus fotos. */
export function getCategories() {
  categoriesPromise ??= (async () => {
    const tree = await loadTree();
    const prefix = `${config.photosDir}/`;
    const folders = new Map();

    for (const node of tree) {
      if (node.type !== "blob" || !node.path.startsWith(prefix)) continue;
      const parts = node.path.slice(prefix.length).split("/");
      const [folder] = parts;
      if (parts.length < 2) continue;
      if (!folders.has(folder)) folders.set(folder, { images: [], thumbs: new Map(), hasInfo: false, hasVideos: false });
      const entry = folders.get(folder);

      if (parts.length === 2 && IMAGE_EXT.test(parts[1])) {
        entry.images.push({ file: parts[1], path: node.path, size: node.size });
      } else if (parts.length === 3 && parts[1] === THUMBS_DIR && IMAGE_EXT.test(parts[2])) {
        entry.thumbs.set(stem(parts[2]), node.path);
      } else if (parts.length === 2 && parts[1] === "info.json") {
        entry.hasInfo = true;
      } else if (parts.length === 2 && parts[1] === "videos.json") {
        entry.hasVideos = true;
      }
    }

    const categories = await Promise.all(
      [...folders].map(async ([folder, entry]) => {
        const [info, videoList] = await Promise.all([
          entry.hasInfo ? loadJson(folder, "info.json", {}) : {},
          entry.hasVideos ? loadJson(folder, "videos.json", []) : [],
        ]);
        const parsed = parseName(folder);
        const captions = info.captions ?? {};
        const photos = entry.images
          .sort((a, b) => a.file.localeCompare(b.file, undefined, { numeric: true }))
          .map((img, i) => ({
            type: "image",
            file: img.file,
            src: url(img.path),
            thumb: url(entry.thumbs.get(stem(img.file)) ?? img.path),
            caption: captions[img.file] ?? "",
            alt: captions[img.file] || `${info.title ?? parsed.title} — fotografía ${i + 1}`,
          }));
        const videos = parseVideos(videoList, folder, photos);
        const cover = photos.find((p) => p.file === info.cover) ?? photos[0] ?? videos[0];
        return {
          folder,
          slug: parsed.slug,
          order: parsed.order,
          title: info.title ?? parsed.title,
          description: info.description ?? "",
          cover,
          photos,
          videos,
          items: mergeMedia(photos, videos),
        };
      })
    );

    return categories
      .filter((c) => c.items.length > 0)
      .sort((a, b) => a.order - b.order || a.title.localeCompare(b.title));
  })();
  return categoriesPromise;
}
