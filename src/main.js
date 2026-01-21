// Funcionalidad del menu toggle

const header = document.querySelector('header'); // Traigo el header completo.
const menuToggle = document.querySelector('.menu-toggle'); // Traigo el botón que abre y cierra el menu de navegación.
const menuNav = document.querySelector('nav'); // Traigo el elemento de navegación con sus respectivos links.

function toggleMenu() {
  const isExpanded = menuToggle.getAttribute('aria-expanded') === 'true'; // Valor del atributo aria-expanded si el menu esta abierto.

  menuToggle.setAttribute('aria-expanded', !isExpanded); // Actualizo el valor del atributo aria-expanded.

  menuNav.classList.toggle('is-open'); // Alterno la clase is-open en el elemento de navegación.

  header.classList.toggle('menu-open'); // Alterno la clase menu-open en el header.

  if (!isExpanded) {
    document.body.style.overflow = 'hidden'; // Desactivo el scroll del body cuando el menu está abierto.
  } else {
    document.body.style.overflow = ''; // Reactivo el scroll del body cuando el menu está cerrado.
  }
}

if (menuToggle) {
  menuToggle.addEventListener('click', toggleMenu); // Escucho el evento click en el botón del menú.
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