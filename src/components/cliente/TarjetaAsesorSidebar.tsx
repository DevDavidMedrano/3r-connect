import { useEffect, useRef, useState } from 'react'
import { ChevronUp, MessageSquare, Phone } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { Asesor } from '../../types/asesor'
import { AvatarAsesor } from '../asesores/AvatarAsesor'

// Visualmente igual que PerfilSidebar (panel admin): misma tarjeta,
// mismo patrón de flecha + menú desplegable — aquí sobre el asesor
// asignado, no sobre el usuario en sesión, así que el contenido del menú
// es distinto (ver su perfil, llamarlo) en vez de cambiar de rol.
export function TarjetaAsesorSidebar({ asesor }: { asesor: Asesor }) {
  const [abierto, setAbierto] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function alClicFuera(evento: MouseEvent) {
      if (ref.current && !ref.current.contains(evento.target as Node)) setAbierto(false)
    }
    document.addEventListener('mousedown', alClicFuera)
    return () => document.removeEventListener('mousedown', alClicFuera)
  }, [])

  return (
    <div className="relative" ref={ref}>
      {abierto && (
        <div className="absolute bottom-full left-0 right-0 z-40 mb-2 overflow-hidden rounded-xl border border-gris-borde bg-blanco py-1.5 shadow-lg">
          <Link
            to="/mi-cuenta/asesor"
            onClick={() => setAbierto(false)}
            className="flex items-center gap-2.5 px-3.5 py-2 text-sm text-texto transition-colors hover:bg-marfil"
          >
            <MessageSquare size={15} strokeWidth={1.75} className="text-texto-suave" />
            Ver mi asesor
          </Link>
          <a
            href={`tel:${asesor.telefono.replace(/\s+/g, '')}`}
            onClick={() => setAbierto(false)}
            className="flex items-center gap-2.5 px-3.5 py-2 text-sm text-texto transition-colors hover:bg-marfil"
          >
            <Phone size={15} strokeWidth={1.75} className="text-texto-suave" />
            Llamar
          </a>
        </div>
      )}

      <button
        type="button"
        onClick={() => setAbierto((v) => !v)}
        className="flex w-full items-center gap-2.5 rounded-3r-md border border-gris-borde bg-marfil p-2.5 text-left transition-colors hover:border-onix/30"
      >
        <AvatarAsesor asesor={asesor} className="h-9 w-9 text-xs" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-semibold text-texto">{asesor.nombre}</p>
          <p className="truncate text-[11px] text-texto-suave">Tu asesor</p>
        </div>
        <ChevronUp size={15} strokeWidth={2} className={`shrink-0 text-texto-suave transition-transform ${abierto ? '' : 'rotate-180'}`} />
      </button>
    </div>
  )
}
