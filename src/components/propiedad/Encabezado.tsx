import { construirTitulo, etiquetaOperacion, formatearPrecio } from '../../types/propiedad'
import type { Propiedad } from '../../types/propiedad'

export function Encabezado({ propiedad }: { propiedad: Propiedad }) {
  return (
    <div>
      <div className="space-y-0.5">
        {propiedad.listados.map((listado, indice) => (
          <p key={indice} className="text-2xl font-bold text-texto sm:text-3xl">
            {formatearPrecio(listado.precio)}{' '}
            <span className="text-sm font-medium text-texto-suave">
              {etiquetaOperacion(listado.operacion).toLowerCase()}
            </span>
          </p>
        ))}
      </div>
      <p className="mt-1 text-base text-texto-suave">{construirTitulo(propiedad)}</p>
    </div>
  )
}
