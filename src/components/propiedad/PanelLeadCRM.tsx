import { ExternalLink } from 'lucide-react'
import type { Asesor } from '../../types/asesor'
import { construirTitulo, type Propiedad } from '../../types/propiedad'
import { resumenParaAsesor, type CalificacionLead } from '../../lib/calificacionLead'
import { URL_CRM_INBOX } from '../../lib/configCRM'
import { AvatarAsesor } from '../asesores/AvatarAsesor'

const ORIGEN_LEAD = 'WhatsApp · Ficha de propiedad'

interface PanelLeadCRMProps {
  propiedad: Propiedad
  asesor: Asesor
  calificacion: CalificacionLead
  citaAgendada: boolean
  propiedadesEnviadas: string[]
}

// El puente entre el chat y el CRM del asesor: una vista previa de cómo
// llega este lead calificado del otro lado, fuera de la "pantalla del
// teléfono" para que se note que es otra pieza del sistema, no parte de
// la conversación. Los nombres de campo son deliberadamente los mismos
// que usa el CRM real (otro proyecto) — "Abrir en el CRM" solo enlaza
// hacia allá, no se construye ningún inbox aquí.
export function PanelLeadCRM({ propiedad, asesor, calificacion, citaAgendada, propiedadesEnviadas }: PanelLeadCRMProps) {
  const etapa = citaAgendada ? 'Visita agendada' : 'Calificado'

  return (
    <div className="w-full rounded-2xl border border-gris-borde bg-blanco p-4 shadow-sm">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-texto-suave">Así llega este lead al asesor</p>
        <a
          href={URL_CRM_INBOX}
          target="_blank"
          rel="noreferrer"
          className="flex shrink-0 items-center gap-1 text-xs font-semibold text-vino-vivo transition-colors hover:text-vino"
        >
          Abrir en el CRM
          <ExternalLink size={12} strokeWidth={2.25} />
        </a>
      </div>

      <div className="mt-3 space-y-3 rounded-xl border border-gris-borde bg-marfil/60 p-3.5 text-xs">
        <div className="flex items-center justify-between">
          <span className="text-texto-suave">Etapa del embudo</span>
          <span className="rounded-full bg-exito/10 px-2.5 py-1 font-semibold text-exito">{etapa}</span>
        </div>

        <div className="flex items-center gap-2.5 border-t border-gris-borde pt-3">
          <AvatarAsesor asesor={asesor} className="h-8 w-8 text-[11px]" />
          <div className="min-w-0">
            <p className="text-texto-suave">Asesor asignado</p>
            <p className="truncate font-semibold text-texto">{asesor.nombre}</p>
          </div>
        </div>

        <div className="border-t border-gris-borde pt-3">
          <p className="text-texto-suave">Qué busca</p>
          <p className="mt-1 font-semibold text-texto">
            {calificacion.presupuesto ?? 'Presupuesto por confirmar'} · {calificacion.zona ?? 'Zona por confirmar'}
            {calificacion.recamaras ? ` · ${calificacion.recamaras} rec.` : ''}
          </p>
          <p className="mt-0.5 text-texto-suave">Origen: {ORIGEN_LEAD}</p>
        </div>

        <div className="border-t border-gris-borde pt-3">
          <p className="text-texto-suave">Propiedades enviadas</p>
          <div className="mt-1.5 flex flex-wrap gap-1">
            {propiedadesEnviadas.map((folio) => (
              <span key={folio} className="rounded-full bg-vino-vivo/10 px-2 py-0.5 font-semibold text-vino-vivo">
                {folio}
              </span>
            ))}
          </div>
          <p className="mt-1 truncate text-texto-suave">{construirTitulo(propiedad)}</p>
        </div>

        <div className="border-t border-gris-borde pt-3">
          <p className="text-texto-suave">Notas</p>
          <p className="mt-1 text-texto">{resumenParaAsesor(calificacion)}</p>
        </div>
      </div>
    </div>
  )
}
