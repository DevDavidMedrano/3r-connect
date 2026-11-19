import { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  ArrowLeft,
  CalendarPlus,
  CheckCheck,
  Clock,
  FileText,
  Info,
  MapPin,
  MoreVertical,
  Paperclip,
  Phone,
  Plus,
  Search,
  Send,
  UserCog,
  X,
} from 'lucide-react'
import { Boton, Chip } from '../../components/cliente/Piezas'
import { useDatosAdmin } from '../../components/admin/useDatosAdmin'
import { AvatarAsesor } from '../../components/asesores/AvatarAsesor'
import { asesoresDemo } from '../../data/asesoresDemo'
import { OPCIONES_COLONIA } from '../../data/colonias'
import { propiedadesDemo } from '../../data/propiedadesDemo'
import { construirTitulo, formatearPrecio, resumenAtributos } from '../../types/propiedad'
import {
  ETIQUETA_ETAPA_VENTA,
  ETIQUETA_ORIGEN_VENTA,
  type EtapaProspectoVenta,
  type ProspectoVenta,
} from '../../types/prospectoVenta'
import {
  etiquetaHora,
  etiquetaVentana,
  sinResponder,
  ultimoMensaje,
  ventanaPorVencer,
  ventanaWhatsapp,
  type ConversacionInbox,
} from '../../types/conversacion'

// Colores propios de WhatsApp, a propósito NO tokens de 3R — mismo criterio
// que WhatsAppModal.tsx del portal: se está imitando la interfaz de un
// tercero, no la marca de 3R Connect.
const VERDE_BURBUJA_ASESOR = '#dcf8c6'
const AZUL_PALOMITA = '#34b7f1'
const VERDE_CONECTADO = '#25d366'

const ETIQUETA_COLONIA_LOOKUP = Object.fromEntries(OPCIONES_COLONIA.map((c) => [c.valor, c.etiqueta]))

const ETAPAS: EtapaProspectoVenta[] = ['nuevo', 'calificado', 'mostrando', 'negociacion', 'cerrado']

type FiltroLista = 'todas' | 'mias' | 'sin_asignar' | 'sin_responder' | 'por_vencer'

function iniciales(nombre: string): string {
  const partes = nombre.trim().split(/\s+/)
  return `${partes[0][0]}${partes[partes.length - 1][0]}`.toUpperCase()
}

interface Fila {
  conversacion: ConversacionInbox
  prospecto: ProspectoVenta
}

function ChipFiltro({ activo, etiqueta, conteo, onClick }: { activo: boolean; etiqueta: string; conteo: number; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
        activo ? 'bg-vino-vivo text-blanco' : 'bg-marfil text-texto-suave hover:text-texto'
      }`}
    >
      {etiqueta}
      <span className={`rounded-full px-1.5 text-[10px] ${activo ? 'bg-blanco/20' : 'bg-gris-borde'}`}>{conteo}</span>
    </button>
  )
}

function FilaConversacion({
  fila,
  activa,
  mostrarAsesor,
  onClick,
}: {
  fila: Fila
  activa: boolean
  mostrarAsesor: boolean
  onClick: () => void
}) {
  const { conversacion, prospecto } = fila
  const ultimo = ultimoMensaje(conversacion)
  const preview = !ultimo ? '' : ultimo.tipo === 'propiedad' ? '📷 Propiedad compartida' : (ultimo.texto ?? '')
  const asesor = asesoresDemo.find((a) => a.id === prospecto.asesorId)
  const porVencer = ventanaPorVencer(conversacion.ventanaExpiraEn)

  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-start gap-2.5 border-b border-gris-borde px-3.5 py-3 text-left transition-colors ${
        activa ? 'bg-vino-vivo/5' : 'hover:bg-marfil'
      }`}
    >
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-vino-vivo text-xs font-bold text-blanco">
        {iniciales(prospecto.nombre)}
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <p className="truncate text-sm font-semibold text-texto">{prospecto.nombre}</p>
          {ultimo && <span className="shrink-0 text-[10.5px] text-texto-suave">{etiquetaHora(ultimo.hora)}</span>}
        </div>
        <p className="mt-0.5 truncate text-xs text-texto-suave">{preview}</p>

        <div className="mt-1.5 flex flex-wrap items-center gap-1">
          <Chip variante="espera" className="px-2 py-0.5 text-[10px]">
            {ETIQUETA_ORIGEN_VENTA[prospecto.origen]}
          </Chip>
          {!prospecto.asesorId && (
            <Chip variante="espera" className="px-2 py-0.5 text-[10px]">
              Sin asignar
            </Chip>
          )}
          {porVencer && (
            <span className="flex items-center gap-1 rounded-full bg-coral/15 px-2 py-0.5 text-[10px] font-semibold text-coral">
              <Clock size={10} strokeWidth={2.5} />
              {etiquetaVentana(ventanaWhatsapp(conversacion.ventanaExpiraEn))}
            </span>
          )}
          {mostrarAsesor && asesor && <span className="text-[10px] text-texto-suave">· {asesor.nombre}</span>}
          {conversacion.noLeidos > 0 && (
            <span className="ml-auto flex h-4 min-w-4 shrink-0 items-center justify-center rounded-full bg-exito px-1 text-[10px] font-bold text-blanco">
              {conversacion.noLeidos}
            </span>
          )}
        </div>
      </div>
    </button>
  )
}

