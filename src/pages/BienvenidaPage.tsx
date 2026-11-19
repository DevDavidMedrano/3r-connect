import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useSesion, type OperacionOnboarding } from '../components/cuenta/SesionContext'

const OPERACIONES: { valor: OperacionOnboarding; etiqueta: string }[] = [
  { valor: 'comprar', etiqueta: 'Comprar' },
  { valor: 'rentar', etiqueta: 'Rentar' },
  { valor: 'invertir', etiqueta: 'Invertir' },
]

const ZONAS = ['Polanco', 'Lomas', 'Nuevo Polanco', 'Anzures', 'Condesa', 'Roma Norte']

const RANGOS_PRESUPUESTO = [
  'Hasta $5,000,000 MXN',
  '$5,000,000 – $15,000,000 MXN',
  '$15,000,000 – $30,000,000 MXN',
  'Más de $30,000,000 MXN',
]

export default function BienvenidaPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { completarOnboarding } = useSesion()

  const next = searchParams.get('next') ?? '/mi-cuenta'

  const [operacion, setOperacion] = useState<OperacionOnboarding | null>(null)
  const [zonas, setZonas] = useState<string[]>([])
  const [presupuesto, setPresupuesto] = useState('')

  function alternarZona(zona: string) {
    setZonas((actual) => (actual.includes(zona) ? actual.filter((z) => z !== zona) : [...actual, zona]))
  }

  function guardarYContinuar() {
    completarOnboarding({ operacion, zonas, presupuesto })
    navigate(next)
  }

  function omitir() {
    completarOnboarding(null)
    navigate(next)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gris-borde/40 px-4 py-12">
      <div className="w-full max-w-md rounded-2xl bg-blanco p-8 shadow-sm">
        <h1 className="text-lg font-bold text-texto">¿Qué estás buscando?</h1>
        <p className="mt-1 text-sm text-texto-suave">
          Nos ayuda a mostrarte propiedades más relevantes desde el primer momento.
        </p>

        <div className="mt-6">
          <p className="text-xs font-semibold uppercase tracking-wide text-texto-suave">Operación</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {OPERACIONES.map((op) => (
              <button
                key={op.valor}
                type="button"
                onClick={() => setOperacion(op.valor)}
                className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
                  operacion === op.valor
                    ? 'border-vino-vivo bg-vino-vivo text-blanco'
                    : 'border-gris-borde text-texto hover:border-vino-vivo hover:text-vino-vivo'
                }`}
              >
                {op.etiqueta}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-texto-suave">Zonas de interés</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {ZONAS.map((zona) => (
              <button
                key={zona}
                type="button"
                onClick={() => alternarZona(zona)}
                className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
                  zonas.includes(zona)
                    ? 'border-vino-vivo bg-vino-vivo text-blanco'
                    : 'border-gris-borde text-texto hover:border-vino-vivo hover:text-vino-vivo'
                }`}
              >
                {zona}
              </button>
            ))}
          </div>
        </div>

        <label className="mt-5 block">
          <p className="text-xs font-semibold uppercase tracking-wide text-texto-suave">Presupuesto</p>
          <select
            value={presupuesto}
            onChange={(evento) => setPresupuesto(evento.target.value)}
            className="mt-2 w-full rounded-lg border border-gris-borde px-3.5 py-2.5 text-sm text-texto outline-none focus:border-vino-vivo"
          >
            <option value="">Cualquiera</option>
            {RANGOS_PRESUPUESTO.map((rango) => (
              <option key={rango} value={rango}>
                {rango}
              </option>
            ))}
          </select>
        </label>

        <button
          type="button"
          onClick={guardarYContinuar}
          className="mt-7 w-full rounded-full bg-vino-vivo px-5 py-3 text-sm font-semibold text-blanco transition-colors hover:bg-vino"
        >
          Guardar y continuar
        </button>

        <button
          type="button"
          onClick={omitir}
          className="mt-3 w-full text-center text-sm text-texto-suave transition-colors hover:text-texto"
        >
          Omitir por ahora
        </button>
      </div>
    </div>
  )
}
