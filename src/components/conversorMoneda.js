import { obtenerCotizacionesActuales, conversionPesosADolares, conversionDolaresAPesos } from "../services/dolarApi.js";

// Generamos esta variable global para almacenar en memoria los datos que nos brinda la API y no tener que hacer múltiples llamadas cada vez que el usuario interactúa con el conversor.
let cotizacionesEnMemoria = [];

export async function renderizarConversor(containerId) {
  const container = document.getElementById(containerId);

  if (!container) return;

  container.innerHTML = '<p class="loading">Cargando conversor de moneda...</p>';

  try {
    cotizacionesEnMemoria = await obtenerCotizacionesActuales();
  } catch (error) {
    container.innerHTML = '<p class="error">Error al cargar el conversor.</p>';
    return;
  }

  container.innerHTML = `
    <div class="form-title">
      <h2>Conversor de Moneda</h2>
      <small>Conversión actualizada en tiempo real.</small>
    </div>

    <div class="form-group">
      <label for="tipo-dolar">Seleccioná el tipo de Dólar :</label>
      <div class="custom-select-container" id="custom-select">
        <div class="select-selected">
          <span id="selected-text">Dólar Oficial</span>
          <span class="arrow"></span>
        </div>
        <div class="select-items select-hide">
          ${cotizacionesEnMemoria.map(cotizacion => `
            <div data-value="${cotizacion.casa}">
              Dólar ${cotizacion.nombre === "Contado con liquidación" ? "CCL" : cotizacion.nombre}
            </div>
          `).join('')}
        </div>
      </div>
      <select id="tipo-dolar" style="display:none">
          ${generadorOpcionesHtml()}
      </select>
    </div>

    <div class="conversor-wrapper">
      <div class="form-group">
          <label id="label-origen"><span>ARS</span></label>
          <input type="hidden" id="moneda-origen" value="ARS">
      </div>
      
      <button id="btn-invertir" class="btn-swap" title="Invertir monedas">
        ⇄
      </button>

      <div class="form-group">
          <label id="label-destino">USD</label>
          <input type="hidden" id="moneda-destino" value="USD">
      </div>
    </div>

    <div class="form-group">
        <label for="monto">Monto :</label>
        <input type="text" id="monto" placeholder="Ej: 100" autocomplete="off">
    </div>

    <div id="resultado-conversion" class="resultado-conversion"></div>
  `;

  configurarEventos();

  // Función que genera opciones del select para seleccionar el tipo de dólar.
  function generadorOpcionesHtml() {
    return cotizacionesEnMemoria
      .map(cotizacion => `<option value="${cotizacion.casa}">Dólar ${cotizacion.nombre === "Contado con liquidación" ? "CCL" : cotizacion.nombre}</option>`)
      .join('');
  }

  function configurarEventos() {
    const inputMonto = document.getElementById('monto');
    const btnInvertir = document.getElementById('btn-invertir');
    const selectDolar = document.getElementById('tipo-dolar');
    const monedaOrigen = document.getElementById('moneda-origen');
    const monedaDestino = document.getElementById('moneda-destino');

    // Para el custom-select y hacerlo mas agradable visualmente.
    const customSelect = document.getElementById('custom-select');
    const selectedDisplay = customSelect.querySelector('.select-selected');
    const itemsContainer = customSelect.querySelector('.select-items');
    const arrow = customSelect.querySelector('.arrow');

    // ======== CUSTOM SELECT - ABRIR/CERRAR ========
    let selectAbierto = false;

    function toggleSelect(e) {
      if (e) e.stopPropagation();
      selectAbierto = !selectAbierto;
      itemsContainer.classList.toggle('select-hide');
      arrow.classList.toggle('arrow-rotate');
    }

    // Creamos el evento para mostrar y desaparecer al hacer clic en el "input"
    selectedDisplay.addEventListener('click', () => {
      itemsContainer.classList.toggle('select-hide');
    });

    // Touch en el select (móvil)
    selectedDisplay.addEventListener('touchend', (e) => {
      e.preventDefault();
      e.stopPropagation();
      toggleSelect();
    }, { passive: false });

    // Al elegir una opción visual
    itemsContainer.querySelectorAll('div').forEach(item => {

      function seleccionarOpcion(e) {
        e.preventDefault();
        e.stopPropagation();

        const value = e.target.getAttribute('data-value');
        const text = e.target.innerText;

        // 1. Actualizamos el texto visual
        const textSpan = customSelect.querySelector('#selected-text');
        textSpan.innerText = text;

        // 2. Sincronizamos con el select oculto
        selectDolar.value = value;

        // 3. Cerramos el menú
        itemsContainer.classList.add('select-hide');

        // 4. DISPARAMOS TU LÓGICA ORIGINAL
        selectDolar.dispatchEvent(new Event('change'));
      }

      // Click
      item.addEventListener('click', seleccionarOpcion);

      // Touch (móvil)
      item.addEventListener('touchend', seleccionarOpcion, { passive: false });
    });



    // ======== CERRAR SELECT AL HACER CLICK/TOUCH FUERA ========
    function cerrarSelect(e) {
      if (!customSelect.contains(e.target) && selectAbierto) {
        selectAbierto = false;
        itemsContainer.classList.add('select-hide');
        arrow.classList.remove('arrow-rotate');
      }
    }

    document.addEventListener('click', cerrarSelect);
    document.addEventListener('touchend', cerrarSelect);

    // Con el evento input, escuchamos los cambios en el campo de monto en tiempo real.
    inputMonto.addEventListener('input', (e) => {
      formatearMonto(e.target); // Primero formateamos el monto 
      realizarConversion(); // Luego realizamos la conversión
    });

    // Escuchar cambio de tipo de dólar
    selectDolar.addEventListener('change', realizarConversion);

    // ======== BOTÓN INVERTIR ========
    function invertirMonedas(e) {
      e.preventDefault();

      const temp = monedaOrigen.value;
      monedaOrigen.value = monedaDestino.value;
      monedaDestino.value = temp;

      document.getElementById('label-origen').innerText = monedaOrigen.value;
      document.getElementById('label-destino').innerText = monedaDestino.value;

      realizarConversion();
    }

    btnInvertir.addEventListener('click', invertirMonedas);
    btnInvertir.addEventListener('touchend', (e) => {
      e.preventDefault();
      invertirMonedas(e);
    }, { passive: false });
  }

  // Buscamos que los puntos de miles se vean automaticamente mientras el usuario escribe.
  function formatearMonto(input) {

    // Creamos una variable valor, le asignamos el valor del input y eliminamos con regex las letras o simbolos que no sean numeros o coma, ya que en Argentina usamos la coma como separador decimal.
    let valor = input.value.replace(/[^0-9,]/g, "");

    // Creamos la constante partes, en donde tomamos el valor y lo separamos en un array usando la coma como separador con el metodo split. Split es el metodo que divide un string en un array de substrings segun el separador que le indiquemos.
    // En el if, si el array tiene mas de dos partes, quiere decir que se ingresaron varias comas, tomamos la primera parte como la parte ENTERA y unimos el resto como la parte DECIMAL.
    const partes = valor.split(",");
    if (partes.length > 2) {
      valor = partes[0] + "," + partes.slice(1).join("");
    }

    // En la variable parteEntera, utilizamos el metodo replace con regex para eliminar todo lo que no sea un numero.
    let parteEntera = partes[0].replace(/\D/g, "");
    let parteDecimal = partes[1];

    // En este if, si la parteEntera no esta vacia, usamos Intl.Number.Format para formatear el numero con puntes de miles segun la localizacion es-AR.
    if (parteEntera !== "") {
      parteEntera = new Intl.NumberFormat('es-AR').format(parseInt(parteEntera, 10));
    }

    // Al input.value le asignamos la parteEntera y la parteDecimal (si existe) unidas por una coma, el slice(0,2) limita la parte decimal a dos digitos.
    input.value = parteDecimal !== undefined ? `${parteEntera},${parteDecimal.slice(0, 2)}` : parteEntera;
  }

  // Funcion que realiza la conversion de moneda segun el monto, la moneda de origen y el tipo de dolar seleccionado.
  function realizarConversion() {
    const inputMonto = document.getElementById('monto').value;
    const monedaOrigen = document.getElementById('moneda-origen').value;
    const tipoDolar = document.getElementById('tipo-dolar').value;
    const resultadoDiv = document.getElementById('resultado-conversion');

    // creamos montoLimpio, donde se toma el valor ingresado en el input, se elimintan los puntos de miles y se reemplaza la coma decimal por punto, para convertirlo a un numero float valido.
    const montoLimpio = parseFloat(inputMonto.replace(/\./g, '').replace(',', '.'));

    if (isNaN(montoLimpio) || montoLimpio <= 0) {
      resultadoDiv.innerHTML = '<small>Ingresá un monto para convertir.</small>';
      return;
    }

    // En la constante precio, buscamos en el array cotizacionesEnMemoria el objeto que coincida con el tipo de dolar seleccionado en el select.
    const precio = cotizacionesEnMemoria.find(p => p.casa === tipoDolar);
    if (!precio) return;


    let resultado, tasa, tipoTasa;

    // Si la moneda de origen es ARS, convertimos de Pesos a Dólares usando la tasa de venta.
    if (monedaOrigen === 'ARS') {
      resultado = conversionPesosADolares(montoLimpio, precio.venta);
      tasa = precio.venta;
      tipoTasa = 'venta';
    } else {
      // Si la moneda de origen es USD, convertimos de Dólares a Pesos usando la tasa de compra.
      resultado = conversionDolaresAPesos(montoLimpio, precio.compra);
      tasa = precio.compra;
      tipoTasa = 'compra';
    }

    mostrarResultado(montoLimpio, monedaOrigen, resultado, precio, tasa, tipoTasa);
  }

  function mostrarResultado(montoOriginal, monedaOrigen, montoConvertido, precio, tasa, tipoTasa) {
    const resultadoDiv = document.getElementById('resultado-conversion');
    const monedaDestino = monedaOrigen === 'ARS' ? 'USD' : 'ARS';
    const simboloOrigen = monedaOrigen === 'ARS' ? '$' : 'US$';
    const simboloDestino = monedaDestino === 'ARS' ? '$' : 'US$';

    resultadoDiv.innerHTML = `
    <div class="resultado-exitoso animate-in">
      <div class="conversion-visual">
        <div class="monto-origen">
          <span class="valor">${simboloOrigen}${montoOriginal.toLocaleString('es-AR')}</span>
        </div>
        <div class="flecha-conversion"> = </div>
        <div class="monto-destino">
          <span class="valor">${simboloDestino}${montoConvertido.toLocaleString('es-AR')}</span>
        </div>
      </div>
      <div class="detalles-conversion">
      <small>Cotización: 1 USD = $${tasa.toFixed(2)} (${tipoTasa})</small>
        <small>Tipo: Dolar ${precio.casa}
      </div>
    </div>`;
  }
}