function BurbujaMensaje({ mensaje }: { mensaje: ConversacionInbox['mensajes'][number] }) {
  const esAsesor = mensaje.de === 'asesor'

  if (mensaje.tipo === 'propiedad' && mensaje.folioPropiedad) {
    const propiedad = propiedadesDemo.find((p) => p.folio === mensaje.folioPropiedad)
    if (!propiedad) return null
    const foto = propiedad.medios.find((m) => !m.url.startsWith('/media/'))
    return (
      <div className={`flex ${esAsesor ? 'justify-end' : 'justify-start'}`}>
        <div className="max-w-[75%] overflow-hidden rounded-2xl border border-gris-borde bg-blanco shadow-sm">
          {foto && <img src={foto.url} alt={foto.alt} className="h-28 w-full object-cover" />}
          <div className="p-2.5">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-texto-suave">{propiedad.folio}</p>
            <p className="truncate text-sm font-bold text-texto">{construirTitulo(propiedad)}</p>
            <p className="text-xs text-texto-suave">{formatearPrecio(propiedad.listados[0].precio)}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`flex ${esAsesor ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[75%] rounded-2xl px-3 py-2 text-sm shadow-sm ${esAsesor ? 'rounded-tr-sm text-texto' : 'rounded-tl-sm bg-marfil text-texto'}`}
        style={esAsesor ? { backgroundColor: VERDE_BURBUJA_ASESOR } : undefined}
      >
        <p className="whitespace-pre-wrap">{mensaje.texto}</p>
        <div className={`mt-1 flex items-center justify-end gap-1 text-[10px] ${esAsesor ? 'text-texto/50' : 'text-texto-suave'}`}>
          {etiquetaHora(mensaje.hora)}
          {esAsesor && <CheckCheck size={13} strokeWidth={2} style={{ color: AZUL_PALOMITA }} />}
        </div>
      </div>
    </div>
  )
}

