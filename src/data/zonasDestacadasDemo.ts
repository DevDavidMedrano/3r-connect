import type { Coordenadas } from '../types/propiedad'
import { COLONIA_BASE } from './coloniasCoordenadas'

export interface ZonaDestacada {
  nombre: string
  precioM2: number
  variacionPct: number
  centro: Coordenadas
  poligono: Coordenadas[]
}

// Polígono irregular (no un rectángulo): un punto por ángulo, cada uno a
// una distancia distinta del centro según `factores`. Con 8 factores que
// suben y bajan se obtiene una silueta orgánica, no una estrella ni un
// círculo perfecto. Aproximado a propósito — no son los límites reales de
// la colonia, solo una forma creíble para pintar el mapa.
function poligonoOrganico(
  centro: Coordenadas,
  radioLat: number,
  radioLng: number,
  factores: number[],
): Coordenadas[] {
  return factores.map((factor, indice) => {
    const angulo = (2 * Math.PI * indice) / factores.length
    return {
      lat: centro.lat + Math.sin(angulo) * radioLat * factor,
      lng: centro.lng + Math.cos(angulo) * radioLng * factor,
    }
  })
}

const FORMA_A = [1, 0.72, 1.15, 0.8, 1.05, 0.68, 1.12, 0.85]
const FORMA_B = [0.85, 1.1, 0.7, 1.18, 0.78, 1.08, 0.72, 1]
const FORMA_C = [1.05, 0.75, 1, 0.85, 1.15, 0.7, 0.95, 1.1]

// Centros de las cinco secciones de Polanco, repartidos con suficiente
// separación entre sí para que los polígonos (radio ~120-150m) no se
// encimen — Polanco no está subdividido en coloniasCoordenadas.ts, así
// que aquí se aproximan a mano en una línea este→oeste.
const POLANCO_I = { lat: 19.4345, lng: -99.1885 }
const POLANCO_II = { lat: 19.4335, lng: -99.194 }
const POLANCO_III = { lat: 19.431, lng: -99.1995 }
const POLANCO_IV = { lat: 19.428, lng: -99.2035 }
const POLANCO_V = { lat: 19.4245, lng: -99.2005 }
const BOSQUES_DE_LAS_LOMAS = { lat: 19.406, lng: -99.252 }

// PRECIOS Y VARIACIONES ESTIMADOS — placeholder para que la sección no se
// vea vacía. Hay que sustituirlos por las cifras reales de 3R Connect
// antes de publicar esto a producción.
export const ZONAS_DESTACADAS: ZonaDestacada[] = [
  {
    nombre: 'Polanco I Sección',
    precioM2: 148_000,
    variacionPct: 4.2,
    centro: POLANCO_I,
    poligono: poligonoOrganico(POLANCO_I, 0.0013, 0.0016, FORMA_A),
  },
  {
    nombre: 'Polanco II Sección',
    precioM2: 152_000,
    variacionPct: 3.8,
    centro: POLANCO_II,
    poligono: poligonoOrganico(POLANCO_II, 0.0012, 0.0015, FORMA_B),
  },
  {
    nombre: 'Polanco III Sección',
    precioM2: 145_000,
    variacionPct: 5.1,
    centro: POLANCO_III,
    poligono: poligonoOrganico(POLANCO_III, 0.0013, 0.0014, FORMA_C),
  },
  {
    nombre: 'Polanco IV Sección',
    precioM2: 138_000,
    variacionPct: 2.9,
    centro: POLANCO_IV,
    poligono: poligonoOrganico(POLANCO_IV, 0.0012, 0.0014, FORMA_A),
  },
  {
    nombre: 'Polanco V Sección',
    precioM2: 141_000,
    variacionPct: 4.6,
    centro: POLANCO_V,
    poligono: poligonoOrganico(POLANCO_V, 0.0012, 0.0015, FORMA_B),
  },
  {
    nombre: 'Lomas de Chapultepec',
    precioM2: 135_000,
    variacionPct: 1.8,
    centro: COLONIA_BASE['lomas de chapultepec'],
    poligono: poligonoOrganico(COLONIA_BASE['lomas de chapultepec'], 0.0022, 0.0026, FORMA_C),
  },
  {
    nombre: 'Bosques de las Lomas',
    precioM2: 118_000,
    variacionPct: -0.9,
    centro: BOSQUES_DE_LAS_LOMAS,
    poligono: poligonoOrganico(BOSQUES_DE_LAS_LOMAS, 0.0026, 0.003, FORMA_A),
  },
  {
    nombre: 'Nuevo Polanco',
    precioM2: 112_000,
    variacionPct: 6.3,
    centro: COLONIA_BASE['nuevo polanco'],
    poligono: poligonoOrganico(COLONIA_BASE['nuevo polanco'], 0.0016, 0.0019, FORMA_B),
  },
  {
    nombre: 'Anzures',
    precioM2: 89_000,
    variacionPct: 2.1,
    centro: COLONIA_BASE.anzures,
    poligono: poligonoOrganico(COLONIA_BASE.anzures, 0.0014, 0.0017, FORMA_C),
  },
  {
    nombre: 'Condesa',
    precioM2: 96_000,
    variacionPct: -1.2,
    centro: COLONIA_BASE.condesa,
    poligono: poligonoOrganico(COLONIA_BASE.condesa, 0.0015, 0.0018, FORMA_A),
  },
]

const formatoPrecioM2 = new Intl.NumberFormat('es-MX', { maximumFractionDigits: 0 })

export function formatearPrecioM2(precioM2: number): string {
  return `$${formatoPrecioM2.format(precioM2)} /m²`
}
