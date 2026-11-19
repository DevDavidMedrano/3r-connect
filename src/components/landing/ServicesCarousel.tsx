import { useRef } from 'react'
import {
  Building2,
  ChevronLeft,
  ChevronRight,
  FileSearch,
  KeyRound,
  Landmark,
  Scale,
  Sparkles,
  Stamp,
  Video,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { rebotaVariants } from '../../lib/motionVariants'
import { StaggerContainer, StaggerItem } from '../motion/StaggerReveal'

const SERVICIOS: { icono: LucideIcon; nombre: string }[] = [
  { icono: FileSearch, nombre: 'Avalúo' },
  { icono: Landmark, nombre: 'Crédito hipotecario' },
  { icono: KeyRound, nombre: 'Administración de rentas' },
  { icono: Scale, nombre: 'Asesoría legal' },
  { icono: Sparkles, nombre: 'Home staging' },
  { icono: Stamp, nombre: 'Escrituración' },
  { icono: Video, nombre: 'Recorridos 360' },
  { icono: Building2, nombre: 'Preventa' },
]

const DESPLAZAMIENTO_PX = 250

export function ServicesCarousel() {
  const scrollRef = useRef<HTMLDivElement>(null)

  function desplazar(delta: number) {
    scrollRef.current?.scrollBy({ left: delta, behavior: 'smooth' })
  }

  return (
    <section className="bg-blanco px-4 pb-12 sm:px-6 lg:px-10">
      <div className="mx-auto flex max-w-6xl items-center gap-2">
        <button
          type="button"
          aria-label="Desplazar a la izquierda"
          onClick={() => desplazar(-DESPLAZAMIENTO_PX)}
          className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-gris-borde text-texto-suave transition-colors hover:border-vino-vivo hover:text-vino-vivo"
        >
          <ChevronLeft size={13} strokeWidth={1.75} />
        </button>

        <div
          ref={scrollRef}
          className="flex flex-1 gap-1.5 overflow-x-auto scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          <StaggerContainer className="flex gap-1.5">
            {SERVICIOS.map(({ icono: Icono, nombre }) => (
              <StaggerItem key={nombre} variants={rebotaVariants}>
                <div className="flex w-28 shrink-0 flex-col items-start gap-2 rounded-xl border border-gris-borde px-3 py-3 text-left">
                  <Icono size={18} strokeWidth={1.5} className="text-vino-vivo" />
                  <span className="text-xs font-medium leading-snug text-texto">{nombre}</span>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>

        <button
          type="button"
          aria-label="Desplazar a la derecha"
          onClick={() => desplazar(DESPLAZAMIENTO_PX)}
          className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-gris-borde text-texto-suave transition-colors hover:border-vino-vivo hover:text-vino-vivo"
        >
          <ChevronRight size={13} strokeWidth={1.75} />
        </button>
      </div>
    </section>
  )
}
