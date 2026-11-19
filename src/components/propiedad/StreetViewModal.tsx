import { useEffect, useRef, useState } from 'react'
import { APIProvider, useApiIsLoaded } from '@vis.gl/react-google-maps'
import { X } from 'lucide-react'
import type { Coordenadas } from '../../types/propiedad'

type Estado = 'cargando' | 'listo' | 'no-disponible'

// Busca la panorámica más cercana al centro de la colonia con
// StreetViewService en vez de solo pasarle `position` al panorama: así
// sabemos con certeza si hay imagen disponible ahí y podemos avisar en vez
// de dejar el visor en gris.
function Panorama({ centro }: { centro: Coordenadas }) {
  const cargado = useApiIsLoaded()
  const contenedorRef = useRef<HTMLDivElement>(null)
  const [estado, setEstado] = useState<Estado>('cargando')

  useEffect(() => {
    if (!cargado || !contenedorRef.current) return
    let cancelado = false
    const servicio = new google.maps.StreetViewService()
    servicio.getPanorama({ location: centro, radius: 500 }, (resultado, status) => {
      if (cancelado) return
      if (status !== google.maps.StreetViewStatus.OK || !resultado?.location) {
        setEstado('no-disponible')
        return
      }
      new google.maps.StreetViewPanorama(contenedorRef.current!, {
        pano: resultado.location.pano,
        addressControl: false,
        fullscreenControl: false,
        motionTracking: false,
        motionTrackingControl: false,
      })
      setEstado('listo')
    })
    return () => {
      cancelado = true
    }
  }, [cargado, centro])

  if (estado === 'no-disponible') {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center gap-1 bg-marfil px-6 text-center">
        <p className="text-sm font-medium text-texto-suave">No hay vista de calle disponible para esta zona.</p>
      </div>
    )
  }

  return <div ref={contenedorRef} className="h-full w-full" />
}

export function StreetViewModal({
  centro,
  colonia,
  onClose,
}: {
  centro: Coordenadas
  colonia: string
  onClose: () => void
}) {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY
  if (!apiKey) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-8" onClick={onClose}>
      <div
        onClick={(evento) => evento.stopPropagation()}
        className="w-full max-w-2xl overflow-hidden rounded-2xl bg-blanco shadow-2xl"
      >
        <div className="flex items-center justify-between px-5 py-4">
          <h2 className="text-sm font-bold text-texto">Street View — {colonia}</h2>
          <button
            type="button"
            aria-label="Cerrar"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-texto-suave transition-colors hover:bg-marfil hover:text-texto"
          >
            <X size={18} strokeWidth={2} />
          </button>
        </div>

        <div className="h-[420px] w-full">
          <APIProvider apiKey={apiKey}>
            <Panorama centro={centro} />
          </APIProvider>
        </div>

        <p className="px-5 py-3 text-xs text-texto-suave">
          Vista de la zona. La ubicación exacta se comparte con tu asesor.
        </p>
      </div>
    </div>
  )
}
