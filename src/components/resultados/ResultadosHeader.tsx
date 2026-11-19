import { ChevronDown } from 'lucide-react'
import { construirTituloResultados, type Filtros, type Orden } from './resultadosLogica'
import type { Propiedad } from '../../types/propiedad'

const OPCIONES_ORDEN: { valor: Orden; etiqueta: string }[] = [
  { valor: 'reciente', etiqueta: 'Más reciente' },
  { valor: 'precio-asc', etiqueta: 'Menor precio' },
  { valor: 'precio-desc', etiqueta: 'Mayor precio' },
  { valor: 'superficie-desc', etiqueta: 'Mayor superficie' },
]

interface ResultadosHeaderProps {
  filtros: Filtros
  resultados: Propiedad[]
  onOrdenChange: (orden: Orden) => void
}

export function ResultadosHeader({ filtros, resultados, onOrdenChange }: ResultadosHeaderProps) {
  const titulo = construirTituloResultados(filtros, resultados)

  return (
    <div className="flex flex-wrap items-end justify-between gap-3 px-6 py-4">
      <div>
        <h1 className="font-sans text-xl font-bold text-texto sm:text-2xl">{titulo}</h1>
        <p className="mt-1 text-sm text-texto-suave">
          {resultados.length} {resultados.length === 1 ? 'inmueble' : 'inmuebles'}
        </p>
      </div>

      <div className="relative shrink-0">
        <select
          value={filtros.orden}
          onChange={(evento) => onOrdenChange(evento.target.value as Orden)}
          aria-label="Ordenar resultados"
          className="cursor-pointer appearance-none rounded-full border border-gris-borde bg-blanco py-2 pl-4 pr-9 text-sm font-medium text-texto outline-none transition-colors hover:border-texto-suave"
        >
          {OPCIONES_ORDEN.map((opcion) => (
            <option key={opcion.valor} value={opcion.valor}>
              Publicación: {opcion.etiqueta.toLowerCase()}
            </option>
          ))}
        </select>
        <ChevronDown
          size={14}
          strokeWidth={2}
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-texto-suave"
        />
      </div>
    </div>
  )
}
