import { useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import {
  Building2,
  CalendarDays,
  ChevronDown,
  ChevronUp,
  Clock,
  Download,
  Trophy,
  TrendingDown,
  TrendingUp,
  Users,
  X,
} from 'lucide-react'
import { Boton, EncabezadoPagina, Tarjeta } from '../../components/cliente/Piezas'
import { useDatosAdmin } from '../../components/admin/useDatosAdmin'
import { AvatarAsesor } from '../../components/asesores/AvatarAsesor'
import { asesoresDemo } from '../../data/asesoresDemo'
import type { Asesor } from '../../types/asesor'
import { etiquetaDiaCita, etiquetaHoraCita, inicioDeSemana } from '../../types/cita'
import type { ConversacionInbox } from '../../types/conversacion'
import { ETIQUETA_TIPO, formatearPrecio } from '../../types/propiedad'
import { ETIQUETA_ETAPA_VENTA, type EtapaProspectoVenta, type ProspectoVenta } from '../../types/prospectoVenta'

// ---------------------------------------------------------------------------
// Todo lo que sigue lee prospectosVenta/citas/prospectosCaptacion/
// conversaciones de useDatosAdmin — nada aquí es un número fijo. Si en la
// demo se mueve un prospecto a 'cerrado', el podio, el embudo y la tabla
// suben en el siguiente render, porque se recalculan de los mismos arreglos
// que ya usan Prospectos de Venta, Agenda, Separación e Inbox.
// ---------------------------------------------------------------------------

export type Periodo = 'mes' | 'trimestre' | 'anio'

const MESES_POR_PERIODO: Record<Periodo, number> = { mes: 1, trimestre: 3, anio: 12 }

export const OPCIONES_PERIODO: { valor: Periodo; etiqueta: string }[] = [
  { valor: 'mes', etiqueta: 'Este mes' },
  { valor: 'trimestre', etiqueta: 'Trimestre' },
  { valor: 'anio', etiqueta: 'Año' },
]

function inicioDeMesAtras(fecha: Date, mesesAtras: number): Date {
  return new Date(fecha.getFullYear(), fecha.getMonth() - mesesAtras, 1)
}

export interface RangoFechas {
  inicio: Date
  fin: Date
}

// anterior=true da el periodo inmediatamente previo, del mismo ancho — la
// base de comparación de "variación contra el periodo anterior".
export function rangoPeriodo(periodo: Periodo, anterior: boolean): RangoFechas {
  const hoy = new Date()
  const ancho = MESES_POR_PERIODO[periodo]
  const inicio = anterior ? inicioDeMesAtras(hoy, ancho - 1 + ancho) : inicioDeMesAtras(hoy, ancho - 1)
  const fin = anterior ? inicioDeMesAtras(hoy, ancho - 1) : new Date(hoy.getTime() + 1)
  return { inicio, fin }
}

export function dentroDePeriodo(fechaISO: string, rango: RangoFechas): boolean {
  const t = new Date(fechaISO).getTime()
  return t >= rango.inicio.getTime() && t < rango.fin.getTime()
}

// ---------------------------------------------------------------------------
// Embudo — Leads recibidos → Contactados → Citas realizadas → Ofertas →
// Cerrados, leído directo de EtapaProspectoVenta ('nuevo' | 'calificado' |
// 'mostrando' | 'negociacion' | 'cerrado'). Cada etapa es acumulativa: "citas
// realizadas" son los que llegaron a 'mostrando' O MÁS, no solo los que están
// ahí ahora.
// ---------------------------------------------------------------------------

export interface Embudo {
  leads: number
  contactados: number
  citas: number
  ofertas: number
  cerrados: number
}

export function calcularEmbudo(prospectos: ProspectoVenta[]): Embudo {
  const etapaAlMenos = (minimo: EtapaProspectoVenta[]) => prospectos.filter((p) => minimo.includes(p.etapa)).length
  return {
    leads: prospectos.length,
    contactados: etapaAlMenos(['calificado', 'mostrando', 'negociacion', 'cerrado']),
    citas: etapaAlMenos(['mostrando', 'negociacion', 'cerrado']),
    ofertas: etapaAlMenos(['negociacion', 'cerrado']),
    cerrados: etapaAlMenos(['cerrado']),
  }
}

const ETAPAS_VISUAL: { clave: keyof Embudo; etiqueta: string }[] = [
  { clave: 'leads', etiqueta: 'Leads recibidos' },
  { clave: 'contactados', etiqueta: 'Contactados' },
  { clave: 'citas', etiqueta: 'Citas realizadas' },
  { clave: 'ofertas', etiqueta: 'Ofertas' },
  { clave: 'cerrados', etiqueta: 'Cerrados' },
]

interface Cuello {
  texto: string
  severidad: 'alta' | 'media'
}

// Señala automáticamente la transición donde el asesor pierde más gente,
// comparada contra la misma transición en el equipo — "Pierde 68% entre
// cita y oferta — el equipo pierde 40%". Con muestra chica (<3 en la etapa
// de origen) no dice nada: no hay para dónde sacar un porcentaje confiable.
function detectarCuello(embudoAsesor: Embudo, embudoEquipo: Embudo): Cuello | null {
  const transiciones: { desde: keyof Embudo; hasta: keyof Embudo; desdeEtiqueta: string; hastaEtiqueta: string }[] = [
    { desde: 'leads', hasta: 'contactados', desdeEtiqueta: 'lead', hastaEtiqueta: 'contacto' },
    { desde: 'contactados', hasta: 'citas', desdeEtiqueta: 'contacto', hastaEtiqueta: 'cita' },
    { desde: 'citas', hasta: 'ofertas', desdeEtiqueta: 'cita', hastaEtiqueta: 'oferta' },
    { desde: 'ofertas', hasta: 'cerrados', desdeEtiqueta: 'oferta', hastaEtiqueta: 'cierre' },
  ]

  let peor: { transicion: (typeof transiciones)[number]; perdidaAsesor: number; perdidaEquipo: number } | null = null
  for (const transicion of transiciones) {
    const baseAsesor = embudoAsesor[transicion.desde]
    if (baseAsesor < 3) continue
    const perdidaAsesor = 1 - embudoAsesor[transicion.hasta] / baseAsesor
    const baseEquipo = embudoEquipo[transicion.desde]
    const perdidaEquipo = baseEquipo > 0 ? 1 - embudoEquipo[transicion.hasta] / baseEquipo : 0
    if (!peor || perdidaAsesor > peor.perdidaAsesor) peor = { transicion, perdidaAsesor, perdidaEquipo }
  }
  if (!peor || peor.perdidaAsesor < 0.35) return null

  const pctAsesor = Math.round(peor.perdidaAsesor * 100)
  const pctEquipo = Math.round(peor.perdidaEquipo * 100)
  return {
    texto: `Pierde ${pctAsesor}% entre ${peor.transicion.desdeEtiqueta} y ${peor.transicion.hastaEtiqueta} — el equipo pierde ${pctEquipo}%`,
    severidad: pctAsesor - pctEquipo >= 15 ? 'alta' : 'media',
  }
}

// ---------------------------------------------------------------------------
// Tiempo de respuesta — primer mensaje del cliente → primera respuesta del
// asesor, leído del hilo real de Inbox. No todo lead tiene hilo (ver la nota
// en data/productividadDemo.ts): donde no hay hilo, ese lead simplemente no
// entra al promedio, nunca se inventa un número.
// ---------------------------------------------------------------------------

function minutosDeRespuesta(conversacion: ConversacionInbox): number | null {
  const primerCliente = conversacion.mensajes.find((m) => m.de === 'cliente')
  if (!primerCliente) return null
  const primerAsesor = conversacion.mensajes.find(
    (m) => m.de === 'asesor' && new Date(m.hora).getTime() > new Date(primerCliente.hora).getTime(),
  )
  if (!primerAsesor) return null
  return (new Date(primerAsesor.hora).getTime() - new Date(primerCliente.hora).getTime()) / 60_000
}

const UMBRAL_RESPUESTA_MIN = 120

type Semaforo = 'al_dia' | 'atencion' | 'en_riesgo'

// El semáforo se calcula SOLO sobre conversión y tiempo de respuesta, nunca
// sobre volumen — un asesor con pocos leads y buena conversión debe salir
// "al día", no en alerta por traer pocas operaciones.
function calcularSemaforo(conversionAsesor: number, conversionEquipo: number, minutosRespuesta: number | null): Semaforo {
  const respuestaAlerta = minutosRespuesta !== null && minutosRespuesta > UMBRAL_RESPUESTA_MIN
  const conversionBaja = conversionEquipo > 0 && conversionAsesor < conversionEquipo * 0.6
  const conversionMuyBaja = conversionEquipo > 0 && conversionAsesor < conversionEquipo * 0.35
  if (conversionMuyBaja || (respuestaAlerta && conversionBaja)) return 'en_riesgo'
  if (conversionBaja || respuestaAlerta) return 'atencion'
  return 'al_dia'
}

const ETIQUETA_SEMAFORO: Record<Semaforo, string> = { al_dia: 'Al día', atencion: 'Atención', en_riesgo: 'En riesgo' }
const CLASE_SEMAFORO: Record<Semaforo, string> = {
  al_dia: 'bg-exito/10 text-exito',
  atencion: 'bg-oro/15 text-oro-oscuro',
  en_riesgo: 'bg-alerta/10 text-alerta',
}
const PUNTO_SEMAFORO: Record<Semaforo, string> = { al_dia: 'bg-exito', atencion: 'bg-oro', en_riesgo: 'bg-alerta' }

function EtiquetaSemaforo({ estado }: { estado: Semaforo }) {
  return (
    <span className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${CLASE_SEMAFORO[estado]}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${PUNTO_SEMAFORO[estado]}`} />
      {ETIQUETA_SEMAFORO[estado]}
    </span>
  )
}

interface StatsAsesor {
  asesor: Asesor
  embudo: Embudo
  conversion: number
  valorCerrado: number
  ticketPromedio: number
  diasCierre: number
  operacionesCerradas: number
  tiempoRespuesta: number | null
  semaforo: Semaforo
  cuello: Cuello | null
}

function calcularStatsAsesor(
  asesor: Asesor,
  creadosDelAsesor: ProspectoVenta[],
  cerradosDelAsesorEnPeriodo: ProspectoVenta[],
  conversacionesDelAsesor: ConversacionInbox[],
  embudoEquipo: Embudo,
  conversionEquipo: number,
): StatsAsesor {
  const embudo = calcularEmbudo(creadosDelAsesor)
  const conversion = embudo.leads > 0 ? embudo.cerrados / embudo.leads : 0
  const valorCerrado = cerradosDelAsesorEnPeriodo.reduce((suma, p) => suma + (p.presupuestoMin + p.presupuestoMax) / 2, 0)
  const operacionesCerradas = cerradosDelAsesorEnPeriodo.length
  const ticketPromedio = operacionesCerradas > 0 ? valorCerrado / operacionesCerradas : 0
  const diasCierre =
    operacionesCerradas > 0
      ? cerradosDelAsesorEnPeriodo.reduce(
          (suma, p) => suma + (new Date(p.fechaCierre!).getTime() - new Date(p.fecha).getTime()) / 86_400_000,
          0,
        ) / operacionesCerradas
      : 0
  const tiemposRespuesta = conversacionesDelAsesor.map(minutosDeRespuesta).filter((m): m is number => m !== null)
  const tiempoRespuesta = tiemposRespuesta.length > 0 ? tiemposRespuesta.reduce((a, b) => a + b, 0) / tiemposRespuesta.length : null
  return {
    asesor,
    embudo,
    conversion,
    valorCerrado,
    ticketPromedio,
    diasCierre,
    operacionesCerradas,
    tiempoRespuesta,
    semaforo: calcularSemaforo(conversion, conversionEquipo, tiempoRespuesta),
    cuello: detectarCuello(embudo, embudoEquipo),
  }
}

// ---------------------------------------------------------------------------
// Piezas de UI
// ---------------------------------------------------------------------------

function formatoCompacto(monto: number): string {
  if (monto >= 1_000_000) return `$${(monto / 1_000_000).toFixed(1)}M`
  if (monto >= 1_000) return `$${Math.round(monto / 1_000)}K`
  return `$${Math.round(monto)}`
}

function etiquetaMinutos(minutos: number | null): string {
  if (minutos === null) return '—'
  if (minutos < 60) return `${Math.round(minutos)} min`
  const horas = Math.floor(minutos / 60)
  const resto = Math.round(minutos % 60)
  return `${horas}h ${resto}m`
}

function Delta({ actual, anterior, invertir = false }: { actual: number; anterior: number; invertir?: boolean }) {
  if (anterior <= 0) {
    return <span className="text-[11px] font-medium text-texto-suave">Sin datos previos</span>
  }
  const cambio = ((actual - anterior) / anterior) * 100
  const mejora = invertir ? cambio <= 0 : cambio >= 0
  return (
    <span className={`inline-flex items-center gap-0.5 text-[11px] font-semibold ${mejora ? 'text-exito' : 'text-alerta'}`}>
      {cambio >= 0 ? <TrendingUp size={11} strokeWidth={2.5} /> : <TrendingDown size={11} strokeWidth={2.5} />}
      {Math.abs(Math.round(cambio))}% vs. periodo anterior
    </span>
  )
}

function TarjetaKpi({
  etiqueta,
  valor,
  actual,
  anterior,
  invertir,
}: {
  etiqueta: string
  valor: string
  actual: number
  anterior: number
  invertir?: boolean
}) {
  return (
    <Tarjeta>
      <p className="text-xs font-semibold uppercase tracking-wide text-texto-suave">{etiqueta}</p>
      <p className="mt-2 font-serif text-2xl font-bold text-texto">{valor}</p>
      <div className="mt-1.5">
        <Delta actual={actual} anterior={anterior} invertir={invertir} />
      </div>
    </Tarjeta>
  )
}

function Podio({ top3 }: { top3: StatsAsesor[] }) {
  if (top3.length === 0) return null
  const enOrdenVisual = [top3[1], top3[0], top3[2]].filter((s): s is StatsAsesor => Boolean(s))

  return (
    <div className="grid grid-cols-1 items-end gap-4 sm:grid-cols-3">
      {enOrdenVisual.map((stats) => {
        const lugar = top3.indexOf(stats) + 1
        const esPrimero = lugar === 1
        return (
          <Tarjeta key={stats.asesor.id} className={`text-center ${esPrimero ? 'py-8 ring-2 ring-oro' : 'py-6'}`}>
            <div className="flex items-center justify-center gap-1.5">
              <Trophy size={esPrimero ? 18 : 15} strokeWidth={2} className="text-oro-oscuro" />
              <p className="text-xs font-bold uppercase tracking-wide text-oro-oscuro">
                {lugar === 1 ? '1er lugar' : lugar === 2 ? '2do lugar' : '3er lugar'}
              </p>
            </div>
            <div className="mx-auto mt-3">
              <AvatarAsesor asesor={stats.asesor} className={esPrimero ? 'h-16 w-16 text-base' : 'h-12 w-12 text-sm'} />
            </div>
            <p className="mt-2 text-sm font-bold text-texto">{stats.asesor.nombre}</p>
            <p className={`mt-2 font-serif font-bold text-texto ${esPrimero ? 'text-2xl' : 'text-lg'}`}>
              {formatearPrecio({ monto: Math.round(stats.valorCerrado), moneda: 'MXN' })}
            </p>
            <p className="text-xs text-texto-suave">{stats.operacionesCerradas} operaciones cerradas</p>
          </Tarjeta>
        )
      })}
    </div>
  )
}

function FilaEmbudoAsesor({ stats, onVerDetalle }: { stats: StatsAsesor; onVerDetalle: () => void }) {
  return (
    <div className="py-4">
      <div className="flex items-center gap-3">
        <AvatarAsesor asesor={stats.asesor} className="h-9 w-9 text-xs" />
        <button type="button" onClick={onVerDetalle} className="text-sm font-bold text-texto hover:text-vino-vivo">
          {stats.asesor.nombre}
        </button>
        <span className="ml-auto">
          <EtiquetaSemaforo estado={stats.semaforo} />
        </span>
      </div>

      <div className="mt-3 grid grid-cols-5 gap-2">
        {ETAPAS_VISUAL.map((etapa, indice) => {
          const valor = stats.embudo[etapa.clave]
          const anterior = indice > 0 ? stats.embudo[ETAPAS_VISUAL[indice - 1].clave] : null
          const pct = anterior !== null && anterior > 0 ? Math.round((valor / anterior) * 100) : null
          return (
            <div key={etapa.clave} className="rounded-xl bg-marfil px-2 py-2.5 text-center">
              <p className="text-[9.5px] font-semibold uppercase leading-tight tracking-wide text-texto-suave">{etapa.etiqueta}</p>
              <p className="mt-1 font-serif text-lg font-bold text-texto">{valor}</p>
              {pct !== null && <p className="mt-0.5 text-[10.5px] text-texto-suave">{pct}% avanzó</p>}
            </div>
          )
        })}
      </div>

      {stats.cuello && (
        <p
          className={`mt-2.5 rounded-3r-md px-3.5 py-2 text-xs font-medium ${
            stats.cuello.severidad === 'alta' ? 'bg-alerta/10 text-alerta' : 'bg-oro/15 text-oro-oscuro'
          }`}
        >
          {stats.cuello.texto}
        </p>
      )}
    </div>
  )
}

type ColumnaOrden =
  | 'nombre'
  | 'leads'
  | 'contactados'
  | 'citas'
  | 'cerrados'
  | 'conversion'
  | 'valorCerrado'
  | 'ticketPromedio'
  | 'diasCierre'
  | 'tiempoRespuesta'
  | 'semaforo'

const RANGO_SEMAFORO: Record<Semaforo, number> = { en_riesgo: 0, atencion: 1, al_dia: 2 }

const VALOR_ORDEN: Record<ColumnaOrden, (s: StatsAsesor) => number | string> = {
  nombre: (s) => s.asesor.nombre,
  leads: (s) => s.embudo.leads,
  contactados: (s) => s.embudo.contactados,
  citas: (s) => s.embudo.citas,
  cerrados: (s) => s.embudo.cerrados,
  conversion: (s) => s.conversion,
  valorCerrado: (s) => s.valorCerrado,
  ticketPromedio: (s) => s.ticketPromedio,
  diasCierre: (s) => s.diasCierre,
  tiempoRespuesta: (s) => s.tiempoRespuesta ?? -1,
  semaforo: (s) => RANGO_SEMAFORO[s.semaforo],
}

const COLUMNAS: { clave: ColumnaOrden; etiqueta: string }[] = [
  { clave: 'nombre', etiqueta: 'Asesor' },
  { clave: 'leads', etiqueta: 'Leads' },
  { clave: 'contactados', etiqueta: 'Contactados' },
  { clave: 'citas', etiqueta: 'Citas' },
  { clave: 'cerrados', etiqueta: 'Cerrados' },
  { clave: 'conversion', etiqueta: 'Conversión' },
  { clave: 'valorCerrado', etiqueta: 'Valor cerrado' },
  { clave: 'ticketPromedio', etiqueta: 'Ticket promedio' },
  { clave: 'diasCierre', etiqueta: 'Días a cierre' },
  { clave: 'tiempoRespuesta', etiqueta: 'Tiempo de respuesta' },
  { clave: 'semaforo', etiqueta: 'Semáforo' },
]

function Overlay({ children, onClose }: { children: ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/50" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="h-full w-full max-w-md overflow-y-auto bg-blanco shadow-2xl">
        {children}
      </div>
    </div>
  )
}

function PanelDetalleAsesor({
  stats,
  propiedadesAsignadas,
  prospectosPorEtapa,
  agendaSemana,
  historialCierres,
  onCerrar,
}: {
  stats: StatsAsesor
  propiedadesAsignadas: { titulo: string; colonia: string }[]
  prospectosPorEtapa: { etapa: EtapaProspectoVenta; cantidad: number }[]
  agendaSemana: { id: string; titulo: string; horario: string }[]
  historialCierres: { id: string; nombre: string; monto: number; fecha: string }[]
  onCerrar: () => void
}) {
  return (
    <Overlay onClose={onCerrar}>
      <div className="p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AvatarAsesor asesor={stats.asesor} className="h-11 w-11 text-sm" />
            <div>
              <p className="text-base font-bold text-texto">{stats.asesor.nombre}</p>
              <p className="text-xs text-texto-suave">{stats.asesor.zonasDominio.join(' · ')}</p>
            </div>
          </div>
          <button type="button" onClick={onCerrar} aria-label="Cerrar" className="text-texto-suave hover:text-texto">
            <X size={18} strokeWidth={2} />
          </button>
        </div>

        <div className="mt-4">
          <EtiquetaSemaforo estado={stats.semaforo} />
          {stats.cuello && (
            <p
              className={`mt-2 rounded-3r-md px-3.5 py-2 text-xs font-medium ${
                stats.cuello.severidad === 'alta' ? 'bg-alerta/10 text-alerta' : 'bg-oro/15 text-oro-oscuro'
              }`}
            >
              {stats.cuello.texto}
            </p>
          )}
        </div>

        <div className="mt-5 grid grid-cols-5 gap-1.5">
          {ETAPAS_VISUAL.map((etapa) => (
            <div key={etapa.clave} className="rounded-xl bg-marfil px-1.5 py-2 text-center">
              <p className="text-[8.5px] font-semibold uppercase leading-tight tracking-wide text-texto-suave">{etapa.etiqueta}</p>
              <p className="mt-1 font-serif text-base font-bold text-texto">{stats.embudo[etapa.clave]}</p>
            </div>
          ))}
        </div>

        <div className="mt-6">
          <h3 className="flex items-center gap-1.5 text-sm font-bold text-texto">
            <Building2 size={15} strokeWidth={1.75} />
            Propiedades asignadas ({propiedadesAsignadas.length})
          </h3>
          {propiedadesAsignadas.length === 0 ? (
            <p className="mt-1.5 text-xs text-texto-suave">Sin propiedades a cargo todavía.</p>
          ) : (
            <div className="mt-2 space-y-1.5">
              {propiedadesAsignadas.slice(0, 6).map((p, indice) => (
                <p key={indice} className="truncate text-xs text-texto-suave">
                  <span className="text-texto">{p.titulo}</span> · {p.colonia}
                </p>
              ))}
            </div>
          )}
        </div>

        <div className="mt-6">
          <h3 className="flex items-center gap-1.5 text-sm font-bold text-texto">
            <Users size={15} strokeWidth={1.75} />
            Prospectos por etapa
          </h3>
          <div className="mt-2 space-y-1.5">
            {prospectosPorEtapa.map((fila) => (
              <div key={fila.etapa} className="flex items-center justify-between text-xs">
                <span className="text-texto-suave">{ETIQUETA_ETAPA_VENTA[fila.etapa]}</span>
                <span className="font-semibold text-texto">{fila.cantidad}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6">
          <h3 className="flex items-center gap-1.5 text-sm font-bold text-texto">
            <CalendarDays size={15} strokeWidth={1.75} />
            Agenda de la semana ({agendaSemana.length})
          </h3>
          {agendaSemana.length === 0 ? (
            <p className="mt-1.5 text-xs text-texto-suave">Sin citas esta semana.</p>
          ) : (
            <div className="mt-2 space-y-1.5">
              {agendaSemana.map((cita) => (
                <div key={cita.id} className="flex items-center justify-between text-xs">
                  <span className="truncate text-texto-suave">{cita.titulo}</span>
                  <span className="shrink-0 font-semibold text-texto">{cita.horario}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-6">
          <h3 className="flex items-center gap-1.5 text-sm font-bold text-texto">
            <Clock size={15} strokeWidth={1.75} />
            Historial de cierres
          </h3>
          {historialCierres.length === 0 ? (
            <p className="mt-1.5 text-xs text-texto-suave">Sin cierres registrados.</p>
          ) : (
            <div className="mt-2 space-y-1.5">
              {historialCierres.slice(0, 8).map((cierre) => (
                <div key={cierre.id} className="flex items-center justify-between text-xs">
                  <span className="truncate text-texto-suave">{cierre.nombre}</span>
                  <span className="shrink-0 font-semibold text-texto">{formatearPrecio({ monto: Math.round(cierre.monto), moneda: 'MXN' })}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <Boton to={`/admin/seguimiento?asesor=${stats.asesor.id}`} variante="contorno" className="mt-6 w-full">
          Ver su seguimiento de clientes
        </Boton>
      </div>
    </Overlay>
  )
}

// ---------------------------------------------------------------------------

export default function ProductividadAdminPage() {
  const { prospectosVenta, prospectosCaptacion, citas, conversaciones } = useDatosAdmin()
  const [periodo, setPeriodo] = useState<Periodo>('mes')
  const [orden, setOrden] = useState<{ columna: ColumnaOrden; direccion: 'asc' | 'desc' }>({ columna: 'valorCerrado', direccion: 'desc' })
  const [detalleId, setDetalleId] = useState<string | null>(null)

  const rangoActual = useMemo(() => rangoPeriodo(periodo, false), [periodo])
  const rangoAnterior = useMemo(() => rangoPeriodo(periodo, true), [periodo])

  function metricasEquipo(rango: RangoFechas) {
    const creados = prospectosVenta.filter((p) => dentroDePeriodo(p.fecha, rango))
    const cerrados = prospectosVenta.filter((p) => p.etapa === 'cerrado' && p.fechaCierre && dentroDePeriodo(p.fechaCierre, rango))
    const valorTotalCerrado = cerrados.reduce((suma, p) => suma + (p.presupuestoMin + p.presupuestoMax) / 2, 0)
    const diasPromedioCierre =
      cerrados.length > 0
        ? cerrados.reduce((suma, p) => suma + (new Date(p.fechaCierre!).getTime() - new Date(p.fecha).getTime()) / 86_400_000, 0) /
          cerrados.length
        : 0
    const tasaConversion = creados.length > 0 ? cerrados.length / creados.length : 0
    return { operacionesCerradas: cerrados.length, valorTotalCerrado, diasPromedioCierre, tasaConversion, creadosEnPeriodo: creados }
  }

  const equipoActual = metricasEquipo(rangoActual)
  const equipoAnterior = metricasEquipo(rangoAnterior)
  const embudoEquipo = calcularEmbudo(equipoActual.creadosEnPeriodo)
  const conversionEquipo = embudoEquipo.leads > 0 ? embudoEquipo.cerrados / embudoEquipo.leads : 0

  const statsPorAsesor = useMemo(() => {
    return asesoresDemo.map((asesor) => {
      const creadosDelAsesor = equipoActual.creadosEnPeriodo.filter((p) => p.asesorId === asesor.id)
      const cerradosDelAsesor = prospectosVenta.filter(
        (p) => p.asesorId === asesor.id && p.etapa === 'cerrado' && p.fechaCierre && dentroDePeriodo(p.fechaCierre, rangoActual),
      )
      const conversacionesDelAsesor = conversaciones.filter((c) => {
        const prospecto = prospectosVenta.find((p) => p.id === c.prospectoVentaId)
        return prospecto?.asesorId === asesor.id && dentroDePeriodo(prospecto.fecha, rangoActual)
      })
      return calcularStatsAsesor(asesor, creadosDelAsesor, cerradosDelAsesor, conversacionesDelAsesor, embudoEquipo, conversionEquipo)
      // eslint-disable-next-line react-hooks/exhaustive-deps
    })
  }, [prospectosVenta, conversaciones, rangoActual])

  const filasOrdenadas = useMemo(() => {
    const copia = [...statsPorAsesor]
    copia.sort((a, b) => {
      const va = VALOR_ORDEN[orden.columna](a)
      const vb = VALOR_ORDEN[orden.columna](b)
      const comparacion = typeof va === 'string' ? va.localeCompare(vb as string) : (va as number) - (vb as number)
      return orden.direccion === 'asc' ? comparacion : -comparacion
    })
    return copia
  }, [statsPorAsesor, orden])

  const top3 = useMemo(() => [...statsPorAsesor].sort((a, b) => b.valorCerrado - a.valorCerrado).slice(0, 3), [statsPorAsesor])

  function alternarOrden(columna: ColumnaOrden) {
    setOrden((actual) =>
      actual.columna === columna
        ? { columna, direccion: actual.direccion === 'asc' ? 'desc' : 'asc' }
        : { columna, direccion: columna === 'nombre' ? 'asc' : 'desc' },
    )
  }

  function exportarCsv() {
    const encabezado = [
      'Asesor', 'Leads', 'Contactados', 'Citas', 'Cerrados', 'Conversion %', 'Valor cerrado',
      'Ticket promedio', 'Dias a cierre', 'Tiempo de respuesta (min)', 'Semaforo',
    ]
    const filas = filasOrdenadas.map((s) =>
      [
        s.asesor.nombre,
        s.embudo.leads,
        s.embudo.contactados,
        s.embudo.citas,
        s.embudo.cerrados,
        Math.round(s.conversion * 100),
        Math.round(s.valorCerrado),
        Math.round(s.ticketPromedio),
        s.diasCierre.toFixed(1),
        s.tiempoRespuesta !== null ? Math.round(s.tiempoRespuesta) : '',
        ETIQUETA_SEMAFORO[s.semaforo],
      ].join(','),
    )
    const csv = [encabezado.join(','), ...filas].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const enlace = document.createElement('a')
    enlace.href = url
    enlace.download = `productividad-${periodo}.csv`
    enlace.click()
    URL.revokeObjectURL(url)
  }

  const detalle = statsPorAsesor.find((s) => s.asesor.id === detalleId) ?? null

  const propiedadesAsignadas = detalle
    ? prospectosCaptacion
        .filter((p) => p.asesorId === detalle.asesor.id)
        .map((p) => ({ titulo: `${ETIQUETA_TIPO[p.tipoPropiedad]} en ${p.colonia}`, colonia: p.colonia }))
    : []

  const prospectosPorEtapa = detalle
    ? (['nuevo', 'calificado', 'mostrando', 'negociacion', 'cerrado'] as EtapaProspectoVenta[]).map((etapa) => ({
        etapa,
        cantidad: prospectosVenta.filter((p) => p.asesorId === detalle.asesor.id && p.etapa === etapa).length,
      }))
    : []

  const agendaSemana = detalle
    ? (() => {
        const inicio = inicioDeSemana(new Date())
        const fin = new Date(inicio.getTime() + 7 * 24 * 60 * 60 * 1000)
        return citas
          .filter((c) => c.asesorId === detalle.asesor.id && new Date(c.inicio) >= inicio && new Date(c.inicio) < fin)
          .sort((a, b) => new Date(a.inicio).getTime() - new Date(b.inicio).getTime())
          .map((c) => ({ id: c.id, titulo: c.clienteNombre, horario: `${etiquetaDiaCita(new Date(c.inicio))} · ${etiquetaHoraCita(c.inicio)}` }))
      })()
    : []

  const historialCierres = detalle
    ? prospectosVenta
        .filter((p) => p.asesorId === detalle.asesor.id && p.etapa === 'cerrado' && p.fechaCierre)
        .sort((a, b) => new Date(b.fechaCierre!).getTime() - new Date(a.fechaCierre!).getTime())
        .map((p) => ({ id: p.id, nombre: p.nombre, monto: (p.presupuestoMin + p.presupuestoMax) / 2, fecha: p.fechaCierre! }))
    : []

  return (
    <div className="space-y-5">
      <EncabezadoPagina
        titulo="Productividad de Asesores"
        descripcion="En qué falla cada asesor y qué coachear — no es un ranking de actividad."
        accion={
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="flex flex-wrap gap-1 rounded-full border border-gris-borde bg-blanco p-1">
              {OPCIONES_PERIODO.map((opcion) => (
                <button
                  key={opcion.valor}
                  type="button"
                  onClick={() => setPeriodo(opcion.valor)}
                  className={`rounded-full px-3.5 py-1.5 text-sm font-semibold transition-colors ${
                    periodo === opcion.valor ? 'bg-vino-vivo text-blanco' : 'text-texto-suave hover:text-texto'
                  }`}
                >
                  {opcion.etiqueta}
                </button>
              ))}
            </div>
            <Boton variante="contorno" onClick={exportarCsv}>
              <Download size={16} strokeWidth={2} />
              Exportar
            </Boton>
          </div>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <TarjetaKpi
          etiqueta="Operaciones cerradas"
          valor={String(equipoActual.operacionesCerradas)}
          actual={equipoActual.operacionesCerradas}
          anterior={equipoAnterior.operacionesCerradas}
        />
        <TarjetaKpi
          etiqueta="Valor total cerrado"
          valor={formatoCompacto(equipoActual.valorTotalCerrado)}
          actual={equipoActual.valorTotalCerrado}
          anterior={equipoAnterior.valorTotalCerrado}
        />
        <TarjetaKpi
          etiqueta="Tiempo promedio de cierre"
          valor={`${equipoActual.diasPromedioCierre.toFixed(0)} días`}
          actual={equipoActual.diasPromedioCierre}
          anterior={equipoAnterior.diasPromedioCierre}
          invertir
        />
        <TarjetaKpi
          etiqueta="Tasa de conversión del equipo"
          valor={`${Math.round(equipoActual.tasaConversion * 100)}%`}
          actual={equipoActual.tasaConversion}
          anterior={equipoAnterior.tasaConversion}
        />
      </div>

      <Tarjeta>
        <h2 className="text-base font-bold text-texto">Podio del periodo</h2>
        <p className="mt-0.5 text-sm text-texto-suave">Por valor generado, no por score.</p>
        <div className="mt-4">
          <Podio top3={top3} />
        </div>
      </Tarjeta>

      <Tarjeta>
        <h2 className="text-base font-bold text-texto">Embudo por asesor</h2>
        <p className="mt-0.5 text-sm text-texto-suave">Dónde entra cada lead y dónde se pierde en el camino.</p>
        <div className="mt-2 divide-y divide-gris-borde">
          {statsPorAsesor.map((stats) => (
            <FilaEmbudoAsesor key={stats.asesor.id} stats={stats} onVerDetalle={() => setDetalleId(stats.asesor.id)} />
          ))}
        </div>
      </Tarjeta>

      <Tarjeta>
        <h2 className="text-base font-bold text-texto">Tabla comparativa</h2>
        <p className="mt-0.5 text-sm text-texto-suave">Ordenable por cualquier columna · clic en una fila para ver el detalle.</p>

        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[1000px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-gris-borde text-[10.5px] font-semibold uppercase tracking-wide text-texto-suave">
                {COLUMNAS.map((columna) => (
                  <th key={columna.clave} className="px-3 py-2.5 font-semibold">
                    <button type="button" onClick={() => alternarOrden(columna.clave)} className="flex items-center gap-1 hover:text-texto">
                      {columna.etiqueta}
                      {orden.columna === columna.clave &&
                        (orden.direccion === 'asc' ? <ChevronUp size={12} strokeWidth={2.5} /> : <ChevronDown size={12} strokeWidth={2.5} />)}
                    </button>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filasOrdenadas.map((s) => (
                <tr
                  key={s.asesor.id}
                  onClick={() => setDetalleId(s.asesor.id)}
                  className="cursor-pointer border-b border-gris-borde last:border-b-0 hover:bg-marfil/60"
                >
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-2.5">
                      <AvatarAsesor asesor={s.asesor} className="h-7 w-7 text-[10px]" />
                      <span className="font-semibold text-texto">{s.asesor.nombre}</span>
                    </div>
                  </td>
                  <td className="px-3 py-3 text-texto-suave">{s.embudo.leads}</td>
                  <td className="px-3 py-3 text-texto-suave">{s.embudo.contactados}</td>
                  <td className="px-3 py-3 text-texto-suave">{s.embudo.citas}</td>
                  <td className="px-3 py-3 text-texto-suave">{s.embudo.cerrados}</td>
                  <td className="px-3 py-3 font-semibold text-texto">{Math.round(s.conversion * 100)}%</td>
                  <td className="px-3 py-3 whitespace-nowrap font-semibold text-texto">
                    {formatearPrecio({ monto: Math.round(s.valorCerrado), moneda: 'MXN' })}
                  </td>
                  <td className="px-3 py-3 whitespace-nowrap text-texto-suave">
                    {s.ticketPromedio > 0 ? formatearPrecio({ monto: Math.round(s.ticketPromedio), moneda: 'MXN' }) : '—'}
                  </td>
                  <td className="px-3 py-3 text-texto-suave">{s.diasCierre > 0 ? `${s.diasCierre.toFixed(0)} d` : '—'}</td>
                  <td className={`px-3 py-3 font-medium ${s.tiempoRespuesta !== null && s.tiempoRespuesta > UMBRAL_RESPUESTA_MIN ? 'text-alerta' : 'text-texto-suave'}`}>
                    {etiquetaMinutos(s.tiempoRespuesta)}
                  </td>
                  <td className="px-3 py-3">
                    <EtiquetaSemaforo estado={s.semaforo} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Tarjeta>

      {detalle && (
        <PanelDetalleAsesor
          stats={detalle}
          propiedadesAsignadas={propiedadesAsignadas}
          prospectosPorEtapa={prospectosPorEtapa}
          agendaSemana={agendaSemana}
          historialCierres={historialCierres}
          onCerrar={() => setDetalleId(null)}
        />
      )}
    </div>
  )
}
