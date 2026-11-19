import { motion, useMotionValue, useSpring } from 'framer-motion'
import { Play } from 'lucide-react'
import type { MouseEvent as ReactMouseEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import type { Propiedad } from '../../types/propiedad'
import { construirTitulo, etiquetaOperacion, formatearPrecio, resumenAtributos } from '../../types/propiedad'
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion'
import { CursorVer } from '../motion/CursorVer'
import { PlaceholderPropiedad } from './art/PlaceholderPropiedad'

// Los listados demo sin foto real todavía usan una URL placeholder bajo
// /media/: mientras no se reemplace por un archivo importado de verdad,
// la tarjeta cae a la ilustración de PropertyArt en vez de romper un <img>.
function esFotoPlaceholder(url: string): boolean {
  return url.startsWith('/media/')
}

export function PropertyCard({ propiedad }: { propiedad: Propiedad }) {
  const navigate = useNavigate()
  const titulo = construirTitulo(propiedad)
  const primerMedio = propiedad.medios.find((medio) => medio.tipo !== 'video')
  const foto = primerMedio && !esFotoPlaceholder(primerMedio.url) ? primerMedio : null
  const tieneVideo = propiedad.medios.some((medio) => medio.tipo === 'video')
  // La tarjeta de la landing es una vitrina, no el buscador: muestra el
  // primer listado nada más. La página de resultados sí despliega todos
  // (una unidad puede estar en venta y en renta a la vez).
  const listadoPrincipal = propiedad.listados[0]

  const prefiereReducido = usePrefersReducedMotion()
  const rotateXRaw = useMotionValue(0)
  const rotateYRaw = useMotionValue(0)
  // Al salir el cursor, un resorte suave la regresa lentamente en vez de
  // saltar de golpe a 0.
  const rotateX = useSpring(rotateXRaw, { stiffness: 120, damping: 18 })
  const rotateY = useSpring(rotateYRaw, { stiffness: 120, damping: 18 })

  function alMoverMouse(evento: ReactMouseEvent<HTMLElement>) {
    if (prefiereReducido) return
    const rect = evento.currentTarget.getBoundingClientRect()
    const px = (evento.clientX - rect.left) / rect.width - 0.5
    const py = (evento.clientY - rect.top) / rect.height - 0.5
    // Rotación mínima: 5° como máximo, apenas se nota.
    rotateY.set(px * 5)
    rotateX.set(py * -5)
  }

  function alSalirMouse() {
    rotateXRaw.set(0)
    rotateYRaw.set(0)
  }

  return (
    <motion.article
      role="link"
      tabIndex={0}
      onClick={() => navigate(`/propiedad/${propiedad.folio}`)}
      onKeyDown={(evento) => {
        if (evento.key === 'Enter') navigate(`/propiedad/${propiedad.folio}`)
      }}
      onMouseMove={alMoverMouse}
      onMouseLeave={alSalirMouse}
      whileHover={prefiereReducido ? undefined : { scale: 1.02 }}
      style={prefiereReducido ? undefined : { rotateX, rotateY, transformPerspective: 1000, willChange: 'transform' }}
      className={`group cursor-pointer overflow-hidden rounded-2xl border bg-blanco shadow-sm transition-shadow duration-300 hover:shadow-2xl ${
        tieneVideo ? 'border-vino-vivo/35' : 'border-gris-borde'
      }`}>
      <div className="relative h-52 w-full overflow-hidden">
        <CursorVer />
        {foto ? (
          // Las fotos reales vienen exportadas de un visor de recorrido 360°
          // con su propia interfaz (flechas, ícono de expandir) quemada en
          // los bordes de la imagen. No es un elemento de nuestra UI — es
          // parte del archivo — así que se recorta con zoom en vez de
          // intentar taparlo.
          <img
            src={foto.url}
            alt={foto.alt}
            className="h-full w-full scale-[1.25] object-cover transition-transform duration-700 ease-out group-hover:scale-[1.35]"
          />
        ) : (
          <PlaceholderPropiedad tipo={propiedad.tipo} folio={propiedad.folio} className="h-full w-full" />
        )}

        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

        <span className="absolute left-3 top-3 rounded-full bg-vino-vivo px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-blanco">
          {etiquetaOperacion(listadoPrincipal.operacion)}
        </span>

        {tieneVideo && (
          <span
            aria-label="Con video"
            title="Con video"
            onClick={(evento) => evento.stopPropagation()}
            className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-onix/80 px-2.5 py-1 text-[11px] font-semibold text-blanco shadow-sm"
          >
            <Play size={11} strokeWidth={0} fill="currentColor" />
            Video
          </span>
        )}

        <span className="absolute inset-x-3 bottom-3 text-lg font-bold text-blanco">
          {formatearPrecio(listadoPrincipal.precio)}
        </span>
      </div>

      <div className="p-4">
        <h3 className="truncate text-base font-semibold text-texto" title={titulo}>
          {titulo}
        </h3>
        <p className="mt-1 text-sm text-texto-suave">{resumenAtributos(propiedad).join(' • ')}</p>
      </div>
    </motion.article>
  )
}
