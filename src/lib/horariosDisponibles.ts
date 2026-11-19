const DIAS_SEMANA = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado']

function capitalizar(texto: string): string {
  return texto.charAt(0).toUpperCase() + texto.slice(1)
}

export interface HorarioDisponible {
  etiqueta: string
  fecha: Date
}

function horarioParaOffset(hoy: Date, offsetDias: number, hora: number, minuto: number, etiquetaHora: string): HorarioDisponible {
  const fecha = new Date(hoy)
  fecha.setDate(fecha.getDate() + offsetDias)
  fecha.setHours(hora, minuto, 0, 0)
  const nombreDia = offsetDias === 1 ? 'Mañana' : capitalizar(DIAS_SEMANA[fecha.getDay()])
  return { etiqueta: `${nombreDia} ${etiquetaHora}`, fecha }
}

// Cuatro horarios "disponibles" a partir de hoy — no vienen de una
// agenda real todavía, son plausibles para la demo. `fecha` es lo que
// SesionContext.agregarCita necesita para registrar la cita real; la
// `etiqueta` es solo lo que se muestra en el chat.
export function generarHorariosDisponibles(): HorarioDisponible[] {
  const hoy = new Date()
  return [
    horarioParaOffset(hoy, 1, 11, 0, '11:00 am'),
    horarioParaOffset(hoy, 2, 17, 0, '5:00 pm'),
    horarioParaOffset(hoy, 3, 10, 30, '10:30 am'),
    horarioParaOffset(hoy, 4, 16, 0, '4:00 pm'),
  ]
}
