import { asesoresDemo } from './asesoresDemo'
import { propiedadesDemo } from './propiedadesDemo'
import type { ConversacionInbox, MensajeInbox } from '../types/conversacion'
import type { EstadoCierre, EstadoPago, EtapaProspectoVenta, ProspectoVenta } from '../types/prospectoVenta'

// ---------------------------------------------------------------------------
// Volumen sintético para Productividad de Asesores. prospectosVentaDemo.ts
// ya trae 10 registros curados a mano — suficientes para contar historias
// puntuales (el cliente Demo, un par de leads por asesor), pero no para que
// un embudo por asesor con porcentajes etapa a etapa diga algo con sentido
// estadístico. Este archivo agrega volumen controlado por asesor, repartido
// en los últimos meses, y se mezcla en SesionContext con prospectosVentaDemo
// y conversacionesDemo — Productividad nunca hardcodea un número: todo lo
// lee de prospectosVenta/conversaciones vía useDatosAdmin, igual que
// cualquier otro módulo.
//
// Los 5 perfiles son deliberadamente distintos (así lo pidió el encargo):
// Mariana — sólida en todo. Diego — agenda muchas citas pero no cierra
// (cuello entre cita y oferta). Renata — pocos leads, altísima conversión.
// Valeria — lenta para responder (más de 2h). Tomás — en riesgo general.
// ---------------------------------------------------------------------------

interface PerfilGeneracion {
  asesorId: string
  leadsPorMes: number
  pctContactados: number
  pctCitas: number
  pctOfertas: number
  pctCerrados: number
  ticketMin: number
  ticketMax: number
  minutosRespuesta: number
  mesesHistoria: number
}

const PERFILES: PerfilGeneracion[] = [
  {
    asesorId: 'mariana-solis',
    leadsPorMes: 9,
    pctContactados: 0.9,
    pctCitas: 0.75,
    pctOfertas: 0.7,
    pctCerrados: 0.55,
    ticketMin: 18_000_000,
    ticketMax: 26_000_000,
    minutosRespuesta: 22,
    mesesHistoria: 7,
  },
  {
    // Agenda muchas citas (pctCitas alto) pero muy pocas llegan a oferta
    // (pctOfertas bajo) — el cuello de botella que el encargo pidió poder ver.
    asesorId: 'diego-herrera',
    leadsPorMes: 10,
    pctContactados: 0.85,
    pctCitas: 0.8,
    pctOfertas: 0.25,
    pctCerrados: 0.5,
    ticketMin: 14_000_000,
    ticketMax: 20_000_000,
    minutosRespuesta: 45,
    mesesHistoria: 7,
  },
  {
    asesorId: 'renata-cobos',
    leadsPorMes: 5,
    pctContactados: 0.95,
    pctCitas: 0.85,
    pctOfertas: 0.8,
    pctCerrados: 0.7,
    ticketMin: 20_000_000,
    ticketMax: 29_000_000,
    minutosRespuesta: 30,
    mesesHistoria: 7,
  },
  {
    // minutosRespuesta > 120: cae en la alerta de tiempo de respuesta.
    asesorId: 'valeria-ibarra',
    leadsPorMes: 8,
    pctContactados: 0.55,
    pctCitas: 0.65,
    pctOfertas: 0.55,
    pctCerrados: 0.45,
    ticketMin: 12_000_000,
    ticketMax: 17_000_000,
    minutosRespuesta: 195,
    mesesHistoria: 7,
  },
  {
    asesorId: 'tomas-reyna',
    leadsPorMes: 7,
    pctContactados: 0.5,
    pctCitas: 0.5,
    pctOfertas: 0.4,
    pctCerrados: 0.3,
    ticketMin: 10_000_000,
    ticketMax: 15_000_000,
    minutosRespuesta: 150,
    mesesHistoria: 7,
  },
]

// PRNG determinístico (LCG) sembrado por asesorId — para que el volumen
// generado sea estable entre recargas de la demo, en vez de cambiar cada vez
// que se monta la app (Math.random() puro haría que "el excelente" se viera
// distinto en cada sesión).
function crearAleatorio(semilla: number) {
  let estado = semilla % 2147483647
  if (estado <= 0) estado += 2147483646
  return function siguiente(): number {
    estado = (estado * 48271) % 2147483647
    return (estado - 1) / 2147483646
  }
}

function semillaDesdeTexto(texto: string): number {
  let hash = 0
  for (let i = 0; i < texto.length; i++) hash = (hash * 31 + texto.charCodeAt(i)) % 2147483647
  return hash || 1
}

