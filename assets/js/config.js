// ============================================================================
//  CONFIGURACIÓN DEL PORFOLIO — este es el único fichero que necesitas editar
// ============================================================================
export const config = {
  // --- Identidad -------------------------------------------------------------
  name: "Pepe Botika Humilde",
  role: "Fotógrafo profesional",
  tagline: "Luz, gesto y momento. Fotografía de retrato, bodas y editorial.",
  location: "Madrid · Disponible para viajar",

  // --- Repositorio de GitHub -------------------------------------------------
  // En GitHub Pages (usuario.github.io/repo) se detectan solos. Rellénalos si
  // usas un dominio propio o quieres forzarlos. En local se usan siempre estos.
  github: {
    owner: "rdcarrera",
    repo: "test-github-page",
    branch: "main",
  },

  // Carpeta del repo que contiene una subcarpeta por categoría.
  photosDir: "photos",

  // --- Sobre mí --------------------------------------------------------------
  about: {
    image: "assets/img/about.jpg",
    text: [
      "Llevo más de diez años contando historias con una cámara. Mi trabajo busca la honestidad del instante: miradas reales, luz natural y una edición cuidada que respeta el color.",
      "Trabajo con particulares, marcas y medios, tanto en estudio como en exteriores.",
    ],
    stats: [
      { value: "10+", label: "años de experiencia" },
      { value: "250+", label: "proyectos entregados" },
      { value: "40", label: "bodas al año" },
    ],
  },

  // --- Contacto --------------------------------------------------------------
  contact: {
    email: "hola@fakeemaildirection.fakeCompletFake",
    phone: "+34 600 000 000",
    // GitHub Pages no tiene backend. Crea un formulario gratis en
    // https://formspree.io y pega aquí su ID (p. ej. "xyzabcde").
    // Si lo dejas vacío, el formulario abrirá el cliente de correo (mailto).
    formspreeId: "",
    availability: "Agenda abierta para 2027",
  },

  social: [
    { label: "Instagram", url: "https://instagram.com/" },
    { label: "Behance", url: "https://behance.net/" },
    { label: "LinkedIn", url: "https://linkedin.com/" },
  ],

  // Minutos que se cachea en el navegador el listado del repositorio
  // (la API pública de GitHub permite 60 peticiones/hora por visitante).
  cacheMinutes: 15,
};
