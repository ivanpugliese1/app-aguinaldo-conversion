import { obtenerCotizacionesActuales, calcularVariacionPorcentual, guardarCotizacionesEnLocalStorage, obtenerCotizacionesDesdeLocalStorage } from "../services/dolarApi.js";


export async function renderizarCotizaciones(containerId) {
  const container = document.getElementById(containerId);

  // Si no encuentra el contenedor, salimos de la función.
  if (!container) {
    console.error(`Container ${containerId} no encontrado`);
    return;
  }

  // Mostrar loading
  container.innerHTML = '<p class="loading">Cargando cotizaciones...</p>';

  try {
    const cotizacionesActuales = await obtenerCotizacionesActuales(); // Obtengo las cotizaciones actuales de los diferentes tipos de dolar desde la API.

    // Obtengo las cotizaciones guardadas en el localStorage
    const cotizacionesGuardadas = obtenerCotizacionesDesdeLocalStorage();

    // Creo una variable en la cual mapeo los datos del dolar actual, los recorro uno por uno para calcular la variacion con el precio anterior.
    const cotizacionesConVariacion = cotizacionesActuales.map(cotizacion => {
      let variaciones = { compra: null, venta: null };
      if (cotizacionesGuardadas && cotizacionesGuardadas.precio) {
        // El find busca dentro del array del cotizacionesGuardadas el objeto que coincida con el tipo de dolar actual (cotizacion.casa) si estamos procesando el dolar blue, busca el dolar blue anterior.
        const cotizacionAnterior = cotizacionesGuardadas.precio.find(prev =>
          prev.casa === cotizacion.casa
        )
        if (cotizacionAnterior) {
          variaciones.compra = calcularVariacionPorcentual(cotizacionAnterior.compra, cotizacion.compra);
          variaciones.venta = calcularVariacionPorcentual(cotizacionAnterior.venta, cotizacion.venta);
        }
      }

      // Retorno un nuevo objeto con la informacion del dolar actual + las variaciones calculadas.
      return { ...cotizacion, variaciones };
    })

    // Guardar el precio actual del dolar en el localStorage
    guardarCotizacionesEnLocalStorage(cotizacionesActuales);


    // El join('') recorre el array y une todos los string generados en uno solo.
    // Utilizo el optional chaining (?.) si el valor antes del signo de interrogacion es null o undefined, no intenta acceder a la propiedad fechaActualizacion y devuelve undefined en su lugar, evitando un error.
    container.innerHTML = `
      <div class="cotizaciones-cabecera">
        <h2>Cotizaciones USD</h2>
        <div>
          <span class="live-dot"></span>
          <span>EN VIVO</span>
        </div>
      </div>
      
      <div class="cotizaciones-dolar">
        ${cotizacionesConVariacion.map(cotizacion => crearTarjetaHtml(cotizacion)).join('')} 
      </div>
      <p class="ultima-actualizacion">
        Última actualización: ${new Date(cotizacionesActuales[0]?.fechaActualizacion || new Date()).toLocaleString('es-AR')} 
      </p>
    `;
  } catch (error) {
    container.innerHTML = '<p class="error">Error al cargar las cotizaciones del dólar. Por favor, intente nuevamente más tarde.</p>';

    document.getElementById('reintentar-cotizaciones')?.addEventListener('click', () => { // ??
      renderizarCotizaciones(containerId);
    });
  }
}

function crearTarjetaHtml(cotizacion) {
  const nombreSimplificado = cotizacion.nombre === "Contado con liquidación"
    ? "CCL"
    : cotizacion.nombre;

  // Función interna para generar el HTML de la variación (subida/bajada)
  const crearVariacionHtml = (variacion) => {
    if (!variacion) return '';
    const clase = variacion.tipo === 'subida' ? 'variacion-positiva' : 'variacion-negativa';
    const simbolo = variacion.tipo === 'subida' ? '▲' : '▼';
    return `
      <span class="variacion-mini ${clase}">
        ${simbolo} ${Math.abs(variacion.variacionPorcentual).toFixed(2)}%
      </span>
    `;
  };
  return `
    <div class="tarjeta-dolar">
      <h3>Dolar ${nombreSimplificado}</h3>
      
      <div class="valores">
        <div class="valor-compra">
          <span class="precio">$${cotizacion.compra.toFixed(2)}</span>
          <span class="texto-compra">Compra</span>
          ${crearVariacionHtml(cotizacion.variaciones.compra)}
        </div>
        <div class="valor-venta">
          <span class="precio">$${cotizacion.venta.toFixed(2)}</span>
          <span class="texto-venta">Venta</span>
          ${crearVariacionHtml(cotizacion.variaciones.venta)}
        </div>
      </div>
    </div>
  `;
}

// ¿Por que cotizacion.nombre? Porque el servicio devuelve un array de objetos con casa, nombre, compra, venta y fechaActualizacion.

// Por que cotizacion.compra.toFixed(2)? Para mostrar siempre dos decimales en el precio de compra y venta.