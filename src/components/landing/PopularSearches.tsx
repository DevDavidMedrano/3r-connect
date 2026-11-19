import { useRef } from 'react'
import { ChevronLeft, ChevronRight, MapPin } from 'lucide-react'
import { StaggerContainer, StaggerItem } from '../motion/StaggerReveal'

const ZONAS_POPULARES = [
  'Polanco',
  'Lomas de Chapultepec',
  'Anzures',
  'Condesa',
  'Roma Norte',
  'Nuevo Polanco',
  'Bosques de las Lomas',
]

const DESPLAZAMIENTO_PX = 180

export function PopularSearches() {
  const scrollRef = useRef<HTMLDivElement>(null)

  function desplazar(delta: number) {
    scrollRef.current?.scrollBy({ left: delta, behavior: 'smooth' })
  }

  return (
    <div className="bg-blanco px-4 pb-6 pt-4 sm:px-6 lg:px-10">
      <div className="mx-auto flex max-w-6xl items-center gap-3">
        <span className="shrink-0 text-xs font-bold text-texto">Búsquedas populares</span>

        <button
          type="button"
          aria-label="Desplazar a la izquierda"
          onClick={() => desplazar(-DESPLAZAMIENTO_PX)}
          className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-gris-borde text-texto-suave transition-colors hover:border-oro-oscuro hover:text-oro-oscuro"
        >
          <ChevronLeft size={12} strokeWidth={1.75} />
        </button>

        <div
          ref={scrollRef}
          className="flex flex-1 gap-1.5 overflow-x-auto scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          <StaggerContainer disparador="montaje" retraso={0.05} className="flex gap-1.5">
            {ZONAS_POPULARES.map((zona) => (
              <StaggerItem key={zona}>
                <button
                  type="button"
                  className="flex shrink-0 items-center gap-1 rounded-full border border-gris-borde px-3 py-1 text-xs text-texto-suave transition-colors hover:border-oro-oscuro hover:text-oro-oscuro"
                >
                  <MapPin size={11} strokeWidth={2} className="text-oro-oscuro" />
                  {zona}
                </button>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>

        <button
          type="button"
          aria-label="Desplazar a la derecha"
          onClick={() => desplazar(DESPLAZAMIENTO_PX)}
          className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-gris-borde text-texto-suave transition-colors hover:border-oro-oscuro hover:text-oro-oscuro"
        >
          <ChevronRight size={12} strokeWidth={1.75} />
        </button>
      </div>
    </div>
  )
}
