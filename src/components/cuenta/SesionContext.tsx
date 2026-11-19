import { createContext, useContext, useState, type ReactNode } from 'react'
import { apartadosDemoIniciales } from '../../data/apartadosDemo'
import { asesoresDemo } from '../../data/asesoresDemo'
import { casosValidacionDemoIniciales } from '../../data/casosValidacionDemo'
import { citasDemoIniciales } from '../../data/citasDemo'
import { conversacionesDemo } from '../../data/conversacionesDemo'
import { procesoDemo } from '../../data/procesoDemo'
import { procesosPublicacionDemo } from '../../data/procesoPublicacionDemo'
import { conversacionesGeneradas, prospectosVentaGenerados } from '../../data/productividadDemo'
import { propiedadesDemo } from '../../data/propiedadesDemo'
import { prospectosCaptacionDemo } from '../../data/prospectosCaptacionDemo'
import { prospectosVentaDemo } from '../../data/prospectosVentaDemo'
import { usuariosAdminDemo } from '../../data/usuariosAdminDemo'
import type { ApartadoMock, EstadoApartado } from '../../types/apartado'
import type { EntradaBitacora } from '../../types/bitacora'
import type { VisitaAgendada } from '../../types/chatAgente'
import { etiquetaDiaCita, etiquetaHoraCita, type Cita, type EstadoCita, type ResultadoCita } from '../../types/cita'
import type { ConversacionInbox } from '../../types/conversacion'
import type { CasoValidacion } from '../../types/expedienteValidacion'
import type { DocumentoExpediente, ProcesoCliente } from '../../types/proceso'
import type { EtapaProspecto, Prospecto } from '../../types/prospecto'
import {
  ID_PROSPECTO_DEMO,
  prospectoDesdeCalificacion,
  type ContextoCalificacion,
  type EtapaProspectoVenta,
  type ProspectoVenta,
} from '../../types/prospectoVenta'
import type { CalificacionLead } from '../../lib/calificacionLead'
import { construirTitulo } from '../../types/propiedad'
import type { UsuarioAdmin } from '../../types/usuarioAdmin'

// 'cliente' es el único tipo que se crea desde el portal público (ver
// AccesoPage) — quien publica propiedades es la inmobiliaria, desde
// /admin. 'asesor' y 'admin' solo se obtienen hoy vía el selector demo de
// AccesoPage (no hay backend real de altas de equipo todavía).
export type TipoCuenta = 'cliente' | 'asesor' | 'admin'

export interface Usuario {
  id: string
  nombre: string
  correo: string
  iniciales: string
  tipoCuenta: TipoCuenta
}

export type OperacionOnboarding = 'comprar' | 'rentar' | 'invertir'

export interface PreferenciasOnboarding {
  operacion: OperacionOnboarding | null
  zonas: string[]
  presupuesto: string
}

