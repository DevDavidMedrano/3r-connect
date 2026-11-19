import { useEffect, useRef, useState } from 'react'
import { Bell, ChevronDown, Search, SlidersHorizontal, X } from 'lucide-react'
import type { TabBusqueda } from '../landing/searchConfig'
import { ETIQUETA_TIPO } from '../../types/propiedad'
import {
  contarFiltrosActivos,
  TIPOS_COMERCIALES,
  type Filtros,
  type OperacionFiltro,
  type Vista,
} from './resultadosLogica'

const OPCIONES_OPERACION: { valor: OperacionFiltro; etiqueta: string }[] = [
  { valor: 'venta', etiqueta: 'En venta' },
  { valor: 'renta', etiqueta: 'En renta' },
  { valor: 'preventa', etiqueta: 'Preventa' },
]

const OPCIONES_PRECIO = [
  { valor: '5000000', etiqueta: 'Desde $5,000,000' },
  { valor: '10000000', etiqueta: 'Desde $10,000,000' },
  { valor: '20000000', etiqueta: 'Desde $20,000,000' },
  { valor: '40000000', etiqueta: 'Desde $40,000,000' },
]

const OPCIONES_RECAMARAS = [
  { valor: '1', etiqueta: '1+ recámaras' },
  { valor: '2', etiqueta: '2+ recámaras' },
  { valor: '3', etiqueta: '3+ recámaras' },
  { valor: '4', etiqueta: '4+ recámaras' },
]

function SelectPill({
  placeholder,
  valor,
  opciones,
  onChange,
}: {
  placeholder: string
  valor: string
  opciones: { valor: string; etiqueta: string }[]
  onChange: (valor: string) => void
}) {
  const activo = valor !== ''

  return (
    <div className="relative shrink-0">
      <select
        value={valor}
        onChange={(evento) => onChange(evento.target.value)}
        aria-label={placeholder}
        className="cursor-pointer appearance-none rounded-full border border-gris-borde bg-blanco py-2 pl-4 pr-8 text-sm font-medium text-texto outline-none transition-colors hover:border-texto-suave"
      >
        <option value="">{placeholder}</option>
        {opciones.map((o) => (
          <option key={o.valor} value={o.valor}>
            {o.etiqueta}
          </option>
        ))}
      </select>
      {activo ? (
        <button
          type="button"
          aria-label={`Quitar filtro de ${placeholder.toLowerCase()}`}
          onClick={() => onChange('')}
          className="absolute right-2.5 top-1/2 flex -translate-y-1/2 items-center justify-center text-texto-suave hover:text-texto"
        >
          <X size={14} strokeWidth={2} />
        </button>
      ) : (
        <ChevronDown
          size={14}
          strokeWidth={2}
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-texto-suave"
        />
      )}
    </div>
  )
}

function CampoZona({ valor, onChange }: { valor: string; onChange: (valor: string) => void }) {
  return (
    <div className="flex min-w-[190px] shrink-0 items-center gap-2 rounded-full border border-gris-borde bg-blanco px-4 py-2">
      <Search size={15} strokeWidth={2} className="shrink-0 text-texto-suave" />
      <input
        type="text"
        value={valor}
        onChange={(evento) => onChange(evento.target.value)}
        placeholder="Colonia, alcaldía o CP"
        className="w-full min-w-0 bg-transparent text-sm font-medium text-texto outline-none placeholder:font-normal placeholder:text-texto-suave/70"
      />
      {valor && (
        <button
          type="button"
          aria-label="Quitar búsqueda de zona"
          onClick={() => onChange('')}
          className="shrink-0 text-texto-suave hover:text-texto"
        >
          <X size={14} strokeWidth={2} />
        </button>
      )}
    </div>
  )
}

function BotonFiltros({ activos, onLimpiar }: { activos: number; onLimpiar: () => void }) {
  const [abierto, setAbierto] = useState(false)
  const contenedorRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function alHacerClicFuera(evento: MouseEvent) {
      if (contenedorRef.current && !contenedorRef.current.contains(evento.target as Node)) {
        setAbierto(false)
      }
    }
    document.addEventListener('mousedown', alHacerClicFuera)
    return () => document.removeEventListener('mousedown', alHacerClicFuera)
  }, [])

  return (
    <div className="relative shrink-0" ref={contenedorRef}>
      <button
        type="button"
        onClick={() => setAbierto((v) => !v)}
        className="flex items-center gap-1.5 rounded-full border border-gris-borde bg-blanco px-4 py-2 text-sm font-medium text-texto transition-colors hover:border-texto-suave"
      >
        <SlidersHorizontal size={15} strokeWidth={2} />
        Filtros
        {activos > 0 && (
          <span className="flex h-4 w-4 items-center justify-center rounded-full bg-vino-vivo text-[10px] font-bold text-blanco">
            {activos}
          </span>
        )}
      </button>

      {abierto && (
        <div className="absolute right-0 top-full z-30 mt-2 w-52 rounded-xl border border-gris-borde bg-blanco p-2 shadow-lg">
          <p className="px-2.5 py-1.5 text-xs text-texto-suave">
            {activos > 0 ? `${activos} filtro${activos === 1 ? '' : 's'} activo${activos === 1 ? '' : 's'}` : 'Sin filtros activos'}
          </p>
          <button
            type="button"
            onClick={() => {
              onLimpiar()
              setAbierto(false)
            }}
            disabled={activos === 0}
            className="w-full rounded-lg px-2.5 py-2 text-left text-sm font-medium text-texto transition-colors hover:bg-marfil disabled:cursor-not-allowed disabled:text-texto-suave disabled:hover:bg-transparent"
          >
            Limpiar filtros
          </button>
        </div>
      )}
    </div>
  )
}

