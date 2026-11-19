import { Bookmark, Play } from 'lucide-react'
import type { MouseEvent } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import type { Propiedad } from '../../types/propiedad'
import { ETIQUETA_TIPO, etiquetaOperacion, formatearPrecio, resumenAtributos } from '../../types/propiedad'
import { useSesion } from '../cuenta/SesionContext'
import { PlaceholderPropiedad } from '../landing/art/PlaceholderPropiedad'

// Los listados demo sin foto real todavía usan una URL placeholder bajo
// /media/: mientras no se reemplace por un archivo importado de verdad,
// la tarjeta cae a la ilustración de PropertyArt en vez de romper un <img>.
function esFotoPlaceholder(url: string): boolean {
  return url.startsWith('/media/')
}

interface ResultCardProps {
  propiedad: Propiedad
  destacada?: boolean
  onMouseEnter?: () => void
  onMouseLeave?: () => void
}

export function ResultCard({ propiedad, destacada = false, onMouseEnter, onMouseLeave }: ResultCardProps) {
  const { usuario, estaGuardada, alternarGuardado } = useSesion()
  const navigate = useNavigate()
  const location = useLocation()
  const guardado = estaGuardada(propiedad.folio)

  const fotos = propiedad.medios.filter((medio) => medio.tipo !== 'video' && !esFotoPlaceholder(medio.url))
  const primeraFoto = fotos[0]
  const tieneVideo = propiedad.medios.some((medio) => medio.tipo === 'video')
  const direccion = 'direccion' in propiedad.ubicacion ? propiedad.ubicacion.direccion : propiedad.ubicacion.referencia

  function alGuardar(evento: MouseEvent) {
    evento.stopPropagation()
    if (!usuario) {
      navigate(`/acceso?next=${encodeURIComponent(location.pathname + location.search)}&guardarFolio=${propiedad.folio}`)
      return
    }
    alternarGuardado(propiedad.folio)
  }

  return (
    <article
      role="link"
      tabIndex={0}
      onClick={() => navigate(`/propiedad/${propiedad.folio}`)}
      onKeyDown={(evento) => {
        if (evento.key === 'Enter') navigate(`/propiedad/${propiedad.folio}`)
      }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className={`cursor-pointer overflow-hidden rounded-2xl border bg-blanco transition-shadow hover:shadow-lg ${
        destacada ? 'border-vino-vivo shadow-lg' : tieneVideo ? 'border-vino-vivo/35' : 'border-gris-borde'
      }`}
    >
      <div className="group relative h-44 w-full overflow-hidden">
        {primeraFoto ? (
          <img
            src={primeraFoto.url}
            alt={primeraFoto.alt}
            className="h-full w-full scale-[1.25] object-cover transition-transform duration-700 ease-out group-hover:scale-[1.35]"
          />
        ) : (
          <PlaceholderPropiedad tipo={propiedad.tipo} folio={propiedad.folio} className="h-full w-full" />
        )}

        {tieneVideo && (
          <span
            aria-label="Con video"
            title="Con video"
            className="absolute left-2.5 top-2.5 flex items-center gap-1 rounded-full bg-onix/80 px-2.5 py-1 text-[11px] font-semibold text-blanco shadow-sm"
          >
            <Play size={11} strokeWidth={0} fill="currentColor" />
            Video
          </span>
        )}

        <button
          type="button"
          aria-label={guardado ? 'Quitar de guardados' : 'Guardar propiedad'}
          onClick={alGuardar}
          className={`absolute right-2.5 top-2.5 flex h-8 w-8 items-center justify-center rounded-full shadow-sm transition-colors ${
            guardado ? 'bg-vino-vivo text-blanco' : 'bg-blanco/90 text-texto hover:bg-blanco'
          }`}
        >
          <Bookmark size={15} strokeWidth={2} fill={guardado ? 'currentColor' : 'none'} />
        </button>

        {fotos.length > 1 && (
          <div className="pointer-events-none absolute inset-x-0 bottom-2.5 flex items-center justify-center gap-1">
            {fotos.map((_, indice) => (
              <span
                key={indice}
                className={`h-1.5 w-1.5 rounded-full ${indice === 0 ? 'bg-blanco' : 'bg-blanco/50'}`}
              />
            ))}
          </div>
        )}
      </div>

      <div className="p-3.5">
        <div className="space-y-0.5">
          {propiedad.listados.map((listado, indice) => (
            <p key={indice} className="text-base font-bold text-texto">
              {formatearPrecio(listado.precio)}{' '}
              <span className="text-xs font-normal text-texto-suave">
                {etiquetaOperacion(listado.operacion).toLowerCase()}
              </span>
            </p>
          ))}
        </div>

        <p className="mt-2 text-sm text-texto-suave">
          {ETIQUETA_TIPO[propiedad.tipo]} · {resumenAtributos(propiedad).join(' · ')}
        </p>

        <p className="mt-1 truncate text-sm text-texto" title={`${direccion}, ${propiedad.ubicacion.colonia}`}>
          {direccion}, {propiedad.ubicacion.colonia}, {propiedad.ubicacion.alcaldia}
        </p>

        <p className="mt-1 truncate text-xs text-texto-suave" title={propiedad.descripcion}>
          {propiedad.descripcion}
        </p>
      </div>
    </article>
  )
}
