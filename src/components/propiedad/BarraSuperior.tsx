import { ArrowLeft, Bookmark, Share2 } from 'lucide-react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useSesion } from '../cuenta/SesionContext'

export function BarraSuperior({ folio }: { folio: string }) {
  const { usuario, estaGuardada, alternarGuardado } = useSesion()
  const navigate = useNavigate()
  const location = useLocation()
  const guardado = estaGuardada(folio)

  function alGuardar() {
    if (!usuario) {
      navigate(`/acceso?next=${encodeURIComponent(location.pathname)}&guardarFolio=${folio}`)
      return
    }
    alternarGuardado(folio)
  }

  return (
    <div className="sticky top-0 z-40 border-b border-gris-borde bg-blanco/95 px-6 py-3 backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between">
        <Link
          to="/comprar"
          className="flex items-center gap-2 text-sm font-medium text-texto transition-colors hover:text-vino-vivo"
        >
          <ArrowLeft size={17} strokeWidth={2} />
          Volver a resultados
        </Link>

        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={alGuardar}
            className={`flex items-center gap-1.5 text-sm font-medium transition-colors ${
              guardado ? 'text-vino-vivo' : 'text-texto hover:text-vino-vivo'
            }`}
          >
            <Bookmark size={17} strokeWidth={2} fill={guardado ? 'currentColor' : 'none'} />
            Guardar
          </button>
          <button
            type="button"
            className="flex items-center gap-1.5 text-sm font-medium text-texto transition-colors hover:text-vino-vivo"
          >
            <Share2 size={17} strokeWidth={2} />
            Compartir
          </button>
        </div>
      </div>
    </div>
  )
}
