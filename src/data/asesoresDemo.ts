import { fotosAsesores } from '../assets/img/asesores'
import type { Asesor } from '../types/asesor'

// DEMO — mismos tres nombres que ya aparecen en components/landing/Advisors.tsx,
// para no inventar un cuarto elenco de personas ficticias en el sitio.
// zonasDominio y operacionesCerradas tampoco vienen de datos reales —
// estimados razonables a partir de asesorDesde, para que el agente de IA
// pueda presentar al asesor con algo de contexto en vez de solo un nombre.
export const asesoresDemo: Asesor[] = [
  {
    id: 'mariana-solis',
    nombre: 'Mariana Solís',
    iniciales: 'MS',
    colorAvatar: '#5c1a2e',
    asesorDesde: 2019,
    telefono: '+52 55 1234 5601',
    zonasDominio: ['Polanco I Sección', 'Polanco II Sección', 'Lomas de Chapultepec'],
    operacionesCerradas: 86,
    cupoMaximo: 12,
  },
  {
    id: 'diego-herrera',
    nombre: 'Diego Herrera',
    iniciales: 'DH',
    colorAvatar: '#2563a8',
    asesorDesde: 2021,
    telefono: '+52 55 1234 5602',
    zonasDominio: ['Nuevo Polanco', 'Polanco III Sección', 'Anzures'],
    operacionesCerradas: 47,
    // Cupo bajo a propósito: con la carga que ya trae de otros módulos
    // (prospectosCaptacion + prospectosVenta demo) es el que cruza el 85%
    // en Asignación de Asesores, como pidió el encargo.
    cupoMaximo: 7,
  },
  {
    id: 'renata-cobos',
    nombre: 'Renata Cobos',
    iniciales: 'RC',
    colorAvatar: '#b0651b',
    foto: fotosAsesores.renataCobos,
    asesorDesde: 2022,
    telefono: '+52 55 1234 5603',
    zonasDominio: ['Bosques de las Lomas', 'Polanco IV Sección', 'Polanco V Sección', 'Condesa'],
    operacionesCerradas: 29,
    cupoMaximo: 10,
  },
  {
    id: 'valeria-ibarra',
    nombre: 'Valeria Ibarra',
    iniciales: 'VI',
    colorAvatar: '#3f8a55',
    asesorDesde: 2023,
    telefono: '+52 55 1234 5604',
    zonasDominio: ['Roma Norte', 'Condesa'],
    operacionesCerradas: 14,
    cupoMaximo: 9,
  },
  {
    id: 'tomas-reyna',
    nombre: 'Tomás Reyna',
    iniciales: 'TR',
    colorAvatar: '#7a4fb5',
    asesorDesde: 2023,
    telefono: '+52 55 1234 5605',
    zonasDominio: ['Nápoles', 'Anzures', 'Tecamachalco'],
    operacionesCerradas: 11,
    cupoMaximo: 8,
  },
]

// Asignación determinística por folio (no aleatoria): la misma propiedad
// siempre muestra el mismo asesor entre recargas.
export function asesorParaPropiedad(folio: string): Asesor {
  const suma = [...folio].reduce((acc, caracter) => acc + caracter.charCodeAt(0), 0)
  return asesoresDemo[suma % asesoresDemo.length]
}
