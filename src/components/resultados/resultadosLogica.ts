import type { TabBusqueda } from '../landing/searchConfig'
import type { Listado, Propiedad, TipoPropiedad } from '../../types/propiedad'
import { ETIQUETA_TIPO, precioMinimo } from '../../types/propiedad'

// ---------------------------------------------------------------------------
// Filtros — un único objeto derivado de la URL. Los componentes nunca leen
// URLSearchParams directamente: todos pasan por parsearFiltros/construirURL,
// para que el enlace compartible sea la única fuente de verdad.
// ---------------------------------------------------------------------------

export type OperacionFiltro = Listado['operacion'] | ''
export type Orden = 'reciente' | 'precio-asc' | 'precio-desc' | 'superficie-desc'
export type Vista = 'mapa' | 'lista'

export interface Filtros {
  zona: string
  operacion: OperacionFiltro
  precioMin: number | null
  tipo: TipoPropiedad | ''
  recamarasMin: number | null
  orden: Orden
  vista: Vista
}

// Tipos de propiedad que caben bajo el tab "Comercial": no es una
// operación (venta/renta/preventa), es un recorte por tipo de inmueble.
export const TIPOS_COMERCIALES: TipoPropiedad[] = ['oficina', 'local-comercial']

// Cada ruta/tab precarga un filtro por default, pero cualquier parámetro
// explícito en la URL siempre gana sobre este default.
const OPERACION_POR_MODO: Record<TabBusqueda, OperacionFiltro> = {
  comprar: 'venta',
  rentar: 'renta',
  preventa: 'preventa',
  comercial: '',
}

export function parsearFiltros(searchParams: URLSearchParams, modo: TabBusqueda): Filtros {
  const operacionParam = searchParams.get('operacion')
  const tipoParam = searchParams.get('tipo')
  const precioMinParam = searchParams.get('precioMin')
  const recamarasMinParam = searchParams.get('recamarasMin')
  const ordenParam = searchParams.get('orden')
  const vistaParam = searchParams.get('vista')

  return {
    zona: searchParams.get('zona') ?? '',
    operacion: (operacionParam as OperacionFiltro | null) ?? OPERACION_POR_MODO[modo],
    precioMin: precioMinParam ? Number(precioMinParam) : null,
    tipo: (tipoParam as TipoPropiedad | null) ?? '',
    recamarasMin: recamarasMinParam ? Number(recamarasMinParam) : null,
    orden: (ordenParam as Orden | null) ?? 'reciente',
    vista: (vistaParam as Vista | null) ?? 'mapa',
  }
}

// Arma la URLSearchParams completa a partir de un parche sobre los filtros
// actuales — así cada control solo declara qué campo cambia.
export function construirParametros(filtros: Filtros): URLSearchParams {
  const parametros = new URLSearchParams()
  if (filtros.zona) parametros.set('zona', filtros.zona)
  if (filtros.operacion) parametros.set('operacion', filtros.operacion)
  if (filtros.precioMin) parametros.set('precioMin', String(filtros.precioMin))
  if (filtros.tipo) parametros.set('tipo', filtros.tipo)
  if (filtros.recamarasMin) parametros.set('recamarasMin', String(filtros.recamarasMin))
  if (filtros.orden !== 'reciente') parametros.set('orden', filtros.orden)
  if (filtros.vista !== 'mapa') parametros.set('vista', filtros.vista)
  return parametros
}

function coincideZona(propiedad: Propiedad, zona: string): boolean {
  const objetivo = zona.trim().toLowerCase()
  if (!objetivo) return true
  const direccion = 'direccion' in propiedad.ubicacion ? propiedad.ubicacion.direccion : propiedad.ubicacion.referencia
  return [propiedad.ubicacion.colonia, propiedad.ubicacion.alcaldia, direccion].some((campo) =>
    campo.toLowerCase().includes(objetivo),
  )
}

function tieneRecamaras(atributos: Propiedad): atributos is Propiedad & { recamaras: number } {
  return 'recamaras' in atributos
}

export function filtrarPropiedades(propiedades: Propiedad[], filtros: Filtros, modo: TabBusqueda): Propiedad[] {
  const tiposPermitidos =
    filtros.tipo ? [filtros.tipo] : modo === 'comercial' ? TIPOS_COMERCIALES : null

  return propiedades.filter((propiedad) => {
    if (!coincideZona(propiedad, filtros.zona)) return false
    if (tiposPermitidos && !tiposPermitidos.includes(propiedad.tipo)) return false
    if (filtros.operacion && !propiedad.listados.some((l) => l.operacion === filtros.operacion)) return false
    if (filtros.precioMin && !propiedad.listados.some((l) => l.precio.monto >= filtros.precioMin!)) return false
    if (filtros.recamarasMin) {
      if (!tieneRecamaras(propiedad) || propiedad.recamaras < filtros.recamarasMin) return false
    }
    return true
  })
}

