import { Bookmark } from 'lucide-react'
import { ResultCard } from '../../components/resultados/ResultCard'
import { Boton, EncabezadoPagina, Tarjeta } from '../../components/cliente/Piezas'
import { useSesion } from '../../components/cuenta/SesionContext'
import { propiedadesDemo } from '../../data/propiedadesDemo'
import type { Propiedad } from '../../types/propiedad'

export default function GuardadosClientePage() {
  const { propiedadesGuardadas } = useSesion()

  const propiedades = propiedadesGuardadas
    .map((folio) => propiedadesDemo.find((p) => p.folio === folio))
    .filter((propiedad): propiedad is Propiedad => propiedad !== undefined)

  return (
    <div className="space-y-6">
      <EncabezadoPagina titulo="Guardados" descripcion="Las propiedades que marcaste para no perderlas de vista." />

      {propiedades.length === 0 ? (
        <Tarjeta className="flex flex-col items-center justify-center py-16 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-onix/10 text-onix">
            <Bookmark size={26} strokeWidth={1.5} />
          </span>
          <h2 className="mt-4 text-base font-bold text-texto">No tienes propiedades guardadas</h2>
          <p className="mt-1.5 max-w-sm text-sm text-texto-suave">
            Guarda las propiedades que te interesen mientras buscas para encontrarlas después aquí mismo.
          </p>
          <Boton to="/comprar" className="mt-4">
            Buscar propiedades
          </Boton>
        </Tarjeta>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {propiedades.map((propiedad) => (
            <ResultCard key={propiedad.folio} propiedad={propiedad} />
          ))}
        </div>
      )}
    </div>
  )
}
