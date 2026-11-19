import { useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import {
  AlertTriangle,
  ArrowRight,
  Building2,
  CalendarCheck2,
  Clock,
  Headset,
  UserX,
  Wand2,
  X,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Boton, EncabezadoPagina, Tarjeta } from '../../components/cliente/Piezas'
import { EstadoVacio } from '../../components/admin/EstadoVacio'
import { AvatarAsesor } from '../../components/asesores/AvatarAsesor'
import { useDatosAdmin } from '../../components/admin/useDatosAdmin'
import { asesoresDemo } from '../../data/asesoresDemo'
import { OPCIONES_COLONIA } from '../../data/colonias'
import type { Asesor } from '../../types/asesor'
import { inicioDeSemana } from '../../types/cita'
import { ETIQUETA_TIPO, formatearPrecio } from '../../types/propiedad'
import { ETIQUETA_ORIGEN, formatearPrecioProspecto, type OrigenProspecto, type Prospecto } from '../../types/prospecto'
import { ETIQUETA_ORIGEN_VENTA, type OrigenProspectoVenta, type ProspectoVenta } from '../../types/prospectoVenta'

// ---------------------------------------------------------------------------
// Ayudas locales de tiempo/zona — la bandeja necesita precisión de horas
// ("Hace 3 h"), a diferencia de etiquetaUltimoAcceso (usuarios) o diasDesde
// (prospectos de venta), que ya redondean a día. No se generaliza a un lib
// compartido: son solo dos funciones chicas.
// ---------------------------------------------------------------------------

export function horasDesde(fechaISO: string): number {
  return (Date.now() - new Date(fechaISO).getTime()) / (1000 * 60 * 60)
}

function etiquetaEspera(fechaISO: string): string {
  const horas = horasDesde(fechaISO)
  if (horas < 1) return 'Hace unos minutos'
  if (horas < 24) return `Hace ${Math.round(horas)} h`
  return `Hace ${Math.floor(horas / 24)} d`
}

export function esperaVencida(fechaISO: string): boolean {
  return horasDesde(fechaISO) > 24
}

const ETIQUETA_COLONIA_LOOKUP = Object.fromEntries(OPCIONES_COLONIA.map((c) => [c.valor, c.etiqueta]))

// Mismos valores que ya usa CaptacionAdminPage para estas colonias — no hay
// alcaldía en Prospecto/ProspectoVenta (no son Propiedad todavía), así que se
// resuelve aquí por colonia.
const ALCALDIA_POR_COLONIA: Record<string, string> = {
  polanco: 'Miguel Hidalgo',
  'lomas de chapultepec': 'Miguel Hidalgo',
  'nuevo polanco': 'Miguel Hidalgo',
  anzures: 'Miguel Hidalgo',
  condesa: 'Cuauhtémoc',
  'roma norte': 'Cuauhtémoc',
  napoles: 'Benito Juárez',
  tecamachalco: 'Naucalpan de Juárez',
}

function etiquetaColonia(colonia: string): string {
  const clave = colonia.toLowerCase().trim()
  return ETIQUETA_COLONIA_LOOKUP[clave] ?? colonia
}

function etiquetaAlcaldia(colonia: string): string {
  return ALCALDIA_POR_COLONIA[colonia.toLowerCase().trim()] ?? ''
}

function iniciales(nombre: string): string {
  const partes = nombre.trim().split(/\s+/)
  return `${partes[0]?.[0] ?? ''}${partes[partes.length - 1]?.[0] ?? ''}`.toUpperCase()
}

// "Del portal" en dorado porque lo publicó un particular directo, sin pasar
// por un asesor — el resto son leads que ya trajo alguien del equipo o un
// canal conocido.
const ETIQUETA_ORIGEN_PROPIEDAD: Record<OrigenProspecto, string> = {
  web: 'Sitio web',
  llamada: 'Llamada',
  referido: 'Referido',
  redes_sociales: ETIQUETA_ORIGEN.redes_sociales,
  portal: 'Del portal',
}

const ETIQUETA_ORIGEN_PROSPECTO: Record<OrigenProspectoVenta, string> = {
  portal_3r: 'Del portal',
  agente_ia: ETIQUETA_ORIGEN_VENTA.agente_ia,
  sitio_web: 'Sitio web',
  referido: 'Referido',
  llamada: 'Llamada',
}

// ---------------------------------------------------------------------------
// Fila unificada de la bandeja — una propiedad (Prospecto de captación) y un
// prospecto de venta se ven distinto por dentro, pero la bandeja los trata
// igual: mismo título/detalle/origen/espera, solo cambia `tipo` para saber
// qué acción de SesionContext disparar al asignar.
// ---------------------------------------------------------------------------

interface FilaPendiente {
  tipo: 'propiedad' | 'prospecto'
  id: string
  titulo: string
  detalle: string
  colonia: string
  origenTexto: string
  origenDorado: boolean
  fecha: string
}

function filaDesdePropiedad(p: Prospecto): FilaPendiente {
  return {
    tipo: 'propiedad',
    id: p.id,
    titulo: `${ETIQUETA_TIPO[p.tipoPropiedad]} en ${etiquetaColonia(p.colonia)}`,
    detalle: `${formatearPrecioProspecto(p)} · ${etiquetaColonia(p.colonia)} · ${etiquetaAlcaldia(p.colonia)}`,
    colonia: p.colonia,
    origenTexto: ETIQUETA_ORIGEN_PROPIEDAD[p.origen],
    origenDorado: p.origen === 'portal',
    fecha: p.fecha,
  }
}

function filaDesdeProspecto(p: ProspectoVenta): FilaPendiente {
  const zona = p.zonas[0] ?? ''
  return {
    tipo: 'prospecto',
    id: p.id,
    titulo: p.nombre,
    detalle: `${formatearPrecio({ monto: p.presupuestoMin, moneda: p.moneda })} – ${formatearPrecio({ monto: p.presupuestoMax, moneda: p.moneda })}${
      zona ? ` · ${etiquetaColonia(zona)}` : ''
    }`,
    colonia: zona,
    origenTexto: ETIQUETA_ORIGEN_PROSPECTO[p.origen],
    origenDorado: p.origen === 'portal_3r',
    fecha: p.fecha,
  }
}

function asesoresQueDominanZona(zona: string, asesores: Asesor[]): Asesor[] {
  if (!zona) return []
  const z = zona.toLowerCase()
  return asesores.filter((a) => a.zonasDominio.some((dominio) => dominio.toLowerCase().includes(z) || z.includes(dominio.toLowerCase())))
}

interface Desglose {
  propiedades: number
  prospectos: number
  citas: number
}

// ---------------------------------------------------------------------------
// Piezas de UI locales
// ---------------------------------------------------------------------------

function TarjetaKpi({ icono: Icono, clase, etiqueta, valor }: { icono: LucideIcon; clase: string; etiqueta: string; valor: string }) {
  return (
    <Tarjeta className="flex items-center gap-3.5">
      <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${clase}`}>
        <Icono size={20} strokeWidth={1.75} />
      </span>
      <div className="min-w-0">
        <p className="truncate text-xs font-semibold text-texto-suave">{etiqueta}</p>
        <p className="mt-0.5 truncate font-serif text-xl font-bold text-texto">{valor}</p>
      </div>
    </Tarjeta>
  )
}

// A pantalla completa en móvil (nada de tarjeta centrada con márgenes);
// desde tablet (sm:) vuelve a ser el modal centrado de siempre.
function Overlay({ children, onClose }: { children: ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/50 sm:flex sm:items-center sm:justify-center sm:px-4 sm:py-8" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="h-full w-full overflow-y-auto bg-blanco sm:h-auto sm:max-h-[85vh] sm:w-full sm:max-w-lg sm:rounded-2xl sm:shadow-2xl"
      >
        {children}
      </div>
    </div>
  )
}

function ChipOrigen({ texto, dorado }: { texto: string; dorado: boolean }) {
  return (
    <span
      className={`inline-flex shrink-0 items-center rounded-full px-3 py-1 text-xs font-semibold ${
        dorado ? 'bg-oro/15 text-oro-oscuro' : 'bg-gris-borde text-texto-suave'
      }`}
    >
      {texto}
    </span>
  )
}

function colorBarraCarga(porcentaje: number): string {
  if (porcentaje >= 85) return 'bg-alerta'
  if (porcentaje >= 60) return 'bg-oro'
  return 'bg-exito'
}

function TarjetaAsesor({ asesor, desglose }: { asesor: Asesor; desglose: Desglose }) {
  const carga = desglose.propiedades + desglose.prospectos
  const porcentaje = Math.min(100, Math.round((carga / asesor.cupoMaximo) * 100))

  return (
    <div className="group relative py-3.5">
      <div className="flex items-center gap-3">
        <AvatarAsesor asesor={asesor} className="h-9 w-9 text-xs" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-texto">{asesor.nombre}</p>
          <p className="truncate text-[11px] text-texto-suave">{asesor.zonasDominio.join(' · ')}</p>
        </div>
        <p className="shrink-0 text-xs font-semibold text-texto-suave">
          {carga}/{asesor.cupoMaximo}
        </p>
      </div>

      <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-gris-borde">
        <div className={`h-full rounded-full transition-all ${colorBarraCarga(porcentaje)}`} style={{ width: `${porcentaje}%` }} />
      </div>

      <div className="pointer-events-none absolute left-0 right-0 top-full z-20 mt-1.5 hidden rounded-xl border border-gris-borde bg-blanco p-3 text-xs shadow-lg group-hover:block">
        <div className="flex items-center justify-between">
          <span className="text-texto-suave">Propiedades a cargo</span>
          <span className="font-semibold text-texto">{desglose.propiedades}</span>
        </div>
        <div className="mt-1 flex items-center justify-between">
          <span className="text-texto-suave">Prospectos a cargo</span>
          <span className="font-semibold text-texto">{desglose.prospectos}</span>
        </div>
        <div className="mt-1 flex items-center justify-between">
          <span className="text-texto-suave">Citas esta semana</span>
          <span className="font-semibold text-texto">{desglose.citas}</span>
        </div>
      </div>
    </div>
  )
}

function FilaCola({
  fila,
  cargaDe,
  onAsignar,
}: {
  fila: FilaPendiente
  cargaDe: (asesorId: string) => number
  onAsignar: (asesorId: string) => void
}) {
  const [seleccion, setSeleccion] = useState('')
  const vencida = esperaVencida(fila.fecha)

  const dominantesIds = new Set(asesoresQueDominanZona(fila.colonia, asesoresDemo).map((a) => a.id))
  const recomendados = asesoresDemo.filter((a) => dominantesIds.has(a.id)).sort((a, b) => cargaDe(a.id) - cargaDe(b.id))
  const otros = asesoresDemo.filter((a) => !dominantesIds.has(a.id)).sort((a, b) => cargaDe(a.id) - cargaDe(b.id))

  function etiquetaOpcion(a: Asesor) {
    const carga = cargaDe(a.id)
    return `${a.nombre} (${carga}/${a.cupoMaximo})${carga >= a.cupoMaximo ? ' · Al tope' : ''}`
  }

  return (
    <div className="flex flex-wrap items-center gap-3 py-3.5">
      <span
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-xs font-bold ${
          fila.tipo === 'propiedad' ? 'bg-vino-vivo/10 text-vino-vivo' : 'bg-marfil text-texto-suave'
        }`}
      >
        {fila.tipo === 'propiedad' ? <Building2 size={19} strokeWidth={1.75} /> : iniciales(fila.titulo)}
      </span>

      <div className="min-w-[170px] flex-1">
        <p className="truncate text-sm font-semibold text-texto">{fila.titulo}</p>
        <p className="truncate text-xs text-texto-suave">{fila.detalle}</p>
      </div>

      <ChipOrigen texto={fila.origenTexto} dorado={fila.origenDorado} />

      <span
        className={`inline-flex shrink-0 items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${
          vencida ? 'bg-coral/15 text-coral' : 'bg-gris-borde text-texto-suave'
        }`}
      >
        <Clock size={12} strokeWidth={2} />
        {etiquetaEspera(fila.fecha)}
      </span>

      <select
        value={seleccion}
        onChange={(evento) => setSeleccion(evento.target.value)}
        className="shrink-0 cursor-pointer rounded-full border border-gris-borde bg-blanco px-3.5 py-1.5 text-xs font-medium text-texto outline-none transition-colors hover:border-texto-suave"
      >
        <option value="">Elegir asesor...</option>
        {recomendados.length > 0 && (
          <optgroup label="Dominan esta zona">
            {recomendados.map((a) => (
              <option key={a.id} value={a.id}>
                {etiquetaOpcion(a)}
              </option>
            ))}
          </optgroup>
        )}
        <optgroup label={recomendados.length > 0 ? 'Otros asesores' : 'Asesores'}>
          {otros.map((a) => (
            <option key={a.id} value={a.id}>
              {etiquetaOpcion(a)}
            </option>
          ))}
        </optgroup>
      </select>

      <Boton variante="solido" disabled={!seleccion} onClick={() => seleccion && onAsignar(seleccion)} className="shrink-0">
        Asignar
      </Boton>
    </div>
  )
}