function elegir<T>(opciones: readonly T[], aleatorio: () => number): T {
  return opciones[Math.floor(aleatorio() * opciones.length)]
}

const NOMBRES = [
  'Ana', 'Luis', 'María', 'Jorge', 'Sofía', 'David', 'Carla', 'Raúl', 'Elena', 'Iván',
  'Paola', 'Hugo', 'Daniela', 'Marco', 'Ximena', 'Sergio', 'Adriana', 'Rubén', 'Fernanda', 'Óscar',
]
const APELLIDOS = [
  'Morales', 'Castillo', 'Rivera', 'Domínguez', 'Guerrero', 'Salazar', 'Peña', 'Cortés', 'Vargas', 'Rosales',
  'Medina', 'Cabrera', 'Escobar', 'Zamora', 'Cervantes', 'Bravo', 'Contreras', 'Vega', 'Barrera', 'Aguayo',
]

function nombreAleatorio(aleatorio: () => number): string {
  return `${elegir(NOMBRES, aleatorio)} ${elegir(APELLIDOS, aleatorio)}`
}

function correoDesde(nombre: string, sufijo: string): string {
  return `${nombre.toLowerCase().replace(/\s+/g, '.')}${sufijo}@gmail.com`
}

// Mes 0 = mes actual (nunca después de hoy), mes 1 = el anterior, etc.
function fechaEnMesAtras(mesesAtras: number, aleatorio: () => number): string {
  const hoy = new Date()
  const base = new Date(hoy.getFullYear(), hoy.getMonth() - mesesAtras, 1)
  const diasEnMes = new Date(base.getFullYear(), base.getMonth() + 1, 0).getDate()
  const limiteDia = mesesAtras === 0 ? hoy.getDate() : diasEnMes
  const dia = Math.min(limiteDia, Math.floor(aleatorio() * limiteDia) + 1)
  return new Date(base.getFullYear(), base.getMonth(), dia, 9 + Math.floor(aleatorio() * 8)).toISOString()
}

function diasDespues(fechaISO: string, dias: number): string {
  return new Date(new Date(fechaISO).getTime() + dias * 24 * 60 * 60 * 1000).toISOString()
}

// Estado de dinero de un cierre generado — determinístico sobre cuánto
// tiempo ha pasado desde fechaCierre, no un valor fijo: mientras más viejo
// el cierre, más probable que ya esté formalizado, cobrado y pagado. Control
// Financiero (types/finanzas.ts) es el único lector de estos cuatro campos.
function estadoFinancieroGenerado(
  fechaCierre: string,
  aleatorio: () => number,
): { estadoCierre: EstadoCierre; estadoPago: EstadoPago; fechaCobro: string | null; comisionPagada: boolean } {
  const dias = (Date.now() - new Date(fechaCierre).getTime()) / 86_400_000
  const estadoCierre: EstadoCierre = dias >= 30 ? 'formalizado' : 'en_proceso'
  const probabilidadCobrado = dias > 45 ? 0.9 : dias > 15 ? 0.55 : 0.2
  const estadoPago: EstadoPago = aleatorio() < probabilidadCobrado ? 'cobrado' : 'pendiente'
  const fechaCobro = estadoPago === 'cobrado' ? diasDespues(fechaCierre, 5 + Math.floor(aleatorio() * 25)) : null
  const comisionPagada = estadoCierre === 'formalizado' && dias > 45 && aleatorio() < 0.85
  return { estadoCierre, estadoPago, fechaCobro, comisionPagada }
}

// Un folio real de la zona que domina el asesor, para que el sistema de
// mensaje del hilo generado ("anuncio 3R-xxx") apunte a una propiedad que
// sí existe en el inventario, en vez de a un folio inventado.
function folioParaAsesor(asesorId: string): string {
  const asesor = asesoresDemo.find((a) => a.id === asesorId)
  if (asesor) {
    for (const zona of asesor.zonasDominio) {
      const z = zona.toLowerCase()
      const propiedad = propiedadesDemo.find(
        (p) => p.ubicacion.colonia.toLowerCase().includes(z) || z.includes(p.ubicacion.colonia.toLowerCase()),
      )
      if (propiedad) return propiedad.folio
    }
  }
  return propiedadesDemo[0].folio
}

