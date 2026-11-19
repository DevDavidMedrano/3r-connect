import type { DocumentoExpediente } from './proceso'

// ---------------------------------------------------------------------------
// CasoValidacion — un expediente en revisión en Confianza y Validación que
// NO tiene ya un ProcesoCliente propio (el del cliente Demo sí lo tiene:
// usa procesoCompra.documentos directo, ver ValidacionAdminPage). Estos son
// más ligeros a propósito: no necesitan pasos ni movimientos, solo el
// expediente.
// ---------------------------------------------------------------------------

export type EstadoCaso = 'en_revision' | 'aprobado' | 'rechazado'

export interface CasoValidacion {
  id: string
  folio: string
  clienteNombre: string
  asesorId: string | null
  documentos: DocumentoExpediente[]
  fechaInicio: string
  estado: EstadoCaso
  fechaAprobado: string | null
}

// ---------------------------------------------------------------------------
// Plantillas — la lista de documentos de cada bloque es un catálogo fijo
// ("ya está bien", según el encargo); lo que varía por caso es el estado de
// cada uno. clonarPlantilla() aplica overrides por id sobre la plantilla,
// para no repetir los 21 documentos de comprador a mano en cada caso.
// ---------------------------------------------------------------------------

type PlantillaDoc = Omit<DocumentoExpediente, 'estado' | 'fechaActualizacion' | 'validadoPor' | 'validadoEn' | 'motivoRechazo'>

export const PLANTILLA_CASA: PlantillaDoc[] = [
  { id: 'casa-escritura', nombre: 'Escritura pública anterior', origen: 'sube_cliente', categoria: 'casa' },
  { id: 'casa-libertad-gravamen', nombre: 'Certificado de Libertad de Gravamen', origen: 'sube_cliente', categoria: 'casa' },
  { id: 'casa-predial', nombre: 'Boleta de pago predial al corriente', origen: 'sube_cliente', categoria: 'casa' },
  { id: 'casa-avaluo', nombre: 'Avalúo comercial de la propiedad', origen: 'entrega_inmobiliaria', categoria: 'casa' },
  { id: 'casa-planos', nombre: 'Planos arquitectónicos', origen: 'entrega_inmobiliaria', categoria: 'casa' },
  { id: 'casa-no-adeudo', nombre: 'Constancia de no adeudo (mantenimiento/condominio)', origen: 'sube_cliente', categoria: 'casa' },
]

export const PLANTILLA_VENDEDOR: PlantillaDoc[] = [
  { id: 'vendedor-ine', nombre: 'Identificación oficial del vendedor (INE)', origen: 'sube_cliente', categoria: 'vendedor' },
  { id: 'vendedor-curp', nombre: 'CURP del vendedor', origen: 'sube_cliente', categoria: 'vendedor' },
  { id: 'vendedor-rfc', nombre: 'RFC del vendedor (constancia de situación fiscal)', origen: 'sube_cliente', categoria: 'vendedor' },
  { id: 'vendedor-domicilio', nombre: 'Comprobante de domicilio del vendedor', origen: 'sube_cliente', categoria: 'vendedor' },
  {
    id: 'vendedor-conyuge',
    nombre: 'Acta de matrimonio / identificación del cónyuge',
    origen: 'sube_cliente',
    categoria: 'vendedor',
    opcional: true,
  },
]

export const PLANTILLA_ISR: PlantillaDoc[] = [
  { id: 'isr-no-exencion', nombre: 'Constancia de no exención de ISR (últimos 3 años)', origen: 'sube_cliente', categoria: 'isr' },
  { id: 'isr-residencia', nombre: 'Comprobante de residencia (casa habitación)', origen: 'sube_cliente', categoria: 'isr' },
  { id: 'isr-formato-96', nombre: 'Formato 96 · determinación de ISR por enajenación', origen: 'entrega_inmobiliaria', categoria: 'isr' },
]

