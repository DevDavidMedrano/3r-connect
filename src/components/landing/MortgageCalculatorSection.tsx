import { MortgageCalculator } from './MortgageCalculator'

export function MortgageCalculatorSection() {
  return (
    <section className="bg-borde/30 px-6 py-24">
      <div className="mx-auto max-w-xl text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-oro-oscuro">
          Planeación
        </p>
        <h2 className="mt-3 font-serif text-3xl font-semibold text-onix">
          Calcula tu pago mensual
        </h2>
        <p className="mt-3 text-sm text-onix/60">
          Una referencia rápida para planear tu compra antes de hablar con un asesor.
        </p>
      </div>

      <div className="mx-auto mt-10 max-w-md">
        <MortgageCalculator />
      </div>
    </section>
  )
}
