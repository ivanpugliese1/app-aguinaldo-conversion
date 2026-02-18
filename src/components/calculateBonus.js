import { calculateBonus } from "../services/bonusService.js";

export function initializeBonusCalculator(containerId) {
  const container = document.getElementById(containerId);

  // Obtengo la fecha actual en año y mes
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();


  // Determino la fecha de calculo.
  let calculationDate;
  if (currentMonth < 6) {
    calculationDate = new Date(currentYear, 5, 30);
  } else {
    calculationDate = new Date(currentYear, 11, 31);
  }


  // Ahora, convierto las fechas a formato YYYY-MM-DD para los inputs tipo "date"
  const inputDate = (date) => date.toISOString().split('T')[0];

  container.innerHTML = `
    <div class="calculator-title">
      <h2>Calculá tu aguinaldo</h2>
      <small>Proporcional a los meses trabajados en determinado semestre.</small>
    </div>
    <form id="form-bonus" class="form-bonus">
        <div class="form-group">
          <label for="better-salary">
            💵 Mejor sueldo bruto del semestre
            <span class="tooltip" title="Ingresá el sueldo bruto más alto que recibiste en el semestre">ⓘ</span>
          </label>
          <div>
            <span>$</span>
            <input
              type="number"
              id="better-salary"
              name="better-salary"
              placeholder="500000"
              step="0.01"
              min="0"
              required
            >
          </div>
          <small>Sueldo bruto (antes de descuentos)</small>
        </div>

        <div class="form-group">
          <label for="entry-date">
            📅 Fecha de ingreso al trabajo
            <span class="tooltip" title="Fecha en que comenzaste a trabajar"></span>
          </label>
          <input
            type="date"
            id="entry-date"
            name="entry-date"
            max="${inputDate(today)}"
            required
          >
          <small>Si ingresaste antes del semestre actual, usá el inicio del semestre</small>
        </div>

        <div class="form-group">
          <label for="input-date">
            📊 Fecha de liquidación del aguinaldo
            <span class="tooltip" title="Usualmente 30 de junio o 31 de diciembre"></span>
          </label>
          <input 
            type="date" 
            id="input-date" 
            name="input-date"
            value="${inputDate(calculationDate)}"
            max="${inputDate(new Date(currentYear + 1, 11, 31))}"
            required
          >
          <small>
            Primer semestre: 30/06 | Segundo semestre: 31/12
          </small>
        </div>

        <div class="form-group-buttons">
          <button type="button" class="btn-secondary" id="btn-first-semester">
            📅 Primer semestre (Junio)
          </button>
          <button type="button" class="btn-secondary" id="btn-second-semester">
            📅 Segundo semestre (Diciembre)
          </button>
        </div>

        <button type="submit" class="btn-primary">
          🧮 Calcular Aguinaldo
        </button>
    </form>

    <div id="bonus-result" class="bonus-result"></div>
  `

  bonusEvents();
}

function bonusEvents() {
  const form = document.getElementById('form-bonus');
  const btnFirstSemester = document.getElementById('btn-first-semester');
  const btnSecondSemester = document.getElementById('btn-second-semester');
  const calculateInputDate = document.getElementById('input-date');

  // Envio del form
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    calculateBonusFormData();
  })

  btnFirstSemester.addEventListener('click', () => {
    const currentYear = new Date().getFullYear();
    const date = new Date(currentYear, 5, 30);
    calculateInputDate.value = date.toISOString().split('T')[0];
  })

  btnSecondSemester.addEventListener('click', () => {
    const currentYear = new Date().getFullYear();
    const date = new Date(currentYear, 11, 31);
    calculateInputDate.value = date.toISOString().split('T')[0];
  })
}


function calculateBonusFormData() {
  // Obtengo los valores del formulario
  const betterSalary = parseFloat(document.getElementById('better-salary').value);
  const entryDateStr = document.getElementById('entry-date').value;
  const calculationDateStr = document.getElementById('input-date').value;

  // Validacion de inputs
  if (!betterSalary || !entryDateStr || !calculationDateStr) {
    bonusShowError('Debes completar todos los campos');
    return;
  }

  const [entryYear, entryMonth, entryDay] = entryDateStr.split('-').map(Number);
  const [calcYear, calcMonth, calcDay] = calculationDateStr.split('-').map(Number);

  const entryDate = new Date(entryYear, entryMonth - 1, entryDay);
  const calculationDate = new Date(calcYear, calcMonth - 1, calcDay);

  // Calculamos el aguinaldo
  try {
    const result = calculateBonus(betterSalary, entryDate, calculationDate);
    showResultBonus(result);
  } catch (error) {
    bonusShowError(error.message);
  }
}

