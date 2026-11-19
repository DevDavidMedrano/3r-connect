import { PropertyArt } from './art/PropertyArt'

export function VirtualToursSection() {
  return (
    <section className="bg-marfil px-6 py-24">
      <div className="mx-auto grid max-w-6xl items-center gap-16 lg:grid-cols-2">
        <PropertyArt tipo="departamento" className="h-80 w-full rounded-3r-md" />

        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-oro-oscuro">
            Recorridos virtuales
          </p>
          <h2 className="mt-3 font-serif text-3xl font-semibold text-onix">
            Recorre cada propiedad antes de visitarla.
          </h2>
          <p className="mt-4 max-w-md text-base text-onix/70">
            Recorrido 360 en las propiedades ya terminadas y modelo 3D en las
            que siguen en obra. Llegas a la visita presencial sabiendo si de
            verdad te interesa.
          </p>
        </div>
      </div>
    </section>
  )
}
