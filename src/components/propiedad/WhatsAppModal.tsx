import { useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { CheckCheck, Send, X } from 'lucide-react'
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion'
import { actualizarCalificacion, CALIFICACION_VACIA, type CalificacionLead } from '../../lib/calificacionLead'
import { MARCADOR_PROPONER_VISITA, type ContextoUsuarioAgente } from '../../lib/agenteContexto'
import { respuestaDeRespaldo } from '../../lib/agenteGuionRespaldo'
import { generarHorariosDisponibles, type HorarioDisponible } from '../../lib/horariosDisponibles'
import { pedirRespuestaAgente, type TurnoConversacion } from '../../lib/agenteOpenAI'
import type { Asesor } from '../../types/asesor'
import type { MensajeChat, VisitaAgendada } from '../../types/chatAgente'
import { construirTitulo, type Propiedad } from '../../types/propiedad'
import { useSesion } from '../cuenta/SesionContext'
import { PanelLeadCRM } from './PanelLeadCRM'
import { AvatarAsesor } from '../asesores/AvatarAsesor'

// Colores propios de WhatsApp, a propósito NO tokens de 3R: este modal
// simula la interfaz de un tercero, no la marca de 3R Connect.
const VERDE_ENCABEZADO = '#075e54'
const VERDE_BURBUJA_USUARIO = '#dcf8c6'
const VERDE_ENVIAR = '#25d366'
const AZUL_PALOMITA = '#34b7f1'
const BEIGE_FONDO = '#e5ddd5'

const PATRON_FONDO = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
  <svg xmlns="http://www.w3.org/2000/svg" width="84" height="84">
    <g fill="none" stroke="#00000012" stroke-width="1">
      <circle cx="14" cy="14" r="3"/>
      <path d="M40 10 l6 6 -6 6 -6 -6 Z"/>
      <circle cx="66" cy="30" r="2.5"/>
      <path d="M20 50 q8 -10 16 0 q8 10 16 0"/>
      <circle cx="70" cy="66" r="3"/>
    </g>
  </svg>
`)}`

const TURNOS_MINIMOS_PARA_OFRECER_CITA = 4
const TURNO_PARA_PRESENTAR_ASESOR = 2
const REGEX_FOLIO = /3R-[A-Za-z0-9-]+/g

function esperar(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function horaActual(): string {
  return new Intl.DateTimeFormat('es-MX', { hour: 'numeric', minute: '2-digit' }).format(new Date())
}

function construirHistorialModelo(lista: MensajeChat[]): TurnoConversacion[] {
  const turnos: TurnoConversacion[] = []
  for (const mensaje of lista) {
    if (mensaje.de === 'usuario') turnos.push({ rol: 'user', contenido: mensaje.texto })
    else if (mensaje.de === 'agente') turnos.push({ rol: 'assistant', contenido: mensaje.texto })
  }
  return turnos
}

function TarjetaVisitaAgendada({ visita }: { visita: VisitaAgendada }) {
  return (
    <div className="flex justify-center py-1">
      <div className="max-w-[85%] rounded-xl border border-vino-vivo/30 bg-blanco px-4 py-3 text-center shadow-sm">
        <p className="text-[11px] font-bold uppercase tracking-wide text-vino-vivo">Visita agendada</p>
        <p className="mt-1 text-sm font-semibold text-texto">{visita.propiedadTitulo}</p>
        <p className="text-xs text-texto-suave">
          {visita.folio} · {visita.horarioEtiqueta}
        </p>
        <p className="mt-1 text-xs text-texto-suave">Con {visita.asesorNombre}</p>
      </div>
    </div>
  )
}

function TarjetaProspectoCalificado({
  asesorNombre,
  calificacion,
  citaAgendada,
}: {
  asesorNombre: string
  calificacion: CalificacionLead
  citaAgendada: boolean
}) {
  return (
    <div className="flex justify-center py-1">
      <div className="max-w-[85%] rounded-xl border border-exito/30 bg-blanco px-4 py-3 text-center shadow-sm">
        <p className="text-[11px] font-bold uppercase tracking-wide text-exito">
          Prospecto calificado y enviado a {asesorNombre}
        </p>
        <p className="mt-1 text-xs text-texto-suave">
          {calificacion.presupuesto ?? 'Presupuesto por confirmar'} · {calificacion.zona ?? 'Zona por confirmar'} ·{' '}
          {calificacion.operacion ?? 'Operación por confirmar'} · {citaAgendada ? 'Visita agendada' : 'Visita por agendar'}
        </p>
        <p className="mt-1.5 text-xs text-texto-suave">{asesorNombre} te escribe en las próximas 2 horas.</p>
      </div>
    </div>
  )
}

function TarjetaAsesorContacto({ asesor }: { asesor: Asesor }) {
  const anios = new Date().getFullYear() - asesor.asesorDesde
  return (
    <div className="flex justify-center py-1">
      <div className="flex max-w-[85%] items-center gap-3 rounded-xl border border-gris-borde bg-blanco px-4 py-3 shadow-sm">
        <AvatarAsesor asesor={asesor} className="h-10 w-10 text-sm" />
        <div className="text-left">
          <p className="text-sm font-semibold text-texto">{asesor.nombre}</p>
          <p className="text-xs text-texto-suave">
            {anios} años en 3R · {asesor.operacionesCerradas} operaciones cerradas
          </p>
        </div>
      </div>
    </div>
  )
}

interface WhatsAppModalProps {
  propiedad: Propiedad
  asesor: Asesor
  onClose: () => void
}

export function WhatsAppModal({ propiedad, asesor, onClose }: WhatsAppModalProps) {
  const { usuario, preferencias, propiedadesGuardadas, agregarCita, registrarProspectoDesdeAgente } = useSesion()
  const prefiereReducido = usePrefersReducedMotion()
  const horarios = useMemo(() => generarHorariosDisponibles(), [])

  const contextoUsuario: ContextoUsuarioAgente = useMemo(
    () => ({
      nombre: usuario ? usuario.nombre.split(' ')[0] : null,
      presupuesto: preferencias?.presupuesto || null,
      zonas: preferencias?.zonas ?? [],
      operacion: preferencias?.operacion
        ? { comprar: 'Compra', rentar: 'Renta', invertir: 'Inversión' }[preferencias.operacion]
        : null,
      propiedadesGuardadas,
    }),
    [usuario, preferencias, propiedadesGuardadas],
  )

  function calificacionInicial(): CalificacionLead {
    if (!preferencias) return CALIFICACION_VACIA
    return {
      presupuesto: preferencias.presupuesto || null,
      zona: preferencias.zonas[0] ?? null,
      operacion: preferencias.operacion === 'rentar' ? 'Renta' : preferencias.operacion ? 'Compra' : null,
      recamaras: null,
      credito: false,
    }
  }

  const idRef = useRef(0)
  const turnosAgenteRef = useRef(0)
  const asesorPresentadoRef = useRef(false)
  const yaInicioRef = useRef(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  function nuevoId(): string {
    idRef.current += 1
    return `m${idRef.current}`
  }

  const [mensajes, setMensajes] = useState<MensajeChat[]>(() => [
    {
      id: 'inicial',
      de: 'usuario',
      tipo: 'texto',
      texto: `Hola, me interesa la propiedad ${propiedad.folio} en ${propiedad.ubicacion.colonia}. ¿Me pueden dar más información?`,
      hora: horaActual(),
    },
  ])
  const [escribiendo, setEscribiendo] = useState(false)
  const [entrada, setEntrada] = useState('')
  const [calificacion, setCalificacion] = useState<CalificacionLead>(calificacionInicial)
  const [calificado, setCalificado] = useState(false)
  const [citaOfrecida, setCitaOfrecida] = useState(false)
  const [citaAgendadaId, setCitaAgendadaId] = useState<string | null>(null)
  const [propiedadesEnviadas, setPropiedadesEnviadas] = useState<string[]>([propiedad.folio])

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [mensajes, escribiendo])

  function marcarComoCalificadoSiAplica(candidata: CalificacionLead) {
    if (calificado) return false
    if (candidata.presupuesto && candidata.zona) {
      setCalificado(true)
      // Mismo lead que llega al asesor (ver PanelLeadCRM) también entra a
      // Prospectos de Venta en 'calificado', origen 'Agente IA' — reusa la
      // misma CalificacionLead, sin volver a preguntarle nada al usuario.
      registrarProspectoDesdeAgente(candidata, {
        asesorId: asesor.id,
        tipoPropiedad: propiedad.tipo,
        nombreContacto: contextoUsuario.nombre ?? 'Prospecto de WhatsApp',
        correoContacto: usuario?.correo ?? 'sin-correo@whatsapp.3rconnect.mx',
        telefonoContacto: 'Contacto por WhatsApp',
      })
      return true
    }
    return false
  }

  function evaluarCalificacion(texto: string) {
    setCalificacion((actual) => {
      const siguiente = actualizarCalificacion(actual, texto)
      if (marcarComoCalificadoSiAplica(siguiente)) {
        setMensajes((prev) => [
          ...prev,
          { id: nuevoId(), de: 'sistema', tipo: 'tarjeta-calificado', asesorNombre: asesor.nombre, hora: horaActual() },
        ])
      }
      return siguiente
    })
  }

  function registrarFoliosMencionados(texto: string) {
    const encontrados = texto.match(REGEX_FOLIO)
    if (!encontrados) return
    setPropiedadesEnviadas((actual) => {
      const nuevos = encontrados.filter((folio) => !actual.includes(folio))
      return nuevos.length ? [...actual, ...nuevos] : actual
    })
  }

  async function generarRespuesta(mensajesActuales: MensajeChat[]) {
    setEscribiendo(true)

    async function obtenerTexto(): Promise<string> {
      try {
        return await pedirRespuestaAgente(construirHistorialModelo(mensajesActuales), propiedad, asesor, contextoUsuario)
      } catch {
        const ultimoUsuario = [...mensajesActuales].reverse().find((m) => m.de === 'usuario')
        const textoUltimoUsuario = ultimoUsuario && ultimoUsuario.de === 'usuario' ? ultimoUsuario.texto : ''
        return respuestaDeRespaldo(textoUltimoUsuario, propiedad, turnosAgenteRef.current, contextoUsuario.nombre)
      }
    }

    const [textoBruto] = await Promise.all([obtenerTexto(), esperar(1500)])

    turnosAgenteRef.current += 1
    const marcador = textoBruto.includes(MARCADOR_PROPONER_VISITA)
    const texto = textoBruto.replace(MARCADOR_PROPONER_VISITA, '').trim()
    registrarFoliosMencionados(texto)

    setEscribiendo(false)
    setMensajes((actual) => {
      const siguiente: MensajeChat[] = [...actual, { id: nuevoId(), de: 'agente', tipo: 'texto', texto, hora: horaActual() }]
      if (!asesorPresentadoRef.current && turnosAgenteRef.current >= TURNO_PARA_PRESENTAR_ASESOR) {
        asesorPresentadoRef.current = true
        siguiente.push({ id: nuevoId(), de: 'sistema', tipo: 'tarjeta-asesor', hora: horaActual() })
      }
      return siguiente
    })

    if (marcarComoCalificadoSiAplica(calificacion)) {
      setMensajes((actual) => [
        ...actual,
        { id: nuevoId(), de: 'sistema', tipo: 'tarjeta-calificado', asesorNombre: asesor.nombre, hora: horaActual() },
      ])
    }

    if (!citaOfrecida && (marcador || turnosAgenteRef.current >= TURNOS_MINIMOS_PARA_OFRECER_CITA)) {
      setCitaOfrecida(true)
      setMensajes((actual) => [
        ...actual,
        {
          id: nuevoId(),
          de: 'agente',
          tipo: 'selector-cita',
          texto: '¿Te gustaría agendar una visita para conocerla en persona?',
          hora: horaActual(),
        },
      ])
    }
  }

  useEffect(() => {
    if (yaInicioRef.current) return
    yaInicioRef.current = true
    void generarRespuesta(mensajes)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function enviarMensajeUsuario(evento: React.FormEvent) {
    evento.preventDefault()
    const texto = entrada.trim()
    if (!texto || escribiendo) return
    setEntrada('')

    const mensajeUsuario: MensajeChat = { id: nuevoId(), de: 'usuario', tipo: 'texto', texto, hora: horaActual() }
    const mensajesConUsuario = [...mensajes, mensajeUsuario]
    setMensajes(mensajesConUsuario)
    evaluarCalificacion(texto)

    await generarRespuesta(mensajesConUsuario)
  }

  function elegirHorario(horario: HorarioDisponible) {
    if (citaAgendadaId !== null) return

    const visita: VisitaAgendada = {
      id: nuevoId(),
      folio: propiedad.folio,
      propiedadTitulo: construirTitulo(propiedad),
      horarioEtiqueta: horario.etiqueta,
      asesorNombre: asesor.nombre,
    }

    setMensajes((actual) => [
      ...actual,
      { id: nuevoId(), de: 'usuario', tipo: 'texto', texto: horario.etiqueta, hora: horaActual() },
      {
        id: nuevoId(),
        de: 'agente',
        tipo: 'texto',
        texto: `¡Perfecto! Tu visita quedó agendada para el ${horario.etiqueta.toLowerCase()}. Ahí nos vemos.`,
        hora: horaActual(),
      },
      { id: nuevoId(), de: 'sistema', tipo: 'tarjeta-cita', visita, hora: horaActual() },
    ])
    setCitaAgendadaId(visita.id)
    // Misma Cita que ve Agenda y Control de Citas (ver SesionContext) —
    // origenPortalEnVivo es lo que le dice a /mi-cuenta/visitas que esta
    // es "mía" en esta sesión, sin duplicar el registro.
    agregarCita({
      id: visita.id,
      tipo: 'visita',
      clienteNombre: usuario ? usuario.nombre : (contextoUsuario.nombre ?? 'Visitante del portal'),
      prospectoVentaId: null,
      folio: propiedad.folio,
      colonia: propiedad.ubicacion.colonia,
      asesorId: asesor.id,
      inicio: horario.fecha.toISOString(),
      duracionMinutos: 45,
      estado: 'confirmada',
      confirmacionEnviada: true,
      notas: 'Agendada desde el WhatsApp del portal.',
      resultado: null,
      origenPortalEnVivo: true,
    })
  }

  function renderMensaje(mensaje: MensajeChat) {
    if (mensaje.de === 'sistema') {
      if (mensaje.tipo === 'tarjeta-cita') return <TarjetaVisitaAgendada key={mensaje.id} visita={mensaje.visita} />
      if (mensaje.tipo === 'tarjeta-asesor') return <TarjetaAsesorContacto key={mensaje.id} asesor={asesor} />
      return (
        <TarjetaProspectoCalificado
          key={mensaje.id}
          asesorNombre={mensaje.asesorNombre}
          calificacion={calificacion}
          citaAgendada={citaAgendadaId !== null}
        />
      )
    }

    const esUsuario = mensaje.de === 'usuario'
    return (
      <div key={mensaje.id} className={`flex ${esUsuario ? 'justify-end' : 'justify-start'}`}>
        <div
          className={`max-w-[78%] rounded-2xl px-3 py-2 text-sm shadow-sm ${
            esUsuario ? 'rounded-tr-sm text-texto' : 'rounded-tl-sm bg-blanco text-texto'
          }`}
          style={esUsuario ? { backgroundColor: VERDE_BURBUJA_USUARIO } : undefined}
        >
          <p className="whitespace-pre-wrap">{mensaje.texto}</p>

          {mensaje.tipo === 'selector-cita' && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {horarios.map((horario) => (
                <button
                  key={horario.etiqueta}
                  type="button"
                  disabled={citaAgendadaId !== null}
                  onClick={() => elegirHorario(horario)}
                  className="rounded-full border border-vino-vivo px-3 py-1 text-xs font-medium text-vino-vivo transition-colors hover:bg-vino-vivo hover:text-blanco disabled:cursor-default disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-vino-vivo"
                >
                  {horario.etiqueta}
                </button>
              ))}
            </div>
          )}

          <div
            className={`mt-1 flex items-center justify-end gap-1 text-[10px] ${
              esUsuario ? 'text-texto/50' : 'text-texto-suave'
            }`}
          >
            {mensaje.hora}
            {esUsuario && <CheckCheck size={13} strokeWidth={2} style={{ color: AZUL_PALOMITA }} />}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 px-4 py-8">
      <div className="flex w-full max-w-sm flex-col items-center gap-4">
        <div className="flex h-[560px] w-full flex-col overflow-hidden rounded-3xl bg-blanco shadow-2xl">
          <div className="flex shrink-0 items-center gap-3 px-4 py-3" style={{ backgroundColor: VERDE_ENCABEZADO }}>
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blanco text-xs font-bold text-vino-vivo">
              3R
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-blanco">3R Connect</p>
              <p className="text-xs text-blanco/75">en línea</p>
            </div>
            <button
              type="button"
              aria-label="Cerrar"
              onClick={onClose}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-blanco/80 transition-colors hover:bg-blanco/10 hover:text-blanco"
            >
              <X size={18} strokeWidth={2} />
            </button>
          </div>

          <div
            ref={scrollRef}
            className="flex-1 space-y-2 overflow-y-auto px-3 py-4"
            style={{ backgroundColor: BEIGE_FONDO, backgroundImage: `url("${PATRON_FONDO}")`, backgroundSize: '84px 84px' }}
          >
            {mensajes.map(renderMensaje)}

            {escribiendo && (
              <div className="flex justify-start">
                <div className="flex items-center gap-1 rounded-2xl rounded-tl-sm bg-blanco px-3.5 py-2.5 shadow-sm">
                  {[0, 1, 2].map((indice) => (
                    <motion.span
                      key={indice}
                      className="h-1.5 w-1.5 rounded-full bg-texto-suave"
                      animate={prefiereReducido ? undefined : { opacity: [0.3, 1, 0.3], y: [0, -2, 0] }}
                      transition={{ duration: 1, repeat: Infinity, delay: indice * 0.15, ease: 'easeInOut' }}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          <form
            onSubmit={enviarMensajeUsuario}
            className="flex shrink-0 items-center gap-2 border-t border-gris-borde bg-blanco px-3 py-2.5"
          >
            <input
              type="text"
              value={entrada}
              onChange={(evento) => setEntrada(evento.target.value)}
              placeholder="Escribe un mensaje"
              className="min-w-0 flex-1 rounded-full border border-gris-borde bg-marfil px-4 py-2 text-sm text-texto placeholder:text-texto-suave focus:outline-none"
            />
            <button
              type="submit"
              disabled={!entrada.trim() || escribiendo}
              aria-label="Enviar"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-blanco transition-opacity disabled:opacity-50"
              style={{ backgroundColor: VERDE_ENVIAR }}
            >
              <Send size={16} strokeWidth={2} />
            </button>
          </form>
        </div>

        {calificado && (
          <PanelLeadCRM
            propiedad={propiedad}
            asesor={asesor}
            calificacion={calificacion}
            citaAgendada={citaAgendadaId !== null}
            propiedadesEnviadas={propiedadesEnviadas}
          />
        )}
      </div>
    </div>
  )
}
