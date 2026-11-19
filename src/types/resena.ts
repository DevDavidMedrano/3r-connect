export interface Resena {
  id: string
  // Liga a Propiedad.folio: la tarjeta toma su foto y su tipo de ahí, no
  // de una imagen suelta.
  folio: string
  nombre: string
  iniciales: string
  colorAvatar: string
  operacion: string
  zona: string
  calificacion: number
  texto: string
  fecha: string
  verificada: boolean
}

export interface ResumenResenas {
  promedio: number
  total: number
}
