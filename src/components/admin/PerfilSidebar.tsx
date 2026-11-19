import { useEffect, useRef, useState } from 'react'
import { ChevronUp, LogOut, RefreshCw, ScreenShare } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import type { TipoCuenta, Usuario } from '../cuenta/SesionContext'

interface PerfilSidebarProps {
  usuario: Usuario
  rol: 'admin' | 'asesor'
  cambiarTipoCuenta: (tipo: TipoCuenta) => void
  cerrarSesion: () => void
}

// Reemplaza al toggle "Ver como": la misma acción (cambiar entre admin y
// asesor para probar las dos vistas sin cerrar sesión) ahora vive como un
// ítem del menú en vez de una cápsula visible todo el tiempo.
export function PerfilSidebar({ usuario, rol, cambiarTipoCuenta, cerrarSesion }: PerfilSidebarProps) {
  const [abierto, setAbierto] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()

  useEffect(() => {
    function alClicFuera(evento: MouseEvent) {
      if (ref.current && !ref.current.contains(evento.target as Node)) setAbierto(false)
    }
    document.addEventListener('mousedown', alClicFuera)
    return () => document.removeEventListener('mousedown', alClicFuera)
  }, [])

  function alCerrarSesion() {
    cerrarSesion()
    navigate('/')
  }

  return (
    <div className="relative" ref={ref}>
      {abierto && (
        <div className="absolute bottom-full left-0 right-0 z-40 mb-2 overflow-hidden rounded-xl border border-gris-borde bg-blanco py-1.5 shadow-lg">
          <Link
            to="/"
            onClick={() => setAbierto(false)}
            className="flex items-center gap-2.5 px-3.5 py-2 text-sm text-texto transition-colors hover:bg-marfil"
          >
            <ScreenShare size={15} strokeWidth={1.75} className="text-texto-suave" />
            Ver el portal
          </Link>
          <button
            type="button"
            onClick={() => {
              cambiarTipoCuenta(rol === 'admin' ? 'asesor' : 'admin')
              setAbierto(false)
            }}
            className="flex w-full items-center gap-2.5 px-3.5 py-2 text-left text-sm text-texto transition-colors hover:bg-marfil"
          >
            <RefreshCw size={15} strokeWidth={1.75} className="text-texto-suave" />
            Cambiar rol
          </button>
          <div className="my-1.5 border-t border-gris-borde" />
          <button
            type="button"
            onClick={alCerrarSesion}
            className="flex w-full items-center gap-2.5 px-3.5 py-2 text-left text-sm text-texto transition-colors hover:bg-marfil"
          >
            <LogOut size={15} strokeWidth={1.75} className="text-texto-suave" />
            Cerrar sesión
          </button>
        </div>
      )}

      <button
        type="button"
        onClick={() => setAbierto((v) => !v)}
        className="flex w-full items-center gap-2.5 rounded-3r-md border border-gris-borde bg-marfil p-2.5 text-left transition-colors hover:border-onix/30"
      >
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-onix text-xs font-bold text-blanco">
          {usuario.iniciales}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-semibold text-texto">{usuario.nombre}</p>
          <p className="truncate text-[11px] text-texto-suave">{usuario.correo}</p>
        </div>
        <ChevronUp size={15} strokeWidth={2} className={`shrink-0 text-texto-suave transition-transform ${abierto ? '' : 'rotate-180'}`} />
      </button>
    </div>
  )
}
