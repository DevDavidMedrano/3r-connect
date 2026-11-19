import type { Resena, ResumenResenas } from '../types/resena'

// ---------------------------------------------------------------------------
// DEMO — reseñas de ejemplo, NO clientes reales. Nombre de pila + inicial
// de apellido únicamente (ej. "Mariana G."), nunca nombre completo, para
// que en una junta quede claro que son ilustrativas y no personas de
// verdad haciéndose pasar por clientes.
//
// Cada una se liga a un folio real de propiedadesDemo.ts — la tarjeta usa
// esa liga para tomar la foto y el tipo de inmueble, nunca una imagen
// suelta.
//
// Fuente de datos aislada a propósito en obtenerResenas()/
// obtenerResumenResenas(): si 3R tiene perfil de Google Business, esas dos
// funciones son el único punto que hay que cambiar por la llamada a la
// API de Places — el componente que las consume no necesita tocarse.
// ---------------------------------------------------------------------------

const resenasDemo: Resena[] = [
  {
    id: 'resena-01',
    folio: '3R-105',
    nombre: 'Mariana G.',
    iniciales: 'MG',
    colorAvatar: '#5c1a2e',
    operacion: 'Compra',
    zona: 'Polanco III',
    calificacion: 5,
    texto:
      'Buscaba departamento en Polanco desde hacía meses y en 3R Connect me atendieron distinto: nunca me mandaron opciones fuera de lo que pedía. Mi asesora conocía cada edificio de la zona, hasta detalles como el ruido de la calle o el tiempo de espera del elevador. Cerramos en seis semanas.',
    fecha: '2026-05-12',
    verificada: true,
  },
  {
    id: 'resena-02',
    folio: '3R-113',
    nombre: 'Jorge T.',
    iniciales: 'JT',
    colorAvatar: '#2563a8',
    operacion: 'Renta',
    zona: 'Polanco V',
    calificacion: 5,
    texto:
      'Necesitaba mudarme en menos de un mes por trabajo. Me mostraron tres departamentos el mismo día y el contrato quedó listo en 48 horas. Respondían mis mensajes de WhatsApp incluso en fin de semana, algo que no me pasó con otras inmobiliarias que contacté antes.',
    fecha: '2026-06-02',
    verificada: true,
  },
  {
    id: 'resena-03',
    folio: '3R-106',
    nombre: 'Alejandra R.',
    iniciales: 'AR',
    colorAvatar: '#b0651b',
    operacion: 'Venta',
    zona: 'Polanco V',
    calificacion: 4,
    texto:
      'Vendí un departamento que había heredado y no sabía por dónde empezar. Me explicaron el proceso de escrituración paso a paso y me acompañaron a la notaría el día de la firma. Se tardó un poco más de lo que esperaba, pero el seguimiento fue constante en todo momento.',
    fecha: '2026-04-20',
    verificada: true,
  },
  {
    id: 'resena-04',
    folio: '3R-110',
    nombre: 'Roberto N.',
    iniciales: 'RN',
    colorAvatar: '#3e7d5a',
    operacion: 'Preventa',
    zona: 'Polanco',
    calificacion: 5,
    texto:
      'Compré en preventa y me daba nervio no ver la unidad terminada. Me mandaron avances de obra cada mes con fotos reales, no solo renders, y mi asesor conocía al desarrollador de tiempo atrás. Eso me dio mucha más confianza que otras preventas que había visto antes.',
    fecha: '2026-03-08',
    verificada: true,
  },
  {
    id: 'resena-05',
    folio: '3R-111',
    nombre: 'Carla V.',
    iniciales: 'CV',
    colorAvatar: '#a81f45',
    operacion: 'Compra',
    zona: 'Polanco',
    calificacion: 5,
    texto:
      'Buscábamos un penthouse con terraza y la lista de opciones que nos mandaron ya venía filtrada de verdad, nada de propiedades que no cumplían lo que pedimos. La negociación del precio final la llevó nuestro asesor directamente con el vendedor, sin presionarnos en ningún momento del proceso.',
    fecha: '2026-02-15',
    verificada: true,
  },
  {
    id: 'resena-06',
    folio: '3R-114',
    nombre: 'Fernando P.',
    iniciales: 'FP',
    colorAvatar: '#6b4c9a',
    operacion: 'Compra',
    zona: 'Lomas de Chapultepec',
    calificacion: 4,
    texto:
      'El trámite de crédito bancario se complicó de mi lado y el equipo de 3R fue paciente, incluso me ayudaron a entender qué documentos me estaba pidiendo el banco. Tardamos casi tres meses en cerrar, más de lo normal, pero nunca perdí el contacto con mi asesor durante ese tiempo.',
    fecha: '2026-01-22',
    verificada: true,
  },
]

// DEMO — estadística del perfil, no calculada de las 6 reseñas de arriba
// (que son solo una muestra ilustrativa de un perfil con más historial).
// Reemplazar junto con las reseñas cuando se conecte la fuente real.
const resumenDemo: ResumenResenas = { promedio: 4.9, total: 38 }

export function obtenerResenas(): Resena[] {
  return resenasDemo
}

export function obtenerResumenResenas(): ResumenResenas {
  return resumenDemo
}
