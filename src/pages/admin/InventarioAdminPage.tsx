import { useMemo, useState } from 'react'
import { Building2, CheckCircle2, ChevronDown, Heart, MapPin } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Chip, EncabezadoPagina, type VarianteChip } from '../../components/cliente/Piezas'
import { EstadoVacio } from '../../components/admin/EstadoVacio'
import { PropertyArt } from '../../components/landing/art/PropertyArt'
import { COLONIA_BASE } from '../../data/coloniasCoordenadas'
import { propiedadesDemo } from '../../data/propiedadesDemo'
import { filtrarPropiedades, ordenarPropiedades, type Filtros, type Orden } from '../../components/resultados/resultadosLogica'
import {
  ETIQUETA_TIPO,
  etiquetaEstado,
  formatearPrecio,
  precioMinimo,
  resumenAtributos,
  type EstadoPropiedad,
  type Propiedad,
  type TipoPropiedad,
} from '../../types/propiedad'

interface EstadoRedireccion {
  mensaje?: string
}

type OperacionInventario = 'venta' | 'renta'

const ETIQUETA_COLONIA: Record<string, string> = {
  polanco: 'Polanco',
  'lomas de chapultepec': 'Lomas de Chapultepec',
  'nuevo polanco': 'Nuevo Polanco',
  anzures: 'Anzures',
  condesa: 'Condesa',
  'roma norte': 'Roma Norte',
  napoles: 'Nápoles',
  tecamachalco: 'Tecamachalco',
}

// Las opciones salen de COLONIA_BASE (fuente única de qué colonias tiene
// mapeadas la app) — nunca una lista aparte que se pueda desincronizar.
const OPCIONES_COLONIA = Object.keys(COLONIA_BASE).map((valor) => ({
  valor,
  etiqueta: ETIQUETA_COLONIA[valor] ?? valor,
}))

const OPCIONES_TIPO = Object.keys(ETIQUETA_TIPO) as TipoPropiedad[]

const OPCIONES_ORDEN: { valor: Orden; etiqueta: string }[] = [
  { valor: 'reciente', etiqueta: 'Más recientes' },
  { valor: 'precio-asc', etiqueta: 'Precio' },
  { valor: 'superficie-desc', etiqueta: 'M²' },
]

const VARIANTE_POR_ESTADO: Record<EstadoPropiedad, VarianteChip> = {
  disponible: 'exito',
  apartada: 'accion',
  vendida: 'espera',
}

const CLASE_INPUT_PRECIO =
  'w-full rounded-3r-md border border-gris-borde px-3 py-2 text-sm text-texto outline-none focus:border-vino-vivo'

function EtiquetaFiltro({ texto }: { texto: string }) {
  return <p className="mb-2 text-[10.5px] font-semibold uppercase tracking-wide text-texto-suave">{texto}</p>
}

function PanelFiltros({
  operacion,
  onOperacionChange,
  tipos,
  onAlternarTipo,
  precioMin,
  onPrecioMinChange,
  precioMax,
  onPrecioMaxChange,
  colonias,
  onAlternarColonia,
}: {
  operacion: OperacionInventario
  onOperacionChange: (operacion: OperacionInventario) => void
  tipos: TipoPropiedad[]
  onAlternarTipo: (tipo: TipoPropiedad) => void
  precioMin: string
  onPrecioMinChange: (valor: string) => void
  precioMax: string
  onPrecioMaxChange: (valor: string) => void
  colonias: string[]
  onAlternarColonia: (valor: string) => void
}) {
  return (
    <aside className="w-[260px] shrink-0 space-y-5 rounded-2xl border border-gris-borde bg-blanco p-4">
      <div className="flex rounded-full border border-gris-borde p-1">
        {(['venta', 'renta'] as const).map((opcion) => (
          <button
            key={opcion}
            type="button"
            onClick={() => onOperacionChange(opcion)}
            className={`flex-1 rounded-full py-1.5 text-sm font-semibold transition-colors ${
              operacion === opcion ? 'bg-vino-vivo text-blanco' : 'text-texto-suave hover:text-texto'
            }`}
          >
            {opcion === 'venta' ? 'Comprar' : 'Rentar'}
          </button>
        ))}
      </div>

      <div>
        <EtiquetaFiltro texto="Tipo de propiedad" />
        <div className="space-y-2">
          {OPCIONES_TIPO.map((tipo) => (
            <label key={tipo} className="flex items-center gap-2 text-sm text-texto">
              <input
                type="checkbox"
                checked={tipos.includes(tipo)}
                onChange={() => onAlternarTipo(tipo)}
                className="h-4 w-4 rounded border-gris-borde accent-vino-vivo"
              />
              {ETIQUETA_TIPO[tipo]}
            </label>
          ))}
        </div>
      </div>

      <div>
        <EtiquetaFiltro texto="Rango de precio" />
        <div className="space-y-2">
          <label className="block">
            <span className="text-xs text-texto-suave">Mínimo (MXN)</span>
            <input
              type="number"
              min="0"
              value={precioMin}
              onChange={(evento) => onPrecioMinChange(evento.target.value)}
              placeholder="0"
              className={`mt-1 ${CLASE_INPUT_PRECIO}`}
            />
          </label>
          <label className="block">
            <span className="text-xs text-texto-suave">Máximo (MXN)</span>
            <input
              type="number"
              min="0"
              value={precioMax}
              onChange={(evento) => onPrecioMaxChange(evento.target.value)}
              placeholder="Sin límite"
              className={`mt-1 ${CLASE_INPUT_PRECIO}`}
            />
          </label>
        </div>
      </div>

      <div>
        <EtiquetaFiltro texto="Colonia" />
        <div className="space-y-2">
          {OPCIONES_COLONIA.map((opcion) => (
            <label key={opcion.valor} className="flex items-center gap-2 text-sm text-texto">
              <input
                type="checkbox"
                checked={colonias.includes(opcion.valor)}
                onChange={() => onAlternarColonia(opcion.valor)}
                className="h-4 w-4 rounded border-gris-borde accent-vino-vivo"
              />
              {opcion.etiqueta}
            </label>
          ))}
        </div>
      </div>
    </aside>
  )
}

