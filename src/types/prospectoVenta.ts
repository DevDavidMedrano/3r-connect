import type { CalificacionLead } from '../lib/calificacionLead'
import type { Moneda, Precio, Propiedad, TipoPropiedad } from './propiedad'

// ---------------------------------------------------------------------------
// ProspectoVenta — un comprador o inquilino (la DEMANDA), opuesto a
// Prospecto en types/prospecto.ts (dueños que quieren VENDER, la OFERTA).
// No guarda un folio de propiedad fijo: guarda qué busca (presupuesto,
// zonas, tipo) y las propiedades de interés se calculan siempre en vivo con
// propiedadesSugeridas() contra el inventario real — así "se sugieren
// automáticamente" nunca queda desactualizado ni duplica datos de Propiedad.
// ---------------------------------------------------------------------------

export type EtapaProspectoVenta = 'nuevo' | 'calificado' | 'mostrando' | 'negociacion' | 'cerrado'

const ORDEN_ETAPAS: EtapaProspectoVenta[] = ['nuevo', 'calificado', 'mostrando', 'negociacion', 'cerrado']

// Usado por "Registrar interés" al cerrar una cita como asistida (ver
// AgendaAdminPage) — sin-op si ya está en 'cerrado'.
export function siguienteEtapa(etapa: EtapaProspectoVenta): EtapaProspectoVenta {
  const indice = ORDEN_ETAPAS.indexOf(etapa)
  return indice === -1 || indice === ORDEN_ETAPAS.length - 1 ? etapa : ORDEN_ETAPAS[indice + 1]
}

// El prospecto del cliente Demo (folio 3R-110, ver prospectosVentaDemo.ts)
// — Agenda y /mi-cuenta/visitas lo usan para saber qué citas mostrarle al
// cliente logueado sin adivinar por nombre.
export const ID_PROSPECTO_DEMO = 'prospecto-venta-10'

export type OrigenProspectoVenta = 'portal_3r' | 'agente_ia' | 'sitio_web' | 'referido' | 'llamada'

export type OperacionBusqueda = 'comprar' | 'rentar'

// Ciclo de dinero de un cierre — leído por Control Financiero
// (types/finanzas.ts) para separar comisión provisionada de devengada.
// 'formalizado' es el nombre neutro para "ya escrituró" (venta) o "ya se
// firmó el contrato" (renta): un mismo campo sirve para las dos
// operaciones sin forzar la palabra "escrituró" sobre una renta.
export type EstadoCierre = 'en_proceso' | 'formalizado'

// Si la inmobiliaria ya cobró su comisión de esta operación o sigue en
// cartera por cobrar — antigüedad se calcula desde `fechaCierre`.
export type EstadoPago = 'pendiente' | 'cobrado'

export interface ProspectoVenta {
  id: string
  nombre: string
  correo: string
  telefono: string
  origen: OrigenProspectoVenta
  operacion: OperacionBusqueda
  presupuestoMin: number
  presupuestoMax: number
  moneda: Moneda
  zonas: string[]
  recamarasMin: number | null
  tipoPropiedad: TipoPropiedad | null
  creditoPreaprobado: boolean
  etapa: EtapaProspectoVenta
  asesorId: string | null
  fecha: string
  ultimoContacto: string
  // Solo se llena cuando "Registrar apartado" se ejecuta (o, para el
  // prospecto Demo, viene precargada) — la usa la tarjeta "Cerrados este
  // mes".
  fechaCierre: string | null
  // Los siguientes cuatro solo tienen sentido cuando etapa === 'cerrado' —
  // en cualquier otra etapa se omiten en vez de forzarlos a null. Control
  // Financiero (types/finanzas.ts) es el único lector; no se duplican en
  // ningún otro archivo.
  estadoCierre?: EstadoCierre
  estadoPago?: EstadoPago
  fechaCobro?: string | null
  // Solo puede ser true si estadoCierre === 'formalizado' — la provisionada
  // nunca se paga (ver calcularComisionOperacion).
  comisionPagada?: boolean
}

export const ETIQUETA_ETAPA_VENTA: Record<EtapaProspectoVenta, string> = {
  nuevo: 'Nuevo',
  calificado: 'Calificado',
  mostrando: 'Mostrando',
  negociacion: 'Negociación',
  cerrado: 'Cerrado',
}

export const ETIQUETA_ORIGEN_VENTA: Record<OrigenProspectoVenta, string> = {
  portal_3r: 'Portal 3R',
  agente_ia: 'Agente IA',
  sitio_web: 'Sitio web',
  referido: 'Referido',
  llamada: 'Llamada',
}

