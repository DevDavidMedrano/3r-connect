// Tasa fija de referencia para la estimación; no es una oferta de crédito
// real. Compartido entre la calculadora de la landing (MortgageCalculator)
// y la de la ficha de propiedad, para que ambas usen la misma matemática.
export const TASA_ANUAL_ESTIMADA = 0.115
export const PLAZOS_ANIOS = [5, 10, 15, 20, 25, 30]

export function calcularPagoMensual(precio: number, enganchePct: number, plazoAnios: number): number {
  const montoFinanciado = precio * (1 - enganchePct / 100)
  const tasaMensual = TASA_ANUAL_ESTIMADA / 12
  const meses = plazoAnios * 12
  const factor = Math.pow(1 + tasaMensual, meses)
  return (montoFinanciado * tasaMensual * factor) / (factor - 1)
}
