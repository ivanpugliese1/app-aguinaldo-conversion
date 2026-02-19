import { calculateBonus } from "../services/bonusService.js";

// Storage key for sessionStorage
const STORAGE_KEY = 'bonusLastResult';

// ✅ Save result to sessionStorage
function saveResult(result) {
  console.log('🔍 Saving result:', result);
  try {
    const resultToSave = {
      ...result,
      startDate: result.entryDate?.toISOString(),
      calculationDate: result.dateCalculation?.toISOString(),
      semesterStart: result.startSemester?.toISOString(),
      semesterEnd: result.endSemester?.toISOString(),
      effectiveStartDate: result.effectiveStartDate?.toISOString()
    };
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(resultToSave));
    console.log('✅ Successfully saved to sessionStorage');
  } catch (error) {
    console.error('❌ Error saving result:', error);
  }
}

// ✅ Retrieve result from sessionStorage
function getSavedResult() {
  console.log('🔍 Attempting to retrieve result...');
  try {
    const saved = sessionStorage.getItem(STORAGE_KEY);
    console.log('📦 Retrieved data:', saved);

    if (!saved) {
      console.log('ℹ️ No saved result found');
      return null;
    }

    const result = JSON.parse(saved);

    // Convert strings back to Date objects
    if (result.startDate) result.startDate = new Date(result.startDate);
    if (result.calculationDate) result.calculationDate = new Date(result.calculationDate);
    if (result.semesterStart) result.semesterStart = new Date(result.semesterStart);
    if (result.semesterEnd) result.semesterEnd = new Date(result.semesterEnd);
    if (result.effectiveStartDate) result.effectiveStartDate = new Date(result.effectiveStartDate);

    console.log('✅ Result restored:', result);
    return result;
  } catch (error) {
    console.error('❌ Error retrieving result:', error);
    return null;
  }
}


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
    <form id="form-bonus" class="form-bonus">
        <div class="form-group">
          <label for="better-salary">
            Mejor sueldo bruto del semestre :
          </label>
          <input
            type="number"
            id="better-salary"
            name="better-salary"
            placeholder="$ 500.000"
            step="0.01"
            min="0"
            required
          >
          <small>Mejor sueldo bruto (antes de descuentos)</small>
        </div>

        <div class="form-group">
          <label for="entry-date">
            Fecha de ingreso al trabajo :
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
            Fecha de liquidación del aguinaldo :
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


        <button type="submit" class="btn-primary">
          Calcular Aguinaldo
        </button>
    </form>
  `
  setTimeout(() => {
    bonusEvents();

    // ✅ Restore previous result if exists
    const savedResult = getSavedResult();
    if (savedResult) {
      showResultBonus(savedResult);
    }
  }, 0);
}


function bonusEvents() {
  const form = document.getElementById('form-bonus');

  // Envio del form
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    calculateBonusFormData();
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
    // ✅ Guardar en sessionStorage
    saveResult(result);
    showResultBonus(result);
  } catch (error) {
    bonusShowError(error.message);
  }
}

function showResultBonus(result) {
  const divResult = document.getElementById('bonus-result');

  const semesterText = result.semester === 1 ? 'Primero ->' : 'Segundo ->';

  divResult.innerHTML = `
      <div class="calculation-details">
        <h3>Detalles del cálculo</h3>
        
        <div class="detail-group">
          <h4>Datos ingresados</h4>
          <div class="grid-detalles">
            <div class="item-detail">
              <span class="detail-text">Mejor sueldo :</span>
              <span class="value">$${result.betterSalary.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</span>
            </div>
            <div class="item-detail">
              <span class="detail-text">Fecha de ingreso :</span>
              <span class="value">${formatDate(result.entryDate)}</span>
            </div>
            <div class="item-detail">
              <span class="detail-text">Fecha de cálculo :</span>
              <span class="value">${formatDate(result.dateCalculation)}</span>
            </div>
            <div class="item-detail">
              <span class="detail-text">Semestre :</span>
              <span class="value">${semesterText} (${formatDate(result.startSemester)} al ${formatDate(result.endSemester)})</span>
            </div>
          </div>
        </div>

        <div class="detail-group">
          <h4>Tiempo trabajado</h4>
          <div class="grid-detalles">
            <div class="item-detail">
              <span class="detail-text">Desde :</span>
              <span class="value">${formatDate(result.effectiveStartDate)}</span>
            </div>
            <div class="item-detail">
              <span class="detail-text">Hasta :</span>
              <span class="value">${formatDate(result.dateCalculation)}</span>
            </div>
            <div class="item-detail">
              <span class="detail-text">Período trabajado :</span>
              <span class="value">${result.monthsWorked} ${result.monthsWorked === 1 ? 'mes' : 'meses'} y ${result.daysWorked} ${result.daysWorked === 1 ? 'día' : 'días'}</span>
            </div>
            <div class="item-detail">
              <span class="detail-text">Meses (decimal) :</span>
              <span class="value">${result.monthsWorkedDecimal} meses</span>
            </div>
          </div>
        </div>

        <div class="detail-group math-calculation">
          <h4>Cálculo matemático</h4>
          <div class="formula-visual">
            <p>- (Mejor sueldo / 12) * Meses trabajados</p>
            <p class="formula-numeros">
              - ($ ${result.betterSalary.toLocaleString('es-AR')} / 12) * ${result.monthsWorkedDecimal}
            </p>
            <p class="formula-numeros">
              - $ ${(result.betterSalary / 12).toLocaleString('es-AR', { maximumFractionDigits: 2 })} * ${result.monthsWorkedDecimal}
            </p>
            <p class="formula-resultado">
              Aguinaldo = <strong>$ ${result.bonusAmount.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</strong>
            </p>
          </div>
        </div>

        <div class="additional-info">
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
  // Si no hay fecha, devolvemos un string vacío o un placeholder
  if (!date) return 'N/A';

  // Si es un string (porque vino de sessionStorage o un input), lo convertimos
  const dateObj = (date instanceof Date) ? date : new Date(date);

  // Verificamos si la fecha es válida para evitar el error "Invalid Date"
  if (isNaN(dateObj.getTime())) {
    console.error("Fecha inválida recibida:", date);
    return 'Fecha error';
  }

  return dateObj.toLocaleDateString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
}

