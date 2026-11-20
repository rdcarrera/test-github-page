// Cabecera, pie y comportamientos comunes a todas las páginas.
import { config } from "./config.js";
import { url } from "./content.js";

export const escapeHtml = (s) =>
  String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

function header(active) {
  const link = (href, label, key) =>
    `<a href="${url(href)}" ${active === key ? 'aria-current="page"' : ""}>${label}</a>`;
  return `
    <a class="brand" href="${url("index.html")}">
      <span class="brand__name">${escapeHtml(config.name)}</span>
      <span class="brand__role">${escapeHtml(config.role)}</span>
    </a>
    <button class="nav-toggle" aria-label="Abrir menú" aria-expanded="false" aria-controls="site-nav">
      <span></span><span></span>
    </button>
    <nav id="site-nav" class="site-nav">
      ${link("index.html#trabajo", "Trabajo", "work")}
      ${link("index.html#sobre-mi", "Sobre mí", "about")}
      ${link("contacto.html", "Contacto", "contact")}
    </nav>`;
}

function footer() {
  const year = new Date().getFullYear();
  const socials = config.social
    .map((s) => `<a href="${escapeHtml(s.url)}" target="_blank" rel="noopener">${escapeHtml(s.label)}</a>`)
    .join("");
  return `
    <div class="footer__cta">
      <p class="eyebrow">¿Tienes un proyecto en mente?</p>
      <a class="footer__big" href="${url("contacto.html")}">Hablemos<span aria-hidden="true">→</span></a>
    </div>
    <div class="footer__bar">
      <span>© ${year} ${escapeHtml(config.name)}</span>
      <span class="footer__social">${socials}</span>
      <a href="mailto:${escapeHtml(config.contact.email)}">${escapeHtml(config.contact.email)}</a>
    </div>`;
}

function setupNav(headerEl) {
  const toggle = headerEl.querySelector(".nav-toggle");
  toggle.addEventListener("click", () => {
    const open = document.body.classList.toggle("nav-open");
    toggle.setAttribute("aria-expanded", String(open));
  });
  headerEl.querySelectorAll(".site-nav a").forEach((a) =>
    a.addEventListener("click", () => document.body.classList.remove("nav-open"))
  );
  const onScroll = () => headerEl.classList.toggle("is-scrolled", window.scrollY > 40);
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
}

// Animación de entrada al hacer scroll: muestra los [data-reveal] que entran en pantalla.
let pending = [];
let ticking = false;

function checkReveal() {
  ticking = false;
  const limit = window.innerHeight * 0.94;
  pending = pending.filter((el) => {
    const r = el.getBoundingClientRect();
    if (r.top < limit && r.bottom > 0) {
      el.classList.add("is-visible");
      return false;
    }
    return true;
  });
}

function scheduleReveal() {
  if (!ticking) {
    ticking = true;
    requestAnimationFrame(checkReveal);
  }
}
window.addEventListener("scroll", scheduleReveal, { passive: true });
window.addEventListener("resize", scheduleReveal);

/** Anima la entrada de los elementos [data-reveal] dentro de root. */
export function reveal(root = document) {
  pending.push(...root.querySelectorAll("[data-reveal]:not(.is-visible)"));
  checkReveal();
}

/** Monta cabecera y pie. `active`: work | about | contact */
export function mountLayout(active) {
  const headerEl = document.querySelector(".site-header");
  const footerEl = document.querySelector(".site-footer");
  headerEl.innerHTML = header(active);
  footerEl.innerHTML = footer();
  setupNav(headerEl);
  reveal();
}

const plural = (n, one, many) => `${n} ${n === 1 ? one : many}`;

/** "7 fotografías · 2 vídeos" */
export function countLabel(cat) {
  return [
    cat.photos.length && plural(cat.photos.length, "fotografía", "fotografías"),
    cat.videos.length && plural(cat.videos.length, "vídeo", "vídeos"),
  ]
    .filter(Boolean)
    .join(" · ");
}

export function setTitle(...parts) {
  document.title = [...parts, config.name].filter(Boolean).join(" · ");
}

export function showError(container, err) {
  console.error(err);
  container.innerHTML = `
    <div class="notice">
      <p><strong>No se ha podido cargar el porfolio.</strong></p>
      <p>Revisa <code>assets/js/config.js</code> (usuario, repositorio y rama) y que exista la carpeta <code>${escapeHtml(config.photosDir)}/</code>.</p>
      <p class="notice__detail">${escapeHtml(err.message)}</p>
    </div>`;
}