function superficie(propiedad: Propiedad): number {
  return 'm2Construccion' in propiedad ? propiedad.m2Construccion : propiedad.m2Terreno
}

// Propiedades con video, fijas al inicio del listado por defecto — en este
// orden exacto, variedad a propósito (departamento, penthouse, casa, renta)
// para que la sección se vea representativa del catálogo, no repetitiva.
// Solo aplica al orden "reciente" (el default): un orden explícito de
// precio/m² o un filtro que las excluya siempre gana sobre este fijado —
// fijarlas ahí rompería el criterio que el usuario pidió.
const FOLIOS_VIDEO_DESTACADO = ['3R-118', '3R-112', '3R-119', '3R-115']

function esVideoDestacada(propiedad: Propiedad): boolean {
  return FOLIOS_VIDEO_DESTACADO.includes(propiedad.folio)
}

// Reordena para que las propiedades con video vayan primero, en el orden
// fijo de arriba; el resto conserva su orden relativo. Si una propiedad con
// video no está en `propiedades` (filtrada, o no forma parte del arreglo
// recibido) simplemente no aparece — no hay hueco ni relleno.
export function priorizarConVideo(propiedades: Propiedad[]): Propiedad[] {
  const destacadas = FOLIOS_VIDEO_DESTACADO.map((folio) =>
    propiedades.find((propiedad) => propiedad.folio === folio),
  ).filter((propiedad): propiedad is Propiedad => propiedad !== undefined)
  const resto = propiedades.filter((propiedad) => !esVideoDestacada(propiedad))
  return [...destacadas, ...resto]
}

export function ordenarPropiedades(propiedades: Propiedad[], orden: Orden): Propiedad[] {
  const copia = [...propiedades]
  switch (orden) {
    case 'precio-asc':
      return copia.sort((a, b) => precioMinimo(a).monto - precioMinimo(b).monto)
    case 'precio-desc':
      return copia.sort((a, b) => precioMinimo(b).monto - precioMinimo(a).monto)
    case 'superficie-desc':
      return copia.sort((a, b) => superficie(b) - superficie(a))
    case 'reciente':
    default:
      return priorizarConVideo(copia)
  }
}

// ---------------------------------------------------------------------------
// Título dinámico — "Departamentos en venta en Polanco, Miguel Hidalgo".
// ---------------------------------------------------------------------------

const PLURAL_TIPO: Record<TipoPropiedad, string> = {
  departamento: 'Departamentos',
  casa: 'Casas',
  penthouse: 'Penthouses',
  oficina: 'Oficinas',
  'local-comercial': 'Locales comerciales',
  terreno: 'Terrenos',
}

const ETIQUETA_OPERACION_CORTA: Record<Listado['operacion'], string> = {
  venta: 'venta',
  renta: 'renta',
  preventa: 'preventa',
}

export function construirTituloResultados(filtros: Filtros, resultados: Propiedad[]): string {
  const sustantivo = filtros.tipo ? PLURAL_TIPO[filtros.tipo] : 'Propiedades'
  const fraseOperacion = filtros.operacion ? ` en ${ETIQUETA_OPERACION_CORTA[filtros.operacion]}` : ''

  let fraseZona = ''
  if (filtros.zona) {
    const primero = resultados[0]
    fraseZona = primero
      ? ` en ${primero.ubicacion.colonia}, ${primero.ubicacion.alcaldia}`
      : ` en "${filtros.zona}"`
  }

  return `${sustantivo}${fraseOperacion}${fraseZona}`
}

export function contarFiltrosActivos(filtros: Filtros): number {
  return [filtros.zona, filtros.operacion, filtros.precioMin, filtros.tipo, filtros.recamarasMin].filter(
    Boolean,
  ).length
}

// Zonas con inventario real, para sugerir cuando una búsqueda no arroja
// nada — nunca una lista fija que podría mentir.
export function zonasConInventario(propiedades: Propiedad[]): string[] {
  const zonas = new Set(propiedades.map((p) => p.ubicacion.colonia))
  return [...zonas].sort((a, b) => a.localeCompare(b, 'es'))
}

export { ETIQUETA_TIPO }
