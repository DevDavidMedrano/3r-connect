import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Bell, LogOut, Menu, Search, X } from 'lucide-react'
import { Link, Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useMediaQuery } from '../../hooks/useMediaQuery'
import { SidebarCliente } from './SidebarCliente'
import { useDatosCliente } from './useDatosCliente'

// Clon estructural de TopbarAdmin (components/admin/LayoutAdmin.tsx): mismo
// botón de menú, mismo buscador con borde (colapsado a solo lupa en móvil),
// misma campana con badge y mismo patrón de avatar+nombre+rol — si se ve
// distinto, es un bug.
function TopbarCliente({ colapsado, onAlternarMenu }: { colapsado: boolean; onAlternarMenu: () => void }) {
  const { usuario, nombre, proceso, cerrarSesion } = useDatosCliente()
  const navigate = useNavigate()
  const [abierto, setAbierto] = useState(false)
  const [busquedaMovil, setBusquedaMovil] = useState(false)
  const contenedorRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function alClicFuera(evento: MouseEvent) {
      if (contenedorRef.current && !contenedorRef.current.contains(evento.target as Node)) setAbierto(false)
    }
    document.addEventListener('mousedown', alClicFuera)
    return () => document.removeEventListener('mousedown', alClicFuera)
  }, [])

  function alCerrarSesion() {
    cerrarSesion()
    navigate('/')
  }

  const documentosPendientes = proceso.documentos.filter((d) => d.origen === 'sube_cliente' && d.estado !== 'validado').length

  // El sidebar ya garantiza sesión antes de montar el topbar — nombre solo
  // sería null en el instante entre logout y el redirect.
  const iniciales = usuario ? usuario.iniciales : ''

  if (busquedaMovil) {
    return (
      <header className="sticky top-0 z-10 flex h-[66px] shrink-0 items-center gap-2.5 border-b border-gris-borde bg-blanco px-3">
        <Search size={16} strokeWidth={1.8} className="shrink-0 text-texto-suave" />
        <input
          autoFocus
          type="text"
          placeholder="Buscar en mi proceso, documentos o propiedades…"
          className="min-w-0 flex-1 bg-transparent text-sm text-texto placeholder:text-texto-suave focus:outline-none"
        />
        <button
          type="button"
          aria-label="Cerrar búsqueda"
          onClick={() => setBusquedaMovil(false)}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-3r-md text-texto-suave hover:bg-marfil hover:text-texto"
        >
          <X size={18} strokeWidth={2} />
        </button>
      </header>
    )
  }

  return (
    <header className="sticky top-0 z-10 flex h-[66px] shrink-0 items-center gap-2.5 border-b border-gris-borde bg-blanco px-3 sm:gap-4 sm:px-5 lg:px-7">
      <button
        type="button"
        aria-label={colapsado ? 'Expandir menú' : 'Colapsar menú'}
        onClick={onAlternarMenu}
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-3r-md text-texto-suave transition-colors hover:bg-marfil hover:text-texto"
      >
        <Menu size={18} strokeWidth={1.75} />
      </button>

      <div className="hidden min-w-0 flex-1 items-center gap-2.5 rounded-full border border-gris-borde bg-marfil/60 px-4 py-2 text-texto-suave sm:flex">
        <Search size={16} strokeWidth={1.8} className="shrink-0" />
        <input
          type="text"
          placeholder="Buscar en mi proceso, documentos o propiedades…"
          className="w-full min-w-0 bg-transparent text-sm text-texto placeholder:text-texto-suave focus:outline-none"
        />
      </div>

      <button
        type="button"
        aria-label="Buscar"
        onClick={() => setBusquedaMovil(true)}
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-3r-md text-texto-suave transition-colors hover:bg-marfil hover:text-texto sm:hidden"
      >
        <Search size={17} strokeWidth={1.75} />
      </button>

      <div className="ml-auto flex items-center gap-2.5 sm:ml-0">
        <button
          type="button"
          aria-label="Notificaciones"
          className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-3r-md text-texto-suave transition-colors hover:bg-marfil hover:text-texto"
        >
          <Bell size={17} strokeWidth={1.75} />
          {documentosPendientes > 0 && (
            <span className="absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-alerta px-1 text-[10px] font-bold text-blanco">
              {documentosPendientes > 99 ? '99+' : documentosPendientes}
            </span>
          )}
        </button>

        <div className="relative shrink-0" ref={contenedorRef}>
          <button type="button" aria-label="Mi cuenta" onClick={() => setAbierto((v) => !v)} className="flex min-h-11 items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-onix text-xs font-bold text-blanco">{iniciales}</span>
            <span className="hidden flex-col items-start leading-none sm:flex">
              <span className="text-xs font-semibold text-texto">{nombre}</span>
              <span className="mt-0.5 text-[10.5px] text-texto-suave">Cliente</span>
            </span>
          </button>

          {abierto && (
            <div className="absolute right-0 top-full z-40 mt-2 w-48 rounded-3r-md border border-gris-borde bg-blanco py-2 shadow-lg">
              <Link
                to="/"
                onClick={() => setAbierto(false)}
                className="block px-4 py-2 text-left text-sm text-texto transition-colors hover:bg-marfil"
              >
                Ver el portal
              </Link>
              <div className="my-1.5 border-t border-gris-borde" />
              <button
                type="button"
                onClick={alCerrarSesion}
                className="flex w-full items-center gap-2.5 px-4 py-2 text-left text-sm text-texto transition-colors hover:bg-marfil"
              >
                <LogOut size={16} strokeWidth={1.75} className="text-texto-suave" />
                Cerrar sesión
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

// Mismo guard que LayoutAdmin.tsx: sin sesión, redirect a /acceso con el
// pathname actual en `next`. Si la cuenta es de admin o asesor, redirect a
// su propio panel — las cuentas están separadas, un admin/asesor nunca ve
// este flujo (ni escribiendo la URL a mano). Pasa por useDatosCliente en
// vez de useSesion directo — ver la nota en ese archivo sobre por qué es el
// único del módulo que toca SesionContext.
export function LayoutCliente() {
  const { usuario } = useDatosCliente()
  const location = useLocation()
  const [colapsadoManual, setColapsadoManual] = useState(false)
  const [drawerAbierto, setDrawerAbierto] = useState(false)
  const esMovil = useMediaQuery('(max-width: 640px)')
  const esEscritorio = useMediaQuery('(min-width: 1024px)')

  // Tablet siempre en riel de íconos (fijo); escritorio respeta el toggle
  // manual del hamburguesa — mismo criterio que LayoutAdmin.tsx.
  const colapsadoRiel = esEscritorio ? colapsadoManual : true

  useEffect(() => {
    setDrawerAbierto(false)
  }, [location.pathname])

  function alAlternarMenu() {
    if (esMovil) {
      setDrawerAbierto((v) => !v)
      return
    }
    if (esEscritorio) setColapsadoManual((v) => !v)
  }

  if (!usuario) {
    return <Navigate to={`/acceso?next=${encodeURIComponent(location.pathname)}`} replace />
  }

  if (usuario.tipoCuenta !== 'cliente') {
    return <Navigate to="/admin" replace />
  }

  return (
    <div className="flex min-h-screen bg-[#f7f7f8]">
      <SidebarCliente colapsado={colapsadoRiel} variante="fija" />

      <AnimatePresence>
        {drawerAbierto && (
          <>
            <motion.div
              className="fixed inset-0 z-40 bg-black/50 sm:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDrawerAbierto(false)}
            />
            <motion.div
              className="fixed inset-y-0 left-0 z-50 sm:hidden"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.22, ease: 'easeOut' }}
            >
              <SidebarCliente colapsado={false} variante="drawer" />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <div className="flex min-w-0 flex-1 flex-col">
        <TopbarCliente colapsado={colapsadoRiel} onAlternarMenu={alAlternarMenu} />
        <main className="flex-1 px-3 py-5 sm:px-5 sm:py-7 lg:px-7">
          <div className="mx-auto max-w-[1240px]">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
