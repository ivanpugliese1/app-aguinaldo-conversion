import { renderizarCotizaciones } from "./components/cotizacionDolar.js";
import { renderizarConversor } from "./components/conversorMoneda.js";


// ********************** MENU TOGGLE ********************** //
const header = document.querySelector('header'); // Traigo el header completo.
const menuToggle = document.querySelector('.menu-toggle'); // Traigo el botón que abre y cierra el menu de navegación.
const menuNav = document.querySelector('nav'); // Traigo el elemento de navegación con sus respectivos links.
const overlay = document.createElement('div');
overlay.className = 'menu-overlay';
document.body.appendChild(overlay);

function toggleMenu() {
  const isExpanded = menuToggle.getAttribute('aria-expanded') === 'true'; // Valor del atributo aria-expanded si el menu esta abierto.

  menuToggle.setAttribute('aria-expanded', !isExpanded); // Actualizo el valor del atributo aria-expanded.

  menuNav.classList.toggle('is-open'); // Alterno la clase is-open en el elemento de navegación.

  overlay.classList.toggle('is-active');


  if (!isExpanded) {
    document.body.style.overflow = 'hidden'; // Desactivo el scroll del body cuando el menu está abierto.
  } else {
    document.body.style.overflow = ''; // Reactivo el scroll del body cuando el menu está cerrado.
  }
}

if (menuToggle) {
  // Click para desktop
  menuToggle.addEventListener('click', toggleMenu);

  // Touch para móvil - CRÍTICO
  menuToggle.addEventListener('touchend', (e) => {
    e.preventDefault();
    toggleMenu();
  }, { passive: false });
}



if (menuNav) {
  const navLinks = menuNav.querySelectorAll('a'); // Traigo todos los links dentro del nav.
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      if (menuToggle.getAttribute('aria-expanded') === 'true') {
        toggleMenu(); // Cierro el menú si está abierto al hacer click en un link.
      }
    })
  })
}

// Cerrar al hacer click en el overlay
overlay.addEventListener('click', () => {
  menuNav.classList.remove('is-open');
  overlay.classList.remove('is-active');
  menuToggle.setAttribute('aria-expanded', 'false');
});


// Cierro el menú al hacer click fuera de él.
document.addEventListener("click", (e) => {
  if (
    header &&
    header.classList.contains("menu-open") &&
    !menuNav.contains(e.target) &&
    !menuToggle.contains(e.target)
  ) {
    toggleMenu();
  }
});

// Cerrar el menú al presionar la tecla Escape
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && menuToggle.getAttribute("aria-expanded") === "true") {
    toggleMenu();
  }
});


// ********************** SECCION RENDERIZADO - PRECIO DOLAR ********************** //
document.querySelector('.seccion-cotizaciones').innerHTML = `
      <article id="cotizaciones-container" class="cotizaciones-container"></article>
`;


// Inicializar componentes
renderizarConversor('formulario-conversion');  // ← Inicializar conversor
// Inicializar componente
// Pequeño delay para asegurar que el DOM se actualizó
setTimeout(() => {
  renderizarCotizaciones('cotizaciones-container');
}, 0); // Incluso con 0ms funciona porque pasa al siguiente ciclo del event loop



