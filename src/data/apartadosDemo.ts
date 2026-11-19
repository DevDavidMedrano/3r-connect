import type { ApartadoMock } from '../types/apartado'

// DEMO — 3 activos, 1 por vencer, 1 vencido, 1 convertido (el apartado del
// cliente Demo, folio 3R-110, se suma a esto pero se arma aparte en
// SeparacionAdminPage). Colonias reales de propiedadesDemo — Condesa y
// Roma Norte no tienen inventario todavía, así que se usa la variedad
// disponible (Polanco y Lomas de Chapultepec) en su lugar.
export const apartadosDemoIniciales: ApartadoMock[] = [
  { id: 'apartado-3r-104', folio: '3R-104', clienteNombre: 'Fernanda Ruiz', estado: 'activo', anticipoMonto: 1_900_000, fechaVencimiento: '2026-09-20' },
  { id: 'apartado-3r-111', folio: '3R-111', clienteNombre: 'Roberto Aguilar', estado: 'activo', anticipoMonto: 6_500_000, fechaVencimiento: '2026-09-10' },
  { id: 'apartado-3r-105', folio: '3R-105', clienteNombre: 'Karla Jiménez', estado: 'por_vencer', anticipoMonto: 2_300_000, fechaVencimiento: '2026-08-10' },
  { id: 'apartado-3r-117', folio: '3R-117', clienteNombre: 'Andrés Molina', estado: 'vencido', anticipoMonto: 3_500_000, fechaVencimiento: '2026-07-28' },
  { id: 'apartado-3r-114', folio: '3R-114', clienteNombre: 'Sofía Castillo', estado: 'convertido', anticipoMonto: 2_800_000, fechaVencimiento: '2026-07-15' },
]
