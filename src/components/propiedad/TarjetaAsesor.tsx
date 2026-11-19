import { useState } from 'react'
import { Phone, Send } from 'lucide-react'
import { IconWhatsApp } from '../landing/art/SocialIcons'
import type { Propiedad } from '../../types/propiedad'
import { LeadModal } from './LeadModal'
import { WhatsAppModal } from './WhatsAppModal'
import type { Asesor } from '../../types/asesor'
import { AvatarAsesor } from '../asesores/AvatarAsesor'

interface TarjetaAsesorProps {
  asesor: Asesor
  propiedad: Propiedad
}

export function TarjetaAsesor({ asesor, propiedad }: TarjetaAsesorProps) {
  const folio = propiedad.folio
  const colonia = propiedad.ubicacion.colonia
  const [mensajeAbierto, setMensajeAbierto] = useState(false)
  const [whatsappAbierto, setWhatsappAbierto] = useState(false)

  return (
    <div className="rounded-2xl border border-gris-borde p-5">
      <div className="flex items-center gap-3">
        <AvatarAsesor asesor={asesor} className="h-12 w-12 text-sm" />
        <div>
          <p className="text-sm font-bold text-texto">{asesor.nombre}</p>
          <p className="text-xs text-texto-suave">3R Connect</p>
        </div>
      </div>
      <p className="mt-2 text-xs text-texto-suave">Asesor desde {asesor.asesorDesde}</p>

      <div className="mt-4 space-y-2">
        <button
          type="button"
          onClick={() => setMensajeAbierto(true)}
          className="flex w-full items-center justify-center gap-2 rounded-full bg-vino-vivo px-4 py-2.5 text-sm font-semibold text-blanco transition-colors hover:bg-vino"
        >
          <Send size={15} strokeWidth={2} />
          Enviar mensaje
        </button>
        <button
          type="button"
          onClick={() => setWhatsappAbierto(true)}
          className="flex w-full items-center justify-center gap-2 rounded-full border border-gris-borde px-4 py-2.5 text-sm font-semibold text-texto transition-colors hover:border-vino-vivo hover:text-vino-vivo"
        >
          <IconWhatsApp className="h-4 w-4" />
          Enviar WhatsApp
        </button>
        <a
          href={`tel:${asesor.telefono.replace(/\s+/g, '')}`}
          className="flex w-full items-center justify-center gap-2 rounded-full border border-gris-borde px-4 py-2.5 text-sm font-semibold text-texto transition-colors hover:border-vino-vivo hover:text-vino-vivo"
        >
          <Phone size={15} strokeWidth={2} />
          Llamar
        </a>
      </div>

      <button
        type="button"
        className="mt-4 w-full text-center text-xs text-texto-suave underline-offset-2 transition-colors hover:text-texto hover:underline"
      >
        Reportar anuncio
      </button>

      {mensajeAbierto && (
        <LeadModal
          abierto
          folio={folio}
          colonia={colonia}
          asesor={asesor}
          onClose={() => setMensajeAbierto(false)}
        />
      )}

      {whatsappAbierto && (
        <WhatsAppModal propiedad={propiedad} asesor={asesor} onClose={() => setWhatsappAbierto(false)} />
      )}
    </div>
  )
}
