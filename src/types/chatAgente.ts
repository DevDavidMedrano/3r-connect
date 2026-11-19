export interface VisitaAgendada {
  id: string
  folio: string
  propiedadTitulo: string
  horarioEtiqueta: string
  asesorNombre: string
}

interface MensajeBase {
  id: string
  hora: string
}

export type MensajeChat =
  | (MensajeBase & { de: 'usuario'; tipo: 'texto'; texto: string })
  | (MensajeBase & { de: 'agente'; tipo: 'texto'; texto: string })
  | (MensajeBase & { de: 'agente'; tipo: 'selector-cita'; texto: string })
  | (MensajeBase & { de: 'sistema'; tipo: 'tarjeta-cita'; visita: VisitaAgendada })
  | (MensajeBase & { de: 'sistema'; tipo: 'tarjeta-calificado'; asesorNombre: string })
  | (MensajeBase & { de: 'sistema'; tipo: 'tarjeta-asesor' })
