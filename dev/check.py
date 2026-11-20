#!/usr/bin/env python3
"""Comprobaciones antes de subir a GitHub + generación de manifest.json.

Sale con código 1 si hay errores (bloqueantes); los avisos no bloquean.
"""
import argparse
import json
import re
import sys
import urllib.error
import urllib.request
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import parse_qs, quote, unquote, urlsplit

sys.dont_write_bytecode = True
from repo_tree import ROOT, build_tree  # noqa: E402

IMAGE_EXT = {".jpg", ".jpeg", ".png", ".webp", ".avif", ".gif"}
WARN_IMAGE_MB = 1.5      # más pesado → carga lenta en móvil
MAX_FILE_MB = 100        # límite duro de GitHub por fichero
MAX_SITE_MB = 1000       # límite de GitHub Pages por sitio
SAFE_NAME = re.compile(r"^[a-z0-9][a-z0-9._-]*$")
YT_ID = re.compile(r"^[\w-]{11}$")

errors, warnings = [], []
err = errors.append
warn = warnings.append
rel = lambda p: p.relative_to(ROOT).as_posix()


def read_config():
    text = (ROOT / "assets/js/config.js").read_text(encoding="utf-8")
    get = lambda key: (m.group(1) if (m := re.search(rf'{key}:\s*"([^"]*)"', text)) else None)
    return {k: get(k) for k in ("owner", "repo", "branch", "photosDir", "email", "formspreeId", "image")}


def check_config(cfg):
    if cfg["owner"] in (None, "", "tu-usuario"):
        warn("config.js: 'github.owner' sigue con el valor de ejemplo (en *.github.io se detecta solo, con dominio propio es obligatorio)")
    if cfg["email"] and cfg["email"].endswith("something.photo"):
        warn("config.js: 'contact.email' sigue con el valor de ejemplo")
    if not cfg["formspreeId"]:
        warn("config.js: sin 'formspreeId' el formulario abrirá el cliente de correo del visitante (mailto)")
    if cfg["image"] and not (ROOT / cfg["image"]).is_file():
        err(f"config.js: la imagen de 'Sobre mí' no existe: {cfg['image']}")


def youtube_id(value):
    """Misma lógica que youtubeId() en content.js."""
    v = str(value or "").strip()
    if YT_ID.match(v):
        return v
    u = urlsplit(v)
    if not u.scheme:
        return None
    if u.hostname and u.hostname.endswith("youtu.be"):
        vid = u.path[1:]
    else:
        vid = parse_qs(u.query).get("v", [None])[0]
        if not vid and (m := re.search(r"/(?:embed|shorts|live)/([\w-]+)", u.path)):
            vid = m.group(1)
    return vid if vid and YT_ID.match(vid) else None


def youtube_status(vid):
    """Consulta el oEmbed público de YouTube: dice si el vídeo existe y se puede insertar."""
    url = "https://www.youtube.com/oembed?format=json&url=" + quote(f"https://www.youtube.com/watch?v={vid}", safe="")
    try:
        with urllib.request.urlopen(url, timeout=6) as r:
            return "ok", json.load(r).get("title", "")
    except urllib.error.HTTPError as e:
        return {401: "no_embed", 403: "no_embed"}.get(e.code, "missing"), ""
    except (urllib.error.URLError, TimeoutError):
        return "offline", ""


def check_videos(folder, image_names, online):
    """Valida <categoría>/videos.json. Devuelve el número de vídeos válidos."""
    path = folder / "videos.json"
    if not path.exists():
        return 0
    try:
        videos = json.loads(path.read_text(encoding="utf-8"))
    except json.JSONDecodeError as e:
        err(f"{rel(path)}: JSON inválido ({e})")
        return 0
    if not isinstance(videos, list):
        err(f"{rel(path)}: debe ser una lista: [ {{ \"youtube\": \"…\", \"title\": \"…\" }} ]")
        return 0
    valid, offline = 0, False
    for n, v in enumerate(videos, 1):
        where = f"{rel(path)} (vídeo {n})"
        vid = youtube_id(v.get("youtube")) if isinstance(v, dict) else None
        if not vid:
            err(f"{where}: 'youtube' debe ser un ID de 11 caracteres o una URL de YouTube")
            continue
        for key in ("after", "poster"):
            if v.get(key) and v[key] not in image_names:
                err(f"{where}: '{key}' apunta a '{v[key]}', que no es una foto de esta categoría")
        if not v.get("title"):
            warn(f"{where}: sin 'title' se mostrará como «Vídeo»")
        if online and not offline:
            status, _ = youtube_status(vid)
            if status == "missing":
                err(f"{where}: el vídeo {vid} no existe o es privado (usa «Oculto», no «Privado»)")
            elif status == "no_embed":
                err(f"{where}: el vídeo {vid} no permite insertarse; actívalo en YouTube Studio → Permitir insertar")
            elif status == "offline":
                offline = True
                warn(f"{rel(path)}: sin conexión, no se ha podido verificar en YouTube")
        valid += 1
    return valid