export default function InboxAdminPage() {
  const {
    rol,
    asesor,
    prospectosVenta,
    conversaciones,
    enviarMensajeInbox,
    marcarConversacionLeida,
    actualizarEtapaProspectoVenta,
    asignarAsesorProspectoVenta,
    agregarCita,
  } = useDatosAdmin()

  const miAsesorId = asesor.id

  const [busqueda, setBusqueda] = useState('')
  const [filtro, setFiltro] = useState<FiltroLista>(rol === 'asesor' ? 'mias' : 'todas')
  const [filtroAsesorId, setFiltroAsesorId] = useState<string>('todos')
  const [seleccionadaId, setSeleccionadaId] = useState<string | null>(conversaciones[0]?.id ?? null)
  const [borrador, setBorrador] = useState('')
  const [visitaConfirmada, setVisitaConfirmada] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  // Solo importa en móvil (<sm): cuál de las dos vistas se muestra — la
  // lista o el hilo, nunca las dos a la vez ahí. De tablet en adelante el
  // CSS ignora este estado y muestra ambas columnas siempre.
  const [vistaMovil, setVistaMovil] = useState<'lista' | 'hilo'>('lista')
  // El panel de datos del lead es la 3a columna fija desde escritorio
  // (lg+); antes de eso se abre como hoja deslizante desde un botón.
  const [panelLeadAbierto, setPanelLeadAbierto] = useState(false)

  const filas: Fila[] = useMemo(
    () =>
      conversaciones
        .map((conversacion) => {
          const prospecto = prospectosVenta.find((p) => p.id === conversacion.prospectoVentaId)
          return prospecto ? { conversacion, prospecto } : null
        })
        .filter((f): f is Fila => f !== null),
    [conversaciones, prospectosVenta],
  )

  // ASESOR: solo ve las suyas y las sin asignar. ADMIN: ve todas, y puede
  // acotar por asesor con el selector de arriba.
  const visibles = useMemo(() => {
    const porRol =
      rol === 'admin' ? filas : filas.filter((f) => f.prospecto.asesorId === miAsesorId || f.prospecto.asesorId === null)
    if (rol === 'admin' && filtroAsesorId !== 'todos') {
      return porRol.filter((f) => f.prospecto.asesorId === filtroAsesorId)
    }
    return porRol
  }, [filas, rol, miAsesorId, filtroAsesorId])

  const conteos = {
    todas: visibles.length,
    mias: visibles.filter((f) => f.prospecto.asesorId === miAsesorId).length,
    sin_asignar: visibles.filter((f) => !f.prospecto.asesorId).length,
    sin_responder: visibles.filter((f) => sinResponder(f.conversacion)).length,
    por_vencer: visibles.filter((f) => ventanaPorVencer(f.conversacion.ventanaExpiraEn)).length,
  }

  const filtradas = useMemo(() => {
    let lista = visibles
    if (filtro === 'mias') lista = lista.filter((f) => f.prospecto.asesorId === miAsesorId)
    else if (filtro === 'sin_asignar') lista = lista.filter((f) => !f.prospecto.asesorId)
    else if (filtro === 'sin_responder') lista = lista.filter((f) => sinResponder(f.conversacion))
    else if (filtro === 'por_vencer') lista = lista.filter((f) => ventanaPorVencer(f.conversacion.ventanaExpiraEn))

    const objetivo = busqueda.trim().toLowerCase()
    if (objetivo) lista = lista.filter((f) => f.prospecto.nombre.toLowerCase().includes(objetivo))

    return [...lista].sort((a, b) => {
      const horaA = ultimoMensaje(a.conversacion)?.hora ?? ''
      const horaB = ultimoMensaje(b.conversacion)?.hora ?? ''
      return horaB.localeCompare(horaA)
    })
  }, [visibles, filtro, busqueda, miAsesorId])

  const seleccionada = filas.find((f) => f.conversacion.id === seleccionadaId) ?? null

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight })
  }, [seleccionadaId, seleccionada?.conversacion.mensajes.length])

  useEffect(() => {
    if (seleccionadaId) marcarConversacionLeida(seleccionadaId)
    setVisitaConfirmada(false)
  }, [seleccionadaId, marcarConversacionLeida])

  // Admin puede leer cualquier hilo, pero solo escribe en el suyo — nunca
  // suplanta a otro asesor. Un asesor siempre escribe en lo que ya puede
  // ver (mías + sin asignar).
  const esSoloLectura = rol === 'admin' && seleccionada !== null && seleccionada.prospecto.asesorId !== miAsesorId

  function enviar() {
    if (!seleccionada || !borrador.trim() || esSoloLectura) return
    enviarMensajeInbox(seleccionada.conversacion.id, borrador.trim())
    setBorrador('')
  }

  function agendarVisita() {
    if (!seleccionada) return
    const enUnaSemana = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    enUnaSemana.setHours(12, 0, 0, 0)
    const propiedad = propiedadesDemo.find((p) => p.folio === seleccionada.conversacion.folioAnuncio)
    agregarCita({
      id: `cita-inbox-${Date.now()}`,
      tipo: 'visita',
      clienteNombre: seleccionada.prospecto.nombre,
      prospectoVentaId: seleccionada.prospecto.id,
      folio: seleccionada.conversacion.folioAnuncio,
      colonia: propiedad ? propiedad.ubicacion.colonia : null,
      asesorId: seleccionada.prospecto.asesorId ?? miAsesorId,
      inicio: enUnaSemana.toISOString(),
      duracionMinutos: 45,
      estado: 'agendada',
      confirmacionEnviada: false,
      notas: 'Agendada desde el Inbox.',
      resultado: null,
    })
    setVisitaConfirmada(true)
  }

  const propiedadesEnviadas = useMemo(() => {
    if (!seleccionada) return []
    const folios = [
      ...new Set(
        seleccionada.conversacion.mensajes.filter((m) => m.tipo === 'propiedad' && m.folioPropiedad).map((m) => m.folioPropiedad!),
      ),
    ]
    return folios.map((folio) => propiedadesDemo.find((p) => p.folio === folio)).filter((p): p is NonNullable<typeof p> => !!p)
  }, [seleccionada])

  // Mismo contenido para la columna fija de escritorio y para la hoja
  // deslizante de tablet/móvil — nunca dos copias del panel del lead.
  const panelLeadContenido = !seleccionada ? (
    <p className="text-xs text-texto-suave">Selecciona una conversación para ver sus datos.</p>
  ) : (
    <div className="space-y-4">
      {esSoloLectura && (
        <Boton
          variante="contorno"
          className="w-full text-xs"
          onClick={() => asignarAsesorProspectoVenta(seleccionada.prospecto.id, miAsesorId)}
        >
          <UserCog size={14} strokeWidth={2} />
          Reasignar a mí
        </Boton>
      )}

      <div>
        <p className="text-[10.5px] font-semibold uppercase tracking-wide text-texto-suave">Etapa del embudo</p>
        <select
          value={seleccionada.prospecto.etapa}
          onChange={(evento) =>
            actualizarEtapaProspectoVenta(
              seleccionada.prospecto.id,
              evento.target.value as EtapaProspectoVenta,
              evento.target.value === 'cerrado' ? new Date().toISOString().slice(0, 10) : null,
            )
          }
          className="mt-1.5 w-full rounded-3r-md border border-gris-borde px-3 py-2 text-sm text-texto outline-none focus:border-vino-vivo"
        >
          {ETAPAS.map((etapa) => (
            <option key={etapa} value={etapa}>
              {ETIQUETA_ETAPA_VENTA[etapa]}
            </option>
          ))}
        </select>
      </div>

      <div>
        <p className="text-[10.5px] font-semibold uppercase tracking-wide text-texto-suave">Asesor asignado</p>
        {(() => {
          const asesorAsignado = asesoresDemo.find((a) => a.id === seleccionada.prospecto.asesorId)
          return asesorAsignado ? (
            <div className="mt-1.5 flex items-center gap-2">
              <AvatarAsesor asesor={asesorAsignado} className="h-7 w-7 text-[11px]" />
              <p className="text-sm font-semibold text-texto">{asesorAsignado.nombre}</p>
            </div>
          ) : (
            <p className="mt-1.5 text-sm text-texto-suave">Sin asignar</p>
          )
        })()}
      </div>

      <div>
        <p className="text-[10.5px] font-semibold uppercase tracking-wide text-texto-suave">Qué busca</p>
        <div className="mt-1.5 space-y-1 text-sm text-texto">
          <p>
            {formatearPrecio({ monto: seleccionada.prospecto.presupuestoMin, moneda: seleccionada.prospecto.moneda })} –{' '}
            {formatearPrecio({ monto: seleccionada.prospecto.presupuestoMax, moneda: seleccionada.prospecto.moneda })}
          </p>
          <p className="text-texto-suave">
            {seleccionada.prospecto.zonas.length > 0
              ? seleccionada.prospecto.zonas.map((z) => ETIQUETA_COLONIA_LOOKUP[z] ?? z).join(', ')
              : 'Cualquier zona'}
            {seleccionada.prospecto.recamarasMin ? ` · ${seleccionada.prospecto.recamarasMin}+ rec.` : ''}
          </p>
          <p className="text-texto-suave">Origen: {ETIQUETA_ORIGEN_VENTA[seleccionada.prospecto.origen]}</p>
        </div>
      </div>

      <Boton variante="solido" className="w-full text-sm" onClick={agendarVisita} disabled={visitaConfirmada}>
        <CalendarPlus size={15} strokeWidth={2} />
        {visitaConfirmada ? 'Visita agendada' : 'Agendar visita'}
      </Boton>

      <div>
        <p className="text-[10.5px] font-semibold uppercase tracking-wide text-texto-suave">Propiedades enviadas</p>
        {propiedadesEnviadas.length === 0 ? (
          <p className="mt-1.5 text-xs text-texto-suave">Todavía no se ha compartido ninguna.</p>
        ) : (
          <div className="mt-1.5 space-y-2">
            {propiedadesEnviadas.map((propiedad) => (
              <div key={propiedad.folio} className="rounded-xl border border-gris-borde p-2.5">
                <p className="text-[10.5px] font-semibold uppercase tracking-wide text-texto-suave">{propiedad.folio}</p>
                <p className="truncate text-xs font-bold text-texto">{construirTitulo(propiedad)}</p>
                <p className="mt-0.5 flex items-center gap-1 truncate text-[11px] text-texto-suave">
                  <MapPin size={10} strokeWidth={2} className="shrink-0" />
                  {propiedad.ubicacion.colonia}
                </p>
                <p className="mt-0.5 text-[11px] text-texto-suave">
                  {formatearPrecio(propiedad.listados[0].precio)} · {resumenAtributos(propiedad).join(' · ')}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )

  return (
    <div className="flex h-[calc(100vh-160px)] min-h-[560px] flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="font-serif text-2xl font-bold text-texto">Inbox</h1>
        <span className="flex items-center gap-1.5 rounded-full border border-gris-borde bg-blanco px-3 py-1 text-xs font-medium text-texto-suave">
          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: VERDE_CONECTADO }} />
          +52 55 4321 0099 · Conectado
        </span>

        <div className="ml-auto flex items-center gap-2">
          <Boton variante="contorno" className="text-sm">
            <FileText size={15} strokeWidth={2} />
            Plantillas
          </Boton>
          <Boton variante="solido" className="text-sm">
            <Plus size={15} strokeWidth={2.5} />
            Nueva conversación
          </Boton>
        </div>
      </div>

      <div className="flex min-h-0 flex-1 gap-4">
        {/* Columna izquierda — lista. En móvil ocupa toda la pantalla y se
            oculta en cuanto se elige una conversación (ver vistaMovil). */}
        <div
          className={`${vistaMovil === 'hilo' ? 'hidden' : 'flex'} w-full shrink-0 flex-col overflow-hidden rounded-2xl border border-gris-borde bg-blanco sm:flex sm:w-[300px]`}
        >
          <div className="shrink-0 space-y-2.5 border-b border-gris-borde p-3">
            <div className="flex items-center gap-2 rounded-full border border-gris-borde bg-marfil px-3 py-2">
              <Search size={14} strokeWidth={2} className="shrink-0 text-texto-suave" />
              <input
                type="text"
                value={busqueda}
                onChange={(evento) => setBusqueda(evento.target.value)}
                placeholder="Buscar contacto"
                className="w-full min-w-0 bg-transparent text-sm text-texto outline-none placeholder:text-texto-suave"
              />
            </div>

            {rol === 'admin' && (
              <select
                value={filtroAsesorId}
                onChange={(evento) => setFiltroAsesorId(evento.target.value)}
                className="w-full cursor-pointer rounded-full border border-gris-borde bg-blanco px-3 py-1.5 text-xs font-medium text-texto outline-none"
              >
                <option value="todos">Todos los asesores</option>
                {asesoresDemo.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.nombre}
                  </option>
                ))}
              </select>
            )}

            <div className="flex flex-wrap gap-1.5">
              <ChipFiltro activo={filtro === 'todas'} etiqueta="Todas" conteo={conteos.todas} onClick={() => setFiltro('todas')} />
              <ChipFiltro activo={filtro === 'mias'} etiqueta="Mías" conteo={conteos.mias} onClick={() => setFiltro('mias')} />
              <ChipFiltro
                activo={filtro === 'sin_asignar'}
                etiqueta="Sin asignar"
                conteo={conteos.sin_asignar}
                onClick={() => setFiltro('sin_asignar')}
              />
              <ChipFiltro
                activo={filtro === 'sin_responder'}
                etiqueta="Sin responder"
                conteo={conteos.sin_responder}
                onClick={() => setFiltro('sin_responder')}
              />
              <ChipFiltro
                activo={filtro === 'por_vencer'}
                etiqueta="Por vencer"
                conteo={conteos.por_vencer}
                onClick={() => setFiltro('por_vencer')}
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {filtradas.length === 0 ? (
              <p className="px-4 py-8 text-center text-xs text-texto-suave">Ninguna conversación coincide.</p>
            ) : (
              filtradas.map((fila) => (
                <FilaConversacion
                  key={fila.conversacion.id}
                  fila={fila}
                  activa={fila.conversacion.id === seleccionadaId}
                  mostrarAsesor={rol === 'admin'}
                  onClick={() => {
                    setSeleccionadaId(fila.conversacion.id)
                    setVistaMovil('hilo')
                  }}
                />
              ))
            )}
          </div>
        </div>

        {/* Columna central — hilo. En móvil solo se muestra tras elegir una
            conversación; el botón de regreso vuelve a la lista. */}
        <div
          className={`${vistaMovil === 'lista' ? 'hidden' : 'flex'} min-w-0 flex-1 flex-col overflow-hidden rounded-2xl border border-gris-borde bg-blanco sm:flex`}
        >
          {!seleccionada ? (
            <div className="flex flex-1 items-center justify-center text-sm text-texto-suave">Selecciona una conversación.</div>
          ) : (
            <>
              <div className="flex shrink-0 items-center gap-3 border-b border-gris-borde px-4 py-3">
                <button
                  type="button"
                  aria-label="Volver a la lista"
                  onClick={() => setVistaMovil('lista')}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-texto-suave hover:bg-marfil sm:hidden"
                >
                  <ArrowLeft size={18} strokeWidth={2} />
                </button>
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-vino-vivo text-xs font-bold text-blanco">
                  {iniciales(seleccionada.prospecto.nombre)}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-texto">{seleccionada.prospecto.nombre}</p>
                  <p className="truncate text-xs text-texto-suave">{seleccionada.prospecto.telefono}</p>
                </div>

                <span className="hidden shrink-0 items-center gap-1 rounded-full bg-exito/10 px-2.5 py-1 text-[11px] font-semibold text-exito sm:flex">
                  <Clock size={12} strokeWidth={2.5} />
                  {etiquetaVentana(ventanaWhatsapp(seleccionada.conversacion.ventanaExpiraEn))}
                </span>

                <a
                  href={`tel:${seleccionada.prospecto.telefono.replace(/\s+/g, '')}`}
                  aria-label="Llamar"
                  className="hidden h-8 w-8 shrink-0 items-center justify-center rounded-full text-texto-suave transition-colors hover:bg-marfil hover:text-texto sm:flex"
                >
                  <Phone size={16} strokeWidth={2} />
                </a>
                <button
                  type="button"
                  aria-label="Datos del lead"
                  onClick={() => setPanelLeadAbierto(true)}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-texto-suave transition-colors hover:bg-marfil hover:text-texto lg:hidden"
                >
                  <Info size={17} strokeWidth={2} />
                </button>
                <button
                  type="button"
                  aria-label="Más opciones"
                  className="hidden h-8 w-8 shrink-0 items-center justify-center rounded-full text-texto-suave transition-colors hover:bg-marfil hover:text-texto sm:flex"
                >
                  <MoreVertical size={16} strokeWidth={2} />
                </button>
              </div>

              <div ref={scrollRef} className="flex-1 space-y-2.5 overflow-y-auto bg-marfil/40 px-4 py-4">
                <div className="flex justify-center py-1">
                  <p className="rounded-full bg-gris-borde px-3.5 py-1.5 text-center text-[11px] text-texto-suave">
                    Lead recibido desde {ETIQUETA_ORIGEN_VENTA[seleccionada.prospecto.origen]} · anuncio {seleccionada.conversacion.folioAnuncio}
                  </p>
                </div>
                {seleccionada.conversacion.mensajes.map((mensaje) => (
                  <BurbujaMensaje key={mensaje.id} mensaje={mensaje} />
                ))}
              </div>

              <div className="shrink-0 border-t border-gris-borde p-3">
                {esSoloLectura ? (
                  <p className="rounded-3r-md bg-marfil px-3.5 py-2.5 text-center text-xs font-medium text-texto-suave">
                    Vista de supervisión — solo lectura
                  </p>
                ) : (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      aria-label="Adjuntar"
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-texto-suave transition-colors hover:bg-marfil hover:text-texto"
                    >
                      <Paperclip size={16} strokeWidth={2} />
                    </button>
                    <button
                      type="button"
                      aria-label="Plantillas"
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-texto-suave transition-colors hover:bg-marfil hover:text-texto"
                    >
                      <FileText size={16} strokeWidth={2} />
                    </button>
                    <input
                      type="text"
                      value={borrador}
                      onChange={(evento) => setBorrador(evento.target.value)}
                      onKeyDown={(evento) => evento.key === 'Enter' && enviar()}
                      placeholder="Escribe un mensaje"
                      className="min-w-0 flex-1 rounded-full border border-gris-borde bg-marfil px-4 py-2 text-sm text-texto outline-none placeholder:text-texto-suave"
                    />
                    <button
                      type="button"
                      onClick={enviar}
                      disabled={!borrador.trim()}
                      aria-label="Enviar"
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-vino-vivo text-blanco transition-opacity disabled:opacity-50"
                    >
                      <Send size={15} strokeWidth={2} />
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Columna derecha — panel del lead, fija desde escritorio (lg+).
            De tablet para abajo se abre como hoja deslizante (ver más
            abajo) desde el botón de info del hilo. */}
        <div className="hidden w-[280px] shrink-0 overflow-y-auto rounded-2xl border border-gris-borde bg-blanco p-4 lg:block">{panelLeadContenido}</div>
      </div>

      <AnimatePresence>
        {panelLeadAbierto && (
          <>
            <motion.div
              className="fixed inset-0 z-50 bg-black/50 lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setPanelLeadAbierto(false)}
            />
            <motion.div
              className="fixed inset-x-0 bottom-0 z-50 max-h-[85vh] overflow-y-auto rounded-t-3xl bg-blanco p-4 lg:hidden"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'tween', duration: 0.22, ease: 'easeOut' }}
            >
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-base font-bold text-texto">Datos del lead</h2>
                <button
                  type="button"
                  aria-label="Cerrar"
                  onClick={() => setPanelLeadAbierto(false)}
                  className="flex h-9 w-9 items-center justify-center rounded-full text-texto-suave hover:bg-marfil"
                >
                  <X size={18} strokeWidth={2} />
                </button>
              </div>
              {panelLeadContenido}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
