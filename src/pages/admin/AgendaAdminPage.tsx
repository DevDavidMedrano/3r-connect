import { useEffect, useMemo, useState } from 'react'
import type { DragEvent, ReactNode } from 'react'
import { AlertTriangle, CalendarClock, CalendarDays, ChevronLeft, ChevronRight, Percent, Plus, X } from 'lucide-react'
import { Boton, Tarjeta } from '../../components/cliente/Piezas'
import { useEsMovil } from '../../hooks/useMediaQuery'
import { useDatosAdmin } from '../../components/admin/useDatosAdmin'
import { asesoresDemo } from '../../data/asesoresDemo'
import { propiedadesDemo } from '../../data/propiedadesDemo'
import { construirTitulo, formatearPrecio } from '../../types/propiedad'
import { siguienteEtapa, type ProspectoVenta } from '../../types/prospectoVenta'
import {
  avisosTraslado,
  citasEnConflicto,
  etiquetaDiaCita,
  etiquetaHoraCita,
  finCita,
  inicioDeSemana,
  mismoDia,
  pendienteDeCierre,
  requiereConfirmacion,
  CLASE_TIPO_CITA,
  ETIQUETA_ESTADO_CITA,
  ETIQUETA_TIPO_CITA,
  type Cita,
  type TipoCita,
} from '../../types/cita'

// ---------------------------------------------------------------------------
// Constantes de la rejilla
// ---------------------------------------------------------------------------

const HORA_INICIO = 8
const HORA_FIN = 20
const PX_POR_HORA = 60
const HORAS = Array.from({ length: HORA_FIN - HORA_INICIO }, (_, i) => HORA_INICIO + i)
const TIPOS: TipoCita[] = ['visita', 'valuacion', 'firma', 'llamada', 'reunion']

function topPx(inicio: Date): number {
  const horas = inicio.getHours() + inicio.getMinutes() / 60
  return Math.max(0, horas - HORA_INICIO) * PX_POR_HORA
}

function alturaPx(duracionMinutos: number): number {
  return Math.max(22, (duracionMinutos / 60) * PX_POR_HORA)
}

function iniciales(nombre: string): string {
  const partes = nombre.trim().split(/\s+/)
  return `${partes[0]?.[0] ?? ''}${partes[partes.length - 1]?.[0] ?? ''}`.toUpperCase()
}

function formatearFechaHora(fecha: string, hora: string): string {
  return new Date(`${fecha}T${hora}:00`).toISOString()
}

function aFechaHora(iso: string): { fecha: string; hora: string } {
  const d = new Date(iso)
  const pad = (n: number) => String(n).padStart(2, '0')
  return { fecha: `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`, hora: `${pad(d.getHours())}:${pad(d.getMinutes())}` }
}

// ---------------------------------------------------------------------------
// Piezas pequeñas
// ---------------------------------------------------------------------------

