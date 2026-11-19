import { Component, useEffect, useMemo, useState, type ReactNode } from 'react'
import { APIProvider, Map, Marker, Polygon, useMap } from '@vis.gl/react-google-maps'
import { ChevronDown, Search, TrendingDown, TrendingUp } from 'lucide-react'
import { propiedadesDemo } from '../../data/propiedadesDemo'
import { formatearPrecioM2, ZONAS_DESTACADAS } from '../../data/zonasDestacadasDemo'
import { COLORES } from '../../lib/colores'
import { ESTILO_MAPA_CLARO, iconoPinPequeno } from '../resultados/mapaEstilo'
import { Reveal } from '../motion/Reveal'

const MARGEN_ENCUADRE_INICIAL_PX = 40
const MARGEN_ENCUADRE_ZONA_PX = 80

type Orden = 'populares' | 'precio'

// Encuadre inicial que muestra las diez zonas de una vez, con margen —
// calculado de los propios polígonos en vez de un centro/zoom fijos, para
// que si se agrega o quita una zona el mapa se siga ajustando solo.
const LIMITES_TODAS_LAS_ZONAS: google.maps.LatLngBoundsLiteral & { padding: number } = (() => {
  const lats = ZONAS_DESTACADAS.flatMap((zona) => zona.poligono.map((punto) => punto.lat))
  const lngs = ZONAS_DESTACADAS.flatMap((zona) => zona.poligono.map((punto) => punto.lng))
  return {
    north: Math.max(...lats),
    south: Math.min(...lats),
    east: Math.max(...lngs),
    west: Math.min(...lngs),
    padding: MARGEN_ENCUADRE_INICIAL_PX,
  }
})()

function MapaNoDisponible() {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-1.5 rounded-2xl bg-marfil px-6 text-center">
      <p className="text-sm font-medium text-texto-suave">El mapa no está disponible en este momento.</p>
    </div>
  )
}

// Igual que en ResultsMap/Ubicacion: si Google Maps truena en tiempo de
// ejecución, no debe tirar el resto de la landing.
class LimiteDeErroresMapa extends Component<{ children: ReactNode }, { fallo: boolean }> {
  state = { fallo: false }
  static getDerivedStateFromError() {
    return { fallo: true }
  }
  render() {
    return this.state.fallo ? <MapaNoDisponible /> : this.props.children
  }
}

// Solo el polígono de la zona sobre la que está el cursor en la lista se
// resalta; con algo resaltado, los demás quedan tenues. Sin nada
// resaltado, todos quedan en su opacidad base (0.25).
function PoligonosZonas({ zonaResaltada }: { zonaResaltada: string | null }) {
  const hayResaltado = zonaResaltada !== null

  return (
    <>
      {ZONAS_DESTACADAS.map((zona) => {
        const activa = zona.nombre === zonaResaltada
        const fillOpacity = activa ? 0.42 : hayResaltado ? 0.1 : 0.25
        const strokeOpacity = activa ? 0.95 : hayResaltado ? 0.3 : 0.7
        const strokeWeight = activa ? 2.5 : hayResaltado ? 1 : 1.5

        return (
          <Polygon
            key={zona.nombre}
            paths={zona.poligono}
            fillColor={COLORES.vinoVivo}
            fillOpacity={fillOpacity}
            strokeColor={COLORES.vinoVivo}
            strokeOpacity={strokeOpacity}
            strokeWeight={strokeWeight}
          />
        )
      })}
    </>
  )
}

function PinesPropiedades() {
  const icono = useMemo(() => iconoPinPequeno(), [])
  return (
    <>
      {propiedadesDemo.map((propiedad) => (
        <Marker key={propiedad.folio} position={propiedad.coordenadas} icon={icono} />
      ))}
    </>
  )
}

function ControladorEncuadre({ zonaSeleccionada }: { zonaSeleccionada: string | null }) {
  const map = useMap()

  useEffect(() => {
    if (!map || !zonaSeleccionada) return
    const zona = ZONAS_DESTACADAS.find((z) => z.nombre === zonaSeleccionada)
    if (!zona) return
    const bounds = new google.maps.LatLngBounds()
    zona.poligono.forEach((punto) => bounds.extend(punto))
    map.fitBounds(bounds, MARGEN_ENCUADRE_ZONA_PX)
  }, [map, zonaSeleccionada])

  return null
}

