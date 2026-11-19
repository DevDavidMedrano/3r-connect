import { useEffect, useState } from 'react'
import { Box, ChevronLeft, ChevronRight, Compass, Images, Play, X } from 'lucide-react'
import { centroColonia } from '../../data/coloniasCoordenadas'
import type { Medio, Propiedad } from '../../types/propiedad'
import { PlaceholderPropiedad } from '../landing/art/PlaceholderPropiedad'
import { StreetViewModal } from './StreetViewModal'
import { Visor3DModal } from './Visor3DModal'

const FOTOS_EN_MOSAICO = 5

function esFotoPlaceholder(url: string): boolean {
  return url.startsWith('/media/')
}

// Nunca confía en que el medio "video" del catálogo demo de verdad exista
// en public/videos/ — esos archivos se copian a mano al servidor (ver
// README) y no pasan por el build. Si falta el archivo o falla la carga,
// el botón simplemente no aparece, en vez de abrir un reproductor roto.
function useVideoDisponible(url: string | null): boolean {
  const [disponible, setDisponible] = useState(false)

  useEffect(() => {
    setDisponible(false)
    if (!url) return
    const video = document.createElement('video')
    video.preload = 'metadata'
    video.onloadedmetadata = () => setDisponible(true)
    video.onerror = () => setDisponible(false)
    video.src = url
    return () => {
      video.onloadedmetadata = null
      video.onerror = null
      video.src = ''
    }
  }, [url])

  return disponible
}

function VisorVideoPantallaCompleta({ medio, onClose }: { medio: Medio; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black/95">
      <div className="flex items-center justify-between px-6 py-4">
        <span className="text-sm font-medium text-blanco/70">Video</span>
        <button
          type="button"
          aria-label="Cerrar"
          onClick={onClose}
          className="flex h-9 w-9 items-center justify-center rounded-full text-blanco transition-colors hover:bg-blanco/10"
        >
          <X size={20} strokeWidth={2} />
        </button>
      </div>

      <div className="flex flex-1 items-center justify-center px-4 pb-6">
        {/* eslint-disable-next-line jsx-a11y/media-has-caption -- video demo sin subtítulos disponibles todavía */}
        <video
          src={medio.url}
          controls
          preload="metadata"
          className="max-h-full max-w-full rounded-lg"
          aria-label={medio.alt}
        />
      </div>
    </div>
  )
}

// Sin m² de construcción no hay superficie con la que escalar el modelo
// (terrenos no tienen distribución interior que mostrar, así que ni
// siquiera traen este campo): en ambos casos el botón "Ver en 3D" no
// aparece, en vez de abrir un visor que no tiene con qué armarse.
function puedeVerEn3D(propiedad: Propiedad): boolean {
  return 'm2Construccion' in propiedad && propiedad.m2Construccion > 0
}

interface Foto {
  url: string
  alt: string
}

// Ya no rellena con GALERIA cuando faltan fotos: una propiedad muestra las
// fotos reales que tiene, o ninguna. Nunca una foto de otro tipo de
// inmueble prestada solo para completar el mosaico.
function construirFotos(propiedad: Propiedad): Foto[] {
  return propiedad.medios
    .filter((medio) => medio.tipo !== 'video' && !esFotoPlaceholder(medio.url))
    .map((medio) => ({ url: medio.url, alt: medio.alt }))
}

