import { Component, type ReactNode } from 'react'
import { APIProvider, Circle, Map } from '@vis.gl/react-google-maps'
import { ExternalLink } from 'lucide-react'
import type { Propiedad } from '../../types/propiedad'
import { ESTILO_MAPA_CLARO } from '../resultados/mapaEstilo'

const RADIO_METROS = 350

function MapaNoDisponible() {
  return (
    <div className="flex h-64 w-full flex-col items-center justify-center gap-1 rounded-2xl bg-marfil px-6 text-center">
      <p className="text-sm font-medium text-texto-suave">El mapa no está disponible en este momento.</p>
    </div>
  )
}

class LimiteDeErroresMapa extends Component<{ children: ReactNode }, { fallo: boolean }> {
  state = { fallo: false }
  static getDerivedStateFromError() {
    return { fallo: true }
  }
  render() {
    return this.state.fallo ? <MapaNoDisponible /> : this.props.children
  }
}

export function Ubicacion({ propiedad }: { propiedad: Propiedad }) {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY
  const { colonia, alcaldia, ciudad } = propiedad.ubicacion
  const urlMaps = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${colonia}, ${alcaldia}, ${ciudad}`)}`

  return (
    <div>
      <h2 className="text-sm font-bold uppercase tracking-wide text-texto">Ubicación</h2>
      <p className="mt-2 text-sm text-texto-suave">
        {colonia}, {alcaldia}, {ciudad}. Por privacidad de la propiedad no publicamos la dirección exacta: el
        círculo en el mapa marca la zona aproximada.
      </p>

      <div className="mt-4 h-64 w-full overflow-hidden rounded-2xl">
        {apiKey ? (
          <LimiteDeErroresMapa>
            <APIProvider apiKey={apiKey}>
              <Map
                className="h-full w-full"
                defaultCenter={propiedad.coordenadas}
                defaultZoom={15}
                styles={ESTILO_MAPA_CLARO}
                disableDefaultUI
                zoomControl
                clickableIcons={false}
              >
                <Circle
                  center={propiedad.coordenadas}
                  radius={RADIO_METROS}
                  fillColor="#a81f45"
                  fillOpacity={0.12}
                  strokeColor="#a81f45"
                  strokeOpacity={0.6}
                  strokeWeight={1.5}
                />
              </Map>
            </APIProvider>
          </LimiteDeErroresMapa>
        ) : (
          <MapaNoDisponible />
        )}
      </div>

      <a
        href={urlMaps}
        target="_blank"
        rel="noreferrer"
        className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-vino-vivo transition-colors hover:text-vino"
      >
        Abrir en Maps
        <ExternalLink size={14} strokeWidth={2} />
      </a>
    </div>
  )
}