function BotonGuardarBusqueda() {
  const [guardada, setGuardada] = useState(false)

  return (
    <button
      type="button"
      onClick={() => setGuardada((v) => !v)}
      className={`flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold text-blanco transition-colors ${
        guardada ? 'bg-vino-oscuro' : 'bg-vino-vivo hover:bg-vino'
      }`}
    >
      <Bell size={15} strokeWidth={2} fill={guardada ? 'currentColor' : 'none'} />
      {guardada ? 'Guardada' : 'Guardar búsqueda'}
    </button>
  )
}

function ToggleVista({ vista, onChange }: { vista: Vista; onChange: (vista: Vista) => void }) {
  return (
    <div className="flex shrink-0 items-center rounded-full border border-gris-borde p-1">
      {(['lista', 'mapa'] as const).map((opcion) => (
        <button
          key={opcion}
          type="button"
          onClick={() => onChange(opcion)}
          className={`rounded-full px-4 py-1.5 text-sm font-semibold capitalize transition-colors ${
            vista === opcion ? 'bg-vino-vivo text-blanco' : 'text-texto-suave hover:text-texto'
          }`}
        >
          {opcion}
        </button>
      ))}
    </div>
  )
}

interface FiltrosBarProps {
  filtros: Filtros
  modo: TabBusqueda
  onFiltrosChange: (parche: Partial<Filtros>) => void
}

export function FiltrosBar({ filtros, modo, onFiltrosChange }: FiltrosBarProps) {
  const opcionesTipo = (modo === 'comercial' ? TIPOS_COMERCIALES : (Object.keys(ETIQUETA_TIPO) as (keyof typeof ETIQUETA_TIPO)[])).map(
    (tipo) => ({ valor: tipo, etiqueta: ETIQUETA_TIPO[tipo] }),
  )

  return (
    <div className="sticky top-[76px] z-20 border-b border-gris-borde bg-blanco px-6 py-3">
      <div className="mx-auto flex max-w-[1600px] flex-wrap items-center gap-2">
        <CampoZona valor={filtros.zona} onChange={(zona) => onFiltrosChange({ zona })} />

        <SelectPill
          placeholder="Operación"
          valor={filtros.operacion}
          opciones={OPCIONES_OPERACION.map((o) => ({ valor: o.valor, etiqueta: o.etiqueta }))}
          onChange={(valor) => onFiltrosChange({ operacion: valor as Filtros['operacion'] })}
        />

        <SelectPill
          placeholder="Precio"
          valor={filtros.precioMin ? String(filtros.precioMin) : ''}
          opciones={OPCIONES_PRECIO.map((o) => ({ valor: o.valor, etiqueta: o.etiqueta }))}
          onChange={(valor) => onFiltrosChange({ precioMin: valor ? Number(valor) : null })}
        />

        <SelectPill
          placeholder="Tipo de propiedad"
          valor={filtros.tipo}
          opciones={opcionesTipo}
          onChange={(valor) => onFiltrosChange({ tipo: valor as Filtros['tipo'] })}
        />

        <SelectPill
          placeholder="Recámaras"
          valor={filtros.recamarasMin ? String(filtros.recamarasMin) : ''}
          opciones={OPCIONES_RECAMARAS.map((o) => ({ valor: o.valor, etiqueta: o.etiqueta }))}
          onChange={(valor) => onFiltrosChange({ recamarasMin: valor ? Number(valor) : null })}
        />

        <BotonFiltros
          activos={contarFiltrosActivos(filtros)}
          onLimpiar={() =>
            onFiltrosChange({ zona: '', operacion: '', precioMin: null, tipo: '', recamarasMin: null })
          }
        />

        <BotonGuardarBusqueda />

        <div className="ml-auto">
          <ToggleVista vista={filtros.vista} onChange={(vista) => onFiltrosChange({ vista })} />
        </div>
      </div>
    </div>
  )
}