function TarjetaKpi({ icono: Icono, clase, etiqueta, valor }: { icono: typeof CalendarClock; clase: string; etiqueta: string; valor: string }) {
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
        className="h-full w-full overflow-y-auto bg-blanco sm:h-auto sm:max-h-[85vh] sm:w-full sm:max-w-md sm:rounded-2xl sm:shadow-2xl"
      >
        {children}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Bloque de cita en la rejilla
// ---------------------------------------------------------------------------

function BloqueCita({
  cita,
  enConflicto,
  aviso,
  onClick,
  onDragStart,
}: {
  cita: Cita
  enConflicto: boolean
  aviso?: string
  onClick: () => void
  onDragStart: (evento: DragEvent) => void
}) {
  const clase = CLASE_TIPO_CITA[cita.tipo]
  const propiedad = cita.folio ? propiedadesDemo.find((p) => p.folio === cita.folio) : undefined
  const puntoDeCierre = pendienteDeCierre(cita)
  const cerrada = cita.estado === 'asistio' || cita.estado === 'no_asistio' || cita.estado === 'reagendada'
  const arrastrable = !cerrada

  return (
    <div
      draggable={arrastrable}
      onDragStart={onDragStart}
      onClick={onClick}
      style={{ top: topPx(new Date(cita.inicio)), height: alturaPx(cita.duracionMinutos) }}
      className={`group absolute inset-x-0.5 z-10 cursor-pointer overflow-hidden rounded-md border px-1.5 py-1 text-left text-[10.5px] leading-tight shadow-sm transition-shadow hover:z-20 hover:shadow-md ${clase.bloque} ${
        cita.estado === 'agendada' ? 'border-dashed' : 'border-solid'
      } ${cerrada ? 'opacity-55' : ''}`}
    >
      <p className={`truncate font-bold ${clase.texto}`}>{etiquetaHoraCita(cita.inicio)}</p>
      <p className="truncate font-semibold text-texto">{cita.clienteNombre}</p>
      {propiedad && <p className="truncate text-texto-suave">{propiedad.folio} · {propiedad.ubicacion.colonia}</p>}

      {(enConflicto || aviso) && (
        <span className="absolute right-1 top-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-alerta text-blanco">
          <AlertTriangle size={9} strokeWidth={2.5} />
        </span>
      )}
      {puntoDeCierre && !cerrada && <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-oro ring-2 ring-blanco" />}

      {/* Tarjeta flotante con el detalle completo */}
      <div className="pointer-events-none absolute left-1/2 top-full z-30 mt-1 w-56 -translate-x-1/2 rounded-xl border border-gris-borde bg-blanco p-3 text-left opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
        <p className={`text-[10.5px] font-semibold uppercase tracking-wide ${clase.texto}`}>{ETIQUETA_TIPO_CITA[cita.tipo]}</p>
        <p className="mt-0.5 text-sm font-bold text-texto">{cita.clienteNombre}</p>
        {propiedad && <p className="text-xs text-texto-suave">{construirTitulo(propiedad)}</p>}
        <p className="mt-1 text-xs text-texto-suave">
          {etiquetaDiaCita(new Date(cita.inicio))} · {etiquetaHoraCita(cita.inicio)} ({cita.duracionMinutos} min)
        </p>
        <p className="mt-1 text-xs font-semibold text-texto">{ETIQUETA_ESTADO_CITA[cita.estado]}</p>
        {aviso && <p className="mt-1 text-xs font-semibold text-alerta">{aviso}</p>}
        {enConflicto && <p className="mt-1 text-xs font-semibold text-alerta">Empalmada con otra cita del asesor</p>}
        {cita.notas && <p className="mt-1 text-xs italic text-texto-suave">{cita.notas}</p>}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Rejilla — recibe columnas ya armadas (días de la semana, un solo día, o
// un día por asesor en la vista comparativa): un solo componente para las
// tres formas de verla.
// ---------------------------------------------------------------------------

interface Columna {
  etiqueta: string
  fecha: Date
  citas: Cita[]
}

function RejillaCitas({
  columnas,
  todasLasCitas,
  onSoltar,
  onClickCita,
}: {
  columnas: Columna[]
  todasLasCitas: Cita[]
  onSoltar: (cita: Cita, dia: Date, hora: number) => void
  onClickCita: (cita: Cita) => void
}) {
  const avisos = useMemo(() => avisosTraslado(todasLasCitas), [todasLasCitas])
  const avisoPorCita = new Map(avisos.map((a) => [a.citaId, a.texto]))
  const [arrastrando, setArrastrando] = useState<Cita | null>(null)
  const ahora = new Date()

  return (
    <div className="overflow-x-auto rounded-2xl border border-gris-borde bg-blanco">
      <div className="flex min-w-[720px]">
        <div className="w-14 shrink-0 border-r border-gris-borde">
          <div className="h-11 border-b border-gris-borde" />
          {HORAS.map((h) => (
            <div key={h} style={{ height: PX_POR_HORA }} className="border-b border-gris-borde px-1.5 pt-0.5 text-[10px] text-texto-suave">
              {h}:00
            </div>
          ))}
        </div>

        {columnas.map((columna) => {
          const esHoy = mismoDia(columna.fecha, ahora)
          return (
            <div key={columna.etiqueta + columna.fecha.toISOString()} className="min-w-0 flex-1 border-r border-gris-borde last:border-r-0">
              <div className={`flex h-11 items-center justify-center border-b border-gris-borde text-xs font-semibold ${esHoy ? 'text-vino-vivo' : 'text-texto'}`}>
                {columna.etiqueta}
              </div>
              <div className="relative" style={{ height: PX_POR_HORA * HORAS.length }}>
                {HORAS.map((h) => (
                  <div
                    key={h}
                    style={{ height: PX_POR_HORA }}
                    className="border-b border-gris-borde last:border-b-0"
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault()
                      if (arrastrando) onSoltar(arrastrando, columna.fecha, h)
                    }}
                  />
                ))}

                {esHoy && ahora.getHours() >= HORA_INICIO && ahora.getHours() < HORA_FIN && (
                  <div className="pointer-events-none absolute inset-x-0 z-20 border-t-2 border-alerta" style={{ top: topPx(ahora) }} />
                )}

                {columna.citas.map((cita) => {
                  const conflicto = citasEnConflicto(cita.asesorId, new Date(cita.inicio), finCita(cita), todasLasCitas, cita.id).length > 0
                  return (
                    <BloqueCita
                      key={cita.id}
                      cita={cita}
                      enConflicto={conflicto}
                      aviso={avisoPorCita.get(cita.id)}
                      onClick={() => onClickCita(cita)}
                      onDragStart={() => setArrastrando(cita)}
                    />
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Vista de mes — resumen liviano, no la rejilla por horas.
// ---------------------------------------------------------------------------

function VistaMes({ fechaBase, citas, onSeleccionarDia }: { fechaBase: Date; citas: Cita[]; onSeleccionarDia: (fecha: Date) => void }) {
  const primerDiaMes = new Date(fechaBase.getFullYear(), fechaBase.getMonth(), 1)
  const inicioGrid = inicioDeSemana(primerDiaMes)
  const dias = Array.from({ length: 42 }, (_, i) => {
    const d = new Date(inicioGrid)
    d.setDate(inicioGrid.getDate() + i)
    return d
  })

  return (
    <div className="overflow-hidden rounded-2xl border border-gris-borde bg-blanco">
      <div className="grid grid-cols-7 text-center text-[10.5px] font-semibold uppercase tracking-wide text-texto-suave">
        {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map((d) => (
          <div key={d} className="border-b border-gris-borde py-2">
            {d}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {dias.map((dia) => {
          const citasDia = citas.filter((c) => mismoDia(new Date(c.inicio), dia))
          const fueraDeMes = dia.getMonth() !== fechaBase.getMonth()
          return (
            <button
              key={dia.toISOString()}
              type="button"
              onClick={() => onSeleccionarDia(dia)}
              className={`flex h-24 flex-col items-start gap-1 border-b border-r border-gris-borde p-1.5 text-left last:border-r-0 hover:bg-marfil ${
                fueraDeMes ? 'text-texto-suave/50' : ''
              }`}
            >
              <span className={`text-xs ${mismoDia(dia, new Date()) ? 'flex h-5 w-5 items-center justify-center rounded-full bg-vino-vivo font-bold text-blanco' : ''}`}>
                {dia.getDate()}
              </span>
              <div className="flex flex-wrap gap-0.5">
                {citasDia.slice(0, 6).map((c) => (
                  <span key={c.id} className={`h-1.5 w-1.5 rounded-full ${CLASE_TIPO_CITA[c.tipo].punto}`} />
                ))}
              </div>
              {citasDia.length > 0 && <span className="text-[10px] text-texto-suave">{citasDia.length} cita{citasDia.length === 1 ? '' : 's'}</span>}
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Modal nueva cita
// ---------------------------------------------------------------------------

interface Prellenado {
  tipo?: TipoCita
  clienteNombre?: string
  prospectoVentaId?: string | null
  folio?: string | null
  asesorId?: string
}

function ModalNuevaCita({
  citas,
  prellenado,
  onCerrar,
  onGuardar,
}: {
  citas: Cita[]
  prellenado?: Prellenado
  onCerrar: () => void
  onGuardar: (cita: Cita) => void
}) {
  const [tipo, setTipo] = useState<TipoCita>(prellenado?.tipo ?? 'visita')
  const [clienteQuery, setClienteQuery] = useState(prellenado?.clienteNombre ?? '')
  const [prospectoId, setProspectoId] = useState<string | null>(prellenado?.prospectoVentaId ?? null)
  const [propiedadQuery, setPropiedadQuery] = useState('')
  const [folio, setFolio] = useState<string | null>(prellenado?.folio ?? null)
  const [asesorId, setAsesorId] = useState(prellenado?.asesorId ?? asesoresDemo[0].id)
  const [fecha, setFecha] = useState(() => aFechaHora(new Date(Date.now() + 86_400_000).toISOString()).fecha)
  const [hora, setHora] = useState('10:00')
  const [duracion, setDuracion] = useState(45)
  const [notas, setNotas] = useState('')

  const necesitaPropiedad = tipo === 'visita' || tipo === 'valuacion' || tipo === 'firma'

  const coincidenciasCliente = useMemo(() => {
    if (!clienteQuery.trim() || prospectoId) return []
    const objetivo = clienteQuery.trim().toLowerCase()
    return prospectosVentaGlobal.filter((p) => p.nombre.toLowerCase().includes(objetivo)).slice(0, 5)
  }, [clienteQuery, prospectoId])

  const coincidenciasPropiedad = useMemo(() => {
    if (!propiedadQuery.trim() || folio) return []
    const objetivo = propiedadQuery.trim().toLowerCase()
    return propiedadesDemo
      .filter((p) => p.folio.toLowerCase().includes(objetivo) || p.ubicacion.colonia.toLowerCase().includes(objetivo))
      .slice(0, 5)
  }, [propiedadQuery, folio])

  const propiedadSeleccionada = folio ? propiedadesDemo.find((p) => p.folio === folio) : undefined

  const disponibilidad = useMemo(() => {
    if (!fecha || !hora) return null
    const inicio = new Date(formatearFechaHora(fecha, hora))
    const fin = new Date(inicio.getTime() + duracion * 60_000)
    return citasEnConflicto(asesorId, inicio, fin, citas)
  }, [asesorId, fecha, hora, duracion, citas])

  const asesorNombre = asesoresDemo.find((a) => a.id === asesorId)?.nombre ?? ''
  const puedeGuardar = clienteQuery.trim() !== '' && fecha !== '' && hora !== '' && (!necesitaPropiedad || folio !== null)

  function guardar() {
    if (!puedeGuardar) return
    onGuardar({
      id: `cita-${Date.now()}`,
      tipo,
      clienteNombre: clienteQuery.trim(),
      prospectoVentaId: prospectoId,
      folio: necesitaPropiedad ? folio : null,
      colonia: necesitaPropiedad && propiedadSeleccionada ? propiedadSeleccionada.ubicacion.colonia : null,
      asesorId,
      inicio: formatearFechaHora(fecha, hora),
      duracionMinutos: duracion,
      estado: 'agendada',
      confirmacionEnviada: false,
      notas,
      resultado: null,
    })
  }

  return (
    <Overlay onClose={onCerrar}>
      <div className="max-h-[85vh] overflow-y-auto p-5">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-texto">Nueva cita</h2>
          <button type="button" onClick={onCerrar} aria-label="Cerrar" className="text-texto-suave hover:text-texto">
            <X size={18} strokeWidth={2} />
          </button>
        </div>

        <div className="mt-4 space-y-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wide text-texto-suave">Tipo de cita</span>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {TIPOS.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTipo(t)}
                  className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
                    tipo === t ? 'border-vino-vivo bg-vino-vivo text-blanco' : 'border-gris-borde text-texto hover:border-vino-vivo'
                  }`}
                >
                  {ETIQUETA_TIPO_CITA[t]}
                </button>
              ))}
            </div>
          </div>

          <div className="relative">
            <span className="text-xs font-semibold uppercase tracking-wide text-texto-suave">Cliente</span>
            <input
              type="text"
              value={clienteQuery}
              onChange={(e) => {
                setClienteQuery(e.target.value)
                setProspectoId(null)
              }}
              placeholder="Buscar prospecto o escribir nombre"
              className="mt-1.5 w-full rounded-3r-md border border-gris-borde px-3.5 py-2.5 text-sm text-texto outline-none focus:border-vino-vivo"
            />
            {coincidenciasCliente.length > 0 && (
              <div className="absolute z-10 mt-1 w-full rounded-xl border border-gris-borde bg-blanco py-1 shadow-lg">
                {coincidenciasCliente.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => {
                      setClienteQuery(p.nombre)
                      setProspectoId(p.id)
                      if (p.asesorId) setAsesorId(p.asesorId)
                    }}
                    className="block w-full px-3.5 py-2 text-left text-sm text-texto hover:bg-marfil"
                  >
                    {p.nombre}
                  </button>
                ))}
              </div>
            )}
          </div>

          {necesitaPropiedad && (
            <div className="relative">
              <span className="text-xs font-semibold uppercase tracking-wide text-texto-suave">Propiedad</span>
              {folio ? (
                <div className="mt-1.5 flex items-center justify-between rounded-3r-md border border-gris-borde px-3.5 py-2.5 text-sm">
                  <span className="truncate text-texto">
                    {folio} · {propiedadSeleccionada ? construirTitulo(propiedadSeleccionada) : ''}
                  </span>
                  <button type="button" onClick={() => setFolio(null)} className="shrink-0 text-texto-suave hover:text-texto">
                    <X size={14} strokeWidth={2} />
                  </button>
                </div>
              ) : (
                <>
                  <input
                    type="text"
                    value={propiedadQuery}
                    onChange={(e) => setPropiedadQuery(e.target.value)}
                    placeholder="Buscar por folio o colonia en Inventario"
                    className="mt-1.5 w-full rounded-3r-md border border-gris-borde px-3.5 py-2.5 text-sm text-texto outline-none focus:border-vino-vivo"
                  />
                  {coincidenciasPropiedad.length > 0 && (
                    <div className="absolute z-10 mt-1 w-full rounded-xl border border-gris-borde bg-blanco py-1 shadow-lg">
                      {coincidenciasPropiedad.map((p) => (
                        <button
                          key={p.folio}
                          type="button"
                          onClick={() => {
                            setFolio(p.folio)
                            setPropiedadQuery('')
                          }}
                          className="block w-full px-3.5 py-2 text-left text-sm text-texto hover:bg-marfil"
                        >
                          <span className="font-semibold">{p.folio}</span> · {p.ubicacion.colonia} · {formatearPrecio(p.listados[0].precio)}
                        </button>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="text-xs font-semibold uppercase tracking-wide text-texto-suave">Asesor</span>
              <select
                value={asesorId}
                onChange={(e) => setAsesorId(e.target.value)}
                className="mt-1.5 w-full rounded-3r-md border border-gris-borde px-3 py-2.5 text-sm text-texto outline-none focus:border-vino-vivo"
              >
                {asesoresDemo.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.nombre}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="text-xs font-semibold uppercase tracking-wide text-texto-suave">Duración</span>
              <select
                value={duracion}
                onChange={(e) => setDuracion(Number(e.target.value))}
                className="mt-1.5 w-full rounded-3r-md border border-gris-borde px-3 py-2.5 text-sm text-texto outline-none focus:border-vino-vivo"
              >
                {[30, 45, 60, 90].map((m) => (
                  <option key={m} value={m}>
                    {m} min
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="text-xs font-semibold uppercase tracking-wide text-texto-suave">Fecha</span>
              <input
                type="date"
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
                className="mt-1.5 w-full rounded-3r-md border border-gris-borde px-3 py-2.5 text-sm text-texto outline-none focus:border-vino-vivo"
              />
            </label>
            <label className="block">
              <span className="text-xs font-semibold uppercase tracking-wide text-texto-suave">Hora</span>
              <input
                type="time"
                value={hora}
                onChange={(e) => setHora(e.target.value)}
                className="mt-1.5 w-full rounded-3r-md border border-gris-borde px-3 py-2.5 text-sm text-texto outline-none focus:border-vino-vivo"
              />
            </label>
          </div>

          {disponibilidad !== null && (
            <p className={`text-xs font-semibold ${disponibilidad.length > 0 ? 'text-alerta' : 'text-exito'}`}>
              {disponibilidad.length > 0
                ? `⚠ ${asesorNombre} ya tiene una cita a las ${etiquetaHoraCita(disponibilidad[0].inicio)}${
                    disponibilidad[0].colonia ? ` en ${disponibilidad[0].colonia}` : ''
                  }.`
                : `✓ ${asesorNombre} está disponible en ese horario.`}
            </p>
          )}

          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-wide text-texto-suave">Notas</span>
            <textarea
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              rows={2}
              className="mt-1.5 w-full rounded-3r-md border border-gris-borde px-3.5 py-2.5 text-sm text-texto outline-none focus:border-vino-vivo"
            />
          </label>
        </div>

        <div className="mt-5 flex justify-end gap-2.5">
          <Boton variante="contorno" onClick={onCerrar}>
            Cancelar
          </Boton>
          <Boton variante="solido" onClick={guardar} disabled={!puedeGuardar}>
            Guardar cita
          </Boton>
        </div>
      </div>
    </Overlay>
  )
}

// Se llena en el módulo (ver abajo) para que ModalNuevaCita pueda buscar
// prospectos sin tener que pasarlos por 12 niveles de props.
let prospectosVentaGlobal: ProspectoVenta[] = []

// ---------------------------------------------------------------------------
// Modal de cierre de cita
// ---------------------------------------------------------------------------

function ModalCerrarCita({
  cita,
  onCerrar,
  onGuardar,
}: {
  cita: Cita
  onCerrar: () => void
  onGuardar: (asistio: boolean, nota: string) => void
}) {
  const [asistio, setAsistio] = useState<boolean | null>(null)
  const [nota, setNota] = useState('')
  const propiedad = cita.folio ? propiedadesDemo.find((p) => p.folio === cita.folio) : undefined

  return (
    <Overlay onClose={onCerrar}>
      <div className="p-5">
        <h2 className="text-base font-bold text-texto">Cerrar cita</h2>
        <p className="mt-1 text-sm text-texto-suave">
          {cita.clienteNombre} · {ETIQUETA_TIPO_CITA[cita.tipo]} · {etiquetaDiaCita(new Date(cita.inicio))} {etiquetaHoraCita(cita.inicio)}
        </p>
        {propiedad && <p className="text-xs text-texto-suave">{construirTitulo(propiedad)}</p>}

        <div className="mt-4 flex gap-2.5">
          <button
            type="button"
            onClick={() => setAsistio(true)}
            className={`flex-1 rounded-3r-md border px-4 py-2.5 text-sm font-semibold transition-colors ${
              asistio === true ? 'border-exito bg-exito/10 text-exito' : 'border-gris-borde text-texto hover:border-exito'
            }`}
          >
            Asistió
          </button>
          <button
            type="button"
            onClick={() => setAsistio(false)}
            className={`flex-1 rounded-3r-md border px-4 py-2.5 text-sm font-semibold transition-colors ${
              asistio === false ? 'border-alerta bg-alerta/10 text-alerta' : 'border-gris-borde text-texto hover:border-alerta'
            }`}
          >
            No asistió
          </button>
        </div>

        <label className="mt-4 block">
          <span className="text-xs font-semibold uppercase tracking-wide text-texto-suave">Nota</span>
          <textarea
            value={nota}
            onChange={(e) => setNota(e.target.value)}
            rows={2}
            className="mt-1.5 w-full rounded-3r-md border border-gris-borde px-3.5 py-2.5 text-sm text-texto outline-none focus:border-vino-vivo"
          />
        </label>

        <div className="mt-5 flex justify-end gap-2.5">
          <Boton variante="contorno" onClick={onCerrar}>
            Cancelar
          </Boton>
          <Boton variante="solido" onClick={() => asistio !== null && onGuardar(asistio, nota)} disabled={asistio === null}>
            Guardar resultado
          </Boton>
        </div>
      </div>
    </Overlay>
  )
}

// ---------------------------------------------------------------------------
// Página
// ---------------------------------------------------------------------------

export default function AgendaAdminPage() {
  const {
    rol,
    asesor,
    citas,
    agregarCita,
    moverCita,
    actualizarEstadoCita,
    marcarRecordatorioEnviado,
    cerrarCita,
    prospectosVenta,
    actualizarEtapaProspectoVenta,
    apartadosMock,
    agregarApartado,
    actualizarEstadoApartado,
  } = useDatosAdmin()

  prospectosVentaGlobal = prospectosVenta

  const miAsesorId = asesor.id
  const esMovil = useEsMovil()
  const [vista, setVista] = useState<'dia' | 'semana' | 'mes'>('semana')
  const [fechaBase, setFechaBase] = useState(new Date())

  // La rejilla semanal no funciona en una pantalla angosta — en móvil se
  // fuerza a vista de día (queda disponible desde tablet). Solo se corrige
  // cuando hace falta: si el usuario ya eligió "mes" o "día" a mano, se
  // respeta.
  useEffect(() => {
    if (esMovil && vista === 'semana') setVista('dia')
  }, [esMovil, vista])
  const [asesorFiltro, setAsesorFiltro] = useState('todos')
  const [comparar, setComparar] = useState(false)
  const [modalNueva, setModalNueva] = useState<Prellenado | null>(null)
  const [citaDetalle, setCitaDetalle] = useState<Cita | null>(null)
  const [citaCierre, setCitaCierre] = useState<Cita | null>(null)
  const [confirmarMover, setConfirmarMover] = useState<{ cita: Cita; nuevoInicio: Date; conflictos: Cita[] } | null>(null)
  const [interesRegistrado, setInteresRegistrado] = useState(false)

  const citasRol = rol === 'admin' ? citas : citas.filter((c) => c.asesorId === miAsesorId)
  const citasFiltradas = rol === 'admin' && asesorFiltro !== 'todos' ? citasRol.filter((c) => c.asesorId === asesorFiltro) : citasRol

  const inicioSemana = inicioDeSemana(fechaBase)
  const finSemana = new Date(inicioSemana)
  finSemana.setDate(finSemana.getDate() + 7)

  const hoy = new Date()
  const citasHoy = citasRol.filter((c) => mismoDia(new Date(c.inicio), hoy))
  const citasSemana = citasRol.filter((c) => new Date(c.inicio) >= inicioSemana && new Date(c.inicio) < finSemana)
  const sinConfirmarSemana = citasSemana.filter((c) => c.estado === 'agendada')
  const cerradasMes = citasRol.filter(
    (c) => (c.estado === 'asistio' || c.estado === 'no_asistio') && new Date(c.inicio).getMonth() === hoy.getMonth() && new Date(c.inicio).getFullYear() === hoy.getFullYear(),
  )
  const tasaAsistencia = cerradasMes.length > 0 ? Math.round((cerradasMes.filter((c) => c.estado === 'asistio').length / cerradasMes.length) * 100) : 0

  const requierenConfirmacion = citasRol.filter((c) => requiereConfirmacion(c))
  const pendientesDeCierre = citasRol.filter((c) => pendienteDeCierre(c))

  function irA(delta: number) {
    const nueva = new Date(fechaBase)
    if (vista === 'mes') nueva.setMonth(nueva.getMonth() + delta)
    else if (vista === 'semana') nueva.setDate(nueva.getDate() + delta * 7)
    else nueva.setDate(nueva.getDate() + delta)
    setFechaBase(nueva)
  }

  function columnasDeDias(dias: Date[]): Columna[] {
    return dias.map((fecha) => ({
      etiqueta: etiquetaDiaCita(fecha),
      fecha,
      citas: citasFiltradas.filter((c) => mismoDia(new Date(c.inicio), fecha)),
    }))
  }

  const columnas: Columna[] = useMemo(() => {
    if (comparar && rol === 'admin') {
      return asesoresDemo.map((a) => ({
        etiqueta: a.nombre,
        fecha: fechaBase,
        citas: citasRol.filter((c) => c.asesorId === a.id && mismoDia(new Date(c.inicio), fechaBase)),
      }))
    }
    if (vista === 'dia') return columnasDeDias([fechaBase])
    if (vista === 'semana') return columnasDeDias(Array.from({ length: 7 }, (_, i) => new Date(inicioSemana.getTime() + i * 86_400_000)))
    return []
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vista, fechaBase, citasFiltradas, comparar, rol])

  function alSoltar(cita: Cita, dia: Date, hora: number) {
    const nuevoInicio = new Date(dia)
    nuevoInicio.setHours(hora, 0, 0, 0)
    const nuevoFin = new Date(nuevoInicio.getTime() + cita.duracionMinutos * 60_000)
    const conflictos = citasEnConflicto(cita.asesorId, nuevoInicio, nuevoFin, citasRol, cita.id)
    setConfirmarMover({ cita, nuevoInicio, conflictos })
  }

  function confirmarCambio() {
    if (!confirmarMover) return
    moverCita(confirmarMover.cita.id, confirmarMover.nuevoInicio.toISOString())
    setConfirmarMover(null)
  }

  function abrirDetalle(cita: Cita) {
    if (pendienteDeCierre(cita)) setCitaCierre(cita)
    else setCitaDetalle(cita)
  }

  function guardarCierre(asistio: boolean, nota: string) {
    if (!citaCierre) return
    cerrarCita(citaCierre.id, { asistio, nota })

    if (asistio && citaCierre.tipo === 'firma') {
      const existente = apartadosMock.find((a) => a.folio === citaCierre.folio && a.clienteNombre === citaCierre.clienteNombre)
      if (existente) {
        actualizarEstadoApartado(existente.id, 'convertido')
      } else if (citaCierre.folio) {
        agregarApartado({
          id: `apartado-firma-${citaCierre.id}`,
          folio: citaCierre.folio,
          clienteNombre: citaCierre.clienteNombre,
          estado: 'convertido',
          anticipoMonto: 0,
          fechaVencimiento: new Date().toISOString().slice(0, 10),
        })
      }
    }

    setCitaCierre(null)
  }

  function registrarInteres(cita: Cita) {
    if (!cita.prospectoVentaId) return
    const prospecto = prospectosVenta.find((p) => p.id === cita.prospectoVentaId)
    if (!prospecto) return
    actualizarEtapaProspectoVenta(prospecto.id, siguienteEtapa(prospecto.etapa))
    setInteresRegistrado(true)
  }

  const prospectoDetalle = citaDetalle?.prospectoVentaId ? prospectosVenta.find((p) => p.id === citaDetalle.prospectoVentaId) : undefined

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="font-serif text-2xl font-bold text-texto">Agenda y Control de Citas</h1>

        <div className="ml-auto flex flex-wrap items-center gap-2">
          <div className="flex rounded-full border border-gris-borde bg-blanco p-1">
            {(['dia', 'semana', 'mes'] as const)
              .filter((v) => v !== 'semana' || !esMovil)
              .map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => {
                    setVista(v)
                    setComparar(false)
                  }}
                  className={`min-h-9 rounded-full px-3 py-1.5 text-xs font-semibold capitalize transition-colors ${
                    vista === v ? 'bg-vino-vivo text-blanco' : 'text-texto-suave hover:text-texto'
                  }`}
                >
                  {v}
                </button>
              ))}
          </div>

          <div className="flex items-center gap-1 rounded-full border border-gris-borde bg-blanco px-1 py-1">
            <button type="button" onClick={() => irA(-1)} aria-label="Anterior" className="flex h-7 w-7 items-center justify-center rounded-full text-texto-suave hover:bg-marfil hover:text-texto">
              <ChevronLeft size={15} strokeWidth={2} />
            </button>
            <button type="button" onClick={() => setFechaBase(new Date())} className="px-2 text-xs font-semibold text-texto">
              Hoy
            </button>
            <button type="button" onClick={() => irA(1)} aria-label="Siguiente" className="flex h-7 w-7 items-center justify-center rounded-full text-texto-suave hover:bg-marfil hover:text-texto">
              <ChevronRight size={15} strokeWidth={2} />
            </button>
          </div>

          <Boton variante="solido" onClick={() => setModalNueva({})}>
            <Plus size={16} strokeWidth={2.5} />
            Nueva cita
          </Boton>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <TarjetaKpi icono={CalendarDays} clase="bg-vino-vivo/10 text-vino-vivo" etiqueta="Citas de hoy" valor={String(citasHoy.length)} />
        <TarjetaKpi icono={AlertTriangle} clase="bg-coral/15 text-coral" etiqueta="Sin confirmar" valor={String(sinConfirmarSemana.length)} />
        <TarjetaKpi icono={CalendarClock} clase="bg-oro/15 text-oro-oscuro" etiqueta="Esta semana" valor={String(citasSemana.length)} />
        <TarjetaKpi icono={Percent} clase="bg-exito/10 text-exito" etiqueta="Tasa de asistencia" valor={`${tasaAsistencia}%`} />
      </div>

      {rol === 'admin' && (
        <div className="flex flex-wrap items-center gap-2.5">
          <select
            value={asesorFiltro}
            onChange={(e) => setAsesorFiltro(e.target.value)}
            className="rounded-full border border-gris-borde bg-blanco px-3.5 py-1.5 text-xs font-medium text-texto outline-none"
          >
            <option value="todos">Todos los asesores</option>
            {asesoresDemo.map((a) => (
              <option key={a.id} value={a.id}>
                {a.nombre}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => setComparar((v) => !v)}
            className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors ${
              comparar ? 'border-vino-vivo bg-vino-vivo text-blanco' : 'border-gris-borde text-texto-suave hover:text-texto'
            }`}
          >
            Comparar asesores (día)
          </button>
        </div>
      )}

      <div className="flex flex-col gap-4 lg:flex-row">
        <div className="min-w-0 flex-1">
          {vista === 'mes' && !comparar ? (
            <VistaMes
              fechaBase={fechaBase}
              citas={citasFiltradas}
              onSeleccionarDia={(fecha) => {
                setFechaBase(fecha)
                setVista('dia')
              }}
            />
          ) : (
            <RejillaCitas columnas={columnas} todasLasCitas={citasRol} onSoltar={alSoltar} onClickCita={abrirDetalle} />
          )}

          <div className="mt-3 flex flex-wrap gap-3 text-xs text-texto-suave">
            {TIPOS.map((t) => (
              <span key={t} className="flex items-center gap-1.5">
                <span className={`h-2.5 w-2.5 rounded-full ${CLASE_TIPO_CITA[t].punto}`} />
                {ETIQUETA_TIPO_CITA[t]}
              </span>
            ))}
          </div>
        </div>

        <div className="w-full shrink-0 space-y-4 lg:w-[280px]">
          <Tarjeta>
            <h2 className="text-sm font-bold text-texto">Requieren confirmación</h2>
            <p className="mt-0.5 text-xs text-texto-suave">Faltan menos de 24h y siguen sin confirmar.</p>
            {requierenConfirmacion.length === 0 ? (
              <p className="mt-3 text-xs text-texto-suave">No hay pendientes.</p>
            ) : (
              <div className="mt-3 space-y-2.5">
                {requierenConfirmacion.map((c) => (
                  <div key={c.id} className="rounded-xl border border-gris-borde p-2.5">
                    <p className="truncate text-xs font-semibold text-texto">{c.clienteNombre}</p>
                    <p className="text-[11px] text-texto-suave">
                      {etiquetaDiaCita(new Date(c.inicio))} · {etiquetaHoraCita(c.inicio)}
                    </p>
                    <Boton
                      variante={c.confirmacionEnviada ? 'contorno' : 'solido'}
                      className="mt-2 w-full py-1.5 text-[11px]"
                      onClick={() => marcarRecordatorioEnviado(c.id)}
                      disabled={c.confirmacionEnviada}
                    >
                      {c.confirmacionEnviada ? 'Recordatorio enviado' : 'Enviar recordatorio'}
                    </Boton>
                  </div>
                ))}
              </div>
            )}
          </Tarjeta>

          {pendientesDeCierre.length > 0 && (
            <Tarjeta>
              <h2 className="text-sm font-bold text-texto">Pendientes de cierre</h2>
              <p className="mt-0.5 text-xs text-texto-suave">Ya pasó la hora y falta registrar qué pasó.</p>
              <div className="mt-3 space-y-2">
                {pendientesDeCierre.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setCitaCierre(c)}
                    className="block w-full rounded-xl border border-oro/40 bg-oro/5 p-2.5 text-left transition-colors hover:border-oro"
                  >
                    <p className="truncate text-xs font-semibold text-texto">{c.clienteNombre}</p>
                    <p className="text-[11px] text-texto-suave">
                      {etiquetaDiaCita(new Date(c.inicio))} · {etiquetaHoraCita(c.inicio)}
                    </p>
                  </button>
                ))}
              </div>
            </Tarjeta>
          )}
        </div>
      </div>

      {modalNueva && (
        <ModalNuevaCita
          citas={citasRol}
          prellenado={modalNueva}
          onCerrar={() => setModalNueva(null)}
          onGuardar={(cita) => {
            agregarCita(cita)
            setModalNueva(null)
          }}
        />
      )}

      {citaCierre && (
        <ModalCerrarCita cita={citaCierre} onCerrar={() => setCitaCierre(null)} onGuardar={guardarCierre} />
      )}

      {citaDetalle && (
        <Overlay
          onClose={() => {
            setCitaDetalle(null)
            setInteresRegistrado(false)
          }}
        >
          <div className="p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-texto">{ETIQUETA_TIPO_CITA[citaDetalle.tipo]}</h2>
              <button
                type="button"
                onClick={() => {
                  setCitaDetalle(null)
                  setInteresRegistrado(false)
                }}
                aria-label="Cerrar"
                className="text-texto-suave hover:text-texto"
              >
                <X size={18} strokeWidth={2} />
              </button>
            </div>
            <div className="mt-2 flex items-center gap-2.5">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-vino-vivo text-xs font-bold text-blanco">
                {iniciales(citaDetalle.clienteNombre)}
              </span>
              <p className="text-sm font-semibold text-texto">{citaDetalle.clienteNombre}</p>
            </div>
            <p className="mt-2 text-xs text-texto-suave">
              {etiquetaDiaCita(new Date(citaDetalle.inicio))} · {etiquetaHoraCita(citaDetalle.inicio)} ({citaDetalle.duracionMinutos} min)
            </p>
            <p className="mt-1 text-xs text-texto-suave">Asesor: {asesoresDemo.find((a) => a.id === citaDetalle.asesorId)?.nombre}</p>
            {citaDetalle.folio && (
              <p className="mt-1 text-xs text-texto-suave">
                {citaDetalle.folio}
                {propiedadesDemo.find((p) => p.folio === citaDetalle.folio) && ` · ${construirTitulo(propiedadesDemo.find((p) => p.folio === citaDetalle.folio)!)}`}
              </p>
            )}
            <p className="mt-2 text-xs font-semibold text-texto">Estado: {ETIQUETA_ESTADO_CITA[citaDetalle.estado]}</p>
            {citaDetalle.resultado?.nota && <p className="mt-1 text-xs italic text-texto-suave">{citaDetalle.resultado.nota}</p>}

            <div className="mt-4 flex flex-wrap gap-2">
              {citaDetalle.estado === 'agendada' && (
                <Boton variante="contorno" className="text-xs" onClick={() => actualizarEstadoCita(citaDetalle.id, 'confirmada')}>
                  Marcar confirmada
                </Boton>
              )}
              {citaDetalle.estado === 'no_asistio' && (
                <Boton
                  variante="contorno"
                  className="text-xs"
                  onClick={() => {
                    setModalNueva({
                      tipo: citaDetalle.tipo,
                      clienteNombre: citaDetalle.clienteNombre,
                      prospectoVentaId: citaDetalle.prospectoVentaId,
                      folio: citaDetalle.folio,
                      asesorId: citaDetalle.asesorId,
                    })
                    actualizarEstadoCita(citaDetalle.id, 'reagendada')
                    setCitaDetalle(null)
                  }}
                >
                  Reagendar
                </Boton>
              )}
              {citaDetalle.estado === 'asistio' && citaDetalle.prospectoVentaId && !interesRegistrado && (
                <Boton variante="solido" className="text-xs" onClick={() => registrarInteres(citaDetalle)}>
                  Registrar interés
                </Boton>
              )}
              {interesRegistrado && <p className="text-xs font-semibold text-exito">Prospecto avanzado a {prospectoDetalle ? ETIQUETA_ESTADO_CITA.asistio : ''} ✓</p>}
            </div>
          </div>
        </Overlay>
      )}

      {confirmarMover && (
        <Overlay onClose={() => setConfirmarMover(null)}>
          <div className="p-5">
            <h2 className="text-base font-bold text-texto">¿Mover esta cita?</h2>
            <p className="mt-2 text-sm text-texto">
              {confirmarMover.cita.clienteNombre} → {etiquetaDiaCita(confirmarMover.nuevoInicio)} · {etiquetaHoraCita(confirmarMover.nuevoInicio.toISOString())}
            </p>
            {confirmarMover.conflictos.length > 0 && (
              <p className="mt-2 text-xs font-semibold text-alerta">
                ⚠ {asesoresDemo.find((a) => a.id === confirmarMover.cita.asesorId)?.nombre} ya tiene una cita con {confirmarMover.conflictos[0].clienteNombre} a las{' '}
                {etiquetaHoraCita(confirmarMover.conflictos[0].inicio)}
                {confirmarMover.conflictos[0].colonia ? ` en ${confirmarMover.conflictos[0].colonia}` : ''}.
              </p>
            )}
            <div className="mt-5 flex justify-end gap-2.5">
              <Boton variante="contorno" onClick={() => setConfirmarMover(null)}>
                Cancelar
              </Boton>
              <Boton variante="solido" onClick={confirmarCambio}>
                Mover de todos modos
              </Boton>
            </div>
          </div>
        </Overlay>
      )}
    </div>
  )
}
