import type { ApartadoMock, EstadoApartado } from './apartado'
import { formatearPrecio, type Precio } from './propiedad'
import type { EtapaProspectoVenta, ProspectoVenta } from './prospectoVenta'

// ---------------------------------------------------------------------------
// Reglas de dinero de Control Financiero — un solo lugar para las tasas de
// comisión y las probabilidades de cierre por etapa, para que la gráfica,
// el flujo proyectado, el desglose de comisiones y la rentabilidad por
// operación lean exactamente el mismo cálculo. Nada de esto se guarda en
// los datos: siempre se deriva en vivo de ProspectoVenta/ApartadoMock, así
// que si en la demo un apartado se vence o un prospecto pasa a cerrado,
// el número correcto sale solo en el siguiente render.
// ---------------------------------------------------------------------------

// 3% del precio en venta; en renta, la comisión es un mes completo de renta
// (práctica estándar) — por eso no hay una sola "tasa" para las dos.
export const TASA_COMISION_VENTA = 0.03
export const MESES_COMISION_RENTA = 1
// La inmobiliaria se queda con la mitad de su comisión; la otra mitad es
// para el asesor que cerró la operación.
export const SPLIT_ASESOR = 0.5

export interface ComisionOperacion {
  precioFinal: number
  comisionInmobiliaria: number
  comisionAsesor: number
  margenNeto: number
}

// precioFinal se estima con el punto medio de presupuestoMin/Max — el mismo
// número que ya usa Productividad de Asesores para "Valor cerrado" (ver
// ProductividadAdminPage): ProspectoVenta no guarda un precio de cierre
// exacto aparte, así que este es el único monto real disponible.
export function calcularComisionOperacion(prospecto: Pick<ProspectoVenta, 'operacion' | 'presupuestoMin' | 'presupuestoMax'>): ComisionOperacion {
  const precioFinal = (prospecto.presupuestoMin + prospecto.presupuestoMax) / 2
  const comisionInmobiliaria = prospecto.operacion === 'rentar' ? precioFinal * MESES_COMISION_RENTA : precioFinal * TASA_COMISION_VENTA
  const comisionAsesor = comisionInmobiliaria * SPLIT_ASESOR
  return { precioFinal, comisionInmobiliaria, comisionAsesor, margenNeto: comisionInmobiliaria - comisionAsesor }
}

// Comisión "devengada" = ya formalizado, todavía no pagada al asesor.
// Comisión "provisionada" = cerró pero sigue en_proceso — no se paga hasta
// formalizar, y si el trato se cae, deja de calcularse sola en el siguiente
// render (nunca hay una entrada de comisión que cancelar a mano).
export function estadoComision(prospecto: ProspectoVenta): 'provisionada' | 'devengada' | 'pagada' | null {
  if (prospecto.etapa !== 'cerrado' || !prospecto.estadoCierre) return null
  if (prospecto.estadoCierre === 'en_proceso') return 'provisionada'
  return prospecto.comisionPagada ? 'pagada' : 'devengada'
}

// Probabilidad de cierre por etapa — la usan Pipeline Proyectado y el Flujo
// a 90 días. 'negociacion' es la única etapa previa a cierre que cuenta
// como pipeline: un lead en 'mostrando' todavía no tiene nada concreto que
// proyectar.
export const PROBABILIDAD_NEGOCIACION = 0.6

export const PROBABILIDAD_APARTADO: Record<EstadoApartado, number> = {
  activo: 0.75,
  por_vencer: 0.4,
  vencido: 0,
  convertido: 0,
}

export interface EtiquetaFormalizacion {
  formalizado: string
  enProceso: string
}

// Mismo campo (estadoCierre), distinta palabra según sea venta o renta —
// una renta no "escritura".
export const ETIQUETA_FORMALIZACION: Record<'comprar' | 'rentar', EtiquetaFormalizacion> = {
  comprar: { formalizado: 'Escriturado', enProceso: 'En proceso de escrituración' },
  rentar: { formalizado: 'Contrato firmado', enProceso: 'En proceso de firma' },
}

export function diasEntre(desde: string, hasta: Date = new Date()): number {
  return Math.floor((hasta.getTime() - new Date(desde).getTime()) / 86_400_000)
}

export function precioComoTexto(monto: number, moneda: Precio['moneda'] = 'MXN'): string {
  return formatearPrecio({ monto: Math.round(monto), moneda })
}

// Comisión esperada de un apartado activo/por vencer — se busca el precio
// real de venta de la propiedad en Inventario (Separación no guarda precio
// propio) y se le aplica la misma tasa de venta que cualquier cierre.
export function comisionEsperadaApartado(precioVentaPropiedad: number, estado: EstadoApartado): number {
  return precioVentaPropiedad * TASA_COMISION_VENTA * PROBABILIDAD_APARTADO[estado]
}

export const ETAPAS_PIPELINE: EtapaProspectoVenta[] = ['negociacion']

export function esApartadoEnPipeline(apartado: ApartadoMock): boolean {
  return apartado.estado === 'activo' || apartado.estado === 'por_vencer'
}
