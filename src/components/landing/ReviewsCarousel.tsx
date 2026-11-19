import { useRef, useState } from 'react'
import { BadgeCheck, ChevronLeft, ChevronRight, Star } from 'lucide-react'
import { GALERIA } from '../../assets/img'
import { obtenerResenas, obtenerResumenResenas } from '../../data/resenasDemo'
import { propiedadesDemo } from '../../data/propiedadesDemo'
import { deslizaDesdeDerechaVariants } from '../../lib/motionVariants'
import { Reveal } from '../motion/Reveal'
import { StaggerContainer, StaggerItem } from '../motion/StaggerReveal'
import { ETIQUETA_TIPO } from '../../types/propiedad'
import type { Resena } from '../../types/resena'

const formatoFecha = new Intl.DateTimeFormat('es-MX', { day: 'numeric', month: 'long', year: 'numeric' })

function Estrellas({ calificacion, tamano = 13 }: { calificacion: number; tamano?: number }) {
  return (
    <div className="flex shrink-0 gap-0.5">
      {Array.from({ length: 5 }).map((_, indice) => (
        <Star
          key={indice}
          size={tamano}
          strokeWidth={0}
          className={indice < calificacion ? 'fill-oro text-oro' : 'fill-gris-borde text-gris-borde'}
        />
      ))}
    </div>
  )
}

// La foto sale de la propiedad ligada por folio, nunca de una imagen
// suelta. Si esa propiedad no tiene foto real, cae en la rotación de
// GALERIA, igual que el resto de la landing.
function fotoYTipoDeResena(resena: Resena, indiceFallback: number): { url: string; tipo: string } {
  const propiedad = propiedadesDemo.find((p) => p.folio === resena.folio)
  const fotoReal = propiedad?.medios.find((medio) => !medio.url.startsWith('/media/'))
  return {
    url: fotoReal ? fotoReal.url : GALERIA[indiceFallback % GALERIA.length],
    tipo: propiedad ? ETIQUETA_TIPO[propiedad.tipo] : 'Propiedad',
  }
}

function TarjetaResena({ resena, indice }: { resena: Resena; indice: number }) {
  const [expandido, setExpandido] = useState(false)
  const { url: foto, tipo } = fotoYTipoDeResena(resena, indice)

  return (
    <article className="w-[300px] shrink-0 overflow-hidden rounded-2xl bg-gris-borde/40">
      <div className="relative h-36 w-full">
        <img src={foto} alt="" className="h-full w-full object-cover" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/75 via-black/15 to-transparent" />
        <p className="absolute bottom-2.5 left-3 text-xs font-semibold text-blanco">
          {tipo} · {resena.zona}
        </p>
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <span
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold text-blanco"
              style={{ backgroundColor: resena.colorAvatar }}
            >
              {resena.iniciales}
            </span>
            <div>
              <p className="text-sm font-bold text-texto">{resena.nombre}</p>
              <p className="text-xs text-texto-suave">
                {resena.operacion} · {resena.zona}
              </p>
            </div>
          </div>
          <Estrellas calificacion={resena.calificacion} />
        </div>

        <p className={`mt-3 text-sm text-texto-suave ${expandido ? '' : 'line-clamp-4'}`}>{resena.texto}</p>
        <button
          type="button"
          onClick={() => setExpandido((v) => !v)}
          className="mt-1 text-sm font-semibold text-vino-vivo transition-colors hover:text-vino"
        >
          {expandido ? 'Leer menos' : 'Leer más'}
        </button>

        <div className="mt-3 flex items-center justify-between border-t border-gris-borde pt-3">
          <span className="text-xs text-texto-suave">{formatoFecha.format(new Date(resena.fecha))}</span>
          {resena.verificada && (
            <span className="flex items-center gap-1 text-xs font-medium text-texto-suave">
              <BadgeCheck size={13} strokeWidth={2} className="text-vino-vivo" />
              Verificada
            </span>
          )}
        </div>
      </div>
    </article>
  )
}

const DESPLAZAMIENTO_PX = 320

export function ReviewsCarousel() {
  const scrollRef = useRef<HTMLDivElement>(null)
  const resenas = obtenerResenas()
  const resumen = obtenerResumenResenas()

  function desplazar(delta: number) {
    scrollRef.current?.scrollBy({ left: delta, behavior: 'smooth' })
  }

  return (
    <section className="bg-blanco px-4 pb-16 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <div className="flex items-center justify-between">
            <h2 className="font-sans text-xl font-bold text-texto sm:text-2xl">Lo que dicen nuestros clientes</h2>
            <div className="flex items-center gap-2">
              <button
                type="button"
                aria-label="Desplazar a la izquierda"
                onClick={() => desplazar(-DESPLAZAMIENTO_PX)}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-gris-borde text-texto-suave transition-colors hover:border-vino-vivo hover:text-vino-vivo"
              >
                <ChevronLeft size={15} strokeWidth={1.75} />
              </button>
              <button
                type="button"
                aria-label="Desplazar a la derecha"
                onClick={() => desplazar(DESPLAZAMIENTO_PX)}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-gris-borde text-texto-suave transition-colors hover:border-vino-vivo hover:text-vino-vivo"
              >
                <ChevronRight size={15} strokeWidth={1.75} />
              </button>
            </div>
          </div>

          <div className="mt-1.5 flex items-center gap-1.5 text-sm text-texto-suave">
            <Estrellas calificacion={5} tamano={14} />
            <span>
              {resumen.promedio.toFixed(1)} de 5 · basado en {resumen.total} reseñas
            </span>
          </div>
        </Reveal>

        <StaggerContainer
          ref={scrollRef}
          className="mt-5 flex gap-4 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {resenas.map((resena, indice) => (
            <StaggerItem key={resena.id} variants={deslizaDesdeDerechaVariants}>
              <TarjetaResena resena={resena} indice={indice} />
            </StaggerItem>
          ))}
        </StaggerContainer>

        <div className="mt-5 text-center">
          <a
            href="#"
            className="text-sm font-medium text-texto-suave underline-offset-2 transition-colors hover:text-texto hover:underline"
          >
            Ver todas las reseñas
          </a>
        </div>
      </div>
    </section>
  )
}
