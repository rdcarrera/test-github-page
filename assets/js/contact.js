import { config } from "./config.js";
import { getCategories, isDev } from "./content.js";
import { mountLayout, escapeHtml, setTitle } from "./layout.js";

mountLayout("contact");
setTitle("Contacto");

const c = config.contact;
const form = document.querySelector(".contact-form");
const status = form.querySelector(".form-status");

document.querySelector(".contact-info").innerHTML = `
  <dl>
    <div><dt>Email</dt><dd><a href="mailto:${escapeHtml(c.email)}">${escapeHtml(c.email)}</a></dd></div>
    ${c.phone ? `<div><dt>Teléfono</dt><dd><a href="tel:${escapeHtml(c.phone.replace(/\s/g, ""))}">${escapeHtml(c.phone)}</a></dd></div>` : ""}
    <div><dt>Ubicación</dt><dd>${escapeHtml(config.location)}</dd></div>
    <div><dt>Redes</dt><dd class="contact-info__social">${config.social
      .map((s) => `<a href="${escapeHtml(s.url)}" target="_blank" rel="noopener">${escapeHtml(s.label)}</a>`)
      .join("")}</dd></div>
  </dl>
  ${c.availability ? `<p class="availability"><span class="dot"></span>${escapeHtml(c.availability)}</p>` : ""}`;

// Rellena el desplegable con las categorías del porfolio
getCategories()
  .then((cats) => {
    const select = form.elements.service;
    for (const cat of cats) select.add(new Option(cat.title, cat.title));
    select.add(new Option("Otro", "Otro"));
  })
  .catch(() => {});

function endpoint() {
  // En local, el servidor de desarrollo simula Formspree e imprime el mensaje en la terminal.
  if (isDev) return `${location.origin}/__dev/formspree/${c.formspreeId || "mailto"}`;
  return c.formspreeId ? `https://formspree.io/f/${c.formspreeId}` : null;
}

function setStatus(type, msg) {
  status.className = `form-status form-status--${type}`;
  status.textContent = msg;
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }
  const data = Object.fromEntries(new FormData(form));
  if (data._gotcha) return; // trampa anti-spam

  const target = endpoint();
  if (!target) {
    const body = `${data.message}\n\n—\n${data.name}\n${data.email}${data.date ? `\nFecha: ${data.date}` : ""}`;
    location.href = `mailto:${c.email}?subject=${encodeURIComponent(`[${data.service}] Consulta de ${data.name}`)}&body=${encodeURIComponent(body)}`;
    setStatus("ok", "Se ha abierto tu cliente de correo para enviar el mensaje.");
    return;
  }

  const button = form.querySelector("button[type=submit]");
  button.disabled = true;
  setStatus("pending", "Enviando…");
  try {
    const res = await fetch(target, {
      method: "POST",
      headers: { Accept: "application/json", "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(res.statusText);
    form.reset();
    setStatus("ok", "¡Gracias! He recibido tu mensaje y te responderé en menos de 48 h.");
  } catch {
    setStatus("error", `No se ha podido enviar. Escríbeme directamente a ${c.email}.`);
  } finally {
    button.disabled = false;
  }
});
