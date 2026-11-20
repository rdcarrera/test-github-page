#!/usr/bin/env python3
"""Servidor de desarrollo que simula GitHub Pages + API de GitHub + Formspree.

  · Sirve el sitio bajo la misma ruta base que tendrá en GitHub Pages
    (p. ej. /portfolio-fotografia/ en usuario.github.io/portfolio-fotografia/).
  · Distingue mayúsculas/minúsculas en las rutas, como GitHub Pages
    (macOS no lo hace: 'Foto.JPG' ≠ 'foto.jpg' fallaría en producción).
  · Devuelve 404.html en rutas inexistentes, como GitHub Pages.
  · /__dev/github/...  responde igual que api.github.com con los ficheros locales.
  · /__dev/formspree/  recibe el formulario de contacto y lo imprime aquí.
"""
import argparse
import json
import mimetypes
import sys
import time
from http import HTTPStatus
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import unquote, urlsplit

sys.dont_write_bytecode = True
from repo_tree import ROOT, build_tree  # noqa: E402

mimetypes.add_type("text/javascript", ".js")
mimetypes.add_type("image/webp", ".webp")
mimetypes.add_type("image/avif", ".avif")

C = {"dim": "\033[2m", "red": "\033[31m", "green": "\033[32m", "yellow": "\033[33m", "cyan": "\033[36m", "bold": "\033[1m", "off": "\033[0m"}


def color(name, text):
    return f"{C[name]}{text}{C['off']}" if sys.stdout.isatty() else text


def exact_case_exists(path: Path) -> bool:
    """True si la ruta existe con exactamente esas mayúsculas/minúsculas."""
    try:
        rel = path.relative_to(ROOT)
    except ValueError:
        return False
    current = ROOT
    for part in rel.parts:
        if not current.is_dir() or part not in {p.name for p in current.iterdir()}:
            return False
        current = current / part
    return True


