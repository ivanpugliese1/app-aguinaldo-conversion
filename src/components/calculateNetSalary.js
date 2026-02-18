/*
 * CALCULADORA DE SUELDO NETO ARGENTINA

 * 1. Bruto → Neto: ingresás tu sueldo bruto y ves cuánto cobrás en mano.

 *
 * La lógica de cálculo vive en netSalaryService.js; este archivo solo se encarga de:
 * - Generar el HTML de la calculadora (formularios, pestañas, sección informativa).
 * - Configurar eventos (submit de formularios, clic en pestañas).
 * - Leer valores de los inputs, llamar al servicio y mostrar resultados en pantalla.
 */

import {
  calculateNetSalary
} from '../services/netSalaryService.js';

// INICIALIZACIÓN
/*
  Punto de entrada: inicializa la calculadora dentro del contenedor indicado.

  1. Busca en el DOM el elemento con el ID recibido (ej. "net-salary-calculator").
  2. Si no existe, escribe un error en consola y sale.
  3. Genera todo el HTML de la calculadora (header, pestañas, formularios, info) y lo inyecta en el contenedor.
  4. Configura los event listeners (enviar formularios y cambiar de pestaña).
*/

// Clave para sessionStorage
const STORAGE_KEY = 'netSalaryLastResult';

// ✅ Guardar resultado en sessionStorage
function saveResult(result) {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(result));
}

// ✅ Recuperar resultado de sessionStorage
function getSavedResult() {
  const saved = sessionStorage.getItem(STORAGE_KEY);
  return saved ? JSON.parse(saved) : null;
}

export function initNetSalaryCalculator(containerId) {
  const container = document.getElementById(containerId);

  if (!container) {
    console.error(`Container ${containerId} not found`);
    return;
  }

  container.innerHTML = generateGrossNet();

  setTimeout(() => {
    setupGrossToNetForm();

    const savedResult = getSavedResult();

    // ✅ Si había un resultado previo, restaurarlo automáticamente
    if (savedResult) {
      showGrossToNetResult(savedResult);
    }
  }, 0);
}


/*
  Contenido del sueldo bruto a neto.

  Incluye:
  - Input de sueldo bruto mensual.
  - Checkbox de sindicato (marca si aplica el 2% adicional).
  - Input de personas a cargo (afecta Ganancias).
  - Acordeón con descuentos opcionales: embargos, préstamos, otros.
  - Botón "Calcular Sueldo Neto" y contenedor donde se mostrará el resultado.
*/
function generateGrossNet() {
  return `
      <form id="form-gross-to-net" class="salary-form">
        <div class="form-group">
          <label for="gross-salary">
            Ingresá tu Sueldo Bruto Mensual
          </label>
          <input
            type="number"
            id="gross-salary"
            name="gross-salary"
            placeholder="$ 500.000"
            step="0.01"
            min="0"
            required
            autocomplete="off"
          >
          <small>Sueldo antes de descuentos</small>
        </div>

        <div class="form-group checkbox-group">
          <label class="checkbox-label">
            <input type="checkbox" id="has-union" checked>
            <span class="checkbox-text">
              ¿Estás sindicalizado? 
            </span>
          </label>
          <small>Descuento adicional del 2%</small>
        </div>

        <div class="form-group">
          <label for="dependents">
            Personas a cargo: 
          </label>
          <input 
            type="number" 
            id="dependents" 
            name="dependents"
            value="0" 
            min="0" 
            max="10"
            class="number-input"
          >
          <small>
            Hijos menores de edad y cónyuge (deducen Ganancias)
          </small>
        </div>

        <button type="submit" class="btn-primary">
          Calcular Sueldo Neto
        </button>
      </form>
  `;
}

/*
  Asocia el formulario "Bruto → Neto" al envío: evita recarga y ejecuta el cálculo bruto→neto.
*/
function setupGrossToNetForm() {
  const form = document.getElementById('form-gross-to-net');

  // ✅ Validación adicional de seguridad
  if (!form) {
    console.error('Formulario no encontrado');
    return;
  }

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    processGrossToNetCalculation();
  });
}


// PROCESAMIENTO DE CÁLCULOS
/*
  Flujo completo del cálculo Bruto → Neto.
 
  Pasos:
  1. Lee del DOM: sueldo bruto, checkbox sindicato, personas a cargo.
  2. Valida que el bruto sea mayor a cero; si no, muestra mensaje de error en el contenedor de resultado y sale.
  3. Llama al servicio calculateNetSalary con esos datos.
  4. Si todo va bien, pinta el resultado con showGrossToNetResult. Si el servicio lanza, muestra el mensaje de error.
*/
function processGrossToNetCalculation() {
  const grossSalary = parseFloat(document.getElementById('gross-salary').value);
  const hasUnion = document.getElementById('has-union').checked;
  const dependents = parseInt(document.getElementById('dependents').value);


  if (!grossSalary || grossSalary <= 0) {
    showError('result-gross-to-net', 'Por favor, ingresá un sueldo bruto válido mayor a cero');
    return;
  }

  try {
    const result = calculateNetSalary(
      grossSalary,
      hasUnion,
      dependents,
    );

    saveResult(result);

    showGrossToNetResult(result);
  } catch (error) {
    showError('result-gross-to-net', error.message);
  }
}