export const PLANTILLA_COMPRADOR: PlantillaDoc[] = [
  { id: 'comprador-ine', nombre: 'Identificación oficial (INE)', origen: 'sube_cliente', categoria: 'comprador' },
  { id: 'comprador-curp', nombre: 'CURP', origen: 'sube_cliente', categoria: 'comprador' },
  { id: 'comprador-rfc', nombre: 'RFC (constancia de situación fiscal)', origen: 'sube_cliente', categoria: 'comprador' },
  { id: 'comprador-domicilio', nombre: 'Comprobante de domicilio', origen: 'sube_cliente', categoria: 'comprador' },
  { id: 'comprador-nacimiento', nombre: 'Acta de nacimiento', origen: 'sube_cliente', categoria: 'comprador' },
  { id: 'comprador-matrimonio', nombre: 'Acta de matrimonio', origen: 'sube_cliente', categoria: 'comprador', opcional: true },
  { id: 'comprador-conyuge', nombre: 'Identificación del cónyuge', origen: 'sube_cliente', categoria: 'comprador', opcional: true },
  { id: 'comprador-ingresos', nombre: 'Comprobante de ingresos', origen: 'sube_cliente', categoria: 'comprador' },
  { id: 'comprador-nomina', nombre: 'Últimos 3 recibos de nómina', origen: 'sube_cliente', categoria: 'comprador', opcional: true },
  {
    id: 'comprador-declaracion-anual',
    nombre: 'Declaración anual (independientes)',
    origen: 'sube_cliente',
    categoria: 'comprador',
    opcional: true,
  },
  { id: 'comprador-estado-cuenta', nombre: 'Estado de cuenta bancario (últimos 3 meses)', origen: 'sube_cliente', categoria: 'comprador' },
  { id: 'comprador-buro', nombre: 'Reporte de buró de crédito', origen: 'sube_cliente', categoria: 'comprador' },
  { id: 'comprador-origen-recursos', nombre: 'Comprobante de origen de recursos', origen: 'sube_cliente', categoria: 'comprador' },
  {
    id: 'comprador-aprobacion-credito',
    nombre: 'Carta de aprobación de crédito hipotecario',
    origen: 'sube_cliente',
    categoria: 'comprador',
    opcional: true,
  },
  { id: 'comprador-avaluo-bancario', nombre: 'Avalúo bancario de la propiedad', origen: 'entrega_inmobiliaria', categoria: 'comprador', opcional: true },
  {
    id: 'comprador-apertura-credito',
    nombre: 'Contrato de apertura de crédito',
    origen: 'sube_cliente',
    categoria: 'comprador',
    opcional: true,
  },
  {
    id: 'comprador-beneficiarios',
    nombre: 'Designación de beneficiarios (seguro del crédito)',
    origen: 'sube_cliente',
    categoria: 'comprador',
    opcional: true,
  },
  { id: 'comprador-poder', nombre: 'Poder notarial del representante', origen: 'sube_cliente', categoria: 'comprador', opcional: true },
  { id: 'comprador-pasaporte', nombre: 'Pasaporte vigente (extranjero)', origen: 'sube_cliente', categoria: 'comprador', opcional: true },
  { id: 'comprador-fm', nombre: 'Forma migratoria FM2/FM3 (extranjero)', origen: 'sube_cliente', categoria: 'comprador', opcional: true },
  { id: 'comprador-pld', nombre: 'Formato de identificación del cliente (PLD/KYC)', origen: 'sube_cliente', categoria: 'comprador' },
]

export function clonarPlantilla(
  plantilla: PlantillaDoc[],
  overrides: Record<string, Partial<Pick<DocumentoExpediente, 'estado' | 'fechaActualizacion' | 'fechaVencimiento' | 'validadoPor' | 'validadoEn' | 'motivoRechazo'>>>,
): DocumentoExpediente[] {
  return plantilla.map((doc) => ({ ...doc, estado: 'pendiente' as const, ...overrides[doc.id] }))
}

// ---------------------------------------------------------------------------
// Progreso — validados / en revisión / faltantes, y si se puede aprobar.
// ---------------------------------------------------------------------------

export interface ProgresoExpediente {
  total: number
  validados: number
  enRevision: number
  faltantes: number
}

export function calcularProgreso(documentos: DocumentoExpediente[]): ProgresoExpediente {
  return {
    total: documentos.length,
    validados: documentos.filter((d) => d.estado === 'validado').length,
    enRevision: documentos.filter((d) => d.estado === 'en_revision').length,
    faltantes: documentos.filter((d) => d.estado === 'pendiente' || d.estado === 'rechazado').length,
  }
}

export interface EvaluacionAprobacion {
  puedeAprobar: boolean
  razon?: string
}

export function evaluarAprobacion(documentos: DocumentoExpediente[]): EvaluacionAprobacion {
  const faltantes = documentos.filter((d) => !d.opcional && d.estado !== 'validado')
  if (faltantes.length === 0) return { puedeAprobar: true }
  return {
    puedeAprobar: false,
    razon: `Falta${faltantes.length === 1 ? '' : 'n'} ${faltantes.length} documento${faltantes.length === 1 ? '' : 's'} obligatorio${
      faltantes.length === 1 ? '' : 's'
    }: ${faltantes.slice(0, 3).map((d) => d.nombre).join(', ')}${faltantes.length > 3 ? '…' : ''}`,
  }
}
