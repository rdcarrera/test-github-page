"""Construye el árbol del repositorio con el mismo formato que la API de GitHub
(GET /repos/{owner}/{repo}/git/trees/{branch}?recursive=1).

Si el proyecto es un repo git, se usan los ficheros que git subiría
(versionados + nuevos no ignorados por .gitignore), igual que verá GitHub.
Si no, se recorre la carpeta ignorando ocultos y herramientas de desarrollo.
"""
import hashlib
import os
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SKIP_DIRS = {".git", "dev", "scripts", "node_modules", "__pycache__"}


def _git_files():
    try:
        out = subprocess.run(
            ["git", "ls-files", "--cached", "--others", "--exclude-standard", "-z"],
            cwd=ROOT, capture_output=True, check=True,
        ).stdout
    except (subprocess.CalledProcessError, FileNotFoundError):
        return None
    files = [f for f in out.decode().split("\0") if f]
    return [f for f in files if (ROOT / f).is_file()] or None


def _walk_files():
    files = []
    for dirpath, dirnames, filenames in os.walk(ROOT):
        rel_dir = Path(dirpath).relative_to(ROOT)
        dirnames[:] = sorted(d for d in dirnames if not d.startswith(".") and not (rel_dir == Path(".") and d in SKIP_DIRS))
        for name in sorted(filenames):
            if name.startswith(".") and name != ".nojekyll":
                continue
            files.append((rel_dir / name).as_posix())
    return files


def list_files():
    return _git_files() or _walk_files()


def build_tree():
    files = list_files()
    dirs = sorted({p for f in files for p in _parents(f)})
    tree = [{"path": d, "mode": "040000", "type": "tree", "sha": _sha(d)} for d in dirs]
    for f in files:
        tree.append({
            "path": f, "mode": "100644", "type": "blob",
            "sha": _sha(f), "size": (ROOT / f).stat().st_size,
        })
    tree.sort(key=lambda n: n["path"])
    return {"sha": _sha("root"), "url": "local://dev-server", "tree": tree, "truncated": False}


def _parents(path):
    parts = path.split("/")[:-1]
    return ["/".join(parts[: i + 1]) for i in range(len(parts))]


def _sha(text):
    return hashlib.sha1(text.encode()).hexdigest()
