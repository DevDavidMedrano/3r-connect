import { Component, useEffect, useMemo, useRef, type ReactNode } from 'react'
import { APIProvider, InfoWindow, Map, useMap } from '@vis.gl/react-google-maps'
import { MarkerClusterer } from '@googlemaps/markerclusterer'
import type { Propiedad } from '../../types/propiedad'
import { ETIQUETA_TIPO, etiquetaOperacion, formatearPrecio, precioMinimo, resumenAtributos } from '../../types/propiedad'
import { abreviarPrecio, ESTILO_MAPA_CLARO, iconoCluster, iconoPrecio } from './mapaEstilo'

const MARGEN_ENCUADRE_PX = 60
const ZOOM_PROPIEDAD_UNICA = 15

const CENTRO_POLANCO = { lat: 19.4326, lng: -99.195 }
const ZOOM_INICIAL = 14

function MapaNoDisponible() {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-1.5 rounded-2xl bg-marfil px-6 text-center">
      <p className="text-sm font-medium text-texto-suave">El mapa no está disponible en este momento.</p>
      <p className="text-xs text-texto-suave/70">La lista de resultados sigue funcionando con normalidad.</p>
    </div>
  )
}

// Si Google Maps truena en tiempo de ejecución (llave inválida, cuota,
// script que no carga), esto evita que se caiga toda la página de
// resultados — en una demo, un problema de llave no debe romper nada más.
class LimiteDeErroresMapa extends Component<{ children: ReactNode }, { fallo: boolean }> {
  state = { fallo: false }

  static getDerivedStateFromError() {
    return { fallo: true }
  }

  render() {
    return this.state.fallo ? <MapaNoDisponible /> : this.props.children
  }
}

interface MarcadoresClusterizadosProps {
  propiedades: Propiedad[]
  folioResaltado: string | null
  folioSeleccionado: string | null
  onHoverMarcador: (folio: string | null) => void
  onClicMarcador: (folio: string) => void
}