def check_photos(photos_dir, online):
    base = ROOT / photos_dir
    if not base.is_dir():
        err(f"No existe la carpeta '{photos_dir}/'")
        return 0
    categories = 0
    for folder in sorted(p for p in base.iterdir() if p.is_dir() and not p.name.startswith(".")):
        images = [f for f in folder.iterdir() if f.suffix.lower() in IMAGE_EXT]
        n_videos = check_videos(folder, {f.name for f in images}, online)
        if not images and not n_videos:
            warn(f"{rel(folder)}/: no tiene fotos ni vídeos, no aparecerá en la web")
            continue
        categories += 1
        if not SAFE_NAME.match(folder.name):
            warn(f"{rel(folder)}/: usa minúsculas, números y guiones (sin espacios ni tildes) para URLs limpias")
        thumbs = folder / "thumbs"
        thumb_stems = {t.stem for t in thumbs.iterdir()} if thumbs.is_dir() else set()
        missing_thumbs = 0
        for img in images:
            mb = img.stat().st_size / 1e6
            if not SAFE_NAME.match(img.name):
                warn(f"{rel(img)}: nombre con espacios, tildes o mayúsculas (GitHub Pages distingue mayúsculas)")
            if mb > MAX_FILE_MB:
                err(f"{rel(img)}: {mb:.0f} MB supera el límite de GitHub ({MAX_FILE_MB} MB)")
            elif mb > WARN_IMAGE_MB:
                warn(f"{rel(img)}: {mb:.1f} MB — ejecuta ./scripts/optimize.sh para reducirla")
            if img.stem not in thumb_stems:
                missing_thumbs += 1
        if missing_thumbs:
            warn(f"{rel(folder)}/: {missing_thumbs} foto(s) sin miniatura (la galería cargará el original) — ./scripts/optimize.sh")
        info = folder / "info.json"
        if info.exists():
            try:
                data = json.loads(info.read_text(encoding="utf-8"))
                if data.get("cover") and not (folder / data["cover"]).is_file():
                    err(f"{rel(info)}: la portada '{data['cover']}' no existe")
            except json.JSONDecodeError as e:
                err(f"{rel(info)}: JSON inválido ({e})")
    if not categories:
        err(f"'{photos_dir}/' no contiene ninguna categoría con fotos o vídeos")
    return categories


class RefParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.refs = []

    def handle_starttag(self, tag, attrs):
        for name, value in attrs:
            if name in ("href", "src") and value:
                self.refs.append(value)


def exact_case(path: Path):
    current = ROOT
    for part in path.relative_to(ROOT).parts:
        if part not in {p.name for p in current.iterdir()}:
            return False
        current = current / part
    return True


def check_html():
    for page in sorted(ROOT.glob("*.html")):
        parser = RefParser()
        parser.feed(page.read_text(encoding="utf-8"))
        for ref in parser.refs:
            u = urlsplit(ref)
            if u.scheme or ref.startswith(("#", "mailto:", "tel:", "//")):
                continue
            if ref.startswith("/"):
                if page.name != "404.html":
                    err(f"{page.name}: ruta absoluta '{ref}' — en una página de proyecto (usuario.github.io/repo/) se rompe; usa rutas relativas")
                continue
            target = (ROOT / unquote(u.path)).resolve()
            if not target.exists():
                err(f"{page.name}: enlace roto '{ref}'")
            elif not exact_case(target):
                err(f"{page.name}: '{ref}' no coincide en mayúsculas/minúsculas con el fichero real")


def main():
    ap = argparse.ArgumentParser(description="Comprobaciones antes de subir a GitHub")
    ap.add_argument("--offline", action="store_true", help="no verifica los vídeos en YouTube")
    args = ap.parse_args()
    cfg = read_config()
    photos_dir = cfg["photosDir"] or "photos"

    if not (ROOT / ".nojekyll").exists():
        err("Falta el fichero .nojekyll (sin él GitHub Pages procesa el sitio con Jekyll)")
    check_config(cfg)
    n_categories = check_photos(photos_dir, online=not args.offline)
    check_html()

    tree = build_tree()
    total_mb = sum(n.get("size", 0) for n in tree["tree"]) / 1e6
    if total_mb > MAX_SITE_MB:
        err(f"El sitio ocupa {total_mb:.0f} MB; GitHub Pages admite hasta {MAX_SITE_MB} MB")
    elif total_mb > MAX_SITE_MB * 0.7:
        warn(f"El sitio ocupa {total_mb:.0f} MB, cerca del límite de {MAX_SITE_MB} MB")

    # manifest.json: respaldo si la API de GitHub no responde (mismo formato)
    manifest = {"generated": "scripts/check.sh", "tree": [n for n in tree["tree"] if n["path"].startswith(f"{photos_dir}/")]}
    (ROOT / "manifest.json").write_text(json.dumps(manifest, indent=1) + "\n", encoding="utf-8")

    print(f"\n  {n_categories} categorías · {sum(1 for n in manifest['tree'] if n['type'] == 'blob')} ficheros en {photos_dir}/ · {total_mb:.1f} MB en total")
    print("  manifest.json actualizado\n")
    for w in warnings:
        print(f"  \033[33m⚠\033[0m  {w}")
    for e in errors:
        print(f"  \033[31m✖\033[0m  {e}")
    if errors:
        print(f"\n  \033[31m{len(errors)} error(es): corrígelos antes de subir.\033[0m\n")
        sys.exit(1)
    print(f"\n  \033[32m✔ Listo para subir\033[0m{f' ({len(warnings)} aviso(s))' if warnings else ''}\n")


if __name__ == "__main__":
    main()