function MapaZonas({ zonaResaltada, zonaSeleccionada }: { zonaResaltada: string | null; zonaSeleccionada: string | null }) {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY
  if (!apiKey) return <MapaNoDisponible />

  return (
    <LimiteDeErroresMapa>
      <APIProvider apiKey={apiKey}>
        <Map
          className="h-full w-full"
          defaultBounds={LIMITES_TODAS_LAS_ZONAS}
          styles={ESTILO_MAPA_CLARO}
          disableDefaultUI
          zoomControl
          fullscreenControl
          mapTypeControl={false}
          streetViewControl={false}
          rotateControl={false}
          scaleControl={false}
          clickableIcons={false}
        >
          <PoligonosZonas zonaResaltada={zonaResaltada} />
          <PinesPropiedades />
          <ControladorEncuadre zonaSeleccionada={zonaSeleccionada} />
        </Map>
      </APIProvider>
    </LimiteDeErroresMapa>
  )
}

export function ZonasDestacadas() {
  const [busqueda, setBusqueda] = useState('')
  const [orden, setOrden] = useState<Orden>('populares')
  const [zonaResaltada, setZonaResaltada] = useState<string | null>(null)
  const [zonaSeleccionada, setZonaSeleccionada] = useState<string | null>(null)

  const zonas = useMemo(() => {
    const filtradas = ZONAS_DESTACADAS.filter((zona) =>
      zona.nombre.toLowerCase().includes(busqueda.toLowerCase()),
    )
    if (orden === 'precio') {
      return [...filtradas].sort((a, b) => b.precioM2 - a.precioM2)
    }
    return filtradas
  }, [busqueda, orden])

  return (
    <section className="bg-blanco px-4 pb-12 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <h2 className="font-sans text-xl font-bold text-texto sm:text-2xl">Zonas destacadas</h2>
          <p className="mt-1 text-sm text-texto-suave">
            Precio promedio por m² y tendencia de los últimos 12 meses.
          </p>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="mt-6 flex flex-col gap-4 lg:h-[520px] lg:flex-row">
            <div className="flex h-[420px] flex-col overflow-hidden rounded-2xl border border-gris-borde lg:h-full lg:w-[35%]">
              <div className="flex shrink-0 items-center gap-2 border-b border-gris-borde bg-blanco p-3">
                <div className="flex flex-1 items-center gap-2 rounded-full border border-gris-borde bg-blanco px-3 py-2">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-vino text-blanco">
                    <Search size={12} strokeWidth={2} />
                  </span>
                  <input
                    type="text"
                    value={busqueda}
                    onChange={(evento) => setBusqueda(evento.target.value)}
                    placeholder="Buscar zona"
                    className="w-full min-w-0 bg-transparent text-sm text-texto placeholder:text-texto-suave focus:outline-none"
                  />
                </div>

                <div className="relative shrink-0">
                  <select
                    value={orden}
                    onChange={(evento) => setOrden(evento.target.value as Orden)}
                    className="appearance-none rounded-full border border-gris-borde bg-blanco py-2 pl-3 pr-7 text-xs font-medium text-texto-suave focus:outline-none"
                  >
                    <option value="populares">Populares</option>
                    <option value="precio">Precio</option>
                  </select>
                  <ChevronDown
                    size={12}
                    strokeWidth={2}
                    className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-texto-suave"
                  />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto">
                {zonas.map((zona, indice) => (
                  <button
                    key={zona.nombre}
                    type="button"
                    onMouseEnter={() => setZonaResaltada(zona.nombre)}
                    onMouseLeave={() => setZonaResaltada(null)}
                    onClick={() => setZonaSeleccionada(zona.nombre)}
                    className={`flex w-full items-center justify-between gap-2 px-4 py-3 text-left transition-all duration-200 hover:bg-blanco hover:shadow-sm ${
                      indice % 2 === 0 ? 'bg-marfil/60' : 'bg-blanco'
                    } ${zona.nombre === zonaSeleccionada ? 'ring-1 ring-inset ring-vino-vivo' : ''}`}
                  >
                    <span className="min-w-0 flex-1 truncate text-sm font-semibold text-texto">{zona.nombre}</span>
                    <span className="shrink-0 text-xs text-texto-suave sm:text-sm">
                      {formatearPrecioM2(zona.precioM2)}
                    </span>
                    <span
                      className={`flex shrink-0 items-center gap-0.5 text-xs font-semibold ${
                        zona.variacionPct >= 0 ? 'text-exito' : 'text-alerta'
                      }`}
                    >
                      {zona.variacionPct >= 0 ? (
                        <TrendingUp size={13} strokeWidth={2.25} />
                      ) : (
                        <TrendingDown size={13} strokeWidth={2.25} />
                      )}
                      {Math.abs(zona.variacionPct).toFixed(1)}%
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="h-[320px] overflow-hidden rounded-2xl lg:h-full lg:w-[65%]">
              <MapaZonas zonaResaltada={zonaResaltada} zonaSeleccionada={zonaSeleccionada} />
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