interface SesionValue {
  usuario: Usuario | null
  onboardingCompletado: boolean
  preferencias: PreferenciasOnboarding | null
  propiedadesGuardadas: string[]
  iniciarSesion: (usuario: Usuario) => void
  cerrarSesion: () => void
  completarOnboarding: (preferencias: PreferenciasOnboarding | null) => void
  alternarGuardado: (folio: string) => void
  estaGuardada: (folio: string) => boolean
  cambiarTipoCuenta: (tipo: TipoCuenta) => void
  // El proceso de compra del cliente demo, vivo en memoria en vez de un
  // import estático: tanto /mi-cuenta/proceso (cliente) como
  // /admin/separacion (admin/asesor, apartado del folio 3R-110) leen este
  // mismo valor — avanzarProcesoCompra() es el único punto que lo muta,
  // para que un cambio hecho del lado admin se vea también del lado
  // cliente sin duplicar el mock en dos archivos.
  procesoCompra: ProcesoCliente
  avanzarProcesoCompra: () => void
  actualizarDocumentoProcesoCompra: (id: string, cambios: Partial<DocumentoExpediente>) => void
  // Procesos de publicación (captación de propiedades) — De la Casa/Del
  // Vendedor/Exención de ISR en Confianza y Validación son estos mismos
  // documentos, nunca un mock aparte (ver types/expedienteValidacion.ts).
  procesosPublicacion: ProcesoCliente[]
  actualizarDocumentoProcesoPublicacion: (folio: string, id: string, cambios: Partial<DocumentoExpediente>) => void
  avanzarPasoPublicacion: (folio: string, tituloPaso: string) => void
  // Casos "Del Comprador" en Confianza y Validación que no tienen un
  // ProcesoCliente propio — el del cliente Demo sí lo tiene (procesoCompra).
  casosValidacion: CasoValidacion[]
  actualizarDocumentoCasoValidacion: (casoId: string, documentoId: string, cambios: Partial<DocumentoExpediente>) => void
  aprobarCasoValidacion: (casoId: string) => void
  // CRM de captación (dueños que quieren listar su propiedad). Compartido
  // entre Prospectos de Captación, Captación de Propiedades (los que ya
  // tienen pasoCaptacion: 'recibida') y Asignación de Asesores (los de
  // origen 'portal' sin asesorId) — mismo arreglo, distintos filtros, nunca
  // tres mocks separados.
  prospectosCaptacion: Prospecto[]
  agregarProspecto: (prospecto: Prospecto) => void
  actualizarEtapaProspecto: (id: string, etapa: EtapaProspecto) => void
  pasarACaptacion: (id: string) => void
  asignarAsesorProspecto: (id: string, asesorId: string) => void
  // CRM de demanda (compradores/inquilinos) — Prospectos de Venta. El
  // prospecto Demo (folio 3R-110) vive en este mismo arreglo; su etapa
  // 'cerrado' es la que ya trae prospectosVentaDemo, no depende de
  // procesoCompra para nada de lo que se lee aquí.
  prospectosVenta: ProspectoVenta[]
  agregarProspectoVenta: (prospecto: ProspectoVenta) => void
  actualizarEtapaProspectoVenta: (id: string, etapa: EtapaProspectoVenta, fechaCierre?: string | null) => void
  // Puente con el agente de WhatsApp (ver WhatsAppModal.tsx): cuando
  // marcarComoCalificadoSiAplica() detecta presupuesto + zona, llama esto
  // una sola vez con la misma CalificacionLead que ya extrajo
  // actualizarCalificacion() — nunca se le vuelve a pedir nada al usuario.
  registrarProspectoDesdeAgente: (calificacion: CalificacionLead, contexto: ContextoCalificacion) => void
  // Apartados de Separación de Propiedades — compartidos para que
  // "Registrar apartado" en Prospectos de Venta cree uno real ahí, sin
  // duplicar el mock en dos archivos. El apartado del cliente Demo
  // (folio 3R-110) no vive en este arreglo, se arma aparte desde
  // procesoCompra (ver SeparacionAdminPage).
  apartadosMock: ApartadoMock[]
  agregarApartado: (apartado: ApartadoMock) => void
  actualizarEstadoApartado: (id: string, estado: EstadoApartado) => void
  // Asigna/reasigna un ProspectoVenta a un asesor — la usa tanto el panel
  // del lead en el Inbox ("Reasignar a mí") como cualquier otro punto que
  // necesite cambiar de quién es la conversación.
  asignarAsesorProspectoVenta: (id: string, asesorId: string) => void
  // Hilos del Inbox — ver types/conversacion.ts sobre por qué no duplican
  // los datos del prospecto.
  conversaciones: ConversacionInbox[]
  enviarMensajeInbox: (conversacionId: string, texto: string) => void
  marcarConversacionLeida: (conversacionId: string) => void
  // Agenda y Control de Citas — única fuente de verdad para cualquier cita
  // del equipo. El Inbox y el WhatsApp del portal agregan aquí (agregarCita)
  // en vez de llevar su propia lista de visitas; visitasCliente (abajo) es
  // la vista derivada que consume /mi-cuenta/visitas.
  citas: Cita[]
  agregarCita: (cita: Cita) => void
  moverCita: (id: string, nuevoInicio: string) => void
  actualizarEstadoCita: (id: string, estado: EstadoCita) => void
  marcarRecordatorioEnviado: (id: string) => void
  cerrarCita: (id: string, resultado: ResultadoCita) => void
  // Derivada de `citas`, nunca guardada aparte: las del cliente Demo (folio
  // 3R-110) más las que se agendaron en vivo desde el WhatsApp del portal
  // en esta sesión — así /mi-cuenta/visitas y TableroClientePage leen
  // exactamente lo mismo que ve Agenda, sin un mock propio.
  visitasCliente: VisitaAgendada[]
  // Cuentas de equipo con sus permisos por módulo — el correo de "Fernando
  // Castro" y "Mariana Solís" son los que usa el login demo, así que editar
  // esas dos filas en /admin/usuarios es una acción real (ver LayoutAdmin,
  // que cruza permisos por correo contra este mismo arreglo).
  usuariosAdmin: UsuarioAdmin[]
  agregarUsuarioAdmin: (usuario: UsuarioAdmin) => void
  actualizarUsuarioAdmin: (id: string, cambios: Partial<UsuarioAdmin>) => void
  // Bitácora — hoy solo la alimenta Asignación de Asesores, ver la nota en
  // types/bitacora.ts.
  bitacora: EntradaBitacora[]
  registrarBitacora: (entrada: Omit<EntradaBitacora, 'id' | 'fecha'>) => void
}

