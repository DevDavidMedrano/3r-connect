import type { Propiedad } from '../../types/propiedad'
import { Reveal } from '../motion/Reveal'
import { StaggerContainer, StaggerItem } from '../motion/StaggerReveal'
import { PropertyCard } from './PropertyCard'

export function FeaturedGrid({ propiedades }: { propiedades: Propiedad[] }) {
  return (
    <section className="bg-blanco px-4 pb-12 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <h2 className="font-sans text-xl font-bold text-texto sm:text-2xl">Propiedades destacadas</h2>
          <p className="mt-1 text-sm text-texto-suave">
            Una selección curada por nuestro equipo, no un catálogo completo.
          </p>
        </Reveal>

        <StaggerContainer className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {propiedades.map((propiedad) => (
            <StaggerItem key={propiedad.folio}>
              <PropertyCard propiedad={propiedad} />
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  )
}
