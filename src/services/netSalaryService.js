
// DESCUENTOS OBLIGATORIOS
const MANDATORY_DEDUCTIONS = {
  pension: 0.11,         // 11% (jubilación)
  pami: 0.03,            // 3%
  healthInsurance: 0.03, // 3% (obra social)
  union: 0.02,           // 2% (opcional)
};


// Mínimo no imponible para el Impuesto a las Ganancias (4ta categoría), estimado para 2026.
const INCOME_TAX_THRESHOLD = 2800000;

// Deducción por pesona a cargo:
const DEDUCTION_PER_DEPENDENT = 280000;


/**
 * Escalas del Impuesto a las Ganancias (4ta categoría). Valores estimados para 2026.
 *
 * Cada tramo define:
 * - from: límite inferior del tramo (en pesos).
 * - to: límite superior del tramo.
 * - rate: alícuota aplicable (ej. 0.05 = 5%).
 * - deduction: monto fijo que se resta en la fórmula para que el impuesto sea progresivo.
 *
 * Fórmula por tramo: Impuesto = (sueldo imponible × rate) - deduction
 * El sueldo imponible puede reducirse por deducción por personas a cargo.
 */
const INCOME_TAX_BRACKETS = [
  { from: 0, to: 2800000, rate: 0, deduction: 0 },
  { from: 2800000, to: 4200000, rate: 0.05, deduction: 140000 },
  { from: 4200000, to: 5600000, rate: 0.09, deduction: 308000 },
  { from: 5600000, to: 7000000, rate: 0.12, deduction: 476000 },
  { from: 7000000, to: 8400000, rate: 0.15, deduction: 686000 },
  { from: 8400000, to: Infinity, rate: 0.27, deduction: 1694000 }
];


// FUNCIÓN PRINCIPAL: BRUTO → NETO
/*
  Calcula el sueldo neto a partir del sueldo bruto mensual.

  1. Valida que el bruto sea mayor a cero y que las personas a cargo no sean negativas.
  2. Calcula cada descuento obligatorio (jubilación, PAMI, obra social, sindicato) como porcentaje del bruto.
  3. Calcula el Impuesto a las Ganancias según escalas (con deducción por personas a cargo).
  4. Suma los descuentos adicionales opcionales (embargos, préstamos, otros).
  5. Obtiene el total de descuentos y el neto (bruto - total descuentos).
  6. Calcula porcentajes (qué % del bruto son descuentos y qué % es neto).
  7. Devuelve un objeto con todo el detalle para mostrar en pantalla.
*/
export function calculateNetSalary(grossSalary, hasUnion = true, dependentsCount = 0) {

  // Valido los ingresos
  if (!grossSalary || grossSalary <= 0) {
    throw new Error('El sueldo bruto debe ser mayor a cero');
  }
  if (dependentsCount < 0) {
    throw new Error('Las personas a cargo no pueden ser negativas');
  }

  // Descuentos obligatorios como % del bruto ---
  const pension = grossSalary * MANDATORY_DEDUCTIONS.pension;
  const pami = grossSalary * MANDATORY_DEDUCTIONS.pami;
  const healthInsurance = grossSalary * MANDATORY_DEDUCTIONS.healthInsurance;
  const union = hasUnion ? grossSalary * MANDATORY_DEDUCTIONS.union : 0;

  // Impuesto a las Ganancias (según escalas y personas a cargo)
  const incomeTax = calculateIncomeTax(grossSalary, dependentsCount);

  // Totales
  const totalDeductions = pension + pami + healthInsurance + union + incomeTax;

  // Sueldo neto y porcentajes
  const netSalary = grossSalary - totalDeductions;
  const deductionsPercentage = (totalDeductions / grossSalary) * 100;
  const netPercentage = (netSalary / grossSalary) * 100;

  // Objeto resultado con todo el detalle
  return {
    grossSalary: parseFloat(grossSalary.toFixed(2)),
    hasUnion,
    dependentsCount,

    mandatoryDeductions: {
      pension: parseFloat(pension.toFixed(2)),
      pensionPercentage: MANDATORY_DEDUCTIONS.pension * 100,
      pami: parseFloat(pami.toFixed(2)),
      pamiPercentage: MANDATORY_DEDUCTIONS.pami * 100,
      healthInsurance: parseFloat(healthInsurance.toFixed(2)),
      healthInsurancePercentage: MANDATORY_DEDUCTIONS.healthInsurance * 100,
      union: parseFloat(union.toFixed(2)),
      unionPercentage: hasUnion ? MANDATORY_DEDUCTIONS.union * 100 : 0,
      incomeTax: parseFloat(incomeTax.toFixed(2)),
      incomeTaxDetail: incomeTax > 0 ? calculateIncomeTaxDetail(grossSalary, dependentsCount) : null,
      total: parseFloat(totalDeductions.toFixed(2))
    },

    totalDeductions: parseFloat(totalDeductions.toFixed(2)),
    netSalary: parseFloat(netSalary.toFixed(2)),
    deductionsPercentage: parseFloat(deductionsPercentage.toFixed(2)),
    netPercentage: parseFloat(netPercentage.toFixed(2)),
    paysIncomeTax: incomeTax > 0,
    minimumTaxableIncome: INCOME_TAX_THRESHOLD
  };
}

// IMPUESTO A LAS GANANCIAS
/*
 Calcula el monto del Impuesto a las Ganancias a descontar.

  1. Se deduce del bruto un monto por cada persona a cargo ($280.000 por carga, valor estimado).
  2. Eso da el "sueldo imponible". Si es <= mínimo no imponible, no se paga Ganancias (devolvemos 0).
  3. Se busca en qué tramo de la tabla cae el sueldo imponible.
  4. Se aplica la fórmula: (sueldo imponible × alícuota del tramo) - deducción del tramo.
  5. Se devuelve el mayor entre ese resultado y 0 (nunca impuesto negativo).
*/
function calculateIncomeTax(grossSalary, dependentsCount) {
  const dependentsDeduction = dependentsCount * DEDUCTION_PER_DEPENDENT;
  const taxableSalary = Math.max(0, grossSalary - dependentsDeduction);

  if (taxableSalary <= INCOME_TAX_THRESHOLD) {
    return 0;
  }

  const bracket = INCOME_TAX_BRACKETS.find(b =>
    taxableSalary >= b.from && taxableSalary < b.to
  );

  if (!bracket) {
    return 0;
  }

  const tax = (taxableSalary * bracket.rate) - bracket.deduction;
  return Math.max(0, tax);
}

/*
  Genera el detalle del cálculo de Ganancias para mostrarlo al usuario
  (sueldo imponible, deducción por cargas, tramo aplicado y alícuota).
  Se usa cuando el usuario paga Ganancias (monto > 0) para mostrar en pantalla
  en qué tramo quedó y cuál fue la base imponible.
*/
function calculateIncomeTaxDetail(grossSalary, dependentsCount) {
  const dependentsDeduction = dependentsCount * DEDUCTION_PER_DEPENDENT;
  const taxableSalary = Math.max(0, grossSalary - dependentsDeduction);

  const bracket = INCOME_TAX_BRACKETS.find(b =>
    taxableSalary >= b.from && taxableSalary < b.to
  );

  return {
    taxableSalary: parseFloat(taxableSalary.toFixed(2)),
    dependentsDeduction: parseFloat(dependentsDeduction.toFixed(2)),
    appliedBracket: bracket ? {
      rate: bracket.rate * 100,
      deduction: bracket.deduction
    } : null
  };
}
