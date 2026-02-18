
export function calculateBonus(betterSalary, entryDate, dateCalculation) {

  // Valido los datos ingresados
  if (!betterSalary || betterSalary <= 0) {
    throw new Error('El sueldo a ingresar debe ser mayor a 0');
  }

  // Valido que las fechas sean validas
  if (!(entryDate instanceof Date) || isNaN(entryDate)) {
    throw new Error('La fecha de ingreso no es válida, intente nuevamente.');
  }

  if (!(dateCalculation instanceof Date) || isNaN(dateCalculation)) {
    throw new Error('La fecha de cálculo no es válida, intente nuevamente.');
  }

  if (entryDate > dateCalculation) {
    throw new Error('La fecha de ingreso no debe ser mayor a la fecha de cálculo, intente nuevamente.');
  }

  // Determino si se trata del primer o segundo semestre
  const monthCalculation = dateCalculation.getMonth(); // 0 = Enero, 11 = Diciembre
  const yearCalculation = dateCalculation.getFullYear();

  let startSemester;
  let endSemester;

  if (monthCalculation < 6) {
    startSemester = new Date(yearCalculation, 0, 1); // 1 de Enero
    endSemester = new Date(yearCalculation, 5, 30); // 30 de Junio

  } else {
    startSemester = new Date(yearCalculation, 6, 1); // 1 de Julio
    endSemester = new Date(yearCalculation, 11, 31); // 31 de Diciembre
  }


  // Calculo la fecha exacta de inicio, le efectiva
  const effectiveStartDate = entryDate > startSemester ? entryDate : startSemester;


  // Calculo el tiempo trabajado
  const timeWorked = calculateTimeWorked(effectiveStartDate, dateCalculation); //¿Por que const?

  // Ahora calculo el aguinaldo
  const monthsOfSemester = 6;

  const monthsWorkedDecimal = timeWorked.months + (timeWorked.days / 30);
  const proportion = monthsWorkedDecimal / monthsOfSemester;

  const bonusAmount = (betterSalary / 12) * monthsWorkedDecimal;

  // Retornamos el resultado
  return {
    betterSalary: betterSalary,
    entryDate: entryDate,
    dateCalculation: dateCalculation,

    semester: monthCalculation < 6 ? 1 : 2, // ?
    startSemester: startSemester,
    endSemester: endSemester,

    effectiveStartDate: effectiveStartDate,
    monthsWorked: timeWorked.months,
    daysWorked: timeWorked.days,
    monthsWorkedDecimal: parseFloat(monthsWorkedDecimal.toFixed(2)),

    proportion: parseFloat((proportion * 100).toFixed(2)), // Porcentaje
    bonusAmount: parseFloat(bonusAmount.toFixed(2)),

    fullSemesterWork: monthsWorkedDecimal >= monthsOfSemester
  }
}

// Calculamos el tiempo trabajado entre dos fechas retornando meses completos y dias adicionales
function calculateTimeWorked(startDate, endDate) {
  // Para no modificar las fechas originales que vengan como parametros
  let start = new Date(startDate);
  let end = new Date(endDate);

  // Calculo diferencia en años y meses
  let years = end.getFullYear() - start.getFullYear();
  let months = end.getMonth() - start.getMonth();
  let days = end.getDate() - start.getDate();

  // Ajusto si los dias son negativos, esto quiere decir que no completamos el mes actual, por ende restamos 1 mes y sumamos los dias del mes anterior.
  if (days < 0) {
    months--;
    const previousMonth = new Date(end.getFullYear(), end.getMonth(), 0); // el 0 lo toma como el ultimo dia de octubre, el 31.
    days += previousMonth.getDate();
  }


  // Ajusto si los meses son negativos
  if (months < 0) {
    years--;
    months += 12;
  }

  /*
  ¿Cuándo pasa? Cuando la fecha final está en un mes anterior dentro del año siguiente.
    Ejemplo detallado (Ejemplo 2):
    Fechas:

    Inicio: 5 de Marzo 2024
    Fin: 20 de Febrero 2025

    Después del Paso 2:

    years = 1
    months = -1 ❌ (Feb es antes que Marzo en el año)
    days = 15

  */

  const totalMonths = (years * 12) + months;

  return {
    months: totalMonths,
    days: days
  }

}