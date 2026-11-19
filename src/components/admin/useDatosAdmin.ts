import { asesorParaPropiedad } from '../../data/asesoresDemo'
import { procesosPublicacionDemo } from '../../data/procesoPublicacionDemo'
import { primerNombreVisible } from '../../lib/nombreUsuario'
import type { Asesor } from '../../types/asesor'
import type { ApartadoMock, EstadoApartado } from '../../types/apartado'
import type { EntradaBitacora } from '../../types/bitacora'
import type { Cita, EstadoCita, ResultadoCita } from '../../types/cita'
import type { ConversacionInbox } from '../../types/conversacion'
import type { CasoValidacion } from '../../types/expedienteValidacion'
import type { DocumentoExpediente, ProcesoCliente } from '../../types/proceso'
import type { EtapaProspecto, Prospecto } from '../../types/prospecto'
import type { EtapaProspectoVenta, ProspectoVenta } from '../../types/prospectoVenta'
import type { UsuarioAdmin } from '../../types/usuarioAdmin'
import { useSesion, type TipoCuenta, type Usuario } from '../cuenta/SesionContext'

// Asesor de referencia para el contenido que sigue viniendo de datos demo
// del cliente (p. ej. el expediente de una propiedad en captación) — mismo
// criterio determinístico que asesorParaPropiedad ya usa en toda la app.
const asesorDemo = asesorParaPropiedad(procesosPublicacionDemo[0].folio)

export interface DatosAdmin {
  // null cuando no hay sesión — LayoutAdmin lo usa como señal para
  // redirigir a /acceso sin tener que importar SesionContext aparte.
  usuario: Usuario | null
  nombre: string | null
  // 'admin' ve los 4 grupos del sidebar; 'asesor' solo Operación y
  // Clientes. Cualquier tipoCuenta que no sea 'admin' cae a 'asesor' —
  // LayoutAdmin ya garantiza que aquí nunca llega un 'cliente'.
  rol: 'admin' | 'asesor'
  asesor: Asesor
  cerrarSesion: () => void
  cambiarTipoCuenta: (tipo: TipoCuenta) => void
  // Mismo proceso que ve el cliente en /mi-cuenta/proceso (ver
  // SesionContext) — Separación de Propiedades lo usa para el apartado del
  // folio 3R-110, sin duplicar sus números en un mock aparte.
  procesoCompra: ProcesoCliente
  avanzarProcesoCompra: () => void
  actualizarDocumentoProcesoCompra: (id: string, cambios: Partial<DocumentoExpediente>) => void
  // De la Casa/Del Vendedor/Exención de ISR en Confianza y Validación —
  // ver la nota en SesionContext.
  procesosPublicacion: ProcesoCliente[]
  actualizarDocumentoProcesoPublicacion: (folio: string, id: string, cambios: Partial<DocumentoExpediente>) => void
  avanzarPasoPublicacion: (folio: string, tituloPaso: string) => void
  casosValidacion: CasoValidacion[]
  actualizarDocumentoCasoValidacion: (casoId: string, documentoId: string, cambios: Partial<DocumentoExpediente>) => void
  aprobarCasoValidacion: (casoId: string) => void
  // CRM de captación compartido entre Prospectos de Captación, Captación
  // de Propiedades y Asignación de Asesores — ver la nota en SesionContext.
  prospectosCaptacion: Prospecto[]
  agregarProspecto: (prospecto: Prospecto) => void
  actualizarEtapaProspecto: (id: string, etapa: EtapaProspecto) => void
  pasarACaptacion: (id: string) => void
  asignarAsesorProspecto: (id: string, asesorId: string) => void
  // CRM de demanda compartido entre Prospectos de Venta y Separación de
  // Propiedades ("Registrar apartado") — ver la nota en SesionContext.
  prospectosVenta: ProspectoVenta[]
  agregarProspectoVenta: (prospecto: ProspectoVenta) => void
  actualizarEtapaProspectoVenta: (id: string, etapa: EtapaProspectoVenta, fechaCierre?: string | null) => void
  apartadosMock: ApartadoMock[]
  agregarApartado: (apartado: ApartadoMock) => void
  actualizarEstadoApartado: (id: string, estado: EstadoApartado) => void
  asignarAsesorProspectoVenta: (id: string, asesorId: string) => void
  conversaciones: ConversacionInbox[]
  enviarMensajeInbox: (conversacionId: string, texto: string) => void
  marcarConversacionLeida: (conversacionId: string) => void
  // Agenda y Control de Citas — única fuente de verdad, ver la nota en
  // SesionContext sobre visitasCliente.
  citas: Cita[]
  agregarCita: (cita: Cita) => void
  moverCita: (id: string, nuevoInicio: string) => void
  actualizarEstadoCita: (id: string, estado: EstadoCita) => void
  marcarRecordatorioEnviado: (id: string) => void
  cerrarCita: (id: string, resultado: ResultadoCita) => void
  usuariosAdmin: UsuarioAdmin[]
  agregarUsuarioAdmin: (usuario: UsuarioAdmin) => void
  actualizarUsuarioAdmin: (id: string, cambios: Partial<UsuarioAdmin>) => void
  bitacora: EntradaBitacora[]
  registrarBitacora: (entrada: Omit<EntradaBitacora, 'id' | 'fecha'>) => void
}

// Análogo a useDatosCliente.ts para el panel administrativo: único archivo
// de components/admin/ que toca SesionContext, el resto pasa por aquí.
export function useDatosAdmin(): DatosAdmin {
  const {
    usuario,
    cerrarSesion,
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
    usuariosAdmin,
    agregarUsuarioAdmin,
    actualizarUsuarioAdmin,
    bitacora,
    registrarBitacora,
  } = useSesion()
  return {
    usuario,
    nombre: usuario ? primerNombreVisible(usuario) : null,
    rol: usuario?.tipoCuenta === 'admin' ? 'admin' : 'asesor',
    asesor: asesorDemo,
    cerrarSesion,
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
    usuariosAdmin,
    agregarUsuarioAdmin,
    actualizarUsuarioAdmin,
    bitacora,
    registrarBitacora,
  }
}