const SesionContext = createContext<SesionValue | null>(null)

// Todo en memoria, sin localStorage ni sessionStorage: al recargar la
// página se pierde la sesión, y para esta demo está bien. Un solo
// provider en la raíz de la app (ver App.tsx) para que la sesión sea la
// misma sin importar en qué página esté el usuario.
export function SesionProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null)
  const [onboardingCompletado, setOnboardingCompletado] = useState(false)
  const [preferencias, setPreferencias] = useState<PreferenciasOnboarding | null>(null)
  const [propiedadesGuardadas, setPropiedadesGuardadas] = useState<string[]>([])
  const [procesoCompra, setProcesoCompra] = useState<ProcesoCliente>(procesoDemo)
  const [prospectosCaptacion, setProspectosCaptacion] = useState<Prospecto[]>(prospectosCaptacionDemo)
  // prospectosVentaGenerados/conversacionesGeneradas: volumen sintético para
  // que Productividad de Asesores tenga suficiente historia real que medir
  // (ver data/productividadDemo.ts) — mismo arreglo compartido, nunca un mock
  // aparte que ese módulo lea distinto al resto del panel.
  const [prospectosVenta, setProspectosVenta] = useState<ProspectoVenta[]>([...prospectosVentaDemo, ...prospectosVentaGenerados])
  const [apartadosMock, setApartadosMock] = useState<ApartadoMock[]>(apartadosDemoIniciales)
  const [conversaciones, setConversaciones] = useState<ConversacionInbox[]>([...conversacionesDemo, ...conversacionesGeneradas])
  const [citas, setCitas] = useState<Cita[]>(citasDemoIniciales)
  const [usuariosAdmin, setUsuariosAdmin] = useState<UsuarioAdmin[]>(usuariosAdminDemo)
  const [bitacora, setBitacora] = useState<EntradaBitacora[]>([])
  const [procesosPublicacion, setProcesosPublicacion] = useState<ProcesoCliente[]>(procesosPublicacionDemo)
  const [casosValidacion, setCasosValidacion] = useState<CasoValidacion[]>(casosValidacionDemoIniciales)

  function iniciarSesion(nuevoUsuario: Usuario) {
    setUsuario(nuevoUsuario)
  }

  function cerrarSesion() {
    setUsuario(null)
  }

  function completarOnboarding(nuevasPreferencias: PreferenciasOnboarding | null) {
    setPreferencias(nuevasPreferencias)
    setOnboardingCompletado(true)
  }

  function alternarGuardado(folio: string) {
    setPropiedadesGuardadas((actual) =>
      actual.includes(folio) ? actual.filter((f) => f !== folio) : [...actual, folio],
    )
  }

  function estaGuardada(folio: string) {
    return propiedadesGuardadas.includes(folio)
  }

  // Hoy solo la usa el selector "Ver como" de SidebarAdmin, para poder
  // probar la vista de admin y de asesor sin cerrar sesión.
  function cambiarTipoCuenta(tipo: TipoCuenta) {
    setUsuario((actual) => (actual ? { ...actual, tipoCuenta: tipo } : actual))
  }

  // Avanza el paso "actual" a completado y libera el siguiente pendiente.
  // Sin-op si el proceso ya no tiene un paso actual (ya se completó todo).
  function avanzarProcesoCompra() {
    setProcesoCompra((actual) => {
      const indiceActual = actual.pasos.findIndex((paso) => paso.estado === 'actual')
      if (indiceActual === -1) return actual
      const hoy = new Date().toISOString().slice(0, 10)
      const pasos = actual.pasos.map((paso, indice) => {
        if (indice === indiceActual) return { ...paso, estado: 'completado' as const, fechaCompletado: hoy }
        if (indice === indiceActual + 1) return { ...paso, estado: 'actual' as const }
        return paso
      })
      return { ...actual, pasos }
    })
  }

  function actualizarDocumentoProcesoCompra(id: string, cambios: Partial<DocumentoExpediente>) {
    setProcesoCompra((actual) => ({ ...actual, documentos: actual.documentos.map((d) => (d.id === id ? { ...d, ...cambios } : d)) }))
  }

  function actualizarDocumentoProcesoPublicacion(folio: string, id: string, cambios: Partial<DocumentoExpediente>) {
    setProcesosPublicacion((actual) =>
      actual.map((proceso) =>
        proceso.folio === folio
          ? { ...proceso, documentos: proceso.documentos.map((d) => (d.id === id ? { ...d, ...cambios } : d)) }
          : proceso,
      ),
    )
  }

  // Mismo criterio que avanzarProcesoCompra: el paso con ese título que esté
  // 'actual' pasa a 'completado' y libera el siguiente — aquí aplicado al
  // proceso de esa propiedad en vez del de compra del cliente.
  function avanzarPasoPublicacion(folio: string, tituloPaso: string) {
    setProcesosPublicacion((actual) =>
      actual.map((proceso) => {
        if (proceso.folio !== folio) return proceso
        const indice = proceso.pasos.findIndex((p) => p.titulo === tituloPaso && p.estado === 'actual')
        if (indice === -1) return proceso
        const hoy = new Date().toISOString().slice(0, 10)
        const pasos = proceso.pasos.map((paso, i) => {
          if (i === indice) return { ...paso, estado: 'completado' as const, fechaCompletado: hoy }
          if (i === indice + 1) return { ...paso, estado: 'actual' as const }
          return paso
        })
        return { ...proceso, pasos }
      }),
    )
  }

  function actualizarDocumentoCasoValidacion(casoId: string, documentoId: string, cambios: Partial<DocumentoExpediente>) {
    setCasosValidacion((actual) =>
      actual.map((caso) =>
        caso.id === casoId ? { ...caso, documentos: caso.documentos.map((d) => (d.id === documentoId ? { ...d, ...cambios } : d)) } : caso,
      ),
    )
  }

  function aprobarCasoValidacion(casoId: string) {
    setCasosValidacion((actual) =>
      actual.map((caso) =>
        caso.id === casoId ? { ...caso, estado: 'aprobado' as const, fechaAprobado: new Date().toISOString().slice(0, 10) } : caso,
      ),
    )
  }

  function agregarProspecto(prospecto: Prospecto) {
    setProspectosCaptacion((actual) => [prospecto, ...actual])
  }

  function actualizarEtapaProspecto(id: string, etapa: EtapaProspecto) {
    setProspectosCaptacion((actual) => actual.map((p) => (p.id === id ? { ...p, etapa } : p)))
  }

  // Solo tiene efecto en etapa 'exclusiva_firmada' — el llamador (menú de
  // acciones en la tabla) ya lo garantiza antes de invocarla.
  function pasarACaptacion(id: string) {
    setProspectosCaptacion((actual) =>
      actual.map((p) => (p.id === id ? { ...p, etapa: 'en_inventario', pasoCaptacion: 'recibida' } : p)),
    )
  }

  function asignarAsesorProspecto(id: string, asesorId: string) {
    setProspectosCaptacion((actual) => actual.map((p) => (p.id === id ? { ...p, asesorId } : p)))
  }

  function agregarProspectoVenta(prospecto: ProspectoVenta) {
    setProspectosVenta((actual) => [prospecto, ...actual])
  }

  function actualizarEtapaProspectoVenta(id: string, etapa: EtapaProspectoVenta, fechaCierre: string | null = null) {
    setProspectosVenta((actual) => actual.map((p) => (p.id === id ? { ...p, etapa, fechaCierre } : p)))
  }

  function registrarProspectoDesdeAgente(calificacion: CalificacionLead, contexto: ContextoCalificacion) {
    const id = `prospecto-venta-agente-${Date.now()}`
    setProspectosVenta((actual) => [prospectoDesdeCalificacion(id, calificacion, contexto), ...actual])
  }

  function agregarApartado(apartado: ApartadoMock) {
    setApartadosMock((actual) => [apartado, ...actual])
  }

  function actualizarEstadoApartado(id: string, estado: EstadoApartado) {
    setApartadosMock((actual) => actual.map((a) => (a.id === id ? { ...a, estado } : a)))
  }

  function asignarAsesorProspectoVenta(id: string, asesorId: string) {
    setProspectosVenta((actual) => actual.map((p) => (p.id === id ? { ...p, asesorId } : p)))
  }

  function enviarMensajeInbox(conversacionId: string, texto: string) {
    setConversaciones((actual) =>
      actual.map((c) =>
        c.id === conversacionId
          ? {
              ...c,
              mensajes: [...c.mensajes, { id: `msg-${Date.now()}`, de: 'asesor' as const, tipo: 'texto' as const, texto, hora: new Date().toISOString() }],
            }
          : c,
      ),
    )
  }

  function marcarConversacionLeida(conversacionId: string) {
    setConversaciones((actual) => actual.map((c) => (c.id === conversacionId ? { ...c, noLeidos: 0 } : c)))
  }

  function agregarCita(cita: Cita) {
    setCitas((actual) => [cita, ...actual])
  }

  // Un reagendo por arrastre deja la cita como 'agendada' otra vez — el
  // horario cambió, así que la confirmación anterior ya no aplica.
  function moverCita(id: string, nuevoInicio: string) {
    setCitas((actual) =>
      actual.map((c) => (c.id === id ? { ...c, inicio: nuevoInicio, estado: 'agendada' as const, confirmacionEnviada: false } : c)),
    )
  }

  function actualizarEstadoCita(id: string, estado: EstadoCita) {
    setCitas((actual) => actual.map((c) => (c.id === id ? { ...c, estado } : c)))
  }

  function marcarRecordatorioEnviado(id: string) {
    setCitas((actual) => actual.map((c) => (c.id === id ? { ...c, confirmacionEnviada: true } : c)))
  }

  function cerrarCita(id: string, resultado: ResultadoCita) {
    setCitas((actual) =>
      actual.map((c) => (c.id === id ? { ...c, estado: resultado.asistio ? ('asistio' as const) : ('no_asistio' as const), resultado } : c)),
    )
  }

  function agregarUsuarioAdmin(usuarioNuevo: UsuarioAdmin) {
    setUsuariosAdmin((actual) => [usuarioNuevo, ...actual])
  }

  function actualizarUsuarioAdmin(id: string, cambios: Partial<UsuarioAdmin>) {
    setUsuariosAdmin((actual) => actual.map((u) => (u.id === id ? { ...u, ...cambios } : u)))
  }

  function registrarBitacora(entrada: Omit<EntradaBitacora, 'id' | 'fecha'>) {
    setBitacora((actual) => [{ ...entrada, id: `bitacora-${Date.now()}-${actual.length}`, fecha: new Date().toISOString() }, ...actual])
  }

  const visitasCliente: VisitaAgendada[] = [...citas]
    .filter((c) => (c.prospectoVentaId === ID_PROSPECTO_DEMO || c.origenPortalEnVivo) && c.estado !== 'no_asistio')
    .sort((a, b) => new Date(a.inicio).getTime() - new Date(b.inicio).getTime())
    .map((c) => {
      const propiedad = propiedadesDemo.find((p) => p.folio === c.folio)
      const asesor = asesoresDemo.find((a) => a.id === c.asesorId)
      return {
        id: c.id,
        folio: c.folio ?? '',
        propiedadTitulo: propiedad ? construirTitulo(propiedad) : (c.folio ?? 'Cita agendada'),
        horarioEtiqueta: `${etiquetaDiaCita(new Date(c.inicio))} · ${etiquetaHoraCita(c.inicio)}`,
        asesorNombre: asesor ? asesor.nombre : 'Tu asesor',
      }
    })

  return (
    <SesionContext.Provider
      value={{
        usuario,
        onboardingCompletado,
        preferencias,
        propiedadesGuardadas,
        iniciarSesion,
        cerrarSesion,
        completarOnboarding,
        alternarGuardado,
        estaGuardada,
        cambiarTipoCuenta,
        procesoCompra,
        avanzarProcesoCompra,
        actualizarDocumentoProcesoCompra,
        procesosPublicacion,
        actualizarDocumentoProcesoPublicacion,
        avanzarPasoPublicacion,
        casosValidacion,
        actualizarDocumentoCasoValidacion,
        aprobarCasoValidacion,
        prospectosCaptacion,
        agregarProspecto,
        actualizarEtapaProspecto,
        pasarACaptacion,
        asignarAsesorProspecto,
        prospectosVenta,
        agregarProspectoVenta,
        actualizarEtapaProspectoVenta,
        registrarProspectoDesdeAgente,
        apartadosMock,
        agregarApartado,
        actualizarEstadoApartado,
        asignarAsesorProspectoVenta,
        conversaciones,
        enviarMensajeInbox,
        marcarConversacionLeida,
        citas,
        agregarCita,
        moverCita,
        actualizarEstadoCita,
        marcarRecordatorioEnviado,
        cerrarCita,
        visitasCliente,
        usuariosAdmin,
        agregarUsuarioAdmin,
        actualizarUsuarioAdmin,
        bitacora,
        registrarBitacora,
      }}
    >
      {children}
    </SesionContext.Provider>
  )
}

export function useSesion(): SesionValue {
  const contexto = useContext(SesionContext)
  if (!contexto) {
    throw new Error('useSesion debe usarse dentro de <SesionProvider>')
  }
  return contexto
}
