// ---------------------------------------------------------------------------
// Precio — nunca un number suelto. Operan en MXN y en USD; sin moneda,
// $1,172,000 USD se ve más barato que $22,792,000 MXN.
// ---------------------------------------------------------------------------

export type Moneda = 'MXN' | 'USD'

export interface Precio {
  monto: number
  moneda: Moneda
}

export function formatearPrecio(precio: Precio): string {
  const monto = new Intl.NumberFormat('es-MX', {
    maximumFractionDigits: 0,
  }).format(precio.monto)
  return `$${monto} ${precio.moneda}`
}

// ---------------------------------------------------------------------------
// Ubicación — colonia y alcaldía separadas (arman el título). Venta y renta
// exponen dirección exacta; preventa solo una referencia aproximada.
// ---------------------------------------------------------------------------

interface UbicacionBase {
  colonia: string
  alcaldia: string
  ciudad: string
  codigoPostal: string
}

export interface UbicacionExacta extends UbicacionBase {
  direccion: string
}

export interface UbicacionAproximada extends UbicacionBase {
  referencia: string
}

export interface Coordenadas {
  lat: number
  lng: number
}

// ---------------------------------------------------------------------------
// Medios — fotografía, render o recorrido 360. Preventa suele usar
// renders, pero también acepta fotografía real (fachada ya construida);
// la interfaz debe poder etiquetar cada medio como tal.
// ---------------------------------------------------------------------------

export type TipoMedio = 'fotografia' | 'render' | 'recorrido-360' | 'video'

export interface Medio {
  tipo: TipoMedio
  url: string
  alt: string
  // Solo aplica a 'video': portada para el mosaico antes de reproducirlo.
  // Sin ella, el mosaico cae al propio <video> (preload="metadata") como
  // miniatura.
  miniatura?: string
}

// Preventa suele mostrarse con renders, pero una torre ya empezada puede
// traer fachada fotografiada de verdad ('fotografia') o un recorrido en
// video de la obra o la unidad modelo ('video').
export type MedioPreventa = Medio & { tipo: 'fotografia' | 'render' | 'recorrido-360' | 'video' }

// ---------------------------------------------------------------------------
// Tipo de inmueble + atributos condicionados por tipo. No todos llevan
// recámaras: una oficina es "baños + m²", un terreno solo "m²". La ausencia
// de un campo se modela con su ausencia real en el tipo, nunca con 0.
// ---------------------------------------------------------------------------

export type TipoPropiedad =
  | 'departamento'
  | 'casa'
  | 'penthouse'
  | 'oficina'
  | 'local-comercial'
  | 'terreno'

export type AtributosPropiedad =
  | {
      tipo: 'departamento' | 'penthouse'
      recamaras: number
      banos: number
      m2Construccion: number
    }
  | {
      tipo: 'casa'
      recamaras: number
      banos: number
      m2Construccion: number
      m2Terreno: number
    }
  | {
      tipo: 'oficina' | 'local-comercial'
      banos: number
      m2Construccion: number
    }
  | {
      tipo: 'terreno'
      m2Terreno: number
    }

export const ETIQUETA_TIPO: Record<TipoPropiedad, string> = {
  departamento: 'Departamento',
  casa: 'Casa',
  penthouse: 'Penthouse',
  oficina: 'Oficina',
  'local-comercial': 'Local comercial',
  terreno: 'Terreno',
}

// ---------------------------------------------------------------------------
// Listados — lo que cambia según cómo se está ofreciendo la unidad (precio,
// plazo, condiciones), separado de la unidad física en sí (tipo, atributos,
// ubicación, fotos). Una misma unidad puede tener más de un listado a la
// vez: en venta Y en renta al mismo tiempo es un caso real, no la
// excepción — por eso `listados` es un arreglo, nunca un campo único.
// ---------------------------------------------------------------------------

export type TipoCredito = 'infonavit' | 'fovissste' | 'bancario' | 'cofinavit'

export interface ListadoVenta {
  operacion: 'venta'
  precio: Precio
  escriturado: boolean
  creditosAceptados: TipoCredito[]
}

export interface ListadoRenta {
  operacion: 'renta'
  precio: Precio
  plazoMinimoMeses: number
  amueblado: boolean
  incluyeMantenimiento: boolean
  deposito: Precio
}

