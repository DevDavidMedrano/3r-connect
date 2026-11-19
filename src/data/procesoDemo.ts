import { propiedadesConFotoReal } from './propiedadesDemo'
import type { DocumentoExpediente, MovimientoPago, PasoProceso, ProcesoCliente } from '../types/proceso'
import { PLANTILLA_COMPRADOR, clonarPlantilla } from '../types/expedienteValidacion'

// DEMO — proceso de compra ficticio. El folio y la operación se toman de
// propiedadesConFotoReal[0] (no se inventan aparte) para que la ficha de
// propiedad, el agente de WhatsApp y este tablero de seguimiento hablen
// siempre de la misma unidad. Fechas, documentos y movimientos son
// inventados, con montos consistentes con el precio y el esquema de pagos
// reales de esa unidad (30% enganche durante obra, 70% contra entrega).

const propiedadDemo = propiedadesConFotoReal[0]
const [listadoDemo] = propiedadDemo.listados

const pasos: readonly PasoProceso[] = [
  {
    orden: 1,
    titulo: 'Interés',
    descripcion: 'El cliente mostró interés por la unidad a través del portal.',
    responsable: 'cliente',
    estado: 'completado',
    fechaCompletado: '2026-06-02',
  },
  {
    orden: 2,
    titulo: 'Visita',
    descripcion: 'Recorrido guiado por un asesor, en sitio o por videollamada.',
    responsable: 'ambos',
    estado: 'completado',
    fechaCompletado: '2026-06-10',
  },
  {
    orden: 3,
    titulo: 'Apartado',
    descripcion: 'Pago de apartado para congelar el precio y retirar la unidad de disponibilidad.',
    responsable: 'ambos',
    estado: 'completado',
    fechaCompletado: '2026-06-18',
  },
  {
    orden: 4,
    titulo: 'Documentación',
    descripcion: 'El cliente entrega identificación, comprobantes de domicilio e ingresos.',
    responsable: 'cliente',
    estado: 'completado',
    fechaCompletado: '2026-07-28',
  },
  {
    orden: 5,
    titulo: 'Validación',
    descripcion: 'La inmobiliaria revisa el expediente y confirma que está completo.',
    responsable: 'inmobiliaria',
    estado: 'actual',
  },
  {
    orden: 6,
    titulo: 'Firma',
    descripcion: 'Firma del contrato de compraventa ante la notaría asignada.',
    responsable: 'notaria',
    estado: 'pendiente',
  },
  {
    orden: 7,
    titulo: 'Escrituración',
    descripcion: 'Inscripción de la escritura y entrega de llaves.',
    responsable: 'notaria',
    estado: 'pendiente',
  },
]

// Los 21 documentos "Del Comprador" salen de la misma plantilla que usa
// cualquier otro caso en Confianza y Validación (ver
// types/expedienteValidacion.ts) — solo se sobrescribe el estado de los
// que sí tienen historia propia en esta demo. El comprobante de ingresos y
// el estado de cuenta se dejan pendientes a propósito: son exactamente los
// dos que bloquean su expediente en /admin/validacion.
const documentosComprador = clonarPlantilla(PLANTILLA_COMPRADOR, {
  'comprador-ine': { estado: 'validado', fechaActualizacion: '2026-06-20', validadoPor: 'Fernando Castro', validadoEn: '2026-06-21' },
  'comprador-curp': { estado: 'validado', fechaActualizacion: '2026-06-20', validadoPor: 'Fernando Castro', validadoEn: '2026-06-21' },
  'comprador-rfc': { estado: 'validado', fechaActualizacion: '2026-06-22', validadoPor: 'Fernando Castro', validadoEn: '2026-06-23' },
  // Vencido a propósito aunque ya está validado — un comprobante de
  // domicilio con más de un mes no debería seguir contando como vigente.
  'comprador-domicilio': {
    estado: 'validado',
    fechaActualizacion: '2026-06-22',
    fechaVencimiento: '2026-08-01',
    validadoPor: 'Fernando Castro',
    validadoEn: '2026-06-23',
  },
  'comprador-nacimiento': { estado: 'validado', fechaActualizacion: '2026-06-22', validadoPor: 'Fernando Castro', validadoEn: '2026-06-23' },
  'comprador-ingresos': { estado: 'en_revision', fechaActualizacion: '2026-07-28' },
  'comprador-estado-cuenta': { estado: 'pendiente' },
  'comprador-buro': {
    estado: 'validado',
    fechaActualizacion: '2026-07-15',
    fechaVencimiento: '2026-10-15',
    validadoPor: 'Fernando Castro',
    validadoEn: '2026-07-16',
  },
  'comprador-origen-recursos': { estado: 'validado', fechaActualizacion: '2026-07-15', validadoPor: 'Fernando Castro', validadoEn: '2026-07-16' },
  'comprador-pld': { estado: 'validado', fechaActualizacion: '2026-06-20', validadoPor: 'Fernando Castro', validadoEn: '2026-06-21' },
})

// Contrato de apartado y carta de instrucción notarial no son del comprador
// ni de un vendedor persona física (3R-110 es preventa de un desarrollador):
// se recategorizan a 'casa'/'vendedor' en vez de inventar un quinto bloque
// que el encargo no pidió.
const documentos: readonly DocumentoExpediente[] = [
  ...documentosComprador,
  {
    id: 'doc-contrato-apartado',
    nombre: 'Contrato de apartado',
    origen: 'entrega_inmobiliaria',
    categoria: 'casa',
    estado: 'validado',
    fechaActualizacion: '2026-06-18',
    validadoPor: 'Fernando Castro',
    validadoEn: '2026-06-19',
  },
  {
    id: 'doc-carta-instruccion',
    nombre: 'Carta de instrucción notarial',
    origen: 'entrega_inmobiliaria',
    categoria: 'vendedor',
    estado: 'validado',
    fechaActualizacion: '2026-06-19',
    validadoPor: 'Fernando Castro',
    validadoEn: '2026-06-20',
  },
]

const movimientos: readonly MovimientoPago[] = [
  {
    id: 'mov-apartado',
    concepto: 'Apartado',
    monto: { monto: 50_000, moneda: listadoDemo.precio.moneda },
    fecha: '2026-06-18',
    estado: 'pagado',
  },
  {
    id: 'mov-enganche',
    concepto: 'Enganche (30% durante obra)',
    monto: { monto: Math.round(listadoDemo.precio.monto * 0.3), moneda: listadoDemo.precio.moneda },
    fecha: '2026-08-15',
    estado: 'programado',
  },
  {
    id: 'mov-contra-entrega',
    concepto: 'Liquidación contra entrega (70%)',
    monto: { monto: Math.round(listadoDemo.precio.monto * 0.7), moneda: listadoDemo.precio.moneda },
    fecha: '2027-09-01',
    estado: 'pendiente',
  },
]

export const procesoDemo: ProcesoCliente = {
  tipo: 'compra',
  folio: propiedadDemo.folio,
  operacion: listadoDemo.operacion,
  iniciado: '2026-06-02',
  cierreEstimado: '2027-09',
  pasos,
  documentos,
  movimientos,
}
