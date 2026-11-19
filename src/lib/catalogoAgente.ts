import { asesoresDemo, asesorParaPropiedad } from '../data/asesoresDemo'
import { propiedadesDemo } from '../data/propiedadesDemo'
import { ZONAS_DESTACADAS, formatearPrecioM2 } from '../data/zonasDestacadasDemo'
import {
  esPreventa,
  ETIQUETA_TIPO,
  etiquetaOperacion,
  formatearPrecio,
  type Propiedad,
  type TipoPropiedad,
} from '../types/propiedad'

// Mismas amenidades sintéticas que src/components/propiedad/Caracteristicas.tsx
// (no hay un campo real de amenidades en Propiedad todavía) — se repiten
// aquí a mano para que el agente pueda mencionarlas; si un día se agrega
// el campo real, ambos lugares deben apuntar a la misma fuente.
const AMENIDADES_POR_TIPO: Record<TipoPropiedad, string[]> = {
  departamento: ['Gimnasio', 'Roof garden', 'Seguridad 24 horas'],
  penthouse: ['Gimnasio', 'Roof garden', 'Seguridad 24 horas'],
  casa: ['Alberca', 'Circuito cerrado de seguridad'],
  oficina: ['Seguridad 24 horas', 'Recepción compartida'],
  'local-comercial': ['Seguridad 24 horas', 'Recepción compartida'],
  terreno: ['Servicios urbanos disponibles'],
}

interface AtributosNumericos {
  recamaras?: number
  banos?: number
  m2Construccion?: number
  m2Terreno?: number
}

function atributosNumericos(propiedad: Propiedad): AtributosNumericos {
  switch (propiedad.tipo) {
    case 'departamento':
    case 'penthouse':
      return { recamaras: propiedad.recamaras, banos: propiedad.banos, m2Construccion: propiedad.m2Construccion }
    case 'casa':
      return {
        recamaras: propiedad.recamaras,
        banos: propiedad.banos,
        m2Construccion: propiedad.m2Construccion,
        m2Terreno: propiedad.m2Terreno,
      }
    case 'oficina':
    case 'local-comercial':
      return { banos: propiedad.banos, m2Construccion: propiedad.m2Construccion }
    case 'terreno':
      return { m2Terreno: propiedad.m2Terreno }
  }
}

export interface ItemCatalogoAgente {
  folio: string
  tipo: string
  listados: { operacion: string; precio: string; creditosAceptados?: string[] }[]
  colonia: string
  alcaldia: string
  // null si es preventa: no hay dirección exacta todavía, solo una
  // referencia aproximada (ver UbicacionAproximada en types/propiedad.ts).
  calle: string | null
  recamaras?: number
  banos?: number
  m2Construccion?: number
  m2Terreno?: number
  estacionamientos?: number
  anoConstruccion?: number
  mantenimiento?: string
  amenidades: string[]
  descripcion: string
  asesorAsignado: string
}

// Catálogo completo (folio, tipo, operación, precio, ubicación,
// atributos, amenidades, descripción y asesor) para que el agente
// responda con datos reales del inventario de 3R, no solo de la
// propiedad en turno.
export function construirCatalogoResumido(): ItemCatalogoAgente[] {
  return propiedadesDemo.map((propiedad) => ({
    folio: propiedad.folio,
    tipo: ETIQUETA_TIPO[propiedad.tipo],
    listados: propiedad.listados.map((listado) => ({
      operacion: etiquetaOperacion(listado.operacion),
      precio: formatearPrecio(listado.precio),
      creditosAceptados: listado.operacion === 'venta' ? listado.creditosAceptados : undefined,
    })),
    colonia: propiedad.ubicacion.colonia,
    alcaldia: propiedad.ubicacion.alcaldia,
    calle: esPreventa(propiedad) ? null : propiedad.ubicacion.direccion,
    ...atributosNumericos(propiedad),
    estacionamientos: propiedad.detalles.estacionamientos,
    anoConstruccion: propiedad.detalles.anoConstruccion,
    mantenimiento: propiedad.detalles.mantenimiento ? formatearPrecio(propiedad.detalles.mantenimiento) : undefined,
    amenidades: AMENIDADES_POR_TIPO[propiedad.tipo],
    descripcion: propiedad.descripcion,
    asesorAsignado: asesorParaPropiedad(propiedad.folio).nombre,
  }))
}

export interface ZonaCoberturaAgente {
  zona: string
  precioPromedioM2: string
}

// Zona adicional de cobertura del agente — Tecamachalco no está todavía
// en "Zonas destacadas" de la landing (ver src/data/zonasDestacadasDemo.ts),
// así que se agrega solo aquí. Mismo tipo de estimado: sustituir por
// datos reales de 3R antes de publicar.
const ZONA_AGENTE_EXTRA: ZonaCoberturaAgente = { zona: 'Tecamachalco', precioPromedioM2: formatearPrecioM2(95_000) }

export function construirZonasCobertura(): ZonaCoberturaAgente[] {
  return [
    ...ZONAS_DESTACADAS.map((zona) => ({ zona: zona.nombre, precioPromedioM2: formatearPrecioM2(zona.precioM2) })),
    ZONA_AGENTE_EXTRA,
  ]
}

export interface AsesorAgente {
  nombre: string
  aniosEnTresR: number
  zonasDominio: string[]
  operacionesCerradas: number
}

export function construirAsesoresResumidos(): AsesorAgente[] {
  const anioActual = new Date().getFullYear()
  return asesoresDemo.map((asesor) => ({
    nombre: asesor.nombre,
    aniosEnTresR: anioActual - asesor.asesorDesde,
    zonasDominio: asesor.zonasDominio,
    operacionesCerradas: asesor.operacionesCerradas,
  }))
}
