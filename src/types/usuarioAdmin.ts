// ---------------------------------------------------------------------------
// UsuarioAdmin — una cuenta de equipo (admin o asesor) con sus permisos por
// módulo. Los permisos son el mismo catálogo que usa el guard de rutas en
// LayoutAdmin: quitarle uno aquí bloquea de verdad la ruta, no solo la
// esconde del sidebar. correo es la clave que liga esta lista con la sesión
// activa (ver AccesoPage y LayoutAdmin) — el login demo de admin/asesor usa
// exactamente el correo del usuario #1 / #2 de esta lista, así que "editar
// tu propio usuario" es una acción real, comprobable navegando después.
// ---------------------------------------------------------------------------

export type RolUsuarioAdmin = 'admin' | 'asesor'
export type EstadoUsuarioAdmin = 'activo' | 'inactivo'

export interface PermisoModulo {
  clave: string
  etiqueta: string
  ruta: string
}

// Los 15 módulos del panel — mismo orden que pidió el encargo. `ruta` es la
// que compara LayoutAdmin contra location.pathname.
export const PERMISOS_MODULO: PermisoModulo[] = [
  { clave: 'reportes', etiqueta: 'Ver Reportes y Dashboard', ruta: '/admin/productividad' },
  { clave: 'usuarios', etiqueta: 'Gestionar Usuarios y Roles', ruta: '/admin/usuarios' },
  { clave: 'asignacion-asesores', etiqueta: 'Asignación de Asesores', ruta: '/admin/asignacion-asesores' },
  { clave: 'validacion', etiqueta: 'Proceso de Confianza y Validación', ruta: '/admin/validacion' },
  { clave: 'financiero', etiqueta: 'Control Financiero', ruta: '/admin/financiero' },
  { clave: 'bitacora', etiqueta: 'Bitácora y Auditoría', ruta: '/admin/bitacora' },
  { clave: 'mi-panel', etiqueta: 'Mi panel (Asesor)', ruta: '/admin' },
  { clave: 'inventario', etiqueta: 'Gestionar Inventario', ruta: '/admin/inventario' },
  { clave: 'prospectos-captacion', etiqueta: 'Prospectos de Captación', ruta: '/admin/prospectos-captacion' },
  { clave: 'prospectos-venta', etiqueta: 'Prospectos de Venta', ruta: '/admin/prospectos-venta' },
  { clave: 'agenda', etiqueta: 'Agenda y Control de Citas', ruta: '/admin/agenda' },
  { clave: 'captacion', etiqueta: 'Captación de Propiedades', ruta: '/admin/captacion' },
  { clave: 'inbox', etiqueta: 'Inbox de WhatsApp', ruta: '/admin/inbox' },
  { clave: 'separacion', etiqueta: 'Separación de Propiedades', ruta: '/admin/separacion' },
  { clave: 'seguimiento', etiqueta: 'Seguimiento de Clientes', ruta: '/admin/seguimiento' },
]

const CLAVES_SOLO_ADMIN = ['usuarios', 'asignacion-asesores', 'validacion', 'financiero', 'bitacora', 'reportes']

// Admin: los 15. Asesor: los 15 menos los exclusivos de administración —
// Productividad de Asesores es panel del dueño del negocio, no del asesor
// que está siendo medido.
export const ROL_PERMISOS_DEFECTO: Record<RolUsuarioAdmin, string[]> = {
  admin: PERMISOS_MODULO.map((p) => p.clave),
  asesor: PERMISOS_MODULO.map((p) => p.clave).filter((clave) => !CLAVES_SOLO_ADMIN.includes(clave)),
}

// El permiso que nadie puede quitarse a sí mismo (ver UsuariosAdminPage).
export const PERMISO_GESTION_USUARIOS = 'usuarios'

export interface UsuarioAdmin {
  id: string
  nombre: string
  correo: string
  rol: RolUsuarioAdmin
  estado: EstadoUsuarioAdmin
  ultimoAcceso: string
  cupoMaximo?: number
  cargaActual?: number
  permisos: string[]
  contrasena: string
}

export function etiquetaUltimoAcceso(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime()
  const minutos = Math.floor(ms / 60_000)
  if (minutos < 1) return 'Justo ahora'
  if (minutos < 60) return `Hace ${minutos} min`
  const horas = Math.floor(minutos / 60)
  if (horas < 24) return `Hace ${horas} h`
  const dias = Math.floor(horas / 24)
  return `Hace ${dias} d`
}

const CARACTERES_CONTRASENA = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%'

export function generarContrasenaSegura(longitud = 12): string {
  let resultado = ''
  for (let i = 0; i < longitud; i++) {
    resultado += CARACTERES_CONTRASENA[Math.floor(Math.random() * CARACTERES_CONTRASENA.length)]
  }
  return resultado
}