function MarcadoresClusterizados({
  propiedades,
  folioResaltado,
  folioSeleccionado,
  onHoverMarcador,
  onClicMarcador,
}: MarcadoresClusterizadosProps) {
  const map = useMap()
  const clustererRef = useRef<MarkerClusterer | null>(null)
  const marcadoresRef = useRef<Record<string, google.maps.Marker>>({})

  useEffect(() => {
    if (!map) return

    const marcadores: Record<string, google.maps.Marker> = {}
    for (const propiedad of propiedades) {
      const marcador = new google.maps.Marker({
        position: propiedad.coordenadas,
        icon: iconoPrecio(abreviarPrecio(precioMinimo(propiedad)), 'normal'),
      })
      marcador.addListener('mouseover', () => onHoverMarcador(propiedad.folio))
      marcador.addListener('mouseout', () => onHoverMarcador(null))
      marcador.addListener('click', () => onClicMarcador(propiedad.folio))
      marcadores[propiedad.folio] = marcador
    }
    marcadoresRef.current = marcadores

    // Encuadre automático sobre los marcadores del resultado actual, no un
    // centro/zoom fijo: con una sola propiedad no tiene sentido "encuadrar
    // un área", así que esa se centra directamente con un zoom cómodo.
    if (propiedades.length === 1) {
      map.setCenter(propiedades[0].coordenadas)
      map.setZoom(ZOOM_PROPIEDAD_UNICA)
    } else if (propiedades.length > 1) {
      const bounds = new google.maps.LatLngBounds()
      propiedades.forEach((propiedad) => bounds.extend(propiedad.coordenadas))
      map.fitBounds(bounds, MARGEN_ENCUADRE_PX)
    }

    clustererRef.current = new MarkerClusterer({
      map,
      markers: Object.values(marcadores),
      renderer: {
        render: ({ count, position }) => {
          const icono = iconoCluster(count)
          return new google.maps.Marker({
            position,
            icon: {
              url: icono.url,
              scaledSize: new google.maps.Size(icono.width, icono.height),
            },
            label: { text: String(count), color: '#ffffff', fontSize: '12px', fontWeight: '700' },
            zIndex: 1000 + count,
          })
        },
      },
    })

    return () => {
      clustererRef.current?.clearMarkers()
      clustererRef.current = null
      Object.values(marcadores).forEach((marcador) => marcador.setMap(null))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, propiedades])

  useEffect(() => {
    for (const propiedad of propiedades) {
      const marcador = marcadoresRef.current[propiedad.folio]
      if (!marcador) continue
      const esResaltado = propiedad.folio === folioResaltado
      const esSeleccionado = propiedad.folio === folioSeleccionado
      const estado = esSeleccionado ? 'seleccionado' : esResaltado ? 'resaltado' : 'normal'
      marcador.setIcon(iconoPrecio(abreviarPrecio(precioMinimo(propiedad)), estado))
      marcador.setAnimation(esResaltado ? google.maps.Animation.BOUNCE : null)
      marcador.setZIndex(esSeleccionado || esResaltado ? 999 : 1)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [folioResaltado, folioSeleccionado, propiedades])

  return null
}

interface MapaInternoProps {
  propiedades: Propiedad[]
  folioResaltado: string | null
  folioSeleccionado: string | null
  onHoverMarcador: (folio: string | null) => void
  onSeleccionarFolio: (folio: string | null) => void
}

function TarjetaFlotante({ propiedad }: { propiedad: Propiedad }) {
  const foto = propiedad.medios.find((medio) => !medio.url.startsWith('/media/'))

  return (
    <div className="w-56">
      <div className="h-28 w-full overflow-hidden rounded-lg bg-marfil">
        {foto && <img src={foto.url} alt={foto.alt} className="h-full w-full scale-110 object-cover" />}
      </div>
      <div className="mt-2 space-y-0.5">
        {propiedad.listados.map((listado, indice) => (
          <p key={indice} className="text-sm font-bold text-texto">
            {formatearPrecio(listado.precio)}{' '}
            <span className="text-xs font-normal text-texto-suave">
              {etiquetaOperacion(listado.operacion).toLowerCase()}
            </span>
          </p>
        ))}
      </div>
      <p className="mt-0.5 text-xs text-texto-suave">
        {ETIQUETA_TIPO[propiedad.tipo]} · {resumenAtributos(propiedad).join(' · ')}
      </p>
    </div>
  )
}

function MapaInterno({
  propiedades,
  folioResaltado,
  folioSeleccionado,
  onHoverMarcador,
  onSeleccionarFolio,
}: MapaInternoProps) {
  const propiedadSeleccionada = propiedades.find((p) => p.folio === folioSeleccionado) ?? null

  return (
    <Map
      className="h-full w-full"
      defaultCenter={CENTRO_POLANCO}
      defaultZoom={ZOOM_INICIAL}
      styles={ESTILO_MAPA_CLARO}
      disableDefaultUI
      zoomControl
      fullscreenControl
      mapTypeControl={false}
      streetViewControl={false}
      rotateControl={false}
      scaleControl={false}
      clickableIcons={false}
      onClick={() => onSeleccionarFolio(null)}
    >
      <MarcadoresClusterizados
        propiedades={propiedades}
        folioResaltado={folioResaltado}
        folioSeleccionado={folioSeleccionado}
        onHoverMarcador={onHoverMarcador}
        onClicMarcador={onSeleccionarFolio}
      />

      {propiedadSeleccionada && (
        <InfoWindow
          position={propiedadSeleccionada.coordenadas}
          onCloseClick={() => onSeleccionarFolio(null)}
        >
          <TarjetaFlotante propiedad={propiedadSeleccionada} />
        </InfoWindow>
      )}
    </Map>
  )
}

interface ResultsMapProps {
  propiedades: Propiedad[]
  folioResaltado: string | null
  folioSeleccionado: string | null
  onHoverMarcador: (folio: string | null) => void
  onSeleccionarFolio: (folio: string | null) => void
}

export function ResultsMap(props: ResultsMapProps) {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY

  const propiedadesConCoordenadas = useMemo(
    () => props.propiedades.filter((p) => Number.isFinite(p.coordenadas.lat) && Number.isFinite(p.coordenadas.lng)),
    [props.propiedades],
  )

  if (!apiKey) {
    return <MapaNoDisponible />
  }

  return (
    <LimiteDeErroresMapa>
      <APIProvider apiKey={apiKey}>
        <MapaInterno {...props} propiedades={propiedadesConCoordenadas} />
      </APIProvider>
    </LimiteDeErroresMapa>
  )
}