export interface ListadoPreventa {
  operacion: 'preventa'
  precio: Precio
  desarrollador: string
  fechaEntregaEstimada: string
  avanceObra: number
  esquemaPagos: string
  unidadesDisponibles: number
  unidadesTotales: number
}

export type Listado = ListadoVenta | ListadoRenta | ListadoPreventa

// Helpers de construcción: si se escribiera el objeto literal directo dentro
// del arreglo `listados`, TS lo infiere como el Listado más amplio que
// calce y pierde el discriminante fino. Anotarlo contra la rama concreta
// antes de meterlo al arreglo evita ese ensanchamiento.
export function listadoVenta(datos: Omit<ListadoVenta, 'operacion'>): ListadoVenta {
  return { operacion: 'venta', ...datos }
}

export function listadoRenta(datos: Omit<ListadoRenta, 'operacion'>): ListadoRenta {
  return { operacion: 'renta', ...datos }
}

export function listadoPreventa(datos: Omit<ListadoPreventa, 'operacion'>): ListadoPreventa {
  return { operacion: 'preventa', ...datos }
}

// Arreglo no vacío: TS exige al menos un elemento en tiempo de compilación.
type ListaNoVacia<T> = [T, ...T[]]

// ---------------------------------------------------------------------------
// Detalles adicionales de la ficha — ninguno venía en la lista original del
// cliente. Todos opcionales salvo la fecha de publicación: un terreno no
// tiene piso ni año de construcción, una preventa no tiene año de
// construcción (todavía no existe), una casa no suele tener mantenimiento.
// La ficha de propiedad solo pinta el dato que sí viene.
// ---------------------------------------------------------------------------

export type Condicion = 'nuevo' | 'usado' | 'remodelado'
export type Disposicion = 'norte' | 'sur' | 'oriente' | 'poniente' | 'esquina'

// Estado interno de la operación — nunca visible en el portal público, solo
// en el inventario del panel administrativo (admin y asesor). No confundir
// con `Listado['operacion']` (venta/renta/preventa, lo que se ofrece) ni con
// TipoProceso 'publicacion' (el trámite de captación): esto es en qué punto
// va la propiedad frente a un comprador — libre, ya apartada, o ya vendida.
export type EstadoPropiedad = 'disponible' | 'apartada' | 'vendida'

const ETIQUETA_ESTADO: Record<EstadoPropiedad, string> = {
  disponible: 'Disponible',
  apartada: 'Apartada',
  vendida: 'Vendida',
}

export function etiquetaEstado(estado: EstadoPropiedad): string {
  return ETIQUETA_ESTADO[estado]
}

export interface DetallesAdicionales {
  fechaPublicacion: string
  estacionamientos?: number
  piso?: number
  anoConstruccion?: number
  mantenimiento?: Precio
  condicion?: Condicion
  disposicion?: Disposicion
}

const ETIQUETA_CONDICION: Record<Condicion, string> = {
  nuevo: 'Nuevo',
  usado: 'Usado',
  remodelado: 'Remodelado',
}

const ETIQUETA_DISPOSICION: Record<Disposicion, string> = {
  norte: 'Norte',
  sur: 'Sur',
  oriente: 'Oriente',
  poniente: 'Poniente',
  esquina: 'Esquina',
}

export function etiquetaCondicion(condicion: Condicion): string {
  return ETIQUETA_CONDICION[condicion]
}

export function etiquetaDisposicion(disposicion: Disposicion): string {
  return ETIQUETA_DISPOSICION[disposicion]
}

const UNIDADES_TIEMPO: [number, string][] = [
  [60 * 60 * 24 * 365, 'año'],
  [60 * 60 * 24 * 30, 'mes'],
  [60 * 60 * 24 * 7, 'semana'],
  [60 * 60 * 24, 'día'],
]

// "Publicado hace X" — relativo a ahora, no un texto fijo guardado en la
// demo, para que no se quede diciendo "hace 2 días" para siempre.
export function publicadoHace(fechaPublicacion: string): string {
  const segundos = Math.max(0, (Date.now() - new Date(fechaPublicacion).getTime()) / 1000)
  for (const [segundosUnidad, etiqueta] of UNIDADES_TIEMPO) {
    const cantidad = Math.floor(segundos / segundosUnidad)
    if (cantidad >= 1) return `hace ${cantidad} ${etiqueta}${cantidad > 1 ? 's' : ''}`
  }
  return 'hoy'
}

