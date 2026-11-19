// Paleta compartida en hex, para módulos que no pueden usar las clases de
// Tailwind directamente (materiales de Three.js, SVGs generados como data
// URI). Debe reflejar los mismos valores que --color-* en src/index.css —
// un solo lugar, para que ningún archivo traiga su propia copia suelta.
export const COLORES = {
  vino: '#5c1a2e',
  vinoOscuro: '#3e0f1e',
  vinoVivo: '#a81f45',
  coral: '#e8674f',
  rosaSuave: '#f2a08c',
  blanco: '#ffffff',
  grisBorde: '#eaeaea',
  texto: '#1a1a1a',
  textoSuave: '#6b6b6b',
  marfil: '#faf8f3',
  exito: '#3f8a55',
  alerta: '#b3392b',
  // Marca oscura — Visor3D y cualquier otra pieza en tema onix/oro.
  onix: '#0c0d10',
  carbon: '#16181c',
  oro: '#c9a227',
  oroClaro: '#e8c766',
  oroOscuro: '#9c7a18',
  oroBrillante: '#ffc72c',
  plata: '#c7ccd1',
  borde: '#e3ddd1',
  // Materiales de la escena del Visor3D — pisos de madera cálida y muros
  // blanco hueso, para que se lea como vivienda y no como planta gris.
  pisoMadera: '#8b6b47',
  muroHueso: '#f0ebe3',
  // Recorrido 3D — texturas procedurales y materiales del modo "Entrar a la
  // casa" y del exterior (lib/texturas3d.ts, Visor3D.tsx). Todo el hex que
  // usan esos módulos vive aquí, nunca suelto en el componente.
  deckMadera: '#8a6640',
  pasto: '#5d7d3c',
  piedra: '#d8d2c6',
  marmol: '#f0ece5',
  azulejo: '#dfdbd3',
  azulejoJunta: '#c2bdb3',
  vidrio: '#dff0f4',
  marcoVentana: '#2e3237',
  acero: '#b9bec4',
  aguaAlberca: '#2f8fae',
  maderaOscura: '#5d4530',
  telaOscura: '#515c66',
  telaClara: '#66727d',
  lino: '#f2ede3',
  follaje: '#3f6b2c',
  follajeClaro: '#4f7f34',
  corteza: '#5b4430',
  terracota: '#b9653c',
  porcelana: '#f6f6f4',
  cieloEntorno: '#9fb4cc',
  sueloEntorno: '#59544a',
  reboteEntorno: '#dfe8f2',
  luzSolNoche: '#7d93c4',
  cieloNoche: '#05060a',
  luzInteriorCalida: '#ffb877',
  tealSuave: '#4f7d74',
  maderaMueble: '#6b4a30',
} as const

// Convierte un hex string ("#c9a227") al número que Three.js espera en sus
// materiales (0xc9a227) — para que ningún módulo tenga que retipear los
// mismos dígitos en dos formatos distintos.
export function hexNum(hex: string): number {
  return parseInt(hex.replace('#', ''), 16)
}
