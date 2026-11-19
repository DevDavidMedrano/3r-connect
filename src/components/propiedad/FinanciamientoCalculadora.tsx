import { useState } from 'react'
import { calcularPagoMensual, PLAZOS_ANIOS } from '../../lib/financiamiento'

const formatoMXN = new Intl.NumberFormat('es-MX', {
  style: 'currency',
  currency: 'MXN',
  maximumFractionDigits: 0,
})

export function FinanciamientoCalculadora({ precioInicial }: { precioInicial: number }) {
  const [precio, setPrecio] = useState(precioInicial)
  const [enganchePct, setEnganchePct] = useState(20)
  const [plazoAnios, setPlazoAnios] = useState(20)

  const pagoMensual = calcularPagoMensual(precio, enganchePct, plazoAnios)
  const montoEnganche = precio * (enganchePct / 100)

  return (
    <div>
      <h2 className="text-sm font-bold uppercase tracking-wide text-texto">Opciones de financiamiento</h2>

      <div className="mt-4 grid grid-cols-1 gap-5 rounded-2xl border border-gris-borde p-5 sm:grid-cols-2">
        <div className="space-y-4">
          <label className="block">
            <span className="text-xs font-medium text-texto-suave">Precio de la propiedad</span>
            <input
              type="number"
              min={0}
              step={100_000}
              value={precio}
              onChange={(evento) => setPrecio(Number(evento.target.value))}
              className="mt-1 w-full rounded-lg border border-gris-borde px-3 py-2 text-sm text-texto outline-none focus:border-vino-vivo"
            />
          </label>

          <label className="block">
            <span className="text-xs font-medium text-texto-suave">
              Enganche ({enganchePct}% · {formatoMXN.format(montoEnganche)})
            </span>
            <input
              type="range"
              min={5}
              max={50}
              value={enganchePct}
              onChange={(evento) => setEnganchePct(Number(evento.target.value))}
              className="mt-3 w-full accent-vino-vivo"
            />
          </label>

          <label className="block">
            <span className="text-xs font-medium text-texto-suave">Plazo</span>
            <select
              value={plazoAnios}
              onChange={(evento) => setPlazoAnios(Number(evento.target.value))}
              className="mt-1 w-full rounded-lg border border-gris-borde px-3 py-2 text-sm text-texto outline-none focus:border-vino-vivo"
            >
              {PLAZOS_ANIOS.map((anios) => (
                <option key={anios} value={anios}>
                  {anios} años
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="flex flex-col justify-center rounded-xl bg-marfil p-5 text-center">
          <p className="text-xs uppercase tracking-wide text-texto-suave">Pago mensual estimado</p>
          <p className="mt-1 text-2xl font-bold text-texto">{formatoMXN.format(pagoMensual)}</p>
          <p className="mt-3 text-[11px] text-texto-suave">
            Estimado con fines ilustrativos, no constituye una oferta de crédito.
          </p>
        </div>
      </div>
    </div>
  )
}
