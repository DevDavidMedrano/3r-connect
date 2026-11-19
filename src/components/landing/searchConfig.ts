import type { TipoPropiedad } from '../../types/propiedad'

export type TabBusqueda = 'comprar' | 'rentar' | 'preventa' | 'comercial'

export const TABS_BUSQUEDA: { valor: TabBusqueda; etiqueta: string; ruta: string }[] = [
  { valor: 'comprar', etiqueta: 'Comprar', ruta: '/comprar' },
  { valor: 'rentar', etiqueta: 'Rentar', ruta: '/rentar' },
  { valor: 'preventa', etiqueta: 'Preventa', ruta: '/preventa' },
  { valor: 'comercial', etiqueta: 'Comercial', ruta: '/comercial' },
]

// Único lugar donde vive la relación tab → tipos de propiedad buscables.
// El resto de la UI (SearchCard, Header) solo lee de aquí, nunca condiciona
// con if/else repetidos.
export const TIPOS_POR_TAB: Record<TabBusqueda, string[]> = {
  comprar: ['Departamento', 'Casa', 'Penthouse', 'Casa en condominio', 'Terreno'],
  rentar: ['Departamento', 'Casa', 'Penthouse'],
  preventa: ['Departamento', 'Casa en condominio'],
  comercial: ['Oficina', 'Local comercial', 'Bodega'],
}

// No todas las etiquetas del buscador tienen un TipoPropiedad real detrás
// ("Casa en condominio", "Bodega" son etiquetas de marketing, no tipos del
// modelo de datos): las que no tienen equivalente simplemente no filtran
// por tipo en los resultados, en vez de mapear a algo incorrecto.
const TIPO_A_DOMINIO: Partial<Record<string, TipoPropiedad>> = {
  Departamento: 'departamento',
  Casa: 'casa',
  Penthouse: 'penthouse',
  Oficina: 'oficina',
  'Local comercial': 'local-comercial',
  Terreno: 'terreno',
}

interface EstadoBusqueda {
  tab: TabBusqueda
  zona: string
  precioMinimo: string
  recamaras: string
  tipo: string
}

// Único lugar donde el estado del buscador (hero y pastilla compacta del
// header) se traduce a la URL de resultados — así ambos comparten
// exactamente los mismos parámetros que lee ResultadosPage.
export function construirRutaBusqueda(estado: EstadoBusqueda): string {
  const ruta = TABS_BUSQUEDA.find((t) => t.valor === estado.tab)!.ruta
  const parametros = new URLSearchParams()

  if (estado.zona.trim()) parametros.set('zona', estado.zona.trim())

  const precioMin = Number(estado.precioMinimo)
  if (estado.precioMinimo && Number.isFinite(precioMin) && precioMin > 0) {
    parametros.set('precioMin', String(precioMin))
  }

  const recamarasMin = Number(estado.recamaras)
  if (estado.recamaras && Number.isFinite(recamarasMin) && recamarasMin > 0) {
    parametros.set('recamarasMin', String(recamarasMin))
  }

  const tipoDominio = TIPO_A_DOMINIO[estado.tipo]
  if (tipoDominio) parametros.set('tipo', tipoDominio)

  const query = parametros.toString()
  return query ? `${ruta}?${query}` : ruta
}