// ---------------------------------------------------------------------------
// Propiedad — la unidad física. Preventa sigue siendo su propia rama (no
// tiene dirección exacta ni fotografía garantizada), pero venta y renta ya
// no son ramas separadas de la propiedad: son listados que pueden convivir
// dentro de la misma unidad construida.
// ---------------------------------------------------------------------------

// Clave de plantilla del visor 3D — no es un dato real del inmueble, es
// un forzado manual opcional. Si una propiedad no la trae, el visor
// decide sola con elegirPlantilla() según tipo, recámaras y m².
export type Plantilla3D = 'depto2' | 'depto3' | 'deptoGrande' | 'penthouse' | 'oficina'

interface PropiedadBase {
  folio: string
  estado: EstadoPropiedad
  descripcion: string
  coordenadas: Coordenadas
  detalles: DetallesAdicionales
  plantilla3d?: Plantilla3D
}

export type PropiedadConstruida = PropiedadBase &
  AtributosPropiedad & {
    medios: Medio[]
    ubicacion: UbicacionExacta
    listados: ListaNoVacia<ListadoVenta | ListadoRenta>
  }

export type PropiedadPreventa = PropiedadBase &
  AtributosPropiedad & {
    medios: MedioPreventa[]
    ubicacion: UbicacionAproximada
    listados: [ListadoPreventa]
  }

export type Propiedad = PropiedadConstruida | PropiedadPreventa

export function esPreventa(propiedad: Propiedad): propiedad is PropiedadPreventa {
  return propiedad.listados[0].operacion === 'preventa'
}

// ---------------------------------------------------------------------------
// Helpers que dependen de exhaustividad — si se agrega o quita una operación
// y algún switch no cubre los tres casos, TypeScript debe reclamar.
// ---------------------------------------------------------------------------

function nuncaOperacion(x: never): never {
  throw new Error(`Operación no manejada: ${JSON.stringify(x)}`)
}

export function etiquetaOperacion(operacion: Listado['operacion']): string {
  switch (operacion) {
    case 'venta':
      return 'EN VENTA'
    case 'renta':
      return 'EN RENTA'
    case 'preventa':
      return 'EN PREVENTA'
    default:
      return nuncaOperacion(operacion)
  }
}

export function construirTitulo(propiedad: Propiedad): string {
  return `${ETIQUETA_TIPO[propiedad.tipo]} en ${propiedad.ubicacion.colonia}, ${propiedad.ubicacion.alcaldia}`
}

function nuncaAtributos(x: never): never {
  throw new Error(`Tipo de propiedad no manejado: ${JSON.stringify(x)}`)
}

const formatoM2 = new Intl.NumberFormat('es-MX')

// Bullets de atributos por tipo. Nunca "0 recámaras": los tipos sin
// recámaras (oficina, local, terreno) simplemente no tienen el campo, así
// que este switch no puede imprimirlas por accidente.
export function resumenAtributos(atributos: AtributosPropiedad): string[] {
  switch (atributos.tipo) {
    case 'departamento':
    case 'penthouse':
      return [
        `${atributos.recamaras} rec.`,
        `${atributos.banos} baños`,
        `${formatoM2.format(atributos.m2Construccion)} m²`,
      ]
    case 'casa':
      return [
        `${atributos.recamaras} rec.`,
        `${atributos.banos} baños`,
        `${formatoM2.format(atributos.m2Construccion)} m² const.`,
      ]
    case 'oficina':
    case 'local-comercial':
      return [`${atributos.banos} baños`, `${formatoM2.format(atributos.m2Construccion)} m²`]
    case 'terreno':
      return [`${formatoM2.format(atributos.m2Terreno)} m²`]
    default:
      return nuncaAtributos(atributos)
  }
}

// Precio "representativo" de una propiedad para ordenar/filtrar por precio
// cuando trae más de un listado: el menor de todos, para que "$65,000 MXN
// en renta" no quede escondido detrás de un "$15,200,000 MXN en venta".
export function precioMinimo(propiedad: Propiedad): Precio {
  return propiedad.listados.reduce((menor, listado) =>
    listado.precio.monto < menor.monto ? listado.precio : menor,
    propiedad.listados[0].precio,
  )
}
