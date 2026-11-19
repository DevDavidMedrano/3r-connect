import { PLANTILLA_COMPRADOR, clonarPlantilla, type CasoValidacion } from '../types/expedienteValidacion'

// DEMO — dos casos "Del Comprador" que no tienen su propio ProcesoCliente
// (el del cliente Demo sí lo tiene, ver procesoDemo.ts + ValidacionAdminPage).
// Folios reales de propiedadesDemo, Polanco y Lomas de Chapultepec — Condesa
// y Roma Norte todavía no tienen inventario a la venta en ese rango de
// precio (mismo caso que ya documenta apartadosDemo.ts), así que se usa la
// variedad disponible.
export const casosValidacionDemoIniciales: CasoValidacion[] = [
  {
    id: 'caso-3r-105',
    folio: '3R-105',
    clienteNombre: 'Alonso Beltrán',
    asesorId: 'mariana-solis',
    fechaInicio: '2026-07-18',
    estado: 'en_revision',
    fechaAprobado: null,
    // Todo validado: el ejemplo de expediente completo, listo para
    // "Aprobar expediente" sin ninguna razón que lo bloquee.
    documentos: clonarPlantilla(PLANTILLA_COMPRADOR, {
      'comprador-ine': { estado: 'validado', fechaActualizacion: '2026-07-19', validadoPor: 'Mariana Solís', validadoEn: '2026-07-20' },
      'comprador-curp': { estado: 'validado', fechaActualizacion: '2026-07-19', validadoPor: 'Mariana Solís', validadoEn: '2026-07-20' },
      'comprador-rfc': { estado: 'validado', fechaActualizacion: '2026-07-19', validadoPor: 'Mariana Solís', validadoEn: '2026-07-20' },
      'comprador-domicilio': {
        estado: 'validado',
        fechaActualizacion: '2026-07-19',
        fechaVencimiento: '2026-10-19',
        validadoPor: 'Mariana Solís',
        validadoEn: '2026-07-20',
      },
      'comprador-nacimiento': { estado: 'validado', fechaActualizacion: '2026-07-20', validadoPor: 'Mariana Solís', validadoEn: '2026-07-21' },
      'comprador-ingresos': { estado: 'validado', fechaActualizacion: '2026-07-22', validadoPor: 'Mariana Solís', validadoEn: '2026-07-23' },
      'comprador-estado-cuenta': {
        estado: 'validado',
        fechaActualizacion: '2026-07-22',
        fechaVencimiento: '2026-10-22',
        validadoPor: 'Mariana Solís',
        validadoEn: '2026-07-23',
      },
      'comprador-buro': {
        estado: 'validado',
        fechaActualizacion: '2026-07-23',
        fechaVencimiento: '2026-10-23',
        validadoPor: 'Mariana Solís',
        validadoEn: '2026-07-24',
      },
      'comprador-origen-recursos': { estado: 'validado', fechaActualizacion: '2026-07-23', validadoPor: 'Mariana Solís', validadoEn: '2026-07-24' },
      'comprador-pld': { estado: 'validado', fechaActualizacion: '2026-07-19', validadoPor: 'Mariana Solís', validadoEn: '2026-07-20' },
    }),
  },
  {
    id: 'caso-3r-104',
    folio: '3R-104',
    clienteNombre: 'Marisol Aranda',
    asesorId: 'valeria-ibarra',
    // Más de 5 días desde el último documento tocado — la alerta de "días en
    // revisión" del listado tiene que verse encendida en este caso.
    fechaInicio: '2026-07-25',
    estado: 'en_revision',
    fechaAprobado: null,
    documentos: clonarPlantilla(PLANTILLA_COMPRADOR, {
      'comprador-ine': { estado: 'validado', fechaActualizacion: '2026-07-26', validadoPor: 'Valeria Ibarra', validadoEn: '2026-07-27' },
      'comprador-curp': { estado: 'validado', fechaActualizacion: '2026-07-26', validadoPor: 'Valeria Ibarra', validadoEn: '2026-07-27' },
      // Vencido aunque validado — el comprobante de domicilio de este caso
      // ya pasó su vigencia.
      'comprador-domicilio': {
        estado: 'validado',
        fechaActualizacion: '2026-07-26',
        fechaVencimiento: '2026-07-31',
        validadoPor: 'Valeria Ibarra',
        validadoEn: '2026-07-27',
      },
      // Rechazado con motivo — exactamente el ejemplo del encargo.
      'comprador-ingresos': {
        estado: 'rechazado',
        fechaActualizacion: '2026-07-28',
        motivoRechazo: 'La fecha no es legible.',
      },
      'comprador-estado-cuenta': { estado: 'en_revision', fechaActualizacion: '2026-07-29' },
    }),
  },
]
