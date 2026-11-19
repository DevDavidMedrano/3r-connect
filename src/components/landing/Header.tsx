import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronDown, Globe, Heart, Menu, Search, X } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { Logo3R } from '../brand/Logo3R'
import { CuentaMenu } from '../cuenta/CuentaMenu'
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion'
import { useSearch } from './SearchContext'
import { construirRutaBusqueda } from './searchConfig'

const NAV = ['Comprar', 'Rentar', 'Preventa', 'Créditos', 'Asesores']

const UMBRAL_SCROLL = 140

// Todo el logo (imagen completa) es el objetivo de click, nunca solo un
// aro invisible alrededor — por eso la clase vive en el <Link>, no en un
// wrapper aparte.
const CLASES_LOGO_LINK = 'inline-block cursor-pointer transition-opacity duration-200 hover:opacity-80'

function irAlBuscadorDelHero() {
  document.getElementById('buscador-hero')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
}

function CampoCompacto({ etiqueta, valor }: { etiqueta: string; valor: string }) {
  return (
    <button
      type="button"
      onClick={irAlBuscadorDelHero}
      className="flex min-w-0 flex-col px-4 py-1.5 text-left"
    >
      <span className="text-[9px] font-semibold uppercase tracking-wide text-texto-suave">
        {etiqueta}
      </span>
      <span className="max-w-[8rem] truncate text-xs font-medium text-texto">{valor}</span>
    </button>
  )
}

function BuscadorCompacto() {
  const navigate = useNavigate()
  const { tab, zona, precioMinimo, recamaras, tipo } = useSearch()

  return (
    <div className="flex items-center divide-x divide-gris-borde rounded-full border border-gris-borde bg-blanco py-1 pl-1 pr-1.5 shadow-sm">
      <CampoCompacto etiqueta="Dónde" valor={zona || 'Colonia, alcaldía o CP'} />
      <CampoCompacto etiqueta="Precio" valor={precioMinimo || 'Desde'} />
      <CampoCompacto etiqueta="Recámaras" valor={recamaras || 'Recámaras y baños'} />
      <CampoCompacto etiqueta="Tipo" valor={tipo || 'Propiedad'} />
      <button
        type="button"
        aria-label="Buscar"
        onClick={() => navigate(construirRutaBusqueda({ tab, zona, precioMinimo, recamaras, tipo }))}
        className="ml-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-oro text-onix transition-colors hover:bg-oro-claro"
      >
        <Search size={14} strokeWidth={2} />
      </button>
    </div>
  )
}

