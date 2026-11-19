import { ContadorAnimado } from '../motion/ContadorAnimado'
import { StaggerContainer, StaggerItem } from '../motion/StaggerReveal'

const FORMATO_MILES = (n: number) => n.toLocaleString('es-MX')

const ESTADISTICAS = [
  { valor: 4500, prefijo: '+', sufijo: '', etiqueta: 'Propiedades', formato: FORMATO_MILES },
  { valor: 850, prefijo: '+', sufijo: '', etiqueta: 'Clientes felices', formato: FORMATO_MILES },
  { valor: 25, prefijo: '', sufijo: '', etiqueta: 'Años de experiencia', formato: undefined },
  { valor: 98, prefijo: '', sufijo: '%', etiqueta: 'Satisfacción', formato: undefined },
] as const

export function StatsSection() {
  return (
    <section className="bg-onix px-4 py-16 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-6xl">
        <StaggerContainer className="grid grid-cols-2 gap-8 sm:grid-cols-4">
          {ESTADISTICAS.map((estadistica) => (
            <StaggerItem key={estadistica.etiqueta} className="text-center">
              <p className="font-serif text-4xl font-bold text-oro sm:text-5xl">
                {estadistica.prefijo}
                <ContadorAnimado valor={estadistica.valor} formato={estadistica.formato} />
                {estadistica.sufijo}
              </p>
              <p className="mt-2 text-sm text-marfil/70">{estadistica.etiqueta}</p>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  )
}
