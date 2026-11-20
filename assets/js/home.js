import { config } from "./config.js";
import { getCategories, url } from "./content.js";
import { mountLayout, reveal, escapeHtml, setTitle, showError, countLabel } from "./layout.js";

mountLayout("work");
setTitle(config.role);

const hero = document.querySelector(".hero");
const grid = document.querySelector(".categories");
const about = document.querySelector(".about");

hero.querySelector(".hero__title").textContent = config.name;
hero.querySelector(".hero__tagline").textContent = config.tagline;
hero.querySelector(".hero__location").textContent = config.location;

renderAbout();

try {
  const categories = await getCategories();
  renderHero(categories);
  renderCategories(categories);
} catch (err) {
  showError(grid, err);
}

function renderHero(categories) {
  const slides = categories.map((c) => c.cover).filter((s) => s?.type === "image");
  const stage = hero.querySelector(".hero__slides");
  stage.innerHTML = slides
    .map((s, i) => `<img src="${s.src}" alt="" class="${i === 0 ? "is-active" : ""}" ${i ? 'loading="lazy"' : 'fetchpriority="high"'}>`)
    .join("");
  hero.querySelector(".hero__meta").textContent = categories.map((c) => c.title).join("  ·  ");

  const imgs = stage.querySelectorAll("img");
  if (imgs.length < 2 || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  let i = 0;
  setInterval(() => {
    imgs[i].classList.remove("is-active");
    i = (i + 1) % imgs.length;
    imgs[i].classList.add("is-active");
  }, 6000);
}

function renderCategories(categories) {
  if (!categories.length) {
    grid.innerHTML = `<p class="notice">Aún no hay fotos. Crea una carpeta dentro de <code>${escapeHtml(config.photosDir)}/</code> por cada categoría.</p>`;
    return;
  }
  grid.innerHTML = categories
    .map(
      (c, i) => `
      <a class="category-card" href="${url(`categoria.html?c=${encodeURIComponent(c.slug)}`)}" data-reveal>
        <figure class="category-card__media">
          <img src="${c.cover.thumb}" alt="${escapeHtml(c.cover.alt)}" loading="lazy">
        </figure>
        <div class="category-card__body">
          <span class="category-card__index">${String(i + 1).padStart(2, "0")}</span>
          <h3 class="category-card__title">${escapeHtml(c.title)}</h3>
          <span class="category-card__count">${countLabel(c)}</span>
        </div>
      </a>`
    )
    .join("");
  reveal(grid);
}

function renderAbout() {
  const a = config.about;
  about.querySelector(".about__media img").src = url(a.image);
  about.querySelector(".about__media img").alt = `Retrato de ${config.name}`;
  about.querySelector(".about__text").innerHTML = a.text.map((p) => `<p>${escapeHtml(p)}</p>`).join("");
  about.querySelector(".stats").innerHTML = a.stats
    .map((s) => `<div><dt>${escapeHtml(s.label)}</dt><dd>${escapeHtml(s.value)}</dd></div>`)
    .join("");
}
