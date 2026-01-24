import { obtenerDolarHoy } from "../services/dolarApi";

export async function renderizarPrecioDolar(containerId) {
  const container = document.getElementById(containerId);

  // Si no encuentra el contenedor, salimos de la función.
  if (!container) {
    console.error(`Container ${containerId} no encontrado`);
    return;
  }

  // Mostrar loading
  container.innerHTML = '<p class="loading">Cargando cotizaciones...</p>';

  try {
    const datosDolar = await obtenerDolarHoy();

    container.innerHTML = `
      <div class="cotizaciones-grid">
        ${datosDolar.map(dol => crearTarjetaCotizacion(dol)).join('')}
      </div>
      <p class="ultima-actualizacion">
        Última actualización: ${new Date(datosDolar[0]?.fechaActualizacion || new Date()).toLocaleString('es-AR')}
      </p>
    `;
  } catch (error) {
    container.innerHTML = '<p class="error">Error al cargar las cotizaciones del dólar. Por favor, intente nuevamente más tarde.</p>';

    document.getElementById('reintentar-cotizaciones')?.addEventListener('click', () => {
      renderizarPrecioDolar(containerId);
    });
  }
}


function crearTarjetaCotizacion(dolar) {
  return `
    <div class="tarjeta-dolar">
      <h3>${dolar.nombre}</h3>
      <div class="valores">
        <div class="valor-compra">
          <span class="label">Compra</span>
          <span class="precio">$${dolar.compra.toFixed(2)}</span>
        </div>
        <div class="valor-venta">
          <span class="label">Venta</span>
          <span class="precio">$${dolar.venta.toFixed(2)}</span>
        </div>
      </div>
    </div>
  `;
}