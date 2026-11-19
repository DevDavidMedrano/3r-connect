import { Reveal } from '../motion/Reveal'

export function PositioningPhrase() {
  return (
    <section className="bg-blanco px-4 py-10 sm:px-6 lg:px-10">
      <Reveal>
        <p className="mx-auto max-w-lg text-center text-base font-medium leading-snug text-texto sm:text-lg">
          No vendemos volumen: vendemos certeza.
          <br />
          Ya revisamos cada propiedad antes de mostrártela.
          <br />
          Así compramos y vendemos en Polanco.
        </p>
      </Reveal>
    </section>
  )
}
