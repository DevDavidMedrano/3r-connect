import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Bell, LogOut, Menu, Search, ShieldAlert, X } from 'lucide-react'
import { Link, Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useMediaQuery } from '../../hooks/useMediaQuery'
import { PERMISOS_MODULO, ROL_PERMISOS_DEFECTO } from '../../types/usuarioAdmin'
import { SidebarAdmin } from './SidebarAdmin'
import { useDatosAdmin } from './useDatosAdmin'

const ETIQUETA_ROL: Record<'admin' | 'asesor', string> = { admin: 'Administrador', asesor: 'Asesor' }

// Clon estructural de TopbarCliente (components/cliente/LayoutCliente.tsx):
// mismo buscador, misma campana — con el botón de colapsar el sidebar a la
// izquierda y el badge de notificaciones agregados.
function TopbarAdmin({ colapsado, onAlternarMenu }: { colapsado: boolean; onAlternarMenu: () => void }) {
  const { usuario, nombre, rol, cerrarSesion, procesoCompra, procesosPublicacion, casosValidacion } = useDatosAdmin()
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

  // Un solo número real: documentos "sube_cliente" sin validar en los tres
  // orígenes que alimenta Confianza y Validación — no un contador inventado.
  const documentosPendientes =
    procesoCompra.documentos.filter((d) => d.origen === 'sube_cliente' && d.estado !== 'validado').length +
    procesosPublicacion.flatMap((p) => p.documentos).filter((d) => d.origen === 'sube_cliente' && d.estado !== 'validado').length +
    casosValidacion.flatMap((c) => c.documentos).filter((d) => d.estado === 'pendiente' || d.estado === 'rechazado').length

  // El layout ya garantiza sesión antes de montar el topbar — nombre solo
  // sería null en el instante entre logout y el redirect.
  const iniciales = usuario ? usuario.iniciales : ''

  if (busquedaMovil) {
    return (
      <header className="sticky top-0 z-10 flex h-[66px] shrink-0 items-center gap-2.5 border-b border-gris-borde bg-blanco px-3">
        <Search size={16} strokeWidth={1.8} className="shrink-0 text-texto-suave" />
        <input
          autoFocus
          type="text"
          placeholder="Buscar propiedades, prospectos o clientes…"
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
          placeholder="Buscar propiedades, prospectos o clientes…"
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
              <span className="mt-0.5 text-[10.5px] text-texto-suave">{ETIQUETA_ROL[rol]}</span>
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

function AccesoModuloBloqueado({ etiqueta }: { etiqueta: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl bg-blanco px-6 py-20 text-center shadow-sm">
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-alerta/10 text-alerta">
        <ShieldAlert size={26} strokeWidth={1.5} />
      </span>
      <h2 className="mt-4 text-base font-bold text-texto">No tienes acceso a este módulo</h2>
      <p className="mt-1.5 max-w-sm text-sm text-texto-suave">
        Tu cuenta no tiene el permiso "{etiqueta}". Pídele a un administrador que te lo asigne en Usuarios y Roles.
      </p>
      <Link to="/admin" className="mt-4 text-xs font-semibold text-vino-vivo hover:underline">
        Volver al tablero
      </Link>
    </div>
  )
}

// Mismo guard que LayoutCliente.tsx: sin sesión, redirect a /acceso con el
// pathname actual en `next`. Si la cuenta es de cliente, redirect a su
// propio tablero — un cliente nunca ve este panel (ni escribiendo la URL a
// mano). SidebarAdmin ya distingue 'admin' de 'asesor' puertas adentro, así
// que aquí basta con excluir 'cliente'.
export function LayoutAdmin() {
  const { usuario, rol, usuariosAdmin } = useDatosAdmin()
  const location = useLocation()
  const [colapsadoManual, setColapsadoManual] = useState(false)
  const [drawerAbierto, setDrawerAbierto] = useState(false)
  const esMovil = useMediaQuery('(max-width: 640px)')
  const esEscritorio = useMediaQuery('(min-width: 1024px)')

  // Tablet siempre en riel de íconos (fijo, sin botón que lo cambie);
  // escritorio respeta el toggle manual del hamburguesa.
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

  if (usuario.tipoCuenta === 'cliente') {
    return <Navigate to="/mi-cuenta" replace />
  }

  // El guard real: cruza el correo de la sesión contra usuariosAdmin (la
  // misma lista que edita /admin/usuarios) para saber qué permisos tiene
  // de verdad. Si no hay fila que haga match (login demo sin cuenta
  // registrada todavía), cae a los permisos por defecto del rol — nunca
  // bloquea a alguien que no está en la lista.
  const registro = usuariosAdmin.find((u) => u.correo === usuario.correo)
  const permisos = registro?.permisos ?? ROL_PERMISOS_DEFECTO[rol]
  const moduloActual = PERMISOS_MODULO.find((p) => p.ruta === location.pathname)
  const sinPermiso = moduloActual && !permisos.includes(moduloActual.clave)

  return (
    <div className="flex min-h-screen bg-[#f7f7f8]">
      <SidebarAdmin colapsado={colapsadoRiel} variante="fija" />

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
              <SidebarAdmin colapsado={false} variante="drawer" />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <div className="flex min-w-0 flex-1 flex-col">
        <TopbarAdmin colapsado={colapsadoRiel} onAlternarMenu={alAlternarMenu} />
        <main className="flex-1 px-3 py-5 sm:px-5 sm:py-7 lg:px-7">
          <div className="mx-auto max-w-[1240px]">
            {sinPermiso && moduloActual ? <AccesoModuloBloqueado etiqueta={moduloActual.etiqueta} /> : <Outlet />}
          </div>
        </main>
      </div>
    </div>
  )
}
