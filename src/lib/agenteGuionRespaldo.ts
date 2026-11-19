import { formatearPrecio, type Propiedad } from '../types/propiedad'

// Guion de respaldo — entra en acción si la llamada a OpenAI falla (sin
// llave, sin red, error de la API). El cambio debe ser invisible para el
// prospecto: mismo tono, mismo largo de mensaje que el agente real. Es a
// propósito más limitado que el agente real (no conoce todo el catálogo
// ni compara zonas): su trabajo es no dejar el chat mudo, no igualar la
// inteligencia del modelo.
export function respuestaDeRespaldo(
  mensajeUsuario: string,
  propiedad: Propiedad,
  turno: number,
  nombreUsuario: string | null = null,
): string {
  const texto = mensajeUsuario.toLowerCase()
  const precio = formatearPrecio(propiedad.listados[0].precio)
  const saludo = turno === 0 && nombreUsuario ? `Hola ${nombreUsuario}, ` : ''

  function conSaludo(respuesta: string): string {
    return `${saludo}${respuesta}`
  }

  if (/precio|cuesta|vale|cuánto/.test(texto)) {
    return conSaludo(`Esta propiedad está en ${precio}. Con gusto te comparto más detalles si quieres.`)
  }
  if (/crédito|credito|infonavit|fovissste/.test(texto)) {
    return conSaludo('Sí, aceptamos crédito hipotecario. ¿Ya tienes uno preaprobado o te gustaría que te oriente sobre el proceso?')
  }
  if (/dueñ|propietari/.test(texto)) {
    return conSaludo('Toda la operación la maneja 3R Connect: tu asesor te acompaña en todo el proceso, desde la visita hasta el cierre.')
  }
  if (/zona|colonia|ubicaci/.test(texto)) {
    return conSaludo(`Está en ${propiedad.ubicacion.colonia}, una zona muy bien conectada. ¿Buscas algo en esta colonia o también te interesan otras?`)
  }
  if (/renta|rentar/.test(texto)) {
    return conSaludo('¿Buscas para rentar entonces? Cuéntame tu presupuesto mensual y te oriento mejor.')
  }
  if (/compr|vent/.test(texto)) {
    return conSaludo('¿Buscas para comprar? Platícame tu presupuesto y si ya tienes crédito preaprobado.')
  }

  const GENERICAS = [
    '¡Con gusto! Cuéntame, ¿qué es lo más importante para ti en esta búsqueda?',
    '¿Estás buscando para comprar o para rentar?',
    '¿Tienes un presupuesto en mente para orientarte mejor?',
    'Perfecto, dame un momento y te comparto más detalles.',
  ]
  return conSaludo(GENERICAS[turno % GENERICAS.length])
}