class Handler(BaseHTTPRequestHandler):
    server_version = "GitHubPagesSimulator/1.0"
    opts: argparse.Namespace

    def log_message(self, fmt, *args):
        pass  # usamos nuestro propio log

    def log(self, status, note=""):
        c = "green" if status < 300 else "cyan" if status < 400 else "yellow" if status < 500 else "red"
        print(f"{color('dim', time.strftime('%H:%M:%S'))} {color(c, status)} {self.command} {unquote(self.path)} {note}", flush=True)

    # --- respuestas ---------------------------------------------------------
    def send(self, status, body=b"", ctype="text/plain; charset=utf-8", headers=None, note=""):
        self.send_response(status)
        self.send_header("Content-Type", ctype)
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", "no-store")
        for k, v in (headers or {}).items():
            self.send_header(k, v)
        self.end_headers()
        if self.command != "HEAD":
            self.wfile.write(body)
        self.log(status, note)

    def send_json(self, status, data, headers=None, note=""):
        self.send(status, json.dumps(data, indent=2).encode(), "application/json; charset=utf-8", headers, note)

    def not_found(self, note=""):
        page = ROOT / "404.html"
        body = page.read_bytes() if page.exists() else b"404"
        self.send(404, body, "text/html; charset=utf-8", note=note)

    # --- rutas --------------------------------------------------------------
    def do_HEAD(self):
        self.do_GET()

    def do_GET(self):
        path = unquote(urlsplit(self.path).path)
        if self.opts.latency:
            time.sleep(self.opts.latency / 1000)
        if path.startswith("/__dev/github/"):
            return self.github_api(path)
        base = self.opts.base
        if path == "/" and base != "/":
            return self.send(302, headers={"Location": base}, note=f"→ {base}")
        if not path.startswith(base):
            return self.not_found(color("dim", f"(fuera de la ruta base {base})"))
        return self.static(path[len(base):])

    def do_POST(self):
        path = urlsplit(self.path).path
        if path.startswith("/__dev/formspree/"):
            return self.formspree(path.rsplit("/", 1)[-1])
        self.send(405, b"Method Not Allowed")

    def static(self, rel):
        target = (ROOT / rel).resolve()
        if ROOT not in target.parents and target != ROOT:
            return self.not_found()
        if target.is_dir():
            if rel and not rel.endswith("/"):
                return self.send(301, headers={"Location": self.opts.base + rel + "/"})
            target = target / "index.html"
        rel_parts = target.relative_to(ROOT).parts if target != ROOT else ()
        if rel_parts[:1] == (".git",):
            return self.not_found()
        if not target.is_file():
            return self.not_found()
        if not exact_case_exists(target):
            return self.not_found(color("red", "⚠ mayúsculas/minúsculas no coinciden: en GitHub Pages esto daría 404"))
        ctype = mimetypes.guess_type(target.name)[0] or "application/octet-stream"
        if ctype.startswith("text/") or ctype.endswith("json"):
            ctype += "; charset=utf-8"
        self.send(200, target.read_bytes(), ctype)

    def github_api(self, path):
        # /__dev/github/repos/{owner}/{repo}/git/trees/{branch}
        parts = path.strip("/").split("/")
        if len(parts) < 8 or parts[2] != "repos" or parts[5:7] != ["git", "trees"]:
            return self.send_json(404, {"message": "Not Found"})
        if self.opts.rate_limit:
            return self.send_json(
                403,
                {"message": "API rate limit exceeded (simulado)", "documentation_url": "https://docs.github.com/rest/overview/resources-in-the-rest-api#rate-limiting"},
                {"X-RateLimit-Remaining": "0"},
                note=color("yellow", "(límite de API simulado → la web debe usar caché o manifest.json)"),
            )
        tree = build_tree()
        photos = sum(1 for n in tree["tree"] if n["type"] == "blob" and n["path"].startswith("photos/"))
        self.send_json(200, tree, {"X-RateLimit-Remaining": "59"}, note=color("dim", f"(API simulada: {len(tree['tree'])} entradas, {photos} en photos/)"))

    def formspree(self, form_id):
        length = int(self.headers.get("Content-Length", 0))
        try:
            data = json.loads(self.rfile.read(length) or b"{}")
        except json.JSONDecodeError:
            return self.send_json(400, {"error": "JSON inválido"})
        print(color("bold", "\n✉  Nuevo mensaje del formulario de contacto (simulado)"))
        for k, v in data.items():
            if not k.startswith("_"):
                print(f"   {color('cyan', k.ljust(8))} {v}")
        if form_id == "mailto":
            print(color("yellow", "   Nota: sin 'formspreeId' en config.js, en producción se abrirá el cliente de correo (mailto)."))
        print()
        self.send_json(200, {"ok": True, "next": "/thanks"})


def main():
    ap = argparse.ArgumentParser(description="Simulador local de GitHub Pages para el porfolio")
    ap.add_argument("--port", type=int, default=8000)
    ap.add_argument("--base", default="/", help="ruta base, p. ej. /portfolio-fotografia/ (página de proyecto)")
    ap.add_argument("--rate-limit", action="store_true", help="simula que la API de GitHub devuelve 403 (límite superado)")
    ap.add_argument("--latency", type=int, default=0, metavar="MS", help="añade latencia a cada petición (red lenta)")
    opts = ap.parse_args()
    opts.base = "/" + opts.base.strip("/") + "/" if opts.base.strip("/") else "/"
    Handler.opts = opts

    server = ThreadingHTTPServer(("127.0.0.1", opts.port), Handler)
    print(color("bold", "\n  Simulador de GitHub Pages en marcha"))
    print(f"  → {color('cyan', f'http://localhost:{opts.port}{opts.base}')}")
    print(color("dim", f"  raíz: {ROOT}"))
    if opts.rate_limit:
        print(color("yellow", "  modo: API de GitHub con límite superado"))
    if opts.latency:
        print(color("yellow", f"  modo: latencia de {opts.latency} ms"))
    print(color("dim", "  Ctrl+C para parar\n"))
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nServidor detenido.")


if __name__ == "__main__":
    main()
