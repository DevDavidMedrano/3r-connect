import { useState } from 'react'
import { calcularPagoMensual, PLAZOS_ANIOS } from '../../lib/financiamiento'

const formatoMXN = new Intl.NumberFormat('es-MX', {
  style: 'currency',
  currency: 'MXN',
  maximumFractionDigits: 0,
})

export function MortgageCalculator() {
  const [precio, setPrecio] = useState(5_000_000)
  const [enganchePct, setEnganchePct] = useState(20)
  const [plazoAnios, setPlazoAnios] = useState(20)
  const [pagoMensual, setPagoMensual] = useState<number | null>(null)

  return (
    <div className="rounded-3r-md border border-borde bg-marfil p-7">
      <h3 className="font-serif text-xl font-semibold text-onix">Calculadora hipotecaria</h3>

      <form
        className="mt-5 space-y-4"
        onSubmit={(evento) => {
          evento.preventDefault()
          setPagoMensual(calcularPagoMensual(precio, enganchePct, plazoAnios))
        }}
      >
        <label className="block">
          <span className="text-xs font-medium uppercase tracking-wide text-onix/50">
            Precio de la propiedad
          </span>
          <input
            type="number"
            min={0}
            step={100_000}
            value={precio}
            onChange={(evento) => setPrecio(Number(evento.target.value))}
            className="mt-1 w-full rounded-3r-sm border border-borde bg-marfil px-3 py-2 text-sm text-onix outline-none focus:border-oro"
          />
        </label>

        <label className="block">
          <span className="text-xs font-medium uppercase tracking-wide text-onix/50">
            Enganche ({enganchePct}%)
          </span>
          <input
            type="range"
            min={5}
            max={50}
            value={enganchePct}
            onChange={(evento) => setEnganchePct(Number(evento.target.value))}
            className="mt-3 w-full accent-oro"
          />
        </label>

        <label className="block">
          <span className="text-xs font-medium uppercase tracking-wide text-onix/50">Plazo</span>
          <select
            value={plazoAnios}
            onChange={(evento) => setPlazoAnios(Number(evento.target.value))}
            className="mt-1 w-full rounded-3r-sm border border-borde bg-marfil px-3 py-2 text-sm text-onix outline-none focus:border-oro"
          >
            {PLAZOS_ANIOS.map((anios) => (
              <option key={anios} value={anios}>
                {anios} años
              </option>
            ))}
          </select>
        </label>

        <button
          type="submit"
          className="w-full rounded-3r-sm bg-gradient-oro px-6 py-3 text-sm font-semibold text-onix"
        >
          Calcular
        </button>
      </form>

      {pagoMensual !== null && (
        <div className="mt-5 rounded-3r-sm bg-onix p-4 text-center">
          <p className="text-xs uppercase tracking-wide text-marfil/60">Pago mensual estimado</p>
          <p className="mt-1 font-serif text-2xl font-semibold text-oro-claro">
            {formatoMXN.format(pagoMensual)}
          </p>
        </div>
      )}

      <p className="mt-3 text-[11px] text-onix/45">
        Estimado con fines ilustrativos, no constituye una oferta de crédito.
      </p>
    </div>
  )
}
