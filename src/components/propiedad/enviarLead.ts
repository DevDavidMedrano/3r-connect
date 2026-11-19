export interface DatosLead {
  nombre: string
  telefono: string
  correo: string
  mensaje: string
  folio: string
  canal: 'mensaje'
}

export interface RespuestaLead {
  ok: true
}

// PUNTO DE INTEGRACIÓN — hoy esto es una simulación en memoria (no hay
// backend, no hay localStorage/sessionStorage, no persiste entre
// recargas). Cuando se conecte de verdad, este es el único lugar que hay
// que tocar para el formulario de "Enviar mensaje". La firma (recibe
// DatosLead, regresa una promesa) no debería cambiar cuando eso pase —
// solo el cuerpo de la función.
//
// El canal de WhatsApp ya NO pasa por aquí: tiene su propio flujo en
// WhatsAppModal.tsx + src/lib/agenteOpenAI.ts (agente de IA) y
// SesionContext.agregarCita (registro de la cita).
export async function enviarLead(datos: DatosLead): Promise<RespuestaLead> {
  void datos // usado por la integración real; el stub no lo necesita
  await new Promise((resolve) => setTimeout(resolve, 700))
  return { ok: true }
}
