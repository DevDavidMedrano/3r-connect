import { COLONIA_BASE } from './coloniasCoordenadas'

// Etiquetas de despliegue para las colonias con coordenadas mapeadas — la
// fuente de qué colonias existen sigue siendo COLONIA_BASE, esto solo las
// pone bonitas en un <select>.
const ETIQUETA_COLONIA: Record<string, string> = {
  polanco: 'Polanco',
  'lomas de chapultepec': 'Lomas de Chapultepec',
  'nuevo polanco': 'Nuevo Polanco',
  anzures: 'Anzures',
  condesa: 'Condesa',
  'roma norte': 'Roma Norte',
  napoles: 'Nápoles',
  tecamachalco: 'Tecamachalco',
}

export const OPCIONES_COLONIA = Object.keys(COLONIA_BASE).map((valor) => ({
  valor,
  etiqueta: ETIQUETA_COLONIA[valor] ?? valor,
}))
