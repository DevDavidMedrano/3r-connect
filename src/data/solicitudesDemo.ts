import type { Solicitud } from '../types/solicitud'

// DEMO — solicitudes ficticias de prospectos sobre las propiedades que el
// vendedor tiene en publicación (folios '3R-114' y '3R-117', ver
// procesoPublicacionDemo.ts), y vistas mensuales por folio para la tarjeta
// de métrica "Vistas este mes". Nada de esto viene de un backend real
// todavía.

export const solicitudesDemo: Solicitud[] = [
  {
    id: 'sol-1',
    nombreProspecto: 'Marco Villanueva',
    folio: '3R-114',
    propiedadTitulo: 'Departamento en Lomas de Chapultepec',
    mensaje: '¿La propiedad acepta crédito bancario?',
    fecha: '2026-08-03',
    respondida: false,
  },
  {
    id: 'sol-2',
    nombreProspecto: 'Ivonne Sandoval',
    folio: '3R-114',
    propiedadTitulo: 'Departamento en Lomas de Chapultepec',
    mensaje: '¿Podemos agendar una visita este fin de semana?',
    fecha: '2026-08-01',
    respondida: false,
  },
  {
    id: 'sol-3',
    nombreProspecto: 'Gerardo Peña',
    folio: '3R-114',
    propiedadTitulo: 'Departamento en Lomas de Chapultepec',
    mensaje: '¿Cuánto es el mantenimiento mensual?',
    fecha: '2026-07-29',
    respondida: true,
  },
  {
    id: 'sol-4',
    nombreProspecto: 'Paola Estrada',
    folio: '3R-117',
    propiedadTitulo: 'Penthouse en Polanco',
    mensaje: '¿Sigue disponible la unidad?',
    fecha: '2026-07-30',
    respondida: false,
  },
  {
    id: 'sol-5',
    nombreProspecto: 'Héctor Villagrán',
    folio: '3R-117',
    propiedadTitulo: 'Penthouse en Polanco',
    mensaje: '¿La terraza tiene bodega incluida?',
    fecha: '2026-07-26',
    respondida: true,
  },
]

export const vistasEsteMesPorFolio: Record<string, number> = {
  '3R-114': 234,
  '3R-117': 118,
}

export const vistasMesAnteriorPorFolio: Record<string, number> = {
  '3R-114': 198,
  '3R-117': 96,
}
