import { getCurrentDollarPrice, pesoToDollarConversion, dollarToPesoConversion } from "../services/dollarApi.js";
import { formatAmount } from "../utils/formatAmount.js";

// Generamos esta variable global para almacenar en memoria los datos que nos brinda la API y no tener que hacer múltiples llamadas cada vez que el usuario interactúa con el conversor.
let pricesInCache = [];

export async function renderConversor(containerId) {
  const container = document.getElementById(containerId);

  if (!container) return;

  try {
    pricesInCache = await getCurrentDollarPrice();
  } catch (error) {
    container.innerHTML = '<p class="error">Error al cargar el conversor.</p>';
    return;
  }

  container.innerHTML = `
    <div class="form-title">
      <h2>Conversor de Moneda</h2>
      <small>Conversión actualizada en tiempo real.</small>
    </div>

    <div class="form-groups-container">
      <div class="form-group">
        <label for="dollar-type">Seleccioná el tipo de Dólar :</label>
        <div class="custom-select-container" id="custom-select">
          <div class="select-selected">
            <span id="selected-text">Dólar Oficial</span>
            <span class="arrow"></span>
          </div>
          <div class="select-items select-hide">
            ${pricesInCache.map(price => `
              <div data-value="${price.casa}">
                Dólar ${price.nombre === "Contado con liquidación" ? "CCL" : price.nombre}
              </div>
            `).join('')}
          </div>
        </div>
        <select id="dollar-type" style="display:none">
            ${optionsGeneratorHtml()}
        </select>
      </div>

      <div class="conversor-wrapper">
        <div class="form-group">
            <label id="origin-label"><span>ARS</span></label>
            <input type="hidden" id="origin-currency" value="ARS">
        </div>
        
        <button id="btn-swap" class="btn-swap" title="Invertir monedas">
          ⇄
        </button>

        <div class="form-group">
            <label id="destination-label">USD</label>
            <input type="hidden" id="destination-currency" value="USD">
        </div>
      </div>

      <div class="form-group">
          <label for="amount">Monto :</label>
          <input type="text" id="amount" placeholder="$ 100.000" autocomplete="off">
      </div>
    </div>        
    <div id="conversion-result" class="conversion-result"></div>
  `;

  configureEvents();

  function optionsGeneratorHtml() {
    return pricesInCache
      .map(price => `<option value="${price.casa}">Dólar ${price.nombre === "Contado con liquidación" ? "CCL" : price.nombre}</option>`)
      .join('');
  }

  function configureEvents() {
    const amountInput = document.getElementById('amount');
    const btnSwap = document.getElementById('btn-swap');
    const dollarType = document.getElementById('dollar-type');
    const originCurrency = document.getElementById('origin-currency');
    const destinationCurrency = document.getElementById('destination-currency');

    // Para el custom-select y hacerlo mas agradable visualmente.
    const customSelect = document.getElementById('custom-select');
    const selectedDisplay = customSelect.querySelector('.select-selected');
    const itemsContainer = customSelect.querySelector('.select-items');

    let selectOpen = false;

    function toggleSelect(e) {
      if (e) e.stopPropagation();
      selectOpen = !selectOpen;
      itemsContainer.classList.toggle('select-hide');
    }

    // Creamos el evento para mostrar y desaparecer al hacer clic en el "input"
    selectedDisplay.addEventListener('click', () => {
      itemsContainer.classList.toggle('select-hide');
    });

    selectedDisplay.addEventListener('touchend', (e) => {
      e.preventDefault();
      e.stopPropagation();
      toggleSelect();
    }, { passive: false });

    // Al elegir una opción visual
    itemsContainer.querySelectorAll('div').forEach(item => {

      function selectOption(e) {
        e.preventDefault();
        e.stopPropagation();

        const value = e.target.getAttribute('data-value');
        const text = e.target.innerText;

        const textSpan = customSelect.querySelector('#selected-text');
        textSpan.innerText = text;

        dollarType.value = value;

        itemsContainer.classList.add('select-hide');

        dollarType.dispatchEvent(new Event('change'));
      }

      item.addEventListener('click', selectOption);

      item.addEventListener('touchend', selectOption, { passive: false });
    });



    function closeSelect(e) {
      if (!customSelect.contains(e.target) && selectOpen) {
        selectOpen = false;
        itemsContainer.classList.add('select-hide');
      }
    }

    document.addEventListener('click', closeSelect);
    document.addEventListener('touchend', closeSelect);


    amountInput.addEventListener('input', (e) => {
      formatAmount(e.target);
      performConversion();
    });


    dollarType.addEventListener('change', performConversion);


    function invertCurrency(e) {
      e.preventDefault();

      const temp = originCurrency.value;
      originCurrency.value = destinationCurrency.value;
      destinationCurrency.value = temp;

      document.getElementById('origin-label').innerText = originCurrency.value;
      document.getElementById('destination-label').innerText = destinationCurrency.value;

      performConversion();
    }

    btnSwap.addEventListener('click', invertCurrency);
    btnSwap.addEventListener('touchend', (e) => {
      e.preventDefault();
      invertCurrency(e);
    }, { passive: false });
  }


  function performConversion() {
    const amountInputValue = document.getElementById('amount').value;
    const originCurrencyValue = document.getElementById('origin-currency').value;
    const dollarTypeValue = document.getElementById('dollar-type').value;
    const divResult = document.getElementById('conversion-result');

    const cleanAmount = parseFloat(amountInputValue.replace(/\./g, '').replace(',', '.'));

    if (isNaN(cleanAmount) || cleanAmount <= 0) {
      divResult.innerHTML = '<small>Ingresá un monto para convertir.</small>';
      return;
    }

    const price = pricesInCache.find(p => p.casa === dollarTypeValue);
    if (!price) return;


    let result, exchange, exchangeType;

    if (originCurrencyValue === 'ARS') {
      result = pesoToDollarConversion(cleanAmount, price.venta);
      exchange = price.venta;
      exchangeType = 'venta';
    } else {
      result = dollarToPesoConversion(cleanAmount, price.compra);
      exchange = price.compra;
      exchangeType = 'compra';
    }

    showResult(cleanAmount, originCurrencyValue, result, price, exchange, exchangeType);
  }

  function showResult(originalAmount, originCurrency, convertedAmount, price, exchange, exchangeType) {
    const divResult = document.getElementById('conversion-result');
    const destinationCurrency = originCurrency === 'ARS' ? 'USD' : 'ARS';
    const originSymbol = originCurrency === 'ARS' ? '$' : 'US$';
    const destinationSymbol = destinationCurrency === 'ARS' ? '$' : 'US$';

    divResult.innerHTML = `
    <div class="conversion-result">
      <div class="conversion-visual">
        <div>
          <span>${originSymbol}${originalAmount.toLocaleString('es-AR')}</span>
        </div>
        <div> = </div>
        <div>
          <span>${destinationSymbol}${convertedAmount.toLocaleString('es-AR')}</span>
        </div>
      </div>
      <div class="conversion-details">
        <small>1 USD = $${exchange.toFixed(2)} (${exchangeType}) / </small>
        <small>Dolar ${price.casa}</small>
      </div>
    </div>`;
  }
} 