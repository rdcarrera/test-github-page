// Visor a pantalla completa para fotos y vídeos de YouTube:
// teclado (← → Esc), gestos táctiles y precarga de las fotos vecinas.
import { escapeHtml } from "./layout.js";

export class Lightbox {
  constructor(items) {
    this.items = items;
    this.index = 0;
    this.el = document.createElement("div");
    this.el.className = "lightbox";
    this.el.setAttribute("role", "dialog");
    this.el.setAttribute("aria-modal", "true");
    this.el.setAttribute("aria-label", "Visor del porfolio");
    this.el.hidden = true;
    this.el.innerHTML = `
      <div class="lightbox__stage"><img class="lightbox__img" alt=""><div class="lightbox__video" hidden></div></div>
      <div class="lightbox__bar">
        <span class="lightbox__counter"></span>
        <span class="lightbox__caption"></span>
      </div>
      <button class="lightbox__btn lightbox__close" aria-label="Cerrar">✕</button>
      <button class="lightbox__btn lightbox__prev" aria-label="Anterior">←</button>
      <button class="lightbox__btn lightbox__next" aria-label="Siguiente">→</button>`;
    document.body.append(this.el);

    this.img = this.el.querySelector(".lightbox__img");
    this.video = this.el.querySelector(".lightbox__video");
    this.el.querySelector(".lightbox__close").onclick = () => this.close();
    this.el.querySelector(".lightbox__prev").onclick = () => this.go(-1);
    this.el.querySelector(".lightbox__next").onclick = () => this.go(1);
    this.el.addEventListener("click", (e) => {
      if (e.target === this.el || e.target.classList.contains("lightbox__stage")) this.close();
    });
    this.onKey = (e) => {
      if (e.key === "Escape") this.close();
      if (e.key === "ArrowLeft") this.go(-1);
      if (e.key === "ArrowRight") this.go(1);
    };

    let startX = null;
    this.el.addEventListener("touchstart", (e) => (startX = e.touches[0].clientX), { passive: true });
    this.el.addEventListener("touchend", (e) => {
      if (startX === null) return;
      const dx = e.changedTouches[0].clientX - startX;
      if (Math.abs(dx) > 50) this.go(dx > 0 ? -1 : 1);
      startX = null;
    });
  }

  open(index, opener) {
    this.opener = opener;
    this.el.hidden = false;
    document.body.classList.add("no-scroll");
    document.addEventListener("keydown", this.onKey);
    this.show(index);
    requestAnimationFrame(() => this.el.classList.add("is-open"));
    this.el.querySelector(".lightbox__close").focus();
  }

  close() {
    this.el.classList.remove("is-open");
    document.body.classList.remove("no-scroll");
    document.removeEventListener("keydown", this.onKey);
    this.video.innerHTML = ""; // detiene la reproducción
    setTimeout(() => (this.el.hidden = true), 250);
    this.opener?.focus();
  }

  go(step) {
    this.show((this.index + step + this.items.length) % this.items.length);
  }

  show(index) {
    this.index = index;
    const p = this.items[index];
    const isVideo = p.type === "youtube";
    this.img.hidden = isVideo;
    this.video.hidden = !isVideo;
    // Al cambiar de pieza se elimina el iframe, así no siguen sonando vídeos ocultos.
    this.video.innerHTML = isVideo
      ? `<iframe src="https://www.youtube-nocookie.com/embed/${p.id}?autoplay=1&rel=0&playsinline=1"
           title="${escapeHtml(p.title)}" allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
           referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>`
      : "";
    if (!isVideo) {
      this.img.classList.remove("is-loaded");
      this.img.onload = () => this.img.classList.add("is-loaded");
      this.img.src = p.src;
      this.img.alt = p.alt;
    }
    this.el.querySelector(".lightbox__counter").textContent = `${index + 1} / ${this.items.length}`;
    this.el.querySelector(".lightbox__caption").innerHTML = escapeHtml(p.caption);
    // Precarga de la foto siguiente y la anterior
    for (const d of [1, -1]) {
      const near = this.items[(index + d + this.items.length) % this.items.length];
      if (near.type === "image") new Image().src = near.src;
    }
  }
}
