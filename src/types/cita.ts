// ---------------------------------------------------------------------------
// Cita — el modelo único de Agenda y Control de Citas. Las visitas
// agendadas desde el Inbox o el WhatsApp del portal, y la del cliente Demo
// que ve en /mi-cuenta/visitas, son todas filas de este mismo arreglo (ver
// SesionContext) — nunca un mock aparte por pantalla.
// ---------------------------------------------------------------------------

export type TipoCita = 'visita' | 'valuacion' | 'firma' | 'llamada' | 'reunion'

export type EstadoCita = 'agendada' | 'confirmada' | 'reagendada' | 'asistio' | 'no_asistio'

export interface ResultadoCita {
  asistio: boolean
  nota: string
}

export interface Cita {
  id: string
  tipo: TipoCita
  clienteNombre: string
  prospectoVentaId: string | null
  folio: string | null
  // Zona corta ("Polanco", "Lomas") para comparar traslados — no la
  // dirección completa de la propiedad.
  colonia: string | null
  asesorId: string
  inicio: string
  duracionMinutos: number
  estado: EstadoCita
  confirmacionEnviada: boolean
  notas: string
  resultado: ResultadoCita | null
  // true solo para citas creadas en vivo desde WhatsAppModal.tsx (portal
  // público) — así /mi-cuenta/visitas sabe cuáles son "mías" en esta
  // sesión además de las del cliente Demo, sin adivinar por nombre.
  origenPortalEnVivo?: boolean
}

export const ETIQUETA_TIPO_CITA: Record<TipoCita, string> = {
  visita: 'Visita a propiedad',
  valuacion: 'Valuación',
  firma: 'Firma',
  llamada: 'Llamada',
  reunion: 'Reunión interna',
}

export const ETIQUETA_ESTADO_CITA: Record<EstadoCita, string> = {
  agendada: 'Agendada',
  confirmada: 'Confirmada',
  reagendada: 'Reagendada',
  asistio: 'Asistió',
  no_asistio: 'No asistió',
}

// visita: vino · valuación: ámbar (oro, no hay token "ámbar" en la marca) ·
// firma: verde · llamada: gris · reunión: azul (tampoco hay token, se usa
// la paleta neutra de Tailwind — mismo criterio que en Prospectos de
// Captación/Venta).
export const CLASE_TIPO_CITA: Record<TipoCita, { bloque: string; punto: string; texto: string }> = {
  visita: { bloque: 'bg-vino-vivo/15 border-vino-vivo', punto: 'bg-vino-vivo', texto: 'text-vino-vivo' },
  valuacion: { bloque: 'bg-oro/20 border-oro-oscuro', punto: 'bg-oro', texto: 'text-oro-oscuro' },
  firma: { bloque: 'bg-exito/15 border-exito', punto: 'bg-exito', texto: 'text-exito' },
  llamada: { bloque: 'bg-gris-borde border-texto-suave', punto: 'bg-texto-suave', texto: 'text-texto-suave' },
  reunion: { bloque: 'bg-blue-100 border-blue-500', punto: 'bg-blue-500', texto: 'text-blue-700' },
}

export function finCita(cita: Cita): Date {
  return new Date(new Date(cita.inicio).getTime() + cita.duracionMinutos * 60_000)
}

const CITAS_VIGENTES = (c: Cita) => c.estado !== 'no_asistio' && c.estado !== 'reagendada'

// Empalmes — mismo asesor, ventanas de tiempo que se cruzan. No bloquea
// nada, solo informa: la decisión de guardar de todos modos es del asesor.
export function citasEnConflicto(asesorId: string, inicio: Date, fin: Date, citas: Cita[], excluirId?: string): Cita[] {
  return citas.filter((c) => {
    if (c.id === excluirId || c.asesorId !== asesorId || !CITAS_VIGENTES(c)) return false
    const cInicio = new Date(c.inicio)
    const cFin = finCita(c)
    return inicio < cFin && fin > cInicio
  })
}

export interface AvisoTraslado {
  citaId: string
  texto: string
}

// Traslado justo — mismo asesor, mismo día, colonias distintas, menos de
// 45 minutos entre el fin de una cita y el inicio de la siguiente.
export function avisosTraslado(citas: Cita[]): AvisoTraslado[] {
  const avisos: AvisoTraslado[] = []
  const porAsesor = new Map<string, Cita[]>()
  for (const cita of citas) {
    if (!cita.colonia || !CITAS_VIGENTES(cita)) continue
    const lista = porAsesor.get(cita.asesorId) ?? []
    lista.push(cita)
    porAsesor.set(cita.asesorId, lista)
  }
  for (const lista of porAsesor.values()) {
    const ordenadas = [...lista].sort((a, b) => new Date(a.inicio).getTime() - new Date(b.inicio).getTime())
    for (let i = 1; i < ordenadas.length; i++) {
      const anterior = ordenadas[i - 1]
      const actual = ordenadas[i]
      const mismoDia = new Date(anterior.inicio).toDateString() === new Date(actual.inicio).toDateString()
      if (!mismoDia || anterior.colonia === actual.colonia) continue
      const minutos = Math.round((new Date(actual.inicio).getTime() - finCita(anterior).getTime()) / 60_000)
      if (minutos >= 0 && minutos < 45) {
        avisos.push({ citaId: actual.id, texto: `Traslado justo: ${anterior.colonia} → ${actual.colonia}` })
      }
    }
  }
  return avisos
}

// Faltan menos de 24h y sigue sin confirmar — candidata para el panel
// "Requieren confirmación".
export function requiereConfirmacion(cita: Cita, ahora: Date = new Date()): boolean {
  if (cita.estado !== 'agendada') return false
  const msRestantes = new Date(cita.inicio).getTime() - ahora.getTime()
  return msRestantes > 0 && msRestantes <= 24 * 60 * 60 * 1000
}

// Ya pasó la hora y nadie registró qué pasó — candidata para "Cierre de
// cita".
export function pendienteDeCierre(cita: Cita, ahora: Date = new Date()): boolean {
  if (cita.estado !== 'agendada' && cita.estado !== 'confirmada') return false
  return finCita(cita).getTime() < ahora.getTime()
}

// Lunes 00:00 de la semana de `fecha` — base de la rejilla semanal.
export function inicioDeSemana(fecha: Date): Date {
  const dia = fecha.getDay()
  const diferencia = (dia === 0 ? -6 : 1) - dia
  const lunes = new Date(fecha)
  lunes.setHours(0, 0, 0, 0)
  lunes.setDate(fecha.getDate() + diferencia)
  return lunes
}

export function mismoDia(a: Date, b: Date): boolean {
  return a.toDateString() === b.toDateString()
}

const FORMATO_HORA = new Intl.DateTimeFormat('es-MX', { hour: 'numeric', minute: '2-digit' })
const FORMATO_DIA = new Intl.DateTimeFormat('es-MX', { weekday: 'short', day: 'numeric' })

export function etiquetaHoraCita(iso: string): string {
  return FORMATO_HORA.format(new Date(iso))
}

export function etiquetaDiaCita(fecha: Date): string {
  return FORMATO_DIA.format(fecha)
}
