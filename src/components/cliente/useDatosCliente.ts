import { asesorParaPropiedad } from '../../data/asesoresDemo'
import { procesoDemo } from '../../data/procesoDemo'
import { primerNombreVisible } from '../../lib/nombreUsuario'
import type { Asesor } from '../../types/asesor'
import type { ProcesoCliente } from '../../types/proceso'
import { useSesion, type TipoCuenta, type Usuario } from '../cuenta/SesionContext'

const asesorDemo = asesorParaPropiedad(procesoDemo.folio)

export interface DatosCliente {
  // null cuando no hay sesión — LayoutCliente lo usa como señal para
  // redirigir a /acceso sin tener que importar SesionContext aparte.
  usuario: Usuario | null
  nombre: string | null
  proceso: ProcesoCliente
  asesor: Asesor
  cerrarSesion: () => void
  cambiarTipoCuenta: (tipo: TipoCuenta) => void
}

// Único archivo de components/cliente/ que toca SesionContext: el resto del
// módulo pasa siempre por este hook en vez de llamar useSesion() directo.
// `proceso` sale de procesoCompra (SesionContext), no del import estático
// de arriba — ese solo se usa para el folio fijo con el que se calcula
// asesorDemo. Así, si /admin/separacion avanza el apartado del folio
// 3R-110, este hook (y con él /mi-cuenta/proceso) lo refleja de inmediato.
export function useDatosCliente(): DatosCliente {
  const { usuario, cerrarSesion, cambiarTipoCuenta, procesoCompra } = useSesion()
  return {
    usuario,
    nombre: usuario ? primerNombreVisible(usuario) : null,
    proceso: procesoCompra,
    asesor: asesorDemo,
    cerrarSesion,
    cambiarTipoCuenta,
  }
}

export function saludoPorHora(): string {
  const hora = new Date().getHours()
  if (hora < 12) return 'Buenos días'
  if (hora < 19) return 'Buenas tardes'
  return 'Buenas noches'
}
