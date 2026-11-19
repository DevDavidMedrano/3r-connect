import type { Coordenadas } from '../types/propiedad'

// Coordenadas base por colonia (provistas por 3R Connect) para centrar el
// mapa de resultados. Cada propiedad en propiedadesDemo.ts le resta/suma
// unas milésimas de grado a su base para que los pines de una misma
// colonia no queden exactamente encimados.
export const COLONIA_BASE: Record<string, Coordenadas> = {
  polanco: { lat: 19.4326, lng: -99.195 },
  'lomas de chapultepec': { lat: 19.421, lng: -99.213 },
  'nuevo polanco': { lat: 19.44, lng: -99.188 },
  anzures: { lat: 19.428, lng: -99.177 },
  condesa: { lat: 19.412, lng: -99.174 },
  'roma norte': { lat: 19.418, lng: -99.162 },
  napoles: { lat: 19.394, lng: -99.176 },
  tecamachalco: { lat: 19.418, lng: -99.248 },
}

// Resuelve "Polanco III Sección" o "Lomas de Chapultepec V Sección" a su
// base de colonia (substring match, la clave más específica gana — para
// que "Nuevo Polanco" no caiga en la base de "Polanco"). Devuelve null si
// la colonia no está mapeada (p.ej. "José María Pino Suárez", "Bosques de
// las Lomas"): ahí no hay centro de zona confiable que ofrecer.
//
// Por privacidad, esta es la ÚNICA coordenada que Street View debe usar —
// nunca propiedad.coordenadas, que identifica la unidad real.
export function centroColonia(colonia: string): Coordenadas | null {
  const normalizado = colonia.toLowerCase()
  const clave = Object.keys(COLONIA_BASE)
    .sort((a, b) => b.length - a.length)
    .find((c) => normalizado.includes(c))
  return clave ? COLONIA_BASE[clave] : null
}
