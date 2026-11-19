import type { Listado, Precio } from './propiedad'

// ---------------------------------------------------------------------------
// ProcesoCliente — el seguimiento de una transacción sobre una propiedad,
// entidad aparte de Propiedad: se relacionan por folio, nunca por referencia
// directa. Propiedad es el inventario (qué es la unidad); ProcesoCliente es
// la transacción (en qué punto va, con quién, con qué papeles y qué pagos).
//
// Sirve para dos casos con la misma forma: el proceso de COMPRA/RENTA de un
// cliente sobre una unidad, y el proceso de PUBLICACIÓN de una propiedad de
// un vendedor. Los pasos, el responsable de cada paso y los estados son los
// mismos vocabularios en ambos casos — solo cambia el contenido (títulos,
// descripciones, documentos). `tipo` discrimina cuál de los dos es.
// ---------------------------------------------------------------------------

export type TipoProceso = 'compra' | 'publicacion'

export type ResponsablePaso = 'cliente' | 'inmobiliaria' | 'ambos' | 'notaria'

export type EstadoPaso = 'completado' | 'actual' | 'pendiente'

export interface PasoProceso {
  orden: number
  titulo: string
  descripcion: string
  responsable: ResponsablePaso
  estado: EstadoPaso
  fechaCompletado?: string
}

export type EstadoDocumento = 'pendiente' | 'en_revision' | 'validado' | 'rechazado'

export type OrigenDocumento = 'sube_cliente' | 'entrega_inmobiliaria'

// Los 4 bloques del expediente de Confianza y Validación — 'comprador' es
// siempre origen 'sube_cliente' y es la misma lista que ve el cliente en
// /mi-cuenta/documentos (ver DocumentosClientePage); los otros tres son del
// lado de la propiedad/vendedor, no del comprador.
export type CategoriaDocumento = 'casa' | 'vendedor' | 'isr' | 'comprador'

export interface DocumentoExpediente {
  id: string
  nombre: string
  origen: OrigenDocumento
  estado: EstadoDocumento
  categoria?: CategoriaDocumento
  // No bloquea "Aprobar expediente" aunque falte — depende del caso (crédito,
  // estado civil, si es extranjero, etc.).
  opcional?: boolean
  // Solo documentos con vigencia real (predial, estados de cuenta, buró de
  // crédito) la traen — un documento validado puede seguir vencido.
  fechaVencimiento?: string
  fechaActualizacion?: string
  validadoPor?: string
  validadoEn?: string
  // Solo se llena cuando estado === 'rechazado' — se le muestra tal cual al
  // cliente en su portal, nunca solo "rechazado" a secas.
  motivoRechazo?: string
}

export function documentoVencido(documento: DocumentoExpediente, ahora: Date = new Date()): boolean {
  return Boolean(documento.fechaVencimiento) && new Date(documento.fechaVencimiento!) < ahora
}

const ETIQUETA_CATEGORIA_DOC: Record<CategoriaDocumento, string> = {
  casa: 'De la Casa',
  vendedor: 'Del Vendedor',
  isr: 'Exención de ISR',
  comprador: 'Del Comprador',
}

export function etiquetaCategoriaDocumento(categoria: CategoriaDocumento): string {
  return ETIQUETA_CATEGORIA_DOC[categoria]
}

export type EstadoMovimiento = 'pagado' | 'programado' | 'pendiente'

// Monto siempre como Precio (monto + moneda), nunca un number suelto: un
// movimiento en USD junto a otro en MXN sin la moneda explícita se presta
// a leerse mal, igual que con el precio de una propiedad.
export interface MovimientoPago {
  id: string
  concepto: string
  monto: Precio
  fecha: string
  estado: EstadoMovimiento
}

export interface ProcesoCliente {
  tipo: TipoProceso
  folio: string
  operacion: Listado['operacion']
  iniciado: string
  cierreEstimado: string
  pasos: readonly PasoProceso[]
  documentos: readonly DocumentoExpediente[]
  movimientos: readonly MovimientoPago[]
}

// ---------------------------------------------------------------------------
// Helpers — puros, sin acceso a red ni estado: toman un ProcesoCliente (o un
// valor de sus enums) y devuelven lo que la UI necesita pintar.
// ---------------------------------------------------------------------------

export function pasoActual(proceso: ProcesoCliente): PasoProceso | undefined {
  return proceso.pasos.find((paso) => paso.estado === 'actual')
}

export function pasosCompletados(proceso: ProcesoCliente): PasoProceso[] {
  return proceso.pasos.filter((paso) => paso.estado === 'completado')
}

// Pasos que le toca mover al cliente: los que no responsable exclusivo de la
// inmobiliaria o la notaría, y que todavía no están completados.
export function pendientesDelCliente(proceso: ProcesoCliente): PasoProceso[] {
  return proceso.pasos.filter(
    (paso) =>
      paso.estado !== 'completado' && (paso.responsable === 'cliente' || paso.responsable === 'ambos'),
  )
}

const ETIQUETA_RESPONSABLE: Record<ResponsablePaso, string> = {
  cliente: 'Cliente',
  inmobiliaria: 'Inmobiliaria',
  ambos: 'Cliente e inmobiliaria',
  notaria: 'Notaría',
}

export function etiquetaResponsable(responsable: ResponsablePaso): string {
  return ETIQUETA_RESPONSABLE[responsable]
}

const ETIQUETA_DOCUMENTO: Record<EstadoDocumento, string> = {
  pendiente: 'Pendiente',
  en_revision: 'En revisión',
  validado: 'Validado',
  rechazado: 'Rechazado',
}

export function etiquetaDocumento(estado: EstadoDocumento): string {
  return ETIQUETA_DOCUMENTO[estado]
}

const ETIQUETA_MOVIMIENTO: Record<EstadoMovimiento, string> = {
  pagado: 'Pagado',
  programado: 'Programado',
  pendiente: 'Pendiente',
}

export function etiquetaMovimiento(estado: EstadoMovimiento): string {
  return ETIQUETA_MOVIMIENTO[estado]
}
