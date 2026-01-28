// Creamos una constante que almacena la URL base de la API de Dólar
const API = 'https://dolarapi.com/v1/dolares';

export async function obtenerCotizacionesActuales() {
  try {
    const response = await fetch(API);

    // Si hay un error de conexion, validamos el estado de la respuesta.
    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }

    // Transformarmos la respuesta a formato JSON
    const data = await response.json();
    return data;
  }
  catch (error) {
    console.error('Error al obtener el valor del dolar', error);
    throw error;
    // Pendiente agregar un componente para mostrar al usuario un mensaje de error.
  }
}

// Ejemplo  --> Si 1USD = 1450 ARS, entonces 10.000 ARS / 1450 = 6.90 USD
export function conversionPesosADolares(pesos, tasaVenta) {
  return pesos / tasaVenta;
}

// Ejemplo --> Si 1USD = 1450 ARS, entonces 10 USD * 1450 = 14.500 ARS
export function conversionDolaresAPesos(dolares, tasaCompra) {
  return dolares * tasaCompra;
}


// Funcion para calcular la variacion de la baja y suba de dolar en porcentaje
export function calcularVariacionPorcentual(valorAnterior, valorActual) {
  if (!valorAnterior || valorAnterior === 0) return null;  // Se valida si no hay un valor anterior previo o es cero, no se puede calcular la variacion.

  const diferencia = valorActual - valorAnterior; // Calculo la diferencia entre el valor actual y el anterior.
  const variacionPorcentual = (diferencia / valorAnterior) * 100; // Calculo el porcentaje de variación

  return {
    diferencia: diferencia,
    variacionPorcentual: variacionPorcentual,
    tipo: diferencia >= 0 ? 'subida' : 'bajada'
  }
}

// Funcion para guardar en el localStorage la cotización del dolar - el LocalStorage solo permite guardar strings, prepara el dato para que el navegador lo recuerde, y por eso se convierte a JSON.
export function guardarCotizacionesEnLocalStorage(cotizacionesActuales) {
  const data = {
    precio: cotizacionesActuales,
    fecha: new Date().toISOString() // Que es el formato ISOString? --> 2024-06-12T14:20:30.123Z
  };
  localStorage.setItem('cotizacionesDolar', JSON.stringify(data)); // Se guarda el objeto data como string en el localStorage bajo la clave 'cotizacionDolar', y convertimos el objeto a string con JSON.stringify para que el navegador lo pueda almacenar.
}

// Funcion para obtener las cotizaciones guardadas desde el localStorage
export function obtenerCotizacionesDesdeLocalStorage() {
  const data = localStorage.getItem('cotizacionesDolar');
  return data ? JSON.parse(data) : null; // Como lo guardamos como texto, necesitamos "reconstruirlo" a un objeto de JavaScript para poder acceder a data.precio o data.fecha.
  // Si es la primera vez que se usa la app y no hay nada guardado, devuelve null de forma segura.
}

/* 
Ejemplo de flujo completo

Imagina que ayer el dólar estaba a 1000 y hoy está a 1050:

1 Llamas a obtenerPrecioDolarDesdeLocalStorage() y obtienes el 1000 de ayer.

2 Ejecutas calcularVariacionPorcentual(1000, 1050).
Resultado: { diferencia: 50, variacionPorcentual: 5, tipo: 'subida' }.

3 Guardas el nuevo precio con guardarPrecioDolarEnLocalStorage(1050).
*/