// Foto sin marca de agua todavía (placeholder bajo /media/): cae a la
// ilustración de PropertyArt en vez de romper un <img> — mismo criterio
// que ResultCard y PropertyCard del portal.
function esFotoPlaceholder(url: string): boolean {
  return url.startsWith('/media/')
}

function TarjetaInventario({
  propiedad,
  favorito,
  onAlternarFavorito,
}: {
  propiedad: Propiedad
  favorito: boolean
  onAlternarFavorito: () => void
}) {
  const navigate = useNavigate()
  const primeraFoto = propiedad.medios.find((medio) => !esFotoPlaceholder(medio.url))
  const direccion = 'direccion' in propiedad.ubicacion ? propiedad.ubicacion.direccion : propiedad.ubicacion.referencia

  return (
    <article
      role="link"
      tabIndex={0}
      onClick={() => navigate(`/propiedad/${propiedad.folio}`)}
      onKeyDown={(evento) => {
        if (evento.key === 'Enter') navigate(`/propiedad/${propiedad.folio}`)
      }}
      className="cursor-pointer overflow-hidden rounded-2xl border border-gris-borde bg-blanco transition-shadow hover:shadow-lg"
    >
      <div className="relative h-48 w-full overflow-hidden">
        {primeraFoto ? (
          <img
            src={primeraFoto.url}
            alt={primeraFoto.alt}
            className="h-full w-full object-cover"
            title={direccion}
          />
        ) : (
          <PropertyArt tipo={propiedad.tipo} className="h-full w-full" />
        )}

        <Chip variante={VARIANTE_POR_ESTADO[propiedad.estado]} className="absolute left-2.5 top-2.5">
          {etiquetaEstado(propiedad.estado)}
        </Chip>

        <button
          type="button"
          aria-label={favorito ? 'Quitar de favoritos' : 'Marcar como favorito'}
          onClick={(evento) => {
            evento.stopPropagation()
            onAlternarFavorito()
          }}
          className={`absolute right-2.5 top-2.5 flex h-8 w-8 items-center justify-center rounded-full shadow-sm transition-colors ${
            favorito ? 'bg-vino-vivo text-blanco' : 'bg-blanco/90 text-texto hover:bg-blanco'
          }`}
        >
          <Heart size={15} strokeWidth={2} fill={favorito ? 'currentColor' : 'none'} />
        </button>
      </div>

      <div className="p-3.5">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-texto-suave">{propiedad.folio}</p>
        <p className="mt-1 font-serif text-xl font-bold text-texto">{formatearPrecio(precioMinimo(propiedad))}</p>
        <p className="mt-1 text-sm text-texto">{ETIQUETA_TIPO[propiedad.tipo]}</p>
        <p className="mt-0.5 text-xs text-texto-suave">{resumenAtributos(propiedad).join(' · ')}</p>
        <p className="mt-1.5 flex items-center gap-1 truncate text-xs text-texto-suave">
          <MapPin size={12} strokeWidth={2} className="shrink-0" />
          {propiedad.ubicacion.colonia}, {propiedad.ubicacion.alcaldia}
        </p>
      </div>
    </article>
  )
}

export default function InventarioAdminPage() {
  const location = useLocation()
  const mensaje = (location.state as EstadoRedireccion | null)?.mensaje ?? null

  const [operacion, setOperacion] = useState<OperacionInventario>('venta')
  const [tipos, setTipos] = useState<TipoPropiedad[]>([])
  const [precioMin, setPrecioMin] = useState('')
  const [precioMax, setPrecioMax] = useState('')
  const [colonias, setColonias] = useState<string[]>([])
  const [orden, setOrden] = useState<Orden>('reciente')
  const [favoritos, setFavoritos] = useState<Set<string>>(new Set())

  function alternarTipo(tipo: TipoPropiedad) {
    setTipos((actual) => (actual.includes(tipo) ? actual.filter((t) => t !== tipo) : [...actual, tipo]))
  }

  function alternarColonia(valor: string) {
    setColonias((actual) => (actual.includes(valor) ? actual.filter((c) => c !== valor) : [...actual, valor]))
  }

  function alternarFavorito(folio: string) {
    setFavoritos((actual) => {
      const copia = new Set(actual)
      if (copia.has(folio)) copia.delete(folio)
      else copia.add(folio)
      return copia
    })
  }

  const resultados = useMemo(() => {
    // filtrarPropiedades/ordenarPropiedades ya resuelven operación y precio
    // mínimo — lo de aquí es solo lo que Filtros no cubre: tipo
    // multi-selección, precio máximo y colonia multi-selección.
    const filtrosBase: Filtros = {
      zona: '',
      operacion,
      precioMin: precioMin ? Number(precioMin) : null,
      tipo: '',
      recamarasMin: null,
      orden: 'reciente',
      vista: 'lista',
    }

    let lista = filtrarPropiedades(propiedadesDemo, filtrosBase, operacion === 'venta' ? 'comprar' : 'rentar')

    if (tipos.length > 0) {
      lista = lista.filter((propiedad) => tipos.includes(propiedad.tipo))
    }
    if (precioMax) {
      const max = Number(precioMax)
      lista = lista.filter((propiedad) => precioMinimo(propiedad).monto <= max)
    }
    if (colonias.length > 0) {
      lista = lista.filter((propiedad) =>
        colonias.some((colonia) => propiedad.ubicacion.colonia.toLowerCase().includes(colonia)),
      )
    }

    return ordenarPropiedades(lista, orden)
  }, [operacion, tipos, precioMin, precioMax, colonias, orden])

  return (
    <div className="space-y-5">
      <EncabezadoPagina titulo="Inventario de Propiedades" descripcion="Todo lo que la inmobiliaria tiene publicado con 3R Connect." />

      {mensaje && (
        <div className="flex items-center gap-3 rounded-2xl bg-exito/10 px-5 py-4 text-sm font-medium text-exito">
          <CheckCircle2 size={20} strokeWidth={1.75} className="shrink-0" />
          {mensaje}
        </div>
      )}

      <div className="flex items-start gap-6">
        <PanelFiltros
          operacion={operacion}
          onOperacionChange={setOperacion}
          tipos={tipos}
          onAlternarTipo={alternarTipo}
          precioMin={precioMin}
          onPrecioMinChange={setPrecioMin}
          precioMax={precioMax}
          onPrecioMaxChange={setPrecioMax}
          colonias={colonias}
          onAlternarColonia={alternarColonia}
        />

        <div className="min-w-0 flex-1 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-texto-suave">
              {resultados.length} propiedad{resultados.length === 1 ? '' : 'es'} encontrada{resultados.length === 1 ? '' : 's'}
            </p>

            <div className="relative shrink-0">
              <select
                value={orden}
                onChange={(evento) => setOrden(evento.target.value as Orden)}
                aria-label="Ordenar por"
                className="cursor-pointer appearance-none rounded-full border border-gris-borde bg-blanco py-2 pl-4 pr-9 text-sm font-medium text-texto outline-none transition-colors hover:border-texto-suave"
              >
                {OPCIONES_ORDEN.map((opcion) => (
                  <option key={opcion.valor} value={opcion.valor}>
                    Ordenar por: {opcion.etiqueta.toLowerCase()}
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

          {resultados.length === 0 ? (
            <EstadoVacio
              icono={Building2}
              titulo="Ninguna propiedad coincide con los filtros"
              descripcion="Prueba quitando algún filtro de tipo, precio o colonia."
            />
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {resultados.map((propiedad) => (
                <TarjetaInventario
                  key={propiedad.folio}
                  propiedad={propiedad}
                  favorito={favoritos.has(propiedad.folio)}
                  onAlternarFavorito={() => alternarFavorito(propiedad.folio)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