// Menú a pantalla completa en móvil/tablet — mismos enlaces que el nav
// horizontal de escritorio, ninguno oculto ni resumido.
function MenuMovil({ abierto, onCerrar }: { abierto: boolean; onCerrar: () => void }) {
  const prefiereReducido = usePrefersReducedMotion()

  useEffect(() => {
    document.body.style.overflow = abierto ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [abierto])

  return (
    <AnimatePresence>
      {abierto && (
        <motion.div
          className="fixed inset-0 z-50 flex flex-col bg-blanco lg:hidden"
          initial={prefiereReducido ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <div className="flex items-center justify-between px-4 py-5 sm:px-6">
            <Link to="/" aria-label="Ir al inicio" className={CLASES_LOGO_LINK} onClick={onCerrar}>
              <Logo3R size={90} sizeSm={110} />
            </Link>
            <button
              type="button"
              aria-label="Cerrar menú"
              onClick={onCerrar}
              className="flex h-11 w-11 items-center justify-center rounded-full text-onix transition-colors hover:bg-marfil"
            >
              <X size={22} strokeWidth={2} />
            </button>
          </div>

          <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-4 py-4 sm:px-6">
            {NAV.map((item) => (
              <a
                key={item}
                href="#"
                onClick={onCerrar}
                className="flex min-h-11 items-center gap-1.5 border-b border-gris-borde py-3.5 text-lg font-medium text-onix"
              >
                {item}
                {item === 'Asesores' && <ChevronDown size={16} strokeWidth={1.75} />}
              </a>
            ))}

            <button
              type="button"
              onClick={onCerrar}
              className="flex min-h-11 items-center gap-2.5 border-b border-gris-borde py-3.5 text-left text-lg font-medium text-onix"
            >
              <Heart size={18} strokeWidth={1.75} />
              Favoritos
            </button>
            <button
              type="button"
              onClick={onCerrar}
              className="flex min-h-11 items-center gap-2.5 py-3.5 text-left text-lg font-medium text-onix"
            >
              <Globe size={18} strokeWidth={1.75} />
              Español
            </button>
          </nav>

          <div className="border-t border-gris-borde px-4 py-4 sm:px-6">
            <CuentaMenu />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

interface HeaderProps {
  // Cuando viene de Landing con el preloader recién terminado, el logo
  // comparte layoutId con el del preloader para que framer-motion anime
  // la transición entre los dos como si fuera el mismo elemento. En el
  // resto de las páginas se omite y el logo no lleva motion.
  logoLayoutId?: string
}

export function Header({ logoLayoutId }: HeaderProps = {}) {
  const [scrolled, setScrolled] = useState(false)
  const [menuAbierto, setMenuAbierto] = useState(false)
  const prefiereReducido = usePrefersReducedMotion()

  useEffect(() => {
    function alScrollear() {
      setScrolled(window.scrollY > UMBRAL_SCROLL)
    }
    alScrollear()
    window.addEventListener('scroll', alScrollear, { passive: true })
    return () => window.removeEventListener('scroll', alScrollear)
  }, [])

  const logo = (
    <Link to="/" aria-label="Ir al inicio" className={CLASES_LOGO_LINK}>
      {logoLayoutId ? (
        <motion.div layoutId={logoLayoutId}>
          <Logo3R size={90} sizeSm={110} />
        </motion.div>
      ) : (
        <Logo3R size={90} sizeSm={110} />
      )}
    </Link>
  )

  return (
    <motion.header
      initial={prefiereReducido ? false : { y: -32, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className={`sticky top-0 z-40 px-4 py-5 transition-all duration-300 sm:px-6 lg:px-10 ${
        scrolled
          ? 'border-b border-gris-borde bg-blanco/85 shadow-sm backdrop-blur-md'
          : 'border-b border-transparent bg-blanco'
      }`}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-6">
        {logo}

        <div className="relative hidden flex-1 items-center justify-center lg:flex">
          <nav
            className={`flex items-center gap-8 text-sm font-medium text-onix/80 transition-all duration-300 ${
              scrolled ? 'pointer-events-none scale-95 opacity-0' : 'opacity-100'
            }`}
          >
            {NAV.map((item) => (
              <a
                key={item}
                href="#"
                className="flex items-center gap-1 transition-colors hover:text-oro-oscuro"
              >
                {item}
                {item === 'Asesores' && <ChevronDown size={14} strokeWidth={1.75} />}
              </a>
            ))}
          </nav>

          <div
            className={`absolute transition-all duration-300 ${
              scrolled ? 'opacity-100' : 'pointer-events-none scale-95 opacity-0'
            }`}
          >
            <BuscadorCompacto />
          </div>
        </div>

        <div className="flex items-center gap-5">
          <button
            type="button"
            className="hidden items-center gap-1.5 text-sm font-medium text-onix/80 transition-colors hover:text-oro-oscuro sm:flex"
          >
            <Heart size={17} strokeWidth={1.75} />
            Favoritos
          </button>

          <button
            type="button"
            className="hidden items-center gap-1.5 text-sm font-medium text-onix/80 transition-colors hover:text-oro-oscuro sm:flex"
          >
            <Globe size={17} strokeWidth={1.75} />
            ES
          </button>

          <div className="hidden lg:block">
            <CuentaMenu />
          </div>

          <button
            type="button"
            aria-label="Abrir menú"
            onClick={() => setMenuAbierto(true)}
            className="flex h-11 w-11 items-center justify-center text-onix lg:hidden"
          >
            <Menu size={22} strokeWidth={1.9} />
          </button>
        </div>
      </div>

      <MenuMovil abierto={menuAbierto} onCerrar={() => setMenuAbierto(false)} />
    </motion.header>
  )
}
