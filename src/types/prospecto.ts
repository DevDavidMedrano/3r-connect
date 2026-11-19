import { formatearPrecio, type Precio, type TipoPropiedad } from './propiedad'

// ---------------------------------------------------------------------------
// Prospecto — un dueño que quiere listar su propiedad con la inmobiliaria
// (el lado de la OFERTA). Vive aparte de Solicitud (types/solicitud.ts): esa
// es un comprador interesado en una propiedad ya publicada; esto es antes de
// que la propiedad exista en el inventario.
//
// `etapa` es el embudo de captación. `pasoCaptacion` solo se llena cuando
// "Pasar a Captación" se ejecuta desde Prospectos de Captación — a partir de
// ahí este mismo registro es también lo que ve el módulo de Captación de
// Propiedades, sin un mock aparte (ver SesionContext).
// ---------------------------------------------------------------------------

export type EtapaProspecto = 'nuevo' | 'contactado' | 'valuacion_agendada' | 'exclusiva_firmada' | 'en_inventario'

export type OrigenProspecto = 'web' | 'llamada' | 'referido' | 'redes_sociales' | 'portal'

export type OperacionProspecto = 'venta' | 'renta'

export type PasoCaptacion = 'recibida'

export interface Prospecto {
  id: string
  propietarioNombre: string
  propietarioCorreo: string
  propietarioTelefono: string
  origen: OrigenProspecto
  tipoPropiedad: TipoPropiedad
  operaciones: OperacionProspecto[]
  colonia: string
  direccion: string
  recamaras?: number
  banos?: number
  m2Construccion?: number
  m2Terreno?: number
  precioEstimado: Precio
  etapa: EtapaProspecto
  pasoCaptacion: PasoCaptacion | null
  asesorId: string | null
  fecha: string
}

export const ETIQUETA_ETAPA: Record<EtapaProspecto, string> = {
  nuevo: 'Nuevo',
  contactado: 'Contactado',
  valuacion_agendada: 'Valuación agendada',
  exclusiva_firmada: 'Exclusiva firmada',
  en_inventario: 'En inventario',
}

export const ETIQUETA_ORIGEN: Record<OrigenProspecto, string> = {
  web: 'Web',
  llamada: 'Llamada',
  referido: 'Referido',
  redes_sociales: 'Redes sociales',
  portal: 'Portal',
}

// Solo cuando la única operación marcada es renta se anota "/mes" — una
// propiedad en venta (o en venta y renta a la vez) muestra el precio a
// secas, igual que el resto de la app.
export function formatearPrecioProspecto(prospecto: Prospecto): string {
  const soloRenta = prospecto.operaciones.includes('renta') && !prospecto.operaciones.includes('venta')
  const base = formatearPrecio(prospecto.precioEstimado)
  return soloRenta ? `${base}/mes` : base
}