function showResultBonus(result) {
  const divResult = document.getElementById('bonus-result');

  const semesterText = result.semester === 1 ? 'Primer' : 'Segundo';
  const percentageWorked = result.proportion;

  divResult.innerHTML = `
      <div class="result-main">
        <div>
          <span class="label-amount">Aguinaldo: </span>
          <span class="bonus-amount">$${result.bonusAmount.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          ${!result.fullSemesterWork ? `
            <span class="badge-proporcional">
              Proporcional (${percentageWorked}% del semestre)
            </span>
          ` : `
            <span class="badge-completo">
              Semestre completo trabajado
            </span>
          `}
        </div>
      </div>

      <div class="detalles-calculo">
        <h3>📋 Detalle del cálculo</h3>
        
        <div class="seccion-detalle">
          <h4>Datos ingresados</h4>
          <div class="grid-detalles">
            <div class="item-detalle">
              <span class="label">Mejor sueldo:</span>
              <span class="value">$${result.betterSalary.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</span>
            </div>
            <div class="item-detalle">
              <span class="label">Fecha de ingreso:</span>
              <span class="value">${formatDate(result.entryDate)}</span>
            </div>
            <div class="item-detalle">
              <span class="label">Fecha de cálculo:</span>
              <span class="value">${formatDate(result.dateCalculation)}</span>
            </div>
            <div class="item-detalle">
              <span class="label">Semestre:</span>
              <span class="value">${semesterText} (${formatDate(result.startSemester)} al ${formatDate(result.endSemester)})</span>
            </div>
          </div>
        </div>

        <div class="seccion-detalle">
          <h4>Tiempo trabajado</h4>
          <div class="grid-detalles">
            <div class="item-detalle">
              <span class="label">Desde:</span>
              <span class="value">${formatDate(result.effectiveStartDate)}</span>
            </div>
            <div class="item-detalle">
              <span class="label">Hasta:</span>
              <span class="value">${formatDate(result.dateCalculation)}</span>
            </div>
            <div class="item-detalle">
              <span class="label">Período trabajado:</span>
              <span class="value">${result.monthsWorked} ${result.monthsWorked === 1 ? 'mes' : 'meses'} y ${result.daysWorked} ${result.daysWorked === 1 ? 'día' : 'días'}</span>
            </div>
            <div class="item-detalle">
              <span class="label">Meses (decimal):</span>
              <span class="value">${result.monthsWorkedDecimal} meses</span>
            </div>
          </div>
        </div>

        <div class="seccion-detalle calculo-matematico">
          <h4>🧮 Cálculo matemático</h4>
          <div class="formula-visual">
            <p>Aguinaldo = (Mejor sueldo ÷ 12) × Meses trabajados</p>
            <p class="formula-numeros">
              Aguinaldo = ($${result.betterSalary.toLocaleString('es-AR')} ÷ 12) × ${result.monthsWorkedDecimal}
            </p>
            <p class="formula-numeros">
              Aguinaldo = $${(result.betterSalary / 12).toLocaleString('es-AR', { maximumFractionDigits: 2 })} × ${result.monthsWorkedDecimal}
            </p>
            <p class="formula-resultado">
              Aguinaldo = <strong>$${result.bonusAmount.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</strong>
            </p>
          </div>
        </div>

        <div class="info-adicional">
          <p>
            💡 <strong>Recordá:</strong> Este es el monto BRUTO de tu aguinaldo. 
            A este monto se le aplicarán los mismos descuentos que a tu sueldo mensual 
            (jubilación, obra social, etc.).
          </p>
        </div>
      </div>
  `;
}

function bonusShowError(mensaje) {
  const divResult = document.getElementById('bonus-result');
  divResult.innerHTML = `
    <div class="error-calculo animate-in">
      <p>⚠️ ${mensaje}</p>
    </div>
  `;
}

function formatDate(date) {
  return date.toLocaleDateString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
}