type FiltroTab = 'todas' | 'propiedades' | 'prospectos'

const TABS: { valor: FiltroTab; etiqueta: string }[] = [
  { valor: 'todas', etiqueta: 'Todas' },
  { valor: 'propiedades', etiqueta: 'Propiedades' },
  { valor: 'prospectos', etiqueta: 'Prospectos' },
]

export default function AsignacionAsesoresAdminPage() {
  const {
    usuario,
    prospectosCaptacion,
    asignarAsesorProspecto,
    pasarACaptacion,
    prospectosVenta,
    asignarAsesorProspectoVenta,
    citas,
    registrarBitacora,
  } = useDatosAdmin()

  const [tab, setTab] = useState<FiltroTab>('todas')
  const [asignadosHoy, setAsignadosHoy] = useState(4)
  const [confirmando, setConfirmando] = useState<{ fila: FilaPendiente; asesorId: string } | null>(null)
  const [propuestaAuto, setPropuestaAuto] = useState<{ fila: FilaPendiente; asesor: Asesor }[] | null>(null)

  const propiedadesPendientes = prospectosCaptacion.filter((p) => !p.asesorId)
  const prospectosPendientes = prospectosVenta.filter((p) => !p.asesorId)

  const cargaPorAsesor = useMemo(() => {
    const inicioSemana = inicioDeSemana(new Date())
    const mapa = new Map<string, Desglose>()
    for (const a of asesoresDemo) mapa.set(a.id, { propiedades: 0, prospectos: 0, citas: 0 })
    for (const p of prospectosCaptacion) {
      if (p.asesorId && mapa.has(p.asesorId)) mapa.get(p.asesorId)!.propiedades++
    }
    for (const p of prospectosVenta) {
      if (p.asesorId && mapa.has(p.asesorId)) mapa.get(p.asesorId)!.prospectos++
    }
    for (const c of citas) {
      if (mapa.has(c.asesorId) && new Date(c.inicio) >= inicioSemana) mapa.get(c.asesorId)!.citas++
    }
    return mapa
  }, [prospectosCaptacion, prospectosVenta, citas])

  function cargaDe(asesorId: string): number {
    const d = cargaPorAsesor.get(asesorId)
    return d ? d.propiedades + d.prospectos : 0
  }

  const filasPropiedades = useMemo(() => propiedadesPendientes.map(filaDesdePropiedad), [propiedadesPendientes])
  const filasProspectos = useMemo(() => prospectosPendientes.map(filaDesdeProspecto), [prospectosPendientes])
  const todasLasFilas = [...filasPropiedades, ...filasProspectos].sort((a, b) => horasDesde(b.fecha) - horasDesde(a.fecha))

  const filasVisibles =
    tab === 'propiedades' ? filasPropiedades : tab === 'prospectos' ? filasProspectos : todasLasFilas

  const totalSinAsignar = filasPropiedades.length + filasProspectos.length
  const hayVencidas = todasLasFilas.some((f) => esperaVencida(f.fecha))

  function ejecutarAsignacion(fila: FilaPendiente, asesorId: string) {
    const asesor = asesoresDemo.find((a) => a.id === asesorId)
    if (!asesor) return
    if (fila.tipo === 'propiedad') {
      asignarAsesorProspecto(fila.id, asesorId)
      pasarACaptacion(fila.id)
    } else {
      asignarAsesorProspectoVenta(fila.id, asesorId)
    }
    setAsignadosHoy((n) => n + 1)
    registrarBitacora({
      actor: usuario?.nombre ?? 'Sistema',
      accion: fila.tipo === 'propiedad' ? 'asignó una propiedad' : 'asignó un prospecto',
      detalle: `${fila.titulo} → ${asesor.nombre}`,
    })
  }

  function manejarAsignar(fila: FilaPendiente, asesorId: string) {
    const asesor = asesoresDemo.find((a) => a.id === asesorId)
    if (asesor && cargaDe(asesorId) >= asesor.cupoMaximo) {
      setConfirmando({ fila, asesorId })
    } else {
      ejecutarAsignacion(fila, asesorId)
    }
  }

  function abrirAsignacionAutomatica() {
    const cargaSimulada = new Map(asesoresDemo.map((a) => [a.id, cargaDe(a.id)]))
    const propuesta = todasLasFilas.map((fila) => {
      const dominantes = asesoresQueDominanZona(fila.colonia, asesoresDemo)
      const pool = dominantes.length > 0 ? dominantes : asesoresDemo
      const elegido = [...pool].sort((a, b) => cargaSimulada.get(a.id)! - cargaSimulada.get(b.id)!)[0]
      cargaSimulada.set(elegido.id, cargaSimulada.get(elegido.id)! + 1)
      return { fila, asesor: elegido }
    })
    setPropuestaAuto(propuesta)
  }

  function aplicarAsignacionAutomatica() {
    if (!propuestaAuto) return
    for (const { fila, asesor } of propuestaAuto) {
      ejecutarAsignacion(fila, asesor.id)
    }
    setPropuestaAuto(null)
  }

  return (
    <div className="space-y-5">
      <EncabezadoPagina
        titulo="Asignación y Supervisión de Asesores"
        descripcion="Reparte el trabajo entrante y mira la carga de cada asesor."
        accion={
          <Boton variante="solido" onClick={abrirAsignacionAutomatica} disabled={totalSinAsignar === 0}>
            <Wand2 size={16} strokeWidth={2} />
            Asignar automáticamente
          </Boton>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <TarjetaKpi
          icono={hayVencidas ? AlertTriangle : UserX}
          clase={hayVencidas ? 'bg-alerta/10 text-alerta' : 'bg-oro/15 text-oro-oscuro'}
          etiqueta="Sin asignar"
          valor={String(totalSinAsignar)}
        />
        <TarjetaKpi icono={CalendarCheck2} clase="bg-exito/10 text-exito" etiqueta="Asignados hoy" valor={String(asignadosHoy)} />
        <TarjetaKpi icono={Headset} clase="bg-vino-vivo/10 text-vino-vivo" etiqueta="Asesores activos" valor={String(asesoresDemo.length)} />
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1.7fr_1fr]">
        <Tarjeta>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-base font-bold text-texto">Propiedades y leads sin asignar</h2>
            <div className="flex flex-wrap gap-1 rounded-full border border-gris-borde bg-blanco p-1">
              {TABS.map((opcion) => (
                <button
                  key={opcion.valor}
                  type="button"
                  onClick={() => setTab(opcion.valor)}
                  className={`rounded-full px-3.5 py-1.5 text-sm font-semibold transition-colors ${
                    tab === opcion.valor ? 'bg-vino-vivo text-blanco' : 'text-texto-suave hover:text-texto'
                  }`}
                >
                  {opcion.etiqueta}
                </button>
              ))}
            </div>
          </div>

          {filasVisibles.length === 0 ? (
            <div className="mt-4">
              <EstadoVacio
                icono={Headset}
                titulo="No hay nada pendiente por repartir"
                descripcion="Cuando llegue una propiedad o un prospecto sin asesor, va a aparecer aquí."
              />
            </div>
          ) : (
            <div className="mt-2 divide-y divide-gris-borde">
              {filasVisibles.map((fila) => (
                <FilaCola key={`${fila.tipo}-${fila.id}`} fila={fila} cargaDe={cargaDe} onAsignar={(asesorId) => manejarAsignar(fila, asesorId)} />
              ))}
            </div>
          )}
        </Tarjeta>

        <Tarjeta>
          <h2 className="text-base font-bold text-texto">Carga por asesor</h2>
          <div className="mt-1 divide-y divide-gris-borde">
            {asesoresDemo.map((asesor) => (
              <TarjetaAsesor key={asesor.id} asesor={asesor} desglose={cargaPorAsesor.get(asesor.id) ?? { propiedades: 0, prospectos: 0, citas: 0 }} />
            ))}
          </div>
        </Tarjeta>
      </div>

      {confirmando && (
        <Overlay onClose={() => setConfirmando(null)}>
          <div className="p-5">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-alerta/10 text-alerta">
                <AlertTriangle size={18} strokeWidth={2} />
              </span>
              <h2 className="text-base font-bold text-texto">Este asesor está al tope de su cupo</h2>
            </div>
            <p className="mt-3 text-sm text-texto-suave">
              {asesoresDemo.find((a) => a.id === confirmando.asesorId)?.nombre} tiene {cargaDe(confirmando.asesorId)}/
              {asesoresDemo.find((a) => a.id === confirmando.asesorId)?.cupoMaximo} activos. ¿Asignar "{confirmando.fila.titulo}" de todos modos?
            </p>
            <div className="mt-5 flex justify-end gap-2.5">
              <Boton variante="contorno" onClick={() => setConfirmando(null)}>
                Cancelar
              </Boton>
              <Boton
                variante="solido"
                onClick={() => {
                  ejecutarAsignacion(confirmando.fila, confirmando.asesorId)
                  setConfirmando(null)
                }}
              >
                Asignar de todos modos
              </Boton>
            </div>
          </div>
        </Overlay>
      )}

      {propuestaAuto && (
        <Overlay onClose={() => setPropuestaAuto(null)}>
          <div className="max-h-[80vh] overflow-y-auto p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-texto">Propuesta de asignación automática</h2>
              <button type="button" onClick={() => setPropuestaAuto(null)} aria-label="Cerrar" className="text-texto-suave hover:text-texto">
                <X size={18} strokeWidth={2} />
              </button>
            </div>
            <p className="mt-1 text-xs text-texto-suave">Revisa antes de aplicar — todavía no se asigna nada.</p>

            {propuestaAuto.length === 0 ? (
              <p className="mt-4 text-sm text-texto-suave">No hay pendientes por repartir.</p>
            ) : (
              <div className="mt-4 divide-y divide-gris-borde">
                {propuestaAuto.map(({ fila, asesor }) => (
                  <div key={`${fila.tipo}-${fila.id}`} className="flex items-center justify-between gap-3 py-2.5">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-texto">{fila.titulo}</p>
                      <p className="truncate text-xs text-texto-suave">{fila.detalle}</p>
                    </div>
                    <div className="flex shrink-0 items-center gap-1.5 text-sm font-semibold text-vino-vivo">
                      <ArrowRight size={14} strokeWidth={2} />
                      {asesor.nombre}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-5 flex justify-end gap-2.5">
              <Boton variante="contorno" onClick={() => setPropuestaAuto(null)}>
                Cancelar
              </Boton>
              <Boton variante="solido" onClick={aplicarAsignacionAutomatica} disabled={propuestaAuto.length === 0}>
                Confirmar y aplicar
              </Boton>
            </div>
          </div>
        </Overlay>
      )}
    </div>
  )
}
