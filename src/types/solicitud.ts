// Solicitud — mensaje de un prospecto interesado en una propiedad del
// vendedor, ligada por folio igual que Resena. Vive aparte de MensajeChat
// (types/chatAgente.ts): esa es la conversación en vivo del agente de
// WhatsApp; esto es el resumen que el vendedor ve en su tablero.
export interface Solicitud {
  id: string
  nombreProspecto: string
  folio: string
  propiedadTitulo: string
  mensaje: string
  fecha: string
  respondida: boolean
}
