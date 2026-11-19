import type { ConversacionInbox } from '../types/conversacion'

const MS_POR_HORA = 60 * 60 * 1000
const MS_POR_MINUTO = 60 * 1000

// Relativas a "ahora" (momento en que carga la demo), no fechas fijas: así
// la ventana de 24h y los "hace X" siempre se ven creíbles sin importar
// cuándo se abra la app. La conversación de folio 3R-110 (cliente Demo)
// tiene la ventana ya cerrada a propósito — el trato ya se cerró.
function haceMinutos(minutos: number): string {
  return new Date(Date.now() - minutos * MS_POR_MINUTO).toISOString()
}

function enHoras(horas: number): string {
  return new Date(Date.now() + horas * MS_POR_HORA).toISOString()
}

// DEMO — 6 hilos ligados por prospectoVentaId a prospectosVentaDemo (ver
// data/prospectosVentaDemo.ts): nombre, correo, teléfono, etapa, asesor y
// "qué busca" no se repiten aquí, se leen del prospecto. Folios de
// propiedad compartida son reales de propiedadesDemo.
export const conversacionesDemo: ConversacionInbox[] = [
  {
    id: 'conversacion-01',
    prospectoVentaId: 'prospecto-venta-02', // Luis Fernando Paredes — sin asignar
    noLeidos: 1,
    ventanaExpiraEn: enHoras(22),
    folioAnuncio: '3R-113',
    mensajes: [
      { id: 'msg-01-1', de: 'cliente', tipo: 'texto', texto: 'Hola, vi el departamento 3R-113 en renta, ¿sigue disponible?', hora: haceMinutos(40) },
    ],
  },
  {
    id: 'conversacion-02',
    prospectoVentaId: 'prospecto-venta-03', // Camila Reyes — mariana-solis
    noLeidos: 0,
    ventanaExpiraEn: enHoras(21.5),
    folioAnuncio: '3R-114',
    mensajes: [
      { id: 'msg-02-1', de: 'cliente', tipo: 'texto', texto: 'Hola, buenas tardes. Vi el departamento en Lomas de Chapultepec, ¿cuál es el precio final?', hora: haceMinutos(180) },
      { id: 'msg-02-2', de: 'asesor', tipo: 'texto', texto: '¡Hola Camila! Buenas tardes. El precio de lista es $28,000,000 MXN, con posibilidad de negociar según forma de pago.', hora: haceMinutos(170) },
      { id: 'msg-02-3', de: 'asesor', tipo: 'propiedad', folioPropiedad: '3R-114', hora: haceMinutos(169) },
      { id: 'msg-02-4', de: 'cliente', tipo: 'texto', texto: 'Perfecto, ¿acepta crédito bancario?', hora: haceMinutos(150) },
      { id: 'msg-02-5', de: 'asesor', tipo: 'texto', texto: 'Sí, aceptamos crédito bancario y Cofinavit. ¿Ya tienes precalificación?', hora: haceMinutos(140) },
    ],
  },
  {
    id: 'conversacion-03',
    prospectoVentaId: 'prospecto-venta-04', // Emilio Duarte — diego-herrera, agente_ia
    noLeidos: 1,
    ventanaExpiraEn: enHoras(19),
    folioAnuncio: '3R-DEMO-02',
    mensajes: [
      { id: 'msg-03-1', de: 'cliente', tipo: 'texto', texto: 'Hola, me interesa la preventa en Nuevo Polanco que vi en redes.', hora: haceMinutos(300) },
      { id: 'msg-03-2', de: 'asesor', tipo: 'texto', texto: '¡Hola Emilio! Con gusto. La torre entrega en junio 2027, con 25% de enganche y 75% contra entrega.', hora: haceMinutos(290) },
      { id: 'msg-03-3', de: 'asesor', tipo: 'propiedad', folioPropiedad: '3R-DEMO-02', hora: haceMinutos(289) },
      { id: 'msg-03-4', de: 'cliente', tipo: 'texto', texto: '¿Tienen alguna unidad de 2 recámaras disponible todavía?', hora: haceMinutos(40) },
    ],
  },
  {
    id: 'conversacion-04',
    prospectoVentaId: 'prospecto-venta-06', // Rodrigo Espinoza — renata-cobos
    noLeidos: 0,
    ventanaExpiraEn: enHoras(18),
    folioAnuncio: '3R-108',
    mensajes: [
      { id: 'msg-04-1', de: 'cliente', tipo: 'texto', texto: 'Buenas, ¿la oficina en Anzures tiene estacionamientos incluidos?', hora: haceMinutos(360) },
      { id: 'msg-04-2', de: 'asesor', tipo: 'texto', texto: 'Hola Rodrigo, sí, incluye 6 cajones de estacionamiento y recepción compartida.', hora: haceMinutos(350) },
      { id: 'msg-04-3', de: 'asesor', tipo: 'propiedad', folioPropiedad: '3R-108', hora: haceMinutos(349) },
      { id: 'msg-04-4', de: 'cliente', tipo: 'texto', texto: 'Me gustaría agendar una visita esta semana.', hora: haceMinutos(330) },
      { id: 'msg-04-5', de: 'asesor', tipo: 'texto', texto: 'Claro, te comparto los horarios disponibles en un momento.', hora: haceMinutos(320) },
    ],
  },
  {
    id: 'conversacion-05',
    prospectoVentaId: 'prospecto-venta-07', // Valentina Cruz — mariana-solis, negociación
    noLeidos: 1,
    ventanaExpiraEn: enHoras(1.2),
    folioAnuncio: '3R-118',
    mensajes: [
      { id: 'msg-05-1', de: 'cliente', tipo: 'texto', texto: 'Hola, ¿$15,500,000 es el precio final o hay margen?', hora: haceMinutos(1380) },
      { id: 'msg-05-2', de: 'asesor', tipo: 'texto', texto: 'Hola Valentina, podemos revisar condiciones. ¿Cuál sería tu oferta?', hora: haceMinutos(1350) },
      { id: 'msg-05-3', de: 'cliente', tipo: 'texto', texto: 'Pensaba en $14,800,000 con cierre rápido.', hora: haceMinutos(30) },
    ],
  },
  {
    id: 'conversacion-06',
    prospectoVentaId: 'prospecto-venta-10', // Demo — folio 3R-110, cerrado
    noLeidos: 0,
    ventanaExpiraEn: enHoras(-5),
    folioAnuncio: '3R-110',
    mensajes: [
      { id: 'msg-06-1', de: 'cliente', tipo: 'texto', texto: 'Hola, me interesa la propiedad 3R-110 en Polanco. ¿Me pueden dar más información?', hora: haceMinutos(3000) },
      { id: 'msg-06-2', de: 'asesor', tipo: 'texto', texto: '¡Hola! Claro, con gusto te comparto los detalles.', hora: haceMinutos(2940) },
      { id: 'msg-06-3', de: 'asesor', tipo: 'propiedad', folioPropiedad: '3R-110', hora: haceMinutos(2930) },
      { id: 'msg-06-4', de: 'cliente', tipo: 'texto', texto: 'Me encantó, ¿cómo sigo con el apartado?', hora: haceMinutos(2400) },
      { id: 'msg-06-5', de: 'asesor', tipo: 'texto', texto: 'Perfecto, ya registramos tu apartado. En breve te contacto para los siguientes pasos.', hora: haceMinutos(2340) },
    ],
  },
]
