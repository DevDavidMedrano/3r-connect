// ---------------------------------------------------------------------------
// Apartado — un anticipo para reservar una propiedad antes de la venta
// formal. Vive en Separación de Propiedades; el registro del cliente Demo
// (folio 3R-110) no usa este tipo, se arma directo desde ProcesoCliente
// (ver SeparacionAdminPage) para no duplicar esos números.
// ---------------------------------------------------------------------------

export type EstadoApartado = 'activo' | 'por_vencer' | 'vencido' | 'convertido'

export interface ApartadoMock {
  id: string
  folio: string
  clienteNombre: string
  estado: EstadoApartado
  anticipoMonto: number
  fechaVencimiento: string
}
