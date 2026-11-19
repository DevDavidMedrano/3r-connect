import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Header } from '../components/landing/Header'
import { SearchProvider } from '../components/landing/SearchContext'
import type { TabBusqueda } from '../components/landing/searchConfig'
import { EmptyState } from '../components/resultados/EmptyState'
import { FiltrosBar } from '../components/resultados/FiltrosBar'
import { ResultCard } from '../components/resultados/ResultCard'
import { ResultadosHeader } from '../components/resultados/ResultadosHeader'
import {
  construirParametros,
  filtrarPropiedades,
  ordenarPropiedades,
  parsearFiltros,
  zonasConInventario,
  type Filtros,
} from '../components/resultados/resultadosLogica'
import { ResultsMap } from '../components/resultados/ResultsMap'
import { propiedadesPublicas } from '../data/propiedadesDemo'

export default function ResultadosPage({ modo }: { modo: TabBusqueda }) {
  const [searchParams, setSearchParams] = useSearchParams()
  const [folioResaltado, setFolioResaltado] = useState<string | null>(null)
  const [folioSeleccionado, setFolioSeleccionado] = useState<string | null>(null)

  const filtros = useMemo(() => parsearFiltros(searchParams, modo), [searchParams, modo])

  // Memorizado para que el hover de una tarjeta (que solo cambia
  // folioResaltado) no reconstruya el arreglo de propiedades en cada
  // render — el mapa reconstruye todos sus marcadores cuando esta
  // referencia cambia, y no queremos que eso pase en cada mouseover.
  const resultados = useMemo(() => {
    const filtrados = filtrarPropiedades(propiedadesPublicas, filtros, modo)
    return ordenarPropiedades(filtrados, filtros.orden)
  }, [filtros, modo])

  const zonasSugeridas = useMemo(() => zonasConInventario(propiedadesPublicas), [])

  function actualizarFiltros(parche: Partial<Filtros>) {
    setSearchParams(construirParametros({ ...filtros, ...parche }), { replace: true })
  }

  function tarjetaProps(propiedad: (typeof resultados)[number]) {
    return {
      destacada: propiedad.folio === folioResaltado || propiedad.folio === folioSeleccionado,
      onMouseEnter: () => setFolioResaltado(propiedad.folio),
      onMouseLeave: () => setFolioResaltado((actual) => (actual === propiedad.folio ? null : actual)),
    }
  }

  const sinResultados = resultados.length === 0

  return (
    <SearchProvider>
      <div className="flex h-screen flex-col overflow-hidden bg-blanco">
        <Header />
        <FiltrosBar filtros={filtros} modo={modo} onFiltrosChange={actualizarFiltros} />
        <ResultadosHeader
          filtros={filtros}
          resultados={resultados}
          onOrdenChange={(orden) => actualizarFiltros({ orden })}
        />

        {sinResultados ? (
          <div className="overflow-y-auto">
            <EmptyState zonasSugeridas={zonasSugeridas} onZonaClick={(zona) => actualizarFiltros({ zona })} />
          </div>
        ) : filtros.vista === 'lista' ? (
          <div className="flex-1 overflow-y-auto px-6 pb-10">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {resultados.map((propiedad) => (
                <ResultCard key={propiedad.folio} propiedad={propiedad} {...tarjetaProps(propiedad)} />
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-1 gap-5 overflow-hidden px-6 pb-6">
            <div className="w-[55%] overflow-y-auto pb-1 pr-1">
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                {resultados.map((propiedad) => (
                  <ResultCard key={propiedad.folio} propiedad={propiedad} {...tarjetaProps(propiedad)} />
                ))}
              </div>
            </div>

            <div className="w-[45%] shrink-0 overflow-hidden rounded-2xl">
              <ResultsMap
                propiedades={resultados}
                folioResaltado={folioResaltado}
                folioSeleccionado={folioSeleccionado}
                onHoverMarcador={setFolioResaltado}
                onSeleccionarFolio={setFolioSeleccionado}
              />
            </div>
          </div>
        )}
      </div>
    </SearchProvider>
  )
}
