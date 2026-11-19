// ---------------------------------------------------------------------------
// ConversacionInbox — el hilo de WhatsApp de un ProspectoVenta. No duplica
// nombre, correo, teléfono, etapa, asesor ni "qué busca": todo eso ya vive
// en ProspectoVenta (types/prospectoVenta.ts) y se lee por prospectoVentaId.
// Esto solo guarda lo que es propio del hilo: mensajes, no leídos, cuándo
// cierra la ventana de 24h de WhatsApp Business, y el folio del anuncio que
// originó el lead (para el separador de sistema al inicio del hilo).
// ---------------------------------------------------------------------------

export type RemitenteMensaje = 'cliente' | 'asesor'

export interface MensajeInbox {
  id: string
  de: RemitenteMensaje
  tipo: 'texto' | 'propiedad'
  texto?: string
  folioPropiedad?: string
  hora: string
}

export interface ConversacionInbox {
  id: string
  prospectoVentaId: string
  noLeidos: number
  // ISO datetime absoluto — se calcula una sola vez al cargar los datos
  // demo (Date.now() + horas), no en cada render, para que el conteo
  // regresivo sea estable mientras dura la sesión.
  ventanaExpiraEn: string
  folioAnuncio: string
  mensajes: MensajeInbox[]
}

const MS_POR_HORA = 60 * 60 * 1000

export interface VentanaWhatsapp {
  abierta: boolean
  horas: number
  minutos: number
}

export function ventanaWhatsapp(ventanaExpiraEn: string): VentanaWhatsapp {
  const msRestantes = new Date(ventanaExpiraEn).getTime() - Date.now()
  if (msRestantes <= 0) return { abierta: false, horas: 0, minutos: 0 }
  const horas = Math.floor(msRestantes / MS_POR_HORA)
  const minutos = Math.floor((msRestantes % MS_POR_HORA) / (60 * 1000))
  return { abierta: true, horas, minutos }
}

export function etiquetaVentana(ventana: VentanaWhatsapp): string {
  if (!ventana.abierta) return 'Ventana cerrada'
  return `Ventana abierta · ${ventana.horas}h ${ventana.minutos}m`
}

// "Por vencer" en la lista de conversaciones: queda menos de 2 horas de
// ventana y todavía no cierra.
export function ventanaPorVencer(ventanaExpiraEn: string): boolean {
  const ventana = ventanaWhatsapp(ventanaExpiraEn)
  return ventana.abierta && ventana.horas < 2
}

export function ultimoMensaje(conversacion: ConversacionInbox): MensajeInbox | undefined {
  return conversacion.mensajes[conversacion.mensajes.length - 1]
}

export function sinResponder(conversacion: ConversacionInbox): boolean {
  return ultimoMensaje(conversacion)?.de === 'cliente'
}

function horaCorta(iso: string): string {
  return new Intl.DateTimeFormat('es-MX', { hour: 'numeric', minute: '2-digit' }).format(new Date(iso))
}

export function etiquetaHora(iso: string): string {
  return horaCorta(iso)
}
