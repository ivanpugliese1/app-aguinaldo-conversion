// Creamos una constante que almacena la URL base de la API de Dólar
const API = 'https://dolarapi.com/v1/dolares';

export async function obtenerDolarHoy() {
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

export async function obtenerDolarPorTipo(tipo) {
  try {
    const response = await fetch(`${API}/${tipo}`)

    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }

    const data = await response.json();
    return data;
  }
  catch (error) {
    console.error(`Error al obtener el valor del dolar tipo: ${tipo}`, error);
    throw error;
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