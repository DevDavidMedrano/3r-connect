import { propiedadesDemo } from './propiedadesDemo'
import type { DocumentoExpediente, PasoProceso, ProcesoCliente } from '../types/proceso'
import { PLANTILLA_CASA, PLANTILLA_ISR, PLANTILLA_VENDEDOR, clonarPlantilla } from '../types/expedienteValidacion'

// DEMO — procesos de publicación ficticios para el modo vendedor, mismo
// criterio que procesoDemo.ts para el modo cliente: los folios salen de
// propiedadesDemo (nunca inventados) para que la ficha pública y este
// tablero hablen de las mismas unidades. Dos procesos a propósito — para
// que el selector de "más de una propiedad en proceso" en el tablero
// tenga algo real que mostrar.

// Los folios '3R-114' y '3R-117' están garantizados en propiedadesDemo.ts.
function propiedadPorFolio(folio: string) {
  const propiedad = propiedadesDemo.find((p) => p.folio === folio)
  if (!propiedad) throw new Error(`procesoPublicacionDemo: no existe la propiedad ${folio} en propiedadesDemo`)
  return propiedad
}

const propiedadLomas = propiedadPorFolio('3R-114')
const propiedadPolanco = propiedadPorFolio('3R-117')

const pasosLomas: readonly PasoProceso[] = [
  {
    orden: 1,
    titulo: 'Solicitud enviada',
    descripcion: 'Enviaste tu propiedad para publicarla con 3R Connect.',
    responsable: 'cliente',
    estado: 'completado',
    fechaCompletado: '2026-07-10',
  },
  {
    orden: 2,
    titulo: 'Visita de valuación',
    descripcion: 'Un asesor visitó la propiedad para fotografiarla y valuarla.',
    responsable: 'ambos',
    estado: 'completado',
    fechaCompletado: '2026-07-18',
  },
  {
    orden: 3,
    titulo: 'Documentación',
    descripcion: 'Sube la escritura y el comprobante de predial para continuar.',
    responsable: 'cliente',
    estado: 'actual',
  },
  {
    orden: 4,
    titulo: 'Validación',
    descripcion: 'La inmobiliaria revisa que el expediente esté completo.',
    responsable: 'inmobiliaria',
    estado: 'pendiente',
  },
  {
    orden: 5,
    titulo: 'Publicación',
    descripcion: 'Tu propiedad queda visible en el portal y en los canales de 3R.',
    responsable: 'inmobiliaria',
    estado: 'pendiente',
  },
]

// De la Casa + Del Vendedor + Exención de ISR, con la misma plantilla que
// usa cualquier caso en Confianza y Validación — esto es exactamente lo que
// se pide en el paso 'Documentación' de este proceso: cuando se valida
// completo, ese paso se completa solo (ver avanzarPasoDocumentacion en
// SesionContext).
const documentosLomas: readonly DocumentoExpediente[] = [
  ...clonarPlantilla(PLANTILLA_CASA, {
    'casa-escritura': { estado: 'pendiente' },
    'casa-libertad-gravamen': { estado: 'validado', fechaActualizacion: '2026-07-14', validadoPor: 'Fernando Castro', validadoEn: '2026-07-15' },
    'casa-predial': { estado: 'pendiente' },
    'casa-avaluo': { estado: 'validado', fechaActualizacion: '2026-07-20', validadoPor: 'Fernando Castro', validadoEn: '2026-07-21' },
    'casa-planos': { estado: 'validado', fechaActualizacion: '2026-07-20', validadoPor: 'Fernando Castro', validadoEn: '2026-07-21' },
    'casa-no-adeudo': {
      estado: 'validado',
      fechaActualizacion: '2026-07-12',
      fechaVencimiento: '2026-08-05',
      validadoPor: 'Fernando Castro',
      validadoEn: '2026-07-13',
    },
  }),
  ...clonarPlantilla(PLANTILLA_VENDEDOR, {
    'vendedor-ine': { estado: 'validado', fechaActualizacion: '2026-07-12', validadoPor: 'Fernando Castro', validadoEn: '2026-07-13' },
    'vendedor-curp': { estado: 'validado', fechaActualizacion: '2026-07-12', validadoPor: 'Fernando Castro', validadoEn: '2026-07-13' },
    'vendedor-rfc': { estado: 'pendiente' },
    'vendedor-domicilio': { estado: 'pendiente' },
  }),
  ...clonarPlantilla(PLANTILLA_ISR, {
    'isr-no-exencion': { estado: 'en_revision', fechaActualizacion: '2026-07-30' },
    'isr-residencia': { estado: 'pendiente' },
    'isr-formato-96': { estado: 'pendiente' },
  }),
]

const procesoLomas: ProcesoCliente = {
  tipo: 'publicacion',
  folio: propiedadLomas.folio,
  operacion: propiedadLomas.listados[0].operacion,
  iniciado: '2026-07-10',
  cierreEstimado: '2026-08-20',
  pasos: pasosLomas,
  documentos: documentosLomas,
  // La publicación no tiene pagos que dar seguimiento — el tablero de
  // vendedor no usa este campo, pero ProcesoCliente lo exige.
  movimientos: [],
}

const pasosPolanco: readonly PasoProceso[] = [
  {
    orden: 1,
    titulo: 'Solicitud enviada',
    descripcion: 'Enviaste tu propiedad para publicarla con 3R Connect.',
    responsable: 'cliente',
    estado: 'completado',
    fechaCompletado: '2026-07-28',
  },
  {
    orden: 2,
    titulo: 'Visita de valuación',
    descripcion: 'Un asesor visitó la propiedad para fotografiarla y valuarla.',
    responsable: 'ambos',
    estado: 'completado',
    fechaCompletado: '2026-08-02',
  },
  {
    orden: 3,
    titulo: 'Documentación',
    descripcion: 'Sube la escritura y el comprobante de predial para continuar.',
    responsable: 'cliente',
    estado: 'actual',
  },
  {
    orden: 4,
    titulo: 'Validación',
    descripcion: 'La inmobiliaria revisa que el expediente esté completo.',
    responsable: 'inmobiliaria',
    estado: 'pendiente',
  },
  {
    orden: 5,
    titulo: 'Publicación',
    descripcion: 'Tu propiedad queda visible en el portal y en los canales de 3R.',
    responsable: 'inmobiliaria',
    estado: 'pendiente',
  },
]

// Caso recién arrancado a propósito: casi todo pendiente, para contrastar
// con Lomas (más avanzado) en el listado de Confianza y Validación.
const documentosPolanco: readonly DocumentoExpediente[] = [
  ...clonarPlantilla(PLANTILLA_CASA, {
    'casa-libertad-gravamen': { estado: 'en_revision', fechaActualizacion: '2026-08-03' },
  }),
  ...clonarPlantilla(PLANTILLA_VENDEDOR, {
    'vendedor-ine': { estado: 'validado', fechaActualizacion: '2026-08-01', validadoPor: 'Fernando Castro', validadoEn: '2026-08-02' },
  }),
  ...clonarPlantilla(PLANTILLA_ISR, {}),
]

const procesoPolanco: ProcesoCliente = {
  tipo: 'publicacion',
  folio: propiedadPolanco.folio,
  operacion: propiedadPolanco.listados[0].operacion,
  iniciado: '2026-07-28',
  cierreEstimado: '2026-09-05',
  pasos: pasosPolanco,
  documentos: documentosPolanco,
  movimientos: [],
}

export const procesosPublicacionDemo: ProcesoCliente[] = [procesoLomas, procesoPolanco]