// El listado relevante según qué busca el prospecto: comprar mira venta y
// preventa, rentar mira renta — nunca precioMinimo() genérico, que podría
// devolver el precio de renta de una unidad que también se compra.
export function precioParaOperacion(propiedad: Propiedad, operacion: OperacionBusqueda): Precio | null {
  const claves = operacion === 'comprar' ? ['venta', 'preventa'] : ['renta']
  const listado = propiedad.listados.find((l) => claves.includes(l.operacion))
  return listado ? listado.precio : null
}

// Empate simple: mismo tipo de operación, precio dentro del rango, zona
// (si se especificó) contenida en la colonia real de la propiedad. Se
// llama en cada render en vez de guardarse en el prospecto, para que
// siempre refleje el inventario actual.
export function propiedadesSugeridas(
  prospecto: Pick<ProspectoVenta, 'operacion' | 'presupuestoMin' | 'presupuestoMax' | 'zonas' | 'tipoPropiedad'>,
  propiedades: Propiedad[],
): Propiedad[] {
  return propiedades.filter((propiedad) => {
    if (prospecto.tipoPropiedad && propiedad.tipo !== prospecto.tipoPropiedad) return false
    const precio = precioParaOperacion(propiedad, prospecto.operacion)
    if (!precio) return false
    if (precio.monto < prospecto.presupuestoMin || precio.monto > prospecto.presupuestoMax) return false
    if (prospecto.zonas.length === 0) return true
    return prospecto.zonas.some((zona) => propiedad.ubicacion.colonia.toLowerCase().includes(zona.toLowerCase()))
  })
}

export function diasDesde(fechaISO: string): number {
  const msPorDia = 1000 * 60 * 60 * 24
  return Math.max(0, Math.floor((Date.now() - new Date(fechaISO).getTime()) / msPorDia))
}

// "8,000,000" · "$8,500,000" · "8 millones" · "8mdp" · "500 mil" → un
// número aproximado en pesos. No intenta ser exacto: calificacionLead.ts ya
// hizo la extracción del texto libre, esto solo lo vuelve numérico para
// poder cruzarlo contra precios reales.
function montoAproximado(texto: string): number | null {
  const numeroMatch = texto.match(/[\d,.]+/)
  if (!numeroMatch) return null
  const numero = Number(numeroMatch[0].replace(/,/g, ''))
  if (Number.isNaN(numero) || numero <= 0) return null
  const minusculas = texto.toLowerCase()
  if (/mill|mdp/.test(minusculas)) return numero * 1_000_000
  if (/\bmil\b|\bk\b/.test(minusculas)) return numero * 1_000
  return numero
}

export interface ContextoCalificacion {
  asesorId: string
  tipoPropiedad: TipoPropiedad
  nombreContacto: string
  correoContacto: string
  telefonoContacto: string
}

// Punto de entrada de la conexión con el agente de WhatsApp (ver
// WhatsAppModal.tsx) — reusa exactamente lo que actualizarCalificacion() ya
// extrajo del chat, sin volver a pedirle nada al usuario ni reinventar el
// modelo de calificación.
export function prospectoDesdeCalificacion(
  id: string,
  calificacion: CalificacionLead,
  contexto: ContextoCalificacion,
): ProspectoVenta {
  const monto = calificacion.presupuesto ? montoAproximado(calificacion.presupuesto) : null
  const presupuestoBase = monto ?? 10_000_000

  return {
    id,
    nombre: contexto.nombreContacto,
    correo: contexto.correoContacto,
    telefono: contexto.telefonoContacto,
    origen: 'agente_ia',
    operacion: calificacion.operacion === 'Renta' ? 'rentar' : 'comprar',
    presupuestoMin: Math.round(presupuestoBase * 0.85),
    presupuestoMax: Math.round(presupuestoBase * 1.15),
    moneda: 'MXN',
    zonas: calificacion.zona ? [calificacion.zona.toLowerCase()] : [],
    recamarasMin: calificacion.recamaras,
    tipoPropiedad: contexto.tipoPropiedad,
    creditoPreaprobado: calificacion.credito,
    etapa: 'calificado',
    asesorId: contexto.asesorId,
    fecha: new Date().toISOString().slice(0, 10),
    ultimoContacto: new Date().toISOString().slice(0, 10),
    fechaCierre: null,
  }
}
