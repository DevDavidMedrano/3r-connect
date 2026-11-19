import { SearchX } from 'lucide-react'

interface EmptyStateProps {
  zonasSugeridas: string[]
  onZonaClick: (zona: string) => void
}

export function EmptyState({ zonasSugeridas, onZonaClick }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-20 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-gris-borde/60 text-texto-suave">
        <SearchX size={24} strokeWidth={1.5} />
      </span>
      <h2 className="mt-4 text-lg font-bold text-texto">No encontramos propiedades con esos filtros</h2>
      <p className="mt-1.5 max-w-sm text-sm text-texto-suave">
        Prueba quitando algún filtro o busca en una de estas zonas, donde sí tenemos inventario:
      </p>

      <div className="mt-5 flex max-w-lg flex-wrap items-center justify-center gap-2">
        {zonasSugeridas.map((zona) => (
          <button
            key={zona}
            type="button"
            onClick={() => onZonaClick(zona)}
            className="rounded-full border border-gris-borde px-4 py-1.5 text-sm text-texto-suave transition-colors hover:border-vino-vivo hover:text-vino-vivo"
          >
            {zona}
          </button>
        ))}
      </div>
    </div>
  )
}