function generarParaPerfil(perfil: PerfilGeneracion): { prospectos: ProspectoVenta[]; conversaciones: ConversacionInbox[] } {
  const aleatorio = crearAleatorio(semillaDesdeTexto(perfil.asesorId))
  const asesor = asesoresDemo.find((a) => a.id === perfil.asesorId)
  const zona = asesor?.zonasDominio[0]?.toLowerCase() ?? 'polanco'
  const folio = folioParaAsesor(perfil.asesorId)

  const prospectos: ProspectoVenta[] = []
  const conversaciones: ConversacionInbox[] = []

  for (let mes = 0; mes < perfil.mesesHistoria; mes++) {
    const variacion = Math.round((aleatorio() - 0.5) * 3)
    const cantidad = Math.max(2, perfil.leadsPorMes + variacion)

    for (let i = 0; i < cantidad; i++) {
      const id = `pv-gen-${perfil.asesorId}-${mes}-${i}`
      const nombre = nombreAleatorio(aleatorio)
      const fecha = fechaEnMesAtras(mes, aleatorio)

      const pasoContacto = aleatorio() < perfil.pctContactados
      const pasoCita = pasoContacto && aleatorio() < perfil.pctCitas
      const pasoOferta = pasoCita && aleatorio() < perfil.pctOfertas
      const pasoCierre = pasoOferta && aleatorio() < perfil.pctCerrados

      const etapa: EtapaProspectoVenta = pasoCierre
        ? 'cerrado'
        : pasoOferta
          ? 'negociacion'
          : pasoCita
            ? 'mostrando'
            : pasoContacto
              ? 'calificado'
              : 'nuevo'

      const presupuestoMin = Math.round(perfil.ticketMin + aleatorio() * (perfil.ticketMax - perfil.ticketMin) * 0.5)
      const presupuestoMax = Math.round(presupuestoMin + (perfil.ticketMax - perfil.ticketMin) * (0.3 + aleatorio() * 0.3))
      const ultimoContacto = pasoContacto ? diasDespues(fecha, Math.floor(aleatorio() * 20) + 1) : fecha
      const fechaCierre = pasoCierre ? diasDespues(fecha, 12 + Math.floor(aleatorio() * 45)) : null
      const financiero = fechaCierre ? estadoFinancieroGenerado(fechaCierre, aleatorio) : null

      prospectos.push({
        id,
        nombre,
        correo: correoDesde(nombre, String(mes * 100 + i)),
        telefono: `+52 55 ${1000 + Math.floor(aleatorio() * 9000)} ${1000 + Math.floor(aleatorio() * 9000)}`,
        origen: elegir(['sitio_web', 'portal_3r', 'referido', 'llamada'] as const, aleatorio),
        operacion: aleatorio() < 0.85 ? 'comprar' : 'rentar',
        presupuestoMin,
        presupuestoMax,
        moneda: 'MXN',
        zonas: [zona],
        recamarasMin: 2 + Math.floor(aleatorio() * 3),
        tipoPropiedad: elegir(['departamento', 'departamento', 'casa', 'penthouse'] as const, aleatorio),
        creditoPreaprobado: aleatorio() < 0.35,
        etapa,
        asesorId: perfil.asesorId,
        fecha,
        ultimoContacto,
        fechaCierre,
        ...(financiero ?? {}),
      })

      // Solo un puñado de leads recientes recibe hilo de Inbox — es la
      // muestra real de la que Productividad calcula "tiempo de respuesta"
      // (primer mensaje del cliente → primera respuesta del asesor). No
      // todos los leads generados necesitan un hilo: inflaría el Inbox real
      // sin agregar nada a esa métrica.
      if (pasoContacto && mes < 2 && i < 3) {
        const minutosRespuesta = Math.max(4, Math.round(perfil.minutosRespuesta * (0.6 + aleatorio() * 0.8)))
        const horaCliente = fecha
        const horaAsesor = new Date(new Date(fecha).getTime() + minutosRespuesta * 60_000).toISOString()
        const mensajes: MensajeInbox[] = [
          { id: `${id}-m1`, de: 'cliente', tipo: 'texto', texto: 'Hola, vi la propiedad y quisiera más información.', hora: horaCliente },
          { id: `${id}-m2`, de: 'asesor', tipo: 'texto', texto: '¡Hola! Claro, con gusto te comparto los detalles en un momento.', hora: horaAsesor },
        ]
        conversaciones.push({
          id: `conv-gen-${id}`,
          prospectoVentaId: id,
          noLeidos: 0,
          ventanaExpiraEn: new Date(new Date(horaAsesor).getTime() + 24 * 60 * 60 * 1000).toISOString(),
          folioAnuncio: folio,
          mensajes,
        })
      }
    }
  }

  return { prospectos, conversaciones }
}

const GENERADO = PERFILES.map(generarParaPerfil)

export const prospectosVentaGenerados: ProspectoVenta[] = GENERADO.flatMap((g) => g.prospectos)
export const conversacionesGeneradas: ConversacionInbox[] = GENERADO.flatMap((g) => g.conversaciones)
