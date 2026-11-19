import {
  Bookmark,
  CalendarDays,
  FileText,
  LayoutGrid,
  MessageSquare,
  User,
  Wallet,
  Clock,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import { Logo3R } from '../brand/Logo3R'
import { AvatarAsesor } from '../asesores/AvatarAsesor'
import { TarjetaAsesorSidebar } from './TarjetaAsesorSidebar'
import { useDatosCliente } from './useDatosCliente'

interface ItemNav {
  etiqueta: string
  to: string
  icono: LucideIcon
}

const GRUPO_COMPRA: ItemNav[] = [
  { etiqueta: 'Tablero', to: '/mi-cuenta', icono: LayoutGrid },
  { etiqueta: 'Mi proceso', to: '/mi-cuenta/proceso', icono: Clock },
  { etiqueta: 'Documentos', to: '/mi-cuenta/documentos', icono: FileText },
  { etiqueta: 'Pagos', to: '/mi-cuenta/pagos', icono: Wallet },
]

const GRUPO_BUSQUEDA: ItemNav[] = [
  { etiqueta: 'Propiedades guardadas', to: '/mi-cuenta/guardados', icono: Bookmark },
  { etiqueta: 'Mis visitas', to: '/mi-cuenta/visitas', icono: CalendarDays },
  { etiqueta: 'Mi asesor', to: '/mi-cuenta/asesor', icono: MessageSquare },
]

const GRUPO_CUENTA: ItemNav[] = [{ etiqueta: 'Mi perfil', to: '/mi-cuenta/perfil', icono: User }]

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

// Mismo patrón visual que SidebarAdmin.tsx: logo apilado, ítem activo en
// gris muy claro con texto negro, íconos más finos, soporte para
// colapsarse a solo íconos (el toggle vive en LayoutCliente). Si algo se ve
// distinto entre este sidebar y el de /admin, es un bug — deben usar
// exactamente los mismos tokens.
export function SidebarCliente({ colapsado, variante = 'fija' }: { colapsado: boolean; variante?: 'fija' | 'drawer' }) {
  const location = useLocation()
  const { proceso, asesor } = useDatosCliente()

  const documentosPendientes = proceso.documentos.filter(
    (documento) => documento.origen === 'sube_cliente' && documento.estado !== 'validado',
  ).length

  const clasesVisibilidad = variante === 'drawer' ? 'flex w-[280px]' : `sticky top-0 hidden sm:flex ${colapsado ? 'w-[76px]' : 'w-[264px]'}`

  return (
    <aside
      className={`h-screen shrink-0 flex-col overflow-hidden border-r border-gris-borde bg-blanco transition-[width] duration-200 ${clasesVisibilidad}`}
    >
      <Link
        to="/mi-cuenta"
        aria-label="Ir al tablero"
        className={`group flex cursor-pointer items-center gap-2.5 px-5 pb-4 pt-5 ${colapsado ? 'justify-center px-0' : ''}`}
      >
        <Logo3R size={90} sizeSm={110} className="transition-opacity duration-200 group-hover:opacity-80" />
        {!colapsado && (
          <div className="flex flex-col leading-none">
            <span className="font-serif text-base font-bold tracking-wide text-onix">3R CONNECT</span>
            <span className="mt-1 text-[9px] font-semibold uppercase tracking-[0.18em] text-texto-suave">Seguimiento de cliente</span>
          </div>
        )}
      </Link>

      <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto px-3">
        <EtiquetaGrupo texto="Mi compra" colapsado={colapsado} />
        {GRUPO_COMPRA.map((item) => (
          <FilaNav
            key={item.to}
            item={item}
            activo={location.pathname === item.to}
            colapsado={colapsado}
            badge={item.to === '/mi-cuenta/documentos' ? documentosPendientes : undefined}
          />
        ))}

        <EtiquetaGrupo texto="Mi búsqueda" colapsado={colapsado} />
        {GRUPO_BUSQUEDA.map((item) => (
          <FilaNav key={item.to} item={item} activo={location.pathname === item.to} colapsado={colapsado} />
        ))}

        <EtiquetaGrupo texto="Cuenta" colapsado={colapsado} />
        {GRUPO_CUENTA.map((item) => (
          <FilaNav key={item.to} item={item} activo={location.pathname === item.to} colapsado={colapsado} />
        ))}
      </nav>

      {!colapsado && (
        <div className="mt-auto border-t border-gris-borde p-3">
          <TarjetaAsesorSidebar asesor={asesor} />
        </div>
      )}
      {colapsado && (
        <div className="mt-auto flex justify-center border-t border-gris-borde p-3">
          <AvatarAsesor asesor={asesor} className="h-9 w-9 text-xs" />
        </div>
      )}
    </aside>
  )
}
