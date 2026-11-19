// ---------------------------------------------------------------------------
// EntradaBitacora — registro de auditoría del equipo. Hoy solo lo alimenta
// Asignación de Asesores ("quién asignó qué y a quién"), pero el modelo es
// genérico para que cualquier otro módulo pueda agregar aquí más adelante
// sin cambiar la forma.
// ---------------------------------------------------------------------------

export interface EntradaBitacora {
  id: string
  fecha: string
  actor: string
  accion: string
  detalle: string
}

export function etiquetaFechaBitacora(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime()
  const minutos = Math.floor(ms / 60_000)
  if (minutos < 1) return 'Justo ahora'
  if (minutos < 60) return `Hace ${minutos} min`
  const horas = Math.floor(minutos / 60)
  if (horas < 24) return `Hace ${horas} h`
  const dias = Math.floor(horas / 24)
  return `Hace ${dias} d`
}
