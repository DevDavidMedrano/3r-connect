import {
  BarChart3,
  BookmarkCheck,
  Building2,
  CalendarDays,
  FileCheck2,
  FileSliders,
  Headset,
  History,
  Inbox as IconoInbox,
  LayoutGrid,
  LineChart,
  ListChecks,
  Plus,
  Settings,
  ShieldCheck,
  SlidersHorizontal,
  UserPlus,
  Users,
  Wallet,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import { Boton } from '../cliente/Piezas'
import { Logo3R } from '../brand/Logo3R'
import { PerfilSidebar } from './PerfilSidebar'
import { useDatosAdmin } from './useDatosAdmin'

interface ItemNav {
  etiqueta: string
  to: string
  icono: LucideIcon
}

const GRUPO_OPERACION: ItemNav[] = [
  { etiqueta: 'Tablero', to: '/admin', icono: LayoutGrid },
  { etiqueta: 'Inventario de Propiedades', to: '/admin/inventario', icono: Building2 },
  { etiqueta: 'Captación de Propiedades', to: '/admin/captacion', icono: Plus },
  { etiqueta: 'Separación de Propiedades', to: '/admin/separacion', icono: BookmarkCheck },
]

const GRUPO_CLIENTES: ItemNav[] = [
  { etiqueta: 'Prospectos de Captación', to: '/admin/prospectos-captacion', icono: UserPlus },
  { etiqueta: 'Prospectos de Venta', to: '/admin/prospectos-venta', icono: Users },
  { etiqueta: 'Inbox', to: '/admin/inbox', icono: IconoInbox },
  { etiqueta: 'Agenda y Citas', to: '/admin/agenda', icono: CalendarDays },
  { etiqueta: 'Seguimiento de Clientes', to: '/admin/seguimiento', icono: ListChecks },
]

const GRUPO_EQUIPO: ItemNav[] = [
  { etiqueta: 'Usuarios y Roles', to: '/admin/usuarios', icono: ShieldCheck },
  { etiqueta: 'Asignación de Asesores', to: '/admin/asignacion-asesores', icono: Headset },
  { etiqueta: 'Productividad', to: '/admin/productividad', icono: BarChart3 },
]

const GRUPO_CONTROL: ItemNav[] = [
  { etiqueta: 'Confianza y Validación', to: '/admin/validacion', icono: FileCheck2 },
  { etiqueta: 'Control Financiero', to: '/admin/financiero', icono: Wallet },
  { etiqueta: 'Bitácora', to: '/admin/bitacora', icono: History },
]

const GRUPO_REPORTES: ItemNav[] = [
  { etiqueta: 'Estadísticas', to: '/admin/estadisticas', icono: LineChart },
  { etiqueta: 'Exportaciones', to: '/admin/exportaciones', icono: FileSliders },
]

const GRUPO_CONFIGURACION: ItemNav[] = [
  { etiqueta: 'Ajustes Generales', to: '/admin/ajustes', icono: Settings },
  { etiqueta: 'Plantillas de Documentos', to: '/admin/plantillas', icono: SlidersHorizontal },
]

function FilaNav({ item, activo, colapsado, badge }: { item: ItemNav; activo: boolean; colapsado: boolean; badge?: number }) {
  const Icono = item.icono
  return (
    <Link
      to={item.to}
      title={colapsado ? item.etiqueta : undefined}
      className={`flex min-h-11 items-center gap-2.5 rounded-3r-md px-2.5 py-2.5 text-[13.5px] transition-colors ${
        colapsado ? 'justify-center' : ''
      } ${activo ? 'bg-marfil font-semibold text-onix' : 'text-texto-suave hover:bg-marfil hover:text-texto'}`}
    >
      <Icono size={17} strokeWidth={1.5} className="shrink-0" />
      {!colapsado && <span className="min-w-0 flex-1 truncate">{item.etiqueta}</span>}
      {!colapsado && badge !== undefined && badge > 0 && (
        <span className="flex h-4 min-w-4 shrink-0 items-center justify-center rounded-full bg-coral px-1 text-[10px] font-bold text-blanco">
          {badge}
        </span>
      )}
    </Link>
  )
}

function EtiquetaGrupo({ texto, colapsado }: { texto: string; colapsado: boolean }) {
  if (colapsado) return <div className="mx-2.5 mt-4 border-t border-gris-borde" />
  return <p className="px-2.5 pb-1.5 pt-4 text-[10.5px] font-semibold uppercase tracking-wide text-texto-suave">{texto}</p>
}

// Clon estructural de SidebarCliente.tsx: mismo ancho, mismo patrón de fila
// activa/badge — pero en negro/blanco (ver el mockup) en vez de vino, con
// soporte para colapsarse a solo íconos (el toggle vive en TopbarAdmin) y
// dos grupos nuevos (Reportes, Configuración) al final.
// `variante`: 'fija' es la columna estática (oculta en móvil, riel de
// íconos en tablet, ancho completo u riel en escritorio según `colapsado`)
// — 'drawer' es la misma sidebar pero siempre visible y a ancho completo,
// para cuando LayoutAdmin la monta dentro del panel deslizante de móvil.
export function SidebarAdmin({ colapsado, variante = 'fija' }: { colapsado: boolean; variante?: 'fija' | 'drawer' }) {
  const location = useLocation()
  const { usuario, rol, procesosPublicacion, cambiarTipoCuenta, cerrarSesion } = useDatosAdmin()

  const documentosPendientes = procesosPublicacion
    .flatMap((proceso) => proceso.documentos)
    .filter((documento) => documento.origen === 'sube_cliente' && documento.estado !== 'validado').length

  // Misma ruta (/admin), dos tableros distintos según el rol — ver la nota
  // en TableroAdminPage.tsx. El admin lo ve como "Dashboard y Reportes"
  // (primer módulo de Operación); el asesor sigue viendo "Mi panel".
  const etiquetaTablero = rol === 'asesor' ? 'Mi panel' : 'Dashboard y Reportes'

  const clasesVisibilidad = variante === 'drawer' ? 'flex w-[280px]' : `sticky top-0 hidden sm:flex ${colapsado ? 'w-[76px]' : 'w-[264px]'}`

  return (
    <aside
      className={`h-screen shrink-0 flex-col overflow-hidden border-r border-gris-borde bg-blanco transition-[width] duration-200 ${clasesVisibilidad}`}
    >
      <Link
        to="/admin"
        aria-label="Ir al tablero"
        className={`group flex cursor-pointer items-center gap-2.5 px-5 pb-4 pt-5 ${colapsado ? 'justify-center px-0' : ''}`}
      >
        <Logo3R size={90} sizeSm={110} className="transition-opacity duration-200 group-hover:opacity-80" />
        {!colapsado && (
          <div className="flex flex-col leading-none">
            <span className="font-serif text-base font-bold tracking-wide text-onix">3R CONNECT</span>
            <span className="mt-1 text-[9px] font-semibold uppercase tracking-[0.18em] text-texto-suave">Panel administrativo</span>
          </div>
        )}
      </Link>

      <div className={colapsado ? 'px-2' : 'px-3'}>
        <Boton to="/admin/captacion" variante="solido" className={`w-full ${colapsado ? '!px-0' : ''}`}>
          <Plus size={16} strokeWidth={2.5} />
          {!colapsado && 'Publicar propiedad'}
        </Boton>
      </div>

      <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto px-3">
        <EtiquetaGrupo texto="Operación" colapsado={colapsado} />
        {GRUPO_OPERACION.map((item) => (
          <FilaNav
            key={item.to}
            item={item.to === '/admin' ? { ...item, etiqueta: etiquetaTablero } : item}
            activo={location.pathname === item.to}
            colapsado={colapsado}
          />
        ))}

        <EtiquetaGrupo texto="Clientes" colapsado={colapsado} />
        {GRUPO_CLIENTES.map((item) => (
          <FilaNav key={item.to} item={item} activo={location.pathname === item.to} colapsado={colapsado} />
        ))}

        {rol === 'admin' && (
          <>
            <EtiquetaGrupo texto="Equipo" colapsado={colapsado} />
            {GRUPO_EQUIPO.map((item) => (
              <FilaNav key={item.to} item={item} activo={location.pathname === item.to} colapsado={colapsado} />
            ))}

            <EtiquetaGrupo texto="Control" colapsado={colapsado} />
            {GRUPO_CONTROL.map((item) => (
              <FilaNav
                key={item.to}
                item={item}
                activo={location.pathname === item.to}
                colapsado={colapsado}
                badge={item.to === '/admin/validacion' ? documentosPendientes : undefined}
              />
            ))}

            <EtiquetaGrupo texto="Reportes" colapsado={colapsado} />
            {GRUPO_REPORTES.map((item) => (
              <FilaNav key={item.to} item={item} activo={location.pathname === item.to} colapsado={colapsado} />
            ))}

            <EtiquetaGrupo texto="Configuración" colapsado={colapsado} />
            {GRUPO_CONFIGURACION.map((item) => (
              <FilaNav key={item.to} item={item} activo={location.pathname === item.to} colapsado={colapsado} />
            ))}
          </>
        )}
      </nav>

      {usuario && !colapsado && (
        <div className="mt-auto border-t border-gris-borde p-3">
          <PerfilSidebar usuario={usuario} rol={rol} cambiarTipoCuenta={cambiarTipoCuenta} cerrarSesion={cerrarSesion} />
        </div>
      )}
      {usuario && colapsado && (
        <div className="mt-auto flex justify-center border-t border-gris-borde p-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-onix text-xs font-bold text-blanco">
            {usuario.iniciales}
          </span>
        </div>
      )}
    </aside>
  )
}
