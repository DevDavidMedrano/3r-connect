import { Search } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useSearch } from './SearchContext'
import { construirRutaBusqueda, TABS_BUSQUEDA, TIPOS_POR_TAB } from './searchConfig'

export function SearchTabs() {
  const { tab, setTab } = useSearch()

  return (
    <div className="inline-flex rounded-full bg-blanco/10 p-1">
      {TABS_BUSQUEDA.map((t) => (
        <button
          key={t.valor}
          type="button"
          onClick={() => setTab(t.valor)}
          className={`rounded-full px-5 py-2 text-sm font-semibold transition-colors ${
            tab === t.valor
              ? 'bg-oro-brillante text-onix shadow-sm ring-1 ring-inset ring-oro-oscuro/50'
              : 'text-marfil/70 hover:text-marfil'
          }`}
        >
          {t.etiqueta}
        </button>
      ))}
    </div>
  )
}

export function SearchBar() {
  const navigate = useNavigate()
  const { tab, zona, setZona, precioMinimo, setPrecioMinimo, recamaras, setRecamaras, tipo, setTipo } =
    useSearch()
  const tipos = TIPOS_POR_TAB[tab]

  return (
    <form
      id="buscador-hero"
      onSubmit={(evento) => {
        evento.preventDefault()
        navigate(construirRutaBusqueda({ tab, zona, precioMinimo, recamaras, tipo }))
      }}
      // 1 columna en móvil (con divisor entre campos) → 2 en tablet → 4 en
      // escritorio, mismo contenedor. Sin divisores internos en el grid de
      // sm/lg: con el ancho variando por fila, un divisor "bonito" ahí
      // termina viéndose peor que ninguno.
      className="motion-safe:hover:-translate-y-1 mx-auto flex w-full max-w-4xl min-w-0 flex-col rounded-[28px] border border-blanco/40 bg-blanco/80 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.45)] backdrop-blur-xl transition-transform duration-300 sm:rounded-[28px] lg:rounded-full"
    >
      <div className="grid grid-cols-1 divide-y divide-gris-borde sm:grid-cols-2 sm:divide-y-0 lg:flex lg:grid-cols-none lg:items-stretch lg:divide-x lg:divide-gris-borde">
        <label className="flex min-w-0 flex-1 flex-col justify-center px-6 py-4">
          <span className="text-[11px] font-semibold uppercase tracking-wide text-texto-suave">
            Dónde
          </span>
          <input
            type="text"
            value={zona}
            onChange={(evento) => setZona(evento.target.value)}
            placeholder="Colonia, alcaldía o CP"
            className="mt-0.5 w-full min-w-0 bg-transparent text-sm text-texto outline-none placeholder:text-texto-suave/70"
          />
        </label>

        <label className="flex min-w-0 flex-1 flex-col justify-center px-6 py-4">
          <span className="text-[11px] font-semibold uppercase tracking-wide text-texto-suave">
            Precio
          </span>
          <input
            type="text"
            inputMode="numeric"
            value={precioMinimo}
            onChange={(evento) => setPrecioMinimo(evento.target.value)}
            placeholder="Desde"
            className="mt-0.5 w-full min-w-0 bg-transparent text-sm text-texto outline-none placeholder:text-texto-suave/70"
          />
        </label>

        <label className="flex min-w-0 flex-1 flex-col justify-center px-6 py-4">
          <span className="text-[11px] font-semibold uppercase tracking-wide text-texto-suave">
            Recámaras
          </span>
          <input
            type="text"
            inputMode="numeric"
            value={recamaras}
            onChange={(evento) => setRecamaras(evento.target.value)}
            placeholder="Recámaras y baños"
            className="mt-0.5 w-full min-w-0 bg-transparent text-sm text-texto outline-none placeholder:text-texto-suave/70"
          />
        </label>

        <label className="flex min-w-0 flex-1 flex-col justify-center px-6 py-4">
          <span className="text-[11px] font-semibold uppercase tracking-wide text-texto-suave">
            Tipo
          </span>
          <select
            value={tipo}
            onChange={(evento) => setTipo(evento.target.value)}
            className="mt-0.5 w-full min-w-0 bg-transparent text-sm text-texto outline-none"
          >
            <option value="">Cualquiera</option>
            {tipos.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </label>

        {/* Botón inline solo en escritorio — en móvil/tablet baja de ancho
            completo, debajo del grid (ver el bloque siguiente). */}
        <div className="hidden shrink-0 items-center justify-center p-3 lg:flex">
          <button
            type="submit"
            aria-label="Buscar"
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-oro-brillante text-onix shadow-[0_0_20px_2px_rgba(255,199,44,0.35)] transition-colors hover:bg-oro-claro"
          >
            <Search size={18} strokeWidth={2} />
          </button>
        </div>
      </div>

      <div className="border-t border-gris-borde p-3 lg:hidden">
        <button
          type="submit"
          className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-oro-brillante text-sm font-semibold text-onix shadow-[0_0_20px_2px_rgba(255,199,44,0.35)] transition-colors hover:bg-oro-claro"
        >
          <Search size={18} strokeWidth={2} />
          Buscar
        </button>
      </div>
    </form>
  )
}
