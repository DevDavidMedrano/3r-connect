export interface Asesor {
  id: string
  nombre: string
  iniciales: string
  colorAvatar: string
  // Si falta, el avatar cae a iniciales sobre colorAvatar (ver AvatarAsesor).
  foto?: string
  asesorDesde: number
  telefono: string
  zonasDominio: string[]
  operacionesCerradas: number
  // Cupo de cartera activa (propiedades + prospectos a la vez) — lo usa
  // Asignación de Asesores para la barra de carga. La carga en sí nunca se
  // guarda aquí: se cuenta en vivo contra prospectosCaptacion/prospectosVenta
  // (ver AsignacionAsesoresAdminPage), para que "sube la carga del asesor"
  // sea automático al asignar, sin un contador que se pueda desincronizar.
  cupoMaximo: number
}
