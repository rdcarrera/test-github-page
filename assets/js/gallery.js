import { getCategories, url } from "./content.js";
import { mountLayout, reveal, escapeHtml, setTitle, showError, countLabel } from "./layout.js";
import { Lightbox } from "./lightbox.js";

mountLayout("work");

const head = document.querySelector(".gallery-head");
const grid = document.querySelector(".masonry");
const pager = document.querySelector(".category-pager");

try {
  const categories = await getCategories();
  const slug = new URLSearchParams(location.search).get("c");
  const index = categories.findIndex((c) => c.slug === slug);

  if (index === -1) {
    setTitle("Categoría no encontrada");
    head.querySelector("h1").textContent = "Categoría no encontrada";
    grid.innerHTML = `<p class="notice">Esta categoría no existe. <a href="${url("index.html#trabajo")}">Ver todo el trabajo</a></p>`;
  } else {
    render(categories, index);
  }
} catch (err) {
  showError(grid, err);
}

function render(categories, index) {
  const cat = categories[index];
  setTitle(cat.title);
  head.querySelector(".eyebrow").textContent = `${String(index + 1).padStart(2, "0")} / ${String(categories.length).padStart(2, "0")}`;
  head.querySelector("h1").textContent = cat.title;
  head.querySelector(".gallery-head__desc").textContent = cat.description;
  head.querySelector(".gallery-head__count").textContent = countLabel(cat);

  grid.innerHTML = cat.items
    .map((p, i) =>
      p.type === "youtube"
        ? `
      <button class="masonry__item masonry__item--video" data-index="${i}" data-reveal aria-label="Reproducir vídeo: ${escapeHtml(p.title)}">
        <img src="${p.thumb}" alt="${escapeHtml(p.alt)}" loading="lazy" decoding="async">
        <span class="masonry__play" aria-hidden="true"></span>
        <span class="masonry__label">${escapeHtml(p.title)}</span>
      </button>`
        : `
      <button class="masonry__item" data-index="${i}" data-reveal aria-label="Ampliar: ${escapeHtml(p.alt)}">
        <img src="${p.thumb}" alt="${escapeHtml(p.alt)}" loading="lazy" decoding="async">
      </button>`
    )
    .join("");
  grid.querySelectorAll("img").forEach((img) => {
    const done = () => img.closest(".masonry__item").classList.add("is-loaded");
    img.complete ? done() : img.addEventListener("load", done, { once: true });
  });
  reveal(grid);

  const lightbox = new Lightbox(cat.items);
  grid.addEventListener("click", (e) => {
    const item = e.target.closest(".masonry__item");
    if (item) lightbox.open(Number(item.dataset.index), item);
  });

  const prev = categories[(index - 1 + categories.length) % categories.length];
  const next = categories[(index + 1) % categories.length];
  const link = (c, dir) => `
    <a class="category-pager__link category-pager__link--${dir}" href="${url(`categoria.html?c=${encodeURIComponent(c.slug)}`)}">
      <span class="eyebrow">${dir === "prev" ? "← Anterior" : "Siguiente →"}</span>
      <span class="category-pager__title">${escapeHtml(c.title)}</span>
    </a>`;
  if (categories.length > 1) pager.innerHTML = link(prev, "prev") + link(next, "next");
}
