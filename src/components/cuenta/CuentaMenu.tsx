import { useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  Bookmark,
  CalendarCheck,
  LayoutDashboard,
  LogIn,
  LogOut,
  User,
  UserPlus,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useSesion } from './SesionContext'

function ItemMenu({
  icono: Icono,
  texto,
  to,
  onClick,
}: {
  icono: LucideIcon
  texto: string
  to?: string
  onClick: () => void
}) {
  const clase =
    'flex w-full items-center gap-2.5 px-4 py-2 text-left text-sm text-texto transition-colors hover:bg-marfil'

  if (to) {
    return (
      <Link to={to} onClick={onClick} className={clase}>
        <Icono size={16} strokeWidth={1.75} className="text-texto-suave" />
        {texto}
      </Link>
    )
  }

  return (
    <a href="#" onClick={(evento) => { evento.preventDefault(); onClick() }} className={clase}>
      <Icono size={16} strokeWidth={1.75} className="text-texto-suave" />
      {texto}
    </a>
  )
}

export function CuentaMenu() {
  const { usuario, cerrarSesion } = useSesion()
  const [abierto, setAbierto] = useState(false)
  const contenedorRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    function alClicFuera(evento: MouseEvent) {
      if (contenedorRef.current && !contenedorRef.current.contains(evento.target as Node)) {
        setAbierto(false)
      }
    }
    document.addEventListener('mousedown', alClicFuera)
    return () => document.removeEventListener('mousedown', alClicFuera)
  }, [])

  function cerrar() {
    setAbierto(false)
  }

  function irAAcceso() {
    cerrar()
    navigate(`/acceso?next=${encodeURIComponent(location.pathname)}`)
  }

  function irACrearCuenta() {
    cerrar()
    navigate(`/acceso?modo=crear&next=${encodeURIComponent(location.pathname)}`)
  }

  function alCerrarSesion() {
    cerrarSesion()
    cerrar()
    navigate('/')
  }

  return (
    <div className="relative" ref={contenedorRef}>
      <button
        type="button"
        aria-label="Mi cuenta"
        onClick={() => setAbierto((v) => !v)}
        className="flex h-9 w-9 items-center justify-center rounded-full bg-gris-borde text-onix transition-colors hover:bg-borde"
      >
        {usuario ? (
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-vino-vivo text-xs font-bold text-blanco">
            {usuario.iniciales}
          </span>
        ) : (
          <User size={16} strokeWidth={1.75} />
        )}
      </button>

      {abierto && (
        <div className="absolute right-0 top-full z-40 mt-2 w-60 rounded-2xl border border-gris-borde bg-blanco py-2 shadow-lg">
          {usuario ? (
            <>
              {usuario.tipoCuenta === 'cliente' ? (
                <>
                  <ItemMenu icono={LayoutDashboard} texto="Mi cuenta" to="/mi-cuenta" onClick={cerrar} />
                  <ItemMenu icono={Bookmark} texto="Mis listas" to="/mi-cuenta/guardados" onClick={cerrar} />
                  <ItemMenu icono={CalendarCheck} texto="Mis visitas" to="/mi-cuenta/visitas" onClick={cerrar} />
                  <ItemMenu icono={User} texto="Mi perfil" to="/mi-cuenta/perfil" onClick={cerrar} />
                </>
              ) : (
                <ItemMenu icono={LayoutDashboard} texto="Panel administrativo" to="/admin" onClick={cerrar} />
              )}
              <div className="my-1.5 border-t border-gris-borde" />
              <button
                type="button"
                onClick={alCerrarSesion}
                className="flex w-full items-center gap-2.5 px-4 py-2 text-left text-sm text-texto transition-colors hover:bg-marfil"
              >
                <LogOut size={16} strokeWidth={1.75} className="text-texto-suave" />
                Cerrar sesión
              </button>
            </>
          ) : (
            <>
              <ItemMenu icono={Bookmark} texto="Listas" onClick={cerrar} />
              <div className="my-1.5 border-t border-gris-borde" />
              <button
                type="button"
                onClick={irAAcceso}
                className="flex w-full items-center gap-2.5 px-4 py-2 text-left text-sm text-texto transition-colors hover:bg-marfil"
              >
                <LogIn size={16} strokeWidth={1.75} className="text-texto-suave" />
                Iniciar sesión
              </button>
              <button
                type="button"
                onClick={irACrearCuenta}
                className="flex w-full items-center gap-2.5 px-4 py-2 text-left text-sm text-texto transition-colors hover:bg-marfil"
              >
                <UserPlus size={16} strokeWidth={1.75} className="text-texto-suave" />
                Crear cuenta
              </button>
            </>
          )}
        </div>
      )}
    </div>
  )
}