// VISUALIZACIÓN DE RESULTADOS

/*
  Pinta en pantalla el resultado del cálculo Bruto → Neto.
*/
function showGrossToNetResult(result) {
  const resultContainer = document.getElementById('result-gross-to-net');

  resultContainer.innerHTML = `
    <div class="result-success">
        <div class="salary-flow">
          <div class="flow-item gross">
            <span class="flow-item-title">Sueldo Bruto : </span>
            <span class="amount">$${formatCurrency(result.grossSalary)} / </span>
            <span class="percentage">100%</span>
          </div>

          <div class="flow-item deductions">
            <span class="flow-item-title">Descuentos : </span>
            <span class="amount negative">- $${formatCurrency(result.totalDeductions)} / </span>
            <span class="percentage">${result.deductionsPercentage}%</span>
          </div>

          <div class="flow-item net">
            <span class="flow-item-title">Sueldo Neto : </span>
            <span class="amount highlighted">$${formatCurrency(result.netSalary)} / </span>
            <span class="percentage">${result.netPercentage}%</span>
          </div>
        </div>

      ${generateBreakdown(result)}
    </div>
  `;
}

/**
  Arma el bloque HTML del desglose de descuentos obligatorios.

  Lista cada ítem obligatorio (jubilación, PAMI, obra social, sindicato si aplica, Ganancias) con nombre, porcentaje y monto.
*/
function generateBreakdown(result) {
  const mandatory = result.mandatoryDeductions;

  return `
    <div class="deductions-breakdown">
      <h3>Detalles sobre los descuentos</h3>

      <div class="deductions-table">
        ${generateDeductionRow('Jubilación : ', mandatory.pension, mandatory.pensionPercentage)}
        ${generateDeductionRow('PAMI : ', mandatory.pami, mandatory.pamiPercentage)}
        ${generateDeductionRow('Obra Social : ', mandatory.healthInsurance, mandatory.healthInsurancePercentage)}
        ${result.hasUnion ? generateDeductionRow('Sindicato : ', mandatory.union, mandatory.unionPercentage) : ''}
        ${generateIncomeTaxRow(result)}
      </div>

      <div class="total-deductions">
        <span class="total-deductions-title">Total descuentos : </span>
        <span class="amount">$${formatCurrency(result.totalDeductions)}</span>
      </div>
    </div>
  `;
}

/*
  Genera una fila de la tabla de descuentos: nombre (ej. "Jubilación"), porcentaje y monto formateado.
  Se usa tanto para descuentos obligatorios como para adicionales (en estos últimos el porcentaje puede ser "-").
*/
function generateDeductionRow(name, amount, percentage) {
  return `
    <div class="deduction-row">
      <span class="deduction-name">${name}</span>
      <span class="amount">$${formatCurrency(amount)} / </span>
      <span class="percentage">${percentage}%</span>
    </div>
  `;
}

/*
  Genera la fila (y opcionalmente el detalle) del Impuesto a las Ganancias.
*/
function generateIncomeTaxRow(result) {
  const incomeTax = result.mandatoryDeductions.incomeTax;

  if (incomeTax === 0) {
    return `
      <div class="deduction-row">
        <span class="deduction-name">Ganancias : </span>
        <span class="percentage">-</span>
        <span class="amount">$0,00</span>
      </div>
      <div class="positive-note">
        <small>✓ No pagás Ganancias (por debajo del mínimo no imponible)</small>
      </div>
    `;
  }

  const detail = result.mandatoryDeductions.incomeTaxDetail;

  return `
    <div class="deduction-row">
      <span class="deduction-name">Ganancias : </span>
      <span class="percentage">Variable</span>
      <span class="amount">$${formatCurrency(incomeTax)}</span>
    </div>
    ${detail ? `
      <div class="income-tax-detail">
        <small>
          Sueldo imponible : $${formatCurrency(detail.taxableSalary)} | 
          Alícuota : ${detail.appliedBracket.rate}%
        </small>
      </div>
    ` : ''}
  `;
}

/*
  Erro cuando falla la validación (ej. bruto <= 0) o cuando el servicio lanza una excepción.
*/
function showError(containerId, message) {
  const container = document.getElementById(containerId);
  container.innerHTML = `
    <div class="calculation-error entrance-animation">
      <p>⚠️ ${message}</p>
    </div>
  `;
}

/*
  Formatea un número como moneda argentina (separador de miles, 2 decimales).
  Se usa en todos los montos mostrados en resultados.
*/
function formatCurrency(number) {
  return number.toLocaleString('es-AR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}