function VisorPantallaCompleta({
  fotos,
  indiceInicial,
  onClose,
}: {
  fotos: Foto[]
  indiceInicial: number
  onClose: () => void
}) {
  const [indice, setIndice] = useState(indiceInicial)

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black/95">
      <div className="flex items-center justify-between px-6 py-4">
        <span className="text-sm font-medium text-blanco/70">
          {indice + 1} / {fotos.length}
        </span>
        <button
          type="button"
          aria-label="Cerrar"
          onClick={onClose}
          className="flex h-9 w-9 items-center justify-center rounded-full text-blanco transition-colors hover:bg-blanco/10"
        >
          <X size={20} strokeWidth={2} />
        </button>
      </div>

      <div className="relative flex flex-1 items-center justify-center px-4 pb-6">
        <button
          type="button"
          aria-label="Foto anterior"
          onClick={() => setIndice((i) => (i - 1 + fotos.length) % fotos.length)}
          className="absolute left-4 flex h-10 w-10 items-center justify-center rounded-full bg-blanco/10 text-blanco transition-colors hover:bg-blanco/20"
        >
          <ChevronLeft size={20} strokeWidth={2} />
        </button>

        <img
          src={fotos[indice].url}
          alt=""
          className="max-h-full max-w-full rounded-lg object-contain"
        />

        <button
          type="button"
          aria-label="Foto siguiente"
          onClick={() => setIndice((i) => (i + 1) % fotos.length)}
          className="absolute right-4 flex h-10 w-10 items-center justify-center rounded-full bg-blanco/10 text-blanco transition-colors hover:bg-blanco/20"
        >
          <ChevronRight size={20} strokeWidth={2} />
        </button>
      </div>
    </div>
  )
}

export function Galeria({ propiedad }: { propiedad: Propiedad }) {
  const fotos = construirFotos(propiedad)
  const [visorAbierto, setVisorAbierto] = useState(false)
  const [indiceVisor, setIndiceVisor] = useState(0)
  const [modal3DAbierto, setModal3DAbierto] = useState(false)
  const [streetViewAbierto, setStreetViewAbierto] = useState(false)
  const [videoAbierto, setVideoAbierto] = useState(false)
  const puede3D = puedeVerEn3D(propiedad)
  const medioVideo = propiedad.medios.find((medio) => medio.tipo === 'video') ?? null
  const videoDisponible = useVideoDisponible(medioVideo?.url ?? null)
  const puedeVideo = medioVideo !== null && videoDisponible
  // Nunca el pin exacto de la propiedad: por privacidad, Street View solo
  // ofrece el centro de la colonia (ver centroColonia). Si la colonia no
  // está mapeada ahí, no hay centro confiable que mostrar y el botón
  // simplemente no aparece — mismo criterio que la llave faltante.
  const centroStreetView = centroColonia(propiedad.ubicacion.colonia)
  const apiKeyMaps = import.meta.env.VITE_GOOGLE_MAPS_API_KEY
  const puedeStreetView = Boolean(apiKeyMaps) && centroStreetView !== null

  function abrirVisor(indice: number) {
    setIndiceVisor(indice)
    setVisorAbierto(true)
  }

  // Mosaico 1+4 (con "ver todas") solo cuando hay 5 fotos o más. Con 2 a 4,
  // el panel secundario se ajusta a esa cantidad. Con 0 o 1, no hay mosaico:
  // una sola imagen grande (o el marcador de posición), sin panel al lado.
  const secundarias = fotos.length >= 2 ? fotos.slice(1, Math.min(fotos.length, FOTOS_EN_MOSAICO)) : []
  // El video toma un espacio del mosaico si sobra uno (máximo 4 tiles ahí,
  // igual que las fotos) — nunca desplaza una foto real. Si ya hay 4 fotos
  // secundarias, sigue disponible por la pastilla "Ver video".
  const mostrarVideoEnMosaico = puedeVideo && secundarias.length < 4
  const totalTilesSecundarios = secundarias.length + (mostrarVideoEnMosaico ? 1 : 0)
  const gridSecundarias =
    totalTilesSecundarios <= 1
      ? 'grid-cols-1 grid-rows-1'
      : totalTilesSecundarios === 2
        ? 'grid-cols-1 grid-rows-2'
        : 'grid-cols-2 grid-rows-2'

  return (
    <div className="mx-auto max-w-6xl px-6 pt-6">
      <div className={totalTilesSecundarios > 0 ? 'grid grid-cols-1 gap-2 sm:grid-cols-[1.5fr_1fr]' : ''}>
        <div className="relative h-72 overflow-hidden rounded-2xl sm:h-[420px]">
          {fotos.length > 0 ? (
            <button type="button" onClick={() => abrirVisor(0)} className="block h-full w-full">
              <img src={fotos[0].url} alt={fotos[0].alt} className="h-full w-full object-cover" />
            </button>
          ) : (
            <PlaceholderPropiedad tipo={propiedad.tipo} folio={propiedad.folio} className="h-full w-full" />
          )}
          <div className="absolute bottom-3 left-3 flex items-center gap-2">
            {puede3D && (
              <button
                type="button"
                onClick={() => setModal3DAbierto(true)}
                className="flex items-center gap-1.5 rounded-full bg-blanco/95 px-3.5 py-2 text-xs font-semibold text-texto shadow-sm transition-colors hover:bg-blanco"
              >
                <Box size={14} strokeWidth={1.75} />
                Ver en 3D
              </button>
            )}
            {puedeStreetView && (
              <button
                type="button"
                onClick={() => setStreetViewAbierto(true)}
                className="flex items-center gap-1.5 rounded-full bg-blanco/95 px-3.5 py-2 text-xs font-semibold text-texto shadow-sm transition-colors hover:bg-blanco"
              >
                <Compass size={14} strokeWidth={1.75} />
                Street View
              </button>
            )}
            {puedeVideo && (
              <button
                type="button"
                onClick={() => setVideoAbierto(true)}
                className="flex items-center gap-1.5 rounded-full bg-blanco/95 px-3.5 py-2 text-xs font-semibold text-texto shadow-sm transition-colors hover:bg-blanco"
              >
                <Play size={14} strokeWidth={1.75} fill="currentColor" />
                Ver video
              </button>
            )}
          </div>
        </div>

        {totalTilesSecundarios > 0 && (
          <div className={`grid gap-2 h-72 sm:h-[420px] ${gridSecundarias}`}>
            {secundarias.map((foto, indice) => (
              <div key={indice} className="relative h-full w-full overflow-hidden rounded-2xl">
                <button type="button" onClick={() => abrirVisor(indice + 1)} className="block h-full w-full">
                  <img src={foto.url} alt={foto.alt} className="h-full w-full object-cover" />
                </button>
                {indice === 3 && (
                  <button
                    type="button"
                    onClick={() => abrirVisor(0)}
                    className="absolute bottom-3 right-3 flex items-center gap-1.5 rounded-full bg-blanco/95 px-3.5 py-2 text-xs font-semibold text-texto shadow-sm transition-colors hover:bg-blanco"
                  >
                    <Images size={14} strokeWidth={1.75} />
                    {fotos.length} fotos
                  </button>
                )}
              </div>
            ))}
            {mostrarVideoEnMosaico && medioVideo && (
              <div className="relative h-full w-full overflow-hidden rounded-2xl">
                <button type="button" onClick={() => setVideoAbierto(true)} className="block h-full w-full">
                  {medioVideo.miniatura ? (
                    <img src={medioVideo.miniatura} alt={medioVideo.alt} className="h-full w-full object-cover" />
                  ) : (
                    <video src={medioVideo.url} preload="metadata" muted playsInline className="h-full w-full object-cover" />
                  )}
                  <span className="absolute inset-0 flex items-center justify-center bg-black/25">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-blanco/90 text-texto">
                      <Play size={18} strokeWidth={2} fill="currentColor" />
                    </span>
                  </span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {visorAbierto && fotos.length > 0 && (
        <VisorPantallaCompleta fotos={fotos} indiceInicial={indiceVisor} onClose={() => setVisorAbierto(false)} />
      )}
      {modal3DAbierto && puede3D && (
        <Visor3DModal propiedad={propiedad} onClose={() => setModal3DAbierto(false)} />
      )}
      {streetViewAbierto && centroStreetView && (
        <StreetViewModal
          centro={centroStreetView}
          colonia={propiedad.ubicacion.colonia}
          onClose={() => setStreetViewAbierto(false)}
        />
      )}
      {videoAbierto && medioVideo && (
        <VisorVideoPantallaCompleta medio={medioVideo} onClose={() => setVideoAbierto(false)} />
      )}
    </div>
  )
}
