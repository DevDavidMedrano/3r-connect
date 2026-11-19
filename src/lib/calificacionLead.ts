import { ZONAS_DESTACADAS } from '../data/zonasDestacadasDemo'

export interface CalificacionLead {
  presupuesto: string | null
  zona: string | null
  operacion: 'Compra' | 'Renta' | null
  recamaras: number | null
  credito: boolean
}

export const CALIFICACION_VACIA: CalificacionLead = {
  presupuesto: null,
  zona: null,
  operacion: null,
  recamaras: null,
  credito: false,
}

// Requiere signo de $ o una palabra de unidad monetaria junto al número —
// así "2 recámaras" o "253 m²" no se confunden con un presupuesto.
const REGEX_PRESUPUESTO = /\$\s?\d[\d,.]*(?:\s?(?:millones?|mdp|mil|k))?|\d[\d,.]*\s?(?:millones?|mdp|mil|pesos)/i
const REGEX_RECAMARAS = /(\d+)\s*rec[aá]maras?/i

// Tecamachalco es cobertura del agente pero no aparece en "Zonas
// destacadas" de la landing todavía — se agrega solo aquí.
const NOMBRES_ZONA = [...ZONAS_DESTACADAS.map((zona) => zona.nombre), 'Tecamachalco']

// Heurística simple sobre texto libre, no NLP real: suficiente para una
// demo. Cada campo se sobreescribe solo si el mensaje trae una señal
// nueva — si no, conserva lo ya detectado en mensajes anteriores.
export function actualizarCalificacion(actual: CalificacionLead, mensaje: string): CalificacionLead {
  const texto = mensaje.toLowerCase()
  const siguiente = { ...actual }

  const coincidePresupuesto = mensaje.match(REGEX_PRESUPUESTO)
  if (coincidePresupuesto) siguiente.presupuesto = coincidePresupuesto[0].trim()

  const zonaEncontrada = NOMBRES_ZONA.find((zona) => texto.includes(zona.toLowerCase()))
  if (zonaEncontrada) siguiente.zona = zonaEncontrada

  const coincideRecamaras = mensaje.match(REGEX_RECAMARAS)
  if (coincideRecamaras) siguiente.recamaras = Number(coincideRecamaras[1])

  if (/renta/.test(texto)) siguiente.operacion = 'Renta'
  else if (/compr|venta/.test(texto)) siguiente.operacion = 'Compra'

  if (/crédito|credito|infonavit|fovissste|preaprobad|pre-aprobad|cofinavit/.test(texto)) {
    siguiente.credito = true
  }

  return siguiente
}

// Nota autogenerada para el asesor a partir de lo detectado en la
// conversación — no es una llamada aparte a la IA: usa la misma
// heurística de actualizarCalificacion, así que funciona igual en modo
// respaldo (sin red) que con el agente real.
export function resumenParaAsesor(calificacion: CalificacionLead): string {
  const partes: string[] = []
  if (calificacion.operacion) partes.push(`Busca ${calificacion.operacion.toLowerCase()}`)
  if (calificacion.zona) partes.push(`en ${calificacion.zona}`)
  if (calificacion.recamaras) partes.push(`${calificacion.recamaras} recámaras`)
  if (calificacion.presupuesto) partes.push(`presupuesto ${calificacion.presupuesto}`)
  if (calificacion.credito) partes.push('con crédito preaprobado')
  return partes.length ? `${partes.join(', ')}.` : 'Conversación en curso.'
}
