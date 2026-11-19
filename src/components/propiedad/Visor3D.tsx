import { useRef, useEffect, useState, useMemo } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import * as THREE from 'three'
import {
  Bed, Bath, Maximize, Car, RotateCcw, Play, Pause, Layers,
  Box, Sun, Moon, Info, Maximize2, Minimize2, Move3d, MousePointer2, X, ListTree,
  DoorOpen, Keyboard,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { COLORES, hexNum } from '../../lib/colores'
import { texturaAzulejo, texturaDeck, texturaMadera, texturaMarmol, texturaMuro, texturaPasto, texturaPiedra } from '../../lib/texturas3d'
import { construirMuro, type VanoMuro } from './visor3d/muros'
import {
  cajaRedondeada, construirCama, construirComedor,
  construirPlanta, construirSofa, type MaterialesMobiliario,
} from './visor3d/mobiliario'
import { construirExterior, tieneExteriorAprovechable, type MaterialesExterior } from './visor3d/exterior'
import { useMediaQuery } from '../../hooks/useMediaQuery'
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion'
import { ETIQUETA_TIPO, precioMinimo } from '../../types/propiedad'
import type { Propiedad, Plantilla3D } from '../../types/propiedad'

/* =================================================================== */
/*  PALETA — tokens del proyecto (src/lib/colores.ts), nada de hex      */
/*  suelto propio de este archivo.                                     */
/* =================================================================== */

const C = {
  vino: COLORES.vino,
  vinoOscuro: COLORES.vinoOscuro,
  vinoVivo: COLORES.vinoVivo,
  coral: COLORES.coral,
  marfil: COLORES.marfil,
  borde: COLORES.grisBorde,
  texto: COLORES.texto,
  textoSuave: COLORES.textoSuave,
  blanco: COLORES.blanco,
  onix: COLORES.onix,
  carbon: COLORES.carbon,
  oro: COLORES.oro,
  oroClaro: COLORES.oroClaro,
  oroOscuro: COLORES.oroOscuro,
  oroBrillante: COLORES.oroBrillante,
  plata: COLORES.plata,
}

const HEX = {
  pisoMadera: hexNum(COLORES.pisoMadera),
  muroHueso: hexNum(COLORES.muroHueso),
  oro: hexNum(COLORES.oro),
  oroBrillante: hexNum(COLORES.oroBrillante),
  onix: hexNum(COLORES.onix),
  carbon: hexNum(COLORES.carbon),
  vinoVivo: hexNum(COLORES.vinoVivo),
  deckMadera: hexNum(COLORES.deckMadera),
  pasto: hexNum(COLORES.pasto),
  piedra: hexNum(COLORES.piedra),
  marmol: hexNum(COLORES.marmol),
  azulejo: hexNum(COLORES.azulejo),
  vidrio: hexNum(COLORES.vidrio),
  marcoVentana: hexNum(COLORES.marcoVentana),
  acero: hexNum(COLORES.acero),
  aguaAlberca: hexNum(COLORES.aguaAlberca),
  madera: hexNum(COLORES.pisoMadera),
  maderaOscura: hexNum(COLORES.maderaOscura),
  telaOscura: hexNum(COLORES.telaOscura),
  telaClara: hexNum(COLORES.telaClara),
  lino: hexNum(COLORES.lino),
  follaje: hexNum(COLORES.follaje),
  follajeClaro: hexNum(COLORES.follajeClaro),
  corteza: hexNum(COLORES.corteza),
  terracota: hexNum(COLORES.terracota),
  porcelana: hexNum(COLORES.porcelana),
  cieloEntorno: hexNum(COLORES.cieloEntorno),
  sueloEntorno: hexNum(COLORES.sueloEntorno),
  reboteEntorno: hexNum(COLORES.reboteEntorno),
  luzSolNoche: hexNum(COLORES.luzSolNoche),
  cieloNoche: hexNum(COLORES.cieloNoche),
  luzInteriorCalida: hexNum(COLORES.luzInteriorCalida),
  tealSuave: hexNum(COLORES.tealSuave),
  marfil: hexNum(COLORES.marfil),
  maderaMueble: hexNum(COLORES.maderaMueble),
}

const SERIF = "'Playfair Display', Georgia, serif"
const SANS = "'Inter', system-ui, sans-serif"

/* =================================================================== */
/*  PLANTILLAS DE DISTRIBUCIÓN                                         */
/*                                                                     */
/*  Cada área se define en proporciones de 0 a 1 sobre la huella de    */
/*  la propiedad, para que escale sola según los m² reales.            */
/*    x, z  → centro del espacio                                       */
/*    w, d  → ancho y fondo                                            */
/*  El origen (0,0) es el centro de la planta.                         */
/* =================================================================== */

type CategoriaEspacio = 'social' | 'cocina' | 'privado' | 'humedo' | 'exterior' | 'trabajo'

interface EspacioPlantilla {
  id: string
  nombre: string
  cat: CategoriaEspacio
  pct: number
  x: number
  z: number
  w: number
  d: number
  nivel?: number
}

interface MueblePlantilla {
  t: string
  x: number
  z: number
  w: number
  d: number
  h: number
  nivel?: number
}

interface Plantilla {
  nombre: string
  proporcion: number
  dosNiveles?: boolean
  espacios: EspacioPlantilla[]
  muebles: MueblePlantilla[]
}

const PALETA_ESPACIOS: Record<CategoriaEspacio, number> = {
  social:   0xd8c9ae,
  cocina:   0xc9b89a,
  privado:  0xd2c2a6,
  humedo:   0xc4d0cd,
  exterior: 0xb9c4ac,
  trabajo:  0xccc6bb,
}

const PLANTILLAS: Record<Plantilla3D, Plantilla> = {
  /* ---------- 1. Departamento de 2 recámaras ---------- */
  depto2: {
    nombre: "Departamento · 2 recámaras",
    proporcion: 1.35,          // ancho / fondo de la huella
    espacios: [
      { id: "sala",    nombre: "Sala – Comedor",       cat: "social",   pct: 0.30, x: -0.20, z: -0.18, w: 0.52, d: 0.60 },
      { id: "cocina",  nombre: "Cocina",               cat: "cocina",   pct: 0.11, x:  0.32, z: -0.28, w: 0.34, d: 0.40 },
      { id: "rec1",    nombre: "Recámara principal",   cat: "privado",  pct: 0.20, x: -0.26, z:  0.30, w: 0.44, d: 0.42 },
      { id: "rec2",    nombre: "Recámara 2",           cat: "privado",  pct: 0.14, x:  0.18, z:  0.32, w: 0.32, d: 0.38 },
      { id: "ban1",    nombre: "Baño principal",       cat: "humedo",   pct: 0.07, x:  0.02, z:  0.30, w: 0.14, d: 0.42 },
      { id: "ban2",    nombre: "Baño 2",               cat: "humedo",   pct: 0.05, x:  0.40, z:  0.32, w: 0.14, d: 0.38 },
      { id: "balcon",  nombre: "Balcón",               cat: "exterior", pct: 0.13, x:  0.30, z:  0.06, w: 0.36, d: 0.16 },
    ],
    muebles: [
      { t: "sofa",     x: -0.30, z: -0.32, w: 0.22, d: 0.09, h: 0.045 },
      { t: "mesa",     x: -0.30, z: -0.16, w: 0.11, d: 0.07, h: 0.022 },
      { t: "tv",       x: -0.05, z: -0.26, w: 0.02, d: 0.14, h: 0.07 },
      { t: "comedor",  x: -0.14, z:  0.02, w: 0.17, d: 0.08, h: 0.033 },
      { t: "barra",    x:  0.32, z: -0.44, w: 0.32, d: 0.05, h: 0.055 },
      { t: "isla",     x:  0.32, z: -0.20, w: 0.15, d: 0.07, h: 0.055 },
      { t: "cama",     x: -0.32, z:  0.30, w: 0.16, d: 0.21, h: 0.035 },
      { t: "cama",     x:  0.14, z:  0.32, w: 0.13, d: 0.18, h: 0.033 },
    ],
  },

  /* ---------- 2. Departamento de 3 recámaras ---------- */
  depto3: {
    nombre: "Departamento · 3 recámaras",
    proporcion: 1.45,
    espacios: [
      { id: "sala",    nombre: "Sala",                 cat: "social",   pct: 0.20, x: -0.28, z: -0.24, w: 0.40, d: 0.44 },
      { id: "comedor", nombre: "Comedor",              cat: "social",   pct: 0.12, x: -0.28, z:  0.06, w: 0.40, d: 0.20 },
      { id: "cocina",  nombre: "Cocina",               cat: "cocina",   pct: 0.10, x:  0.06, z: -0.34, w: 0.28, d: 0.26 },
      { id: "rec1",    nombre: "Recámara principal",   cat: "privado",  pct: 0.17, x:  0.28, z: -0.22, w: 0.36, d: 0.38 },
      { id: "rec2",    nombre: "Recámara 2",           cat: "privado",  pct: 0.10, x:  0.30, z:  0.16, w: 0.32, d: 0.24 },
      { id: "rec3",    nombre: "Recámara 3",           cat: "privado",  pct: 0.09, x:  0.30, z:  0.40, w: 0.32, d: 0.22 },
      { id: "ban1",    nombre: "Baño principal",       cat: "humedo",   pct: 0.06, x:  0.04, z: -0.06, w: 0.14, d: 0.24 },
      { id: "ban2",    nombre: "Baño 2",               cat: "humedo",   pct: 0.04, x:  0.06, z:  0.18, w: 0.12, d: 0.20 },
      { id: "ban3",    nombre: "Medio baño",           cat: "humedo",   pct: 0.03, x:  0.06, z:  0.40, w: 0.12, d: 0.16 },
      { id: "servicio",nombre: "Cuarto de servicio",   cat: "trabajo",  pct: 0.05, x: -0.42, z:  0.36, w: 0.16, d: 0.20 },
      { id: "terraza", nombre: "Terraza",              cat: "exterior", pct: 0.04, x: -0.10, z: -0.48, w: 0.30, d: 0.10 },
    ],
    muebles: [
      { t: "sofa",    x: -0.36, z: -0.36, w: 0.18, d: 0.08, h: 0.042 },
      { t: "sofa",    x: -0.16, z: -0.28, w: 0.06, d: 0.16, h: 0.042 },
      { t: "mesa",    x: -0.30, z: -0.22, w: 0.10, d: 0.07, h: 0.020 },
      { t: "tv",      x: -0.44, z: -0.16, w: 0.02, d: 0.13, h: 0.065 },
      { t: "comedor", x: -0.28, z:  0.06, w: 0.20, d: 0.09, h: 0.033 },
      { t: "barra",   x:  0.06, z: -0.44, w: 0.26, d: 0.05, h: 0.055 },
      { t: "isla",    x:  0.06, z: -0.28, w: 0.14, d: 0.06, h: 0.055 },
      { t: "cama",    x:  0.28, z: -0.24, w: 0.15, d: 0.19, h: 0.035 },
      { t: "cama",    x:  0.30, z:  0.16, w: 0.12, d: 0.15, h: 0.033 },
      { t: "cama",    x:  0.30, z:  0.40, w: 0.12, d: 0.14, h: 0.033 },
    ],
  },

  /* ---------- 3. Departamento grande con terraza ---------- */
  deptoGrande: {
    nombre: "Departamento de gran formato",
    proporcion: 1.6,
    espacios: [
      { id: "sala",    nombre: "Sala doble altura",    cat: "social",   pct: 0.22, x: -0.30, z: -0.22, w: 0.38, d: 0.46 },
      { id: "comedor", nombre: "Comedor",              cat: "social",   pct: 0.11, x: -0.30, z:  0.12, w: 0.38, d: 0.22 },
      { id: "estudio", nombre: "Estudio",              cat: "trabajo",  pct: 0.07, x: -0.30, z:  0.40, w: 0.30, d: 0.18 },
      { id: "cocina",  nombre: "Cocina equipada",      cat: "cocina",   pct: 0.09, x:  0.00, z: -0.36, w: 0.26, d: 0.24 },
      { id: "rec1",    nombre: "Recámara principal",   cat: "privado",  pct: 0.16, x:  0.26, z: -0.20, w: 0.34, d: 0.36 },
      { id: "vestidor",nombre: "Vestidor",             cat: "privado",  pct: 0.05, x:  0.48, z: -0.20, w: 0.12, d: 0.36 },
      { id: "rec2",    nombre: "Recámara 2",           cat: "privado",  pct: 0.09, x:  0.28, z:  0.18, w: 0.30, d: 0.22 },
      { id: "rec3",    nombre: "Recámara 3",           cat: "privado",  pct: 0.08, x:  0.28, z:  0.42, w: 0.30, d: 0.20 },
      { id: "ban1",    nombre: "Baño principal",       cat: "humedo",   pct: 0.05, x:  0.02, z: -0.06, w: 0.12, d: 0.22 },
      { id: "ban2",    nombre: "Baño 2",               cat: "humedo",   pct: 0.04, x:  0.04, z:  0.20, w: 0.12, d: 0.18 },
      { id: "ban3",    nombre: "Medio baño",           cat: "humedo",   pct: 0.02, x:  0.04, z:  0.42, w: 0.10, d: 0.14 },
      { id: "terraza", nombre: "Terraza",              cat: "exterior", pct: 0.12, x: -0.06, z: -0.50, w: 0.60, d: 0.12 },
    ],
    muebles: [
      { t: "sofa",    x: -0.38, z: -0.34, w: 0.17, d: 0.08, h: 0.040 },
      { t: "sofa",    x: -0.18, z: -0.24, w: 0.06, d: 0.16, h: 0.040 },
      { t: "mesa",    x: -0.32, z: -0.20, w: 0.10, d: 0.07, h: 0.020 },
      { t: "tv",      x: -0.46, z: -0.14, w: 0.02, d: 0.14, h: 0.062 },
      { t: "comedor", x: -0.30, z:  0.12, w: 0.22, d: 0.09, h: 0.032 },
      { t: "escrit",  x: -0.30, z:  0.40, w: 0.16, d: 0.06, h: 0.030 },
      { t: "barra",   x:  0.00, z: -0.45, w: 0.24, d: 0.05, h: 0.052 },
      { t: "isla",    x:  0.00, z: -0.30, w: 0.14, d: 0.06, h: 0.052 },
      { t: "cama",    x:  0.24, z: -0.22, w: 0.15, d: 0.18, h: 0.034 },
      { t: "cama",    x:  0.28, z:  0.18, w: 0.12, d: 0.14, h: 0.032 },
      { t: "cama",    x:  0.28, z:  0.42, w: 0.12, d: 0.13, h: 0.032 },
      { t: "tumbona", x: -0.20, z: -0.50, w: 0.10, d: 0.05, h: 0.018 },
      { t: "tumbona", x:  0.00, z: -0.50, w: 0.10, d: 0.05, h: 0.018 },
    ],
  },

  /* ---------- 4. Penthouse de dos niveles ---------- */
  penthouse: {
    nombre: "Penthouse · dos niveles",
    proporcion: 1.5,
    dosNiveles: true,
    espacios: [
      /* planta baja */
      { id: "sala",    nombre: "Sala principal",       cat: "social",   pct: 0.16, x: -0.28, z: -0.24, w: 0.40, d: 0.40, nivel: 0 },
      { id: "comedor", nombre: "Comedor",              cat: "social",   pct: 0.09, x: -0.28, z:  0.10, w: 0.40, d: 0.22, nivel: 0 },
      { id: "cocina",  nombre: "Cocina",               cat: "cocina",   pct: 0.08, x:  0.06, z: -0.34, w: 0.28, d: 0.24, nivel: 0 },
      { id: "estudio", nombre: "Estudio",              cat: "trabajo",  pct: 0.06, x:  0.30, z: -0.30, w: 0.28, d: 0.20, nivel: 0 },
      { id: "banV",    nombre: "Medio baño",           cat: "humedo",   pct: 0.02, x:  0.06, z: -0.06, w: 0.10, d: 0.14, nivel: 0 },
      { id: "servicio",nombre: "Área de servicio",     cat: "trabajo",  pct: 0.05, x:  0.42, z:  0.06, w: 0.16, d: 0.22, nivel: 0 },
      { id: "terraza", nombre: "Terraza principal",    cat: "exterior", pct: 0.14, x: -0.04, z:  0.42, w: 0.62, d: 0.18, nivel: 0 },
      /* planta alta */
      { id: "rec1",    nombre: "Recámara principal",   cat: "privado",  pct: 0.13, x: -0.26, z: -0.20, w: 0.36, d: 0.34, nivel: 1 },
      { id: "vestidor",nombre: "Vestidor",             cat: "privado",  pct: 0.05, x: -0.02, z: -0.20, w: 0.14, d: 0.34, nivel: 1 },
      { id: "ban1",    nombre: "Baño principal",       cat: "humedo",   pct: 0.05, x:  0.16, z: -0.20, w: 0.16, d: 0.34, nivel: 1 },
      { id: "rec2",    nombre: "Recámara 2",           cat: "privado",  pct: 0.07, x: -0.26, z:  0.20, w: 0.32, d: 0.24, nivel: 1 },
      { id: "rec3",    nombre: "Recámara 3",           cat: "privado",  pct: 0.06, x:  0.10, z:  0.20, w: 0.28, d: 0.24, nivel: 1 },
      { id: "ban2",    nombre: "Baño 2",               cat: "humedo",   pct: 0.03, x:  0.36, z:  0.20, w: 0.14, d: 0.24, nivel: 1 },
      { id: "roof",    nombre: "Roof garden",          cat: "exterior", pct: 0.11, x:  0.00, z:  0.44, w: 0.56, d: 0.16, nivel: 1 },
    ],
    muebles: [
      { t: "sofa",    x: -0.36, z: -0.34, w: 0.18, d: 0.08, h: 0.038, nivel: 0 },
      { t: "sofa",    x: -0.14, z: -0.26, w: 0.06, d: 0.15, h: 0.038, nivel: 0 },
      { t: "mesa",    x: -0.30, z: -0.20, w: 0.10, d: 0.07, h: 0.018, nivel: 0 },
      { t: "comedor", x: -0.28, z:  0.10, w: 0.22, d: 0.09, h: 0.030, nivel: 0 },
      { t: "isla",    x:  0.06, z: -0.30, w: 0.15, d: 0.06, h: 0.050, nivel: 0 },
      { t: "escrit",  x:  0.30, z: -0.32, w: 0.16, d: 0.06, h: 0.028, nivel: 0 },
      { t: "tumbona", x: -0.20, z:  0.42, w: 0.10, d: 0.05, h: 0.016, nivel: 0 },
      { t: "tumbona", x:  0.02, z:  0.42, w: 0.10, d: 0.05, h: 0.016, nivel: 0 },
      { t: "cama",    x: -0.28, z: -0.20, w: 0.16, d: 0.19, h: 0.032, nivel: 1 },
      { t: "cama",    x: -0.26, z:  0.20, w: 0.13, d: 0.15, h: 0.030, nivel: 1 },
      { t: "cama",    x:  0.10, z:  0.20, w: 0.12, d: 0.15, h: 0.030, nivel: 1 },
    ],
  },

  /* ---------- 5. Oficina de planta libre ---------- */
  oficina: {
    nombre: "Oficina · planta libre",
    proporcion: 1.55,
    espacios: [
      { id: "recepcion", nombre: "Recepción",          cat: "social",   pct: 0.08, x: -0.38, z: -0.02, w: 0.20, d: 0.44 },
      { id: "openspace", nombre: "Área abierta",       cat: "trabajo",  pct: 0.42, x:  0.02, z: -0.14, w: 0.56, d: 0.56 },
      { id: "juntas",    nombre: "Sala de juntas",     cat: "social",   pct: 0.13, x:  0.36, z: -0.28, w: 0.24, d: 0.28 },
      { id: "privado1",  nombre: "Privado 1",          cat: "trabajo",  pct: 0.07, x:  0.38, z:  0.06, w: 0.20, d: 0.20 },
      { id: "privado2",  nombre: "Privado 2",          cat: "trabajo",  pct: 0.07, x:  0.38, z:  0.28, w: 0.20, d: 0.20 },
      { id: "cocineta",  nombre: "Cocineta",           cat: "cocina",   pct: 0.07, x: -0.12, z:  0.34, w: 0.24, d: 0.18 },
      { id: "ban1",      nombre: "Baños",              cat: "humedo",   pct: 0.08, x:  0.14, z:  0.36, w: 0.22, d: 0.16 },
      { id: "bodega",    nombre: "Bodega / archivo",   cat: "trabajo",  pct: 0.08, x: -0.38, z:  0.34, w: 0.20, d: 0.18 },
    ],
    muebles: [
      { t: "escrit", x: -0.16, z: -0.28, w: 0.16, d: 0.06, h: 0.026 },
      { t: "escrit", x: -0.16, z: -0.12, w: 0.16, d: 0.06, h: 0.026 },
      { t: "escrit", x: -0.16, z:  0.04, w: 0.16, d: 0.06, h: 0.026 },
      { t: "escrit", x:  0.12, z: -0.28, w: 0.16, d: 0.06, h: 0.026 },
      { t: "escrit", x:  0.12, z: -0.12, w: 0.16, d: 0.06, h: 0.026 },
      { t: "escrit", x:  0.12, z:  0.04, w: 0.16, d: 0.06, h: 0.026 },
      { t: "comedor",x:  0.36, z: -0.28, w: 0.16, d: 0.08, h: 0.028 },
      { t: "sofa",   x: -0.38, z: -0.14, w: 0.12, d: 0.06, h: 0.036 },
      { t: "barra",  x: -0.12, z:  0.40, w: 0.20, d: 0.05, h: 0.048 },
    ],
  },
}

/* Elige la plantilla según los datos de la propiedad */
export function elegirPlantilla(
  { tipo = '', recamaras = 0, m2 = 0 }: { tipo?: string; recamaras?: number; m2?: number } = {},
): Plantilla3D {
  const t = String(tipo).toLowerCase()

  if (t.includes('oficina') || t.includes('local') || t.includes('bodega')) {
    return 'oficina'
  }
  if (t.includes('penthouse') || m2 >= 450) {
    return 'penthouse'
  }
  if (m2 >= 300) return 'deptoGrande'
  if (recamaras >= 3) return 'depto3'
  return 'depto2'
}

/* =================================================================== */
/*  ADAPTADOR — de la Propiedad del dominio a la forma que el visor     */
/*  espera. El visor no sabe nada de `listados[]` ni de `ubicacion`      */
/*  anidada: solo de tipo/colonia/alcaldia/recámaras/baños/m²/precio.    */
/* =================================================================== */

interface DatosVisor {
  folio: string
  tipoRaw: string
  tipo: string
  colonia: string
  alcaldia: string
  recamaras?: number
  banos?: number
  m2: number
  m2Terreno?: number
  estacionamientos?: number
  precio?: { monto: number; moneda: string }
}

function adaptarPropiedad(propiedad: Propiedad): DatosVisor {
  return {
    folio: propiedad.folio,
    tipoRaw: propiedad.tipo,
    tipo: ETIQUETA_TIPO[propiedad.tipo],
    colonia: propiedad.ubicacion.colonia,
    alcaldia: propiedad.ubicacion.alcaldia,
    recamaras: 'recamaras' in propiedad ? propiedad.recamaras : undefined,
    banos: 'banos' in propiedad ? propiedad.banos : undefined,
    m2: 'm2Construccion' in propiedad ? propiedad.m2Construccion : 0,
    m2Terreno: 'm2Terreno' in propiedad ? propiedad.m2Terreno : undefined,
    estacionamientos: propiedad.detalles.estacionamientos,
    precio: precioMinimo(propiedad),
  }
}

/* =================================================================== */
/*  DIMENSIONES — un solo lugar para pasar de m² reales a unidades de    */
/*  escena, usado tanto por el efecto que arma el Three.Scene como por   */
/*  los memos de React que alimentan la barra de saltos y los límites    */
/*  de movimiento. Evita que esa aritmética viva duplicada en dos sitios.*/
/* =================================================================== */

interface Dimensiones {
  ANCHO: number
  FONDO: number
  ALTO_MURO: number
  SEP_NIVEL: number
  ESCALA_BASE: number
}

function calcularDimensiones(m2: number, proporcion: number): Dimensiones {
  const totalM2 = m2 || 150
  const areaVis = Math.max(totalM2, 60)
  const ESCALA_BASE = Math.sqrt(areaVis) * 1.25
  const ANCHO = ESCALA_BASE * Math.sqrt(proporcion)
  const FONDO = ESCALA_BASE / Math.sqrt(proporcion)
  const ALTO_MURO = ESCALA_BASE * 0.157
  const SEP_NIVEL = ALTO_MURO * 1.9
  return { ANCHO, FONDO, ALTO_MURO, SEP_NIVEL, ESCALA_BASE }
}

// Sill/altura de vano por categoría de cuarto — baños llevan ventana alta y
// angosta, sociales van casi de piso a techo, el resto queda a media altura.
function parametrosVentana(cat: CategoriaEspacio, alturaMuro: number): { alturaBase: number; altura: number } {
  if (cat === 'humedo') return { alturaBase: alturaMuro * 0.62, altura: alturaMuro * 0.3 }
  if (cat === 'cocina') return { alturaBase: alturaMuro * 0.34, altura: alturaMuro * 0.42 }
  if (cat === 'privado') return { alturaBase: alturaMuro * 0.28, altura: alturaMuro * 0.5 }
  return { alturaBase: alturaMuro * 0.04, altura: alturaMuro * 0.84 }
}

function parametrosPuerta(cat: CategoriaEspacio, alturaMuro: number): { ancho: number; altura: number } {
  return { ancho: cat === 'humedo' ? 0.8 : 1.0, altura: alturaMuro * 0.82 }
}

interface EspacioMundo extends EspacioPlantilla {
  m2: number
  ex: number
  ez: number
  ew: number
  ed: number
  x0: number
  x1: number
  z0: number
  z1: number
}

interface MallaEspacio {
  grupo: THREE.Group
  sup: THREE.Mesh
  matSup: THREE.MeshStandardMaterial
  nivel: number
  base: number
}

interface PuntoRecorrido {
  id: string
  nombre: string
  x: number
  z: number
  yaw: number
}

interface EstadoPrimeraPersona {
  pos: { x: number; z: number }
  objetivo: { x: number; z: number }
  yaw: number
  pitch: number
  ojoAltura: number
  teclas: Record<'f' | 'b' | 'l' | 'r' | 's', boolean>
}

interface EscenaState {
  scene?: THREE.Scene
  cam?: THREE.PerspectiveCamera
  rend?: THREE.WebGLRenderer
  raiz?: THREE.Group
  mallas?: Record<string, MallaEspacio>
  orb?: { theta: number; phi: number; radio: number }
  posCam?: () => void
  sol?: THREE.DirectionalLight
  amb?: THREE.HemisphereLight
  relleno?: THREE.DirectionalLight
  interiores?: THREE.PointLight[]
  girar?: boolean
  escalaBase?: number
  pausar?: () => void
  techo?: THREE.Mesh
  aristas?: THREE.LineSegments[]
  matMuro?: THREE.MeshStandardMaterial
  matPiedra?: THREE.MeshStandardMaterial
  gMuros?: THREE.Group
  gFurn?: THREE.Group
  gPatio?: THREE.Group
  limites?: { x0: number; x1: number; z0: number; z1: number }
  fp?: EstadoPrimeraPersona
}

type Modo = 'volumen' | 'planta' | 'estructura' | 'interior'
type NivelId = 'todos' | '0' | '1'

const OPCIONES_NIVEL: [NivelId, string][] = [
  ['todos', 'Ambos'],
  ['0', 'Nivel 1'],
  ['1', 'Nivel 2'],
]

interface Visor3DProps {
  propiedad: Propiedad
}

export default function Visor3D({ propiedad }: Visor3DProps) {
  const p = adaptarPropiedad(propiedad)

  const claveInicial = useMemo(
    () => propiedad.plantilla3d ?? elegirPlantilla({ tipo: p.tipo, recamaras: p.recamaras, m2: p.m2 }),
    [propiedad.plantilla3d, p.tipo, p.recamaras, p.m2],
  )

  const cont = useRef<HTMLDivElement>(null)
  const escena = useRef<EscenaState>({})
  const [clave, setClave] = useState<Plantilla3D>(claveInicial)
  void setClave // reservado para el selector de plantilla comentado más abajo
  const prefiereReducido = usePrefersReducedMotion()
  const [girando, setGirando] = useState(!prefiereReducido)
  const [espacio, setEspacio] = useState<string | null>(null)
  const [modo, setModo] = useState<Modo>('volumen')
  const [noche, setNoche] = useState(false)
  const [nivel, setNivel] = useState<NivelId>('todos')
  const [listo, setListo] = useState(false)
  const esMovil = useMediaQuery('(max-width: 767px)')

  const plantilla = PLANTILLAS[clave]
  const dosNiveles = !!plantilla.dosNiveles

  const dimensiones = useMemo(() => calcularDimensiones(p.m2, plantilla.proporcion), [p.m2, plantilla.proporcion])

  /* Espacios con su superficie calculada a partir de los m² reales */
  const espacios = useMemo(() => {
    const total = p.m2 || 150
    return plantilla.espacios.map((e) => ({
      ...e,
      m2: Math.round(total * e.pct),
    }))
  }, [plantilla, p.m2])

  const espaciosMundo = useMemo<EspacioMundo[]>(() => espacios.map((e) => {
    const ex = e.x * dimensiones.ANCHO
    const ez = e.z * dimensiones.FONDO
    const ew = e.w * dimensiones.ANCHO
    const ed = e.d * dimensiones.FONDO
    return { ...e, ex, ez, ew, ed, x0: ex - ew / 2, x1: ex + ew / 2, z0: ez - ed / 2, z1: ez + ed / 2 }
  }), [espacios, dimensiones])

  // Casa con terreno de sobra → hay exterior que construir (deck, alberca,
  // jardín, cochera); todo lo demás se queda con solo el volumen construido.
  const loteExterior = useMemo(() => {
    if (p.tipoRaw !== 'casa' || !p.m2Terreno || p.m2Terreno <= p.m2) return null
    const dimTerreno = calcularDimensiones(p.m2Terreno, plantilla.proporcion)
    const lote = {
      anchoConstruccion: dimensiones.ANCHO,
      fondoConstruccion: dimensiones.FONDO,
      anchoTerreno: Math.max(dimTerreno.ANCHO, dimensiones.ANCHO + 4),
      fondoTerreno: Math.max(dimTerreno.FONDO, dimensiones.FONDO + 4),
    }
    return tieneExteriorAprovechable(lote) ? lote : null
  }, [p.tipoRaw, p.m2Terreno, p.m2, plantilla.proporcion, dimensiones])

  // Barra de saltos del modo "Entrar a la casa" — un punto por cada cuarto
  // de planta baja que la plantilla generó, más el jardín si hay exterior.
  const puntosRecorrido = useMemo<PuntoRecorrido[]>(() => {
    const puntos = espaciosMundo
      .filter((e) => (dosNiveles ? (e.nivel ?? 0) === 0 : true))
      .map((e) => ({ id: e.id, nombre: e.nombre, x: e.ex, z: e.ez, yaw: Math.atan2(-e.ex, -e.ez) }))
    if (loteExterior) {
      const zJardin = loteExterior.fondoConstruccion / 2 + 1.4
      puntos.push({ id: '__jardin', nombre: 'Jardín', x: 0, z: zJardin, yaw: 0 })
    }
    return puntos
  }, [espaciosMundo, dosNiveles, loteExterior])

  // Ref del modo para que los listeners de teclado/mouse (registrados una
  // sola vez dentro del efecto de la escena) siempre lean el modo vigente
  // sin tener que reconstruir toda la geometría cuando el modo cambia.
  const modoRef = useRef(modo)
  useEffect(() => {
    modoRef.current = modo
  }, [modo])

  /* ---------------- Escena ---------------- */
  useEffect(() => {
    const nodo = cont.current
    if (!nodo) return

    const W = nodo.clientWidth || 800
    const H = nodo.clientHeight || 480
    const { ANCHO, FONDO, ALTO_MURO, SEP_NIVEL, ESCALA_BASE: escalaBase } = dimensiones

    const scene = new THREE.Scene()
    scene.background = new THREE.Color(HEX.onix)
    scene.fog = new THREE.Fog(HEX.onix, escalaBase * 2.4, escalaBase * 5.4)

    const cam = new THREE.PerspectiveCamera(42, W / H, 0.1, 300)
    const rend = new THREE.WebGLRenderer({ antialias: true, logarithmicDepthBuffer: true })
    rend.setSize(W, H)
    rend.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    rend.outputColorSpace = THREE.SRGBColorSpace
    rend.toneMapping = THREE.ACESFilmicToneMapping
    rend.toneMappingExposure = 1.05
    rend.shadowMap.enabled = true
    rend.shadowMap.type = THREE.PCFSoftShadowMap
    nodo.appendChild(rend.domElement)
    const anisotropy = rend.capabilities.getMaxAnisotropy()

    /* --- Entorno para PMREM: un cielo, un suelo, un sol y un rebote frío
       — no es una foto, son cuatro formas simples, pero le dan a los
       materiales reflejantes (cristal, mármol) algo real que reflejar. --- */
    const escenaEntorno = new THREE.Scene()
    const cieloEnt = new THREE.Mesh(
      new THREE.SphereGeometry(escalaBase * 4, 16, 12),
      new THREE.MeshBasicMaterial({ color: HEX.cieloEntorno, side: THREE.BackSide }),
    )
    escenaEntorno.add(cieloEnt)
    const sueloEnt = new THREE.Mesh(
      new THREE.CircleGeometry(escalaBase * 4, 24),
      new THREE.MeshBasicMaterial({ color: HEX.sueloEntorno, side: THREE.DoubleSide }),
    )
    sueloEnt.rotation.x = -Math.PI / 2
    sueloEnt.position.y = -escalaBase * 0.4
    escenaEntorno.add(sueloEnt)
    const solEnt = new THREE.Mesh(new THREE.SphereGeometry(escalaBase * 0.6, 12, 10), new THREE.MeshBasicMaterial({ color: HEX.marfil }))
    solEnt.position.set(escalaBase * 1.6, escalaBase * 2.2, escalaBase * 1.1)
    escenaEntorno.add(solEnt)
    const reboteEnt = new THREE.Mesh(
      new THREE.BoxGeometry(escalaBase * 2.6, escalaBase * 1.7, 1),
      new THREE.MeshBasicMaterial({ color: HEX.reboteEntorno }),
    )
    reboteEnt.position.set(-escalaBase * 1.7, escalaBase * 0.9, -escalaBase * 1.3)
    escenaEntorno.add(reboteEnt)
    const pmrem = new THREE.PMREMGenerator(rend)
    pmrem.compileEquirectangularShader()
    scene.environment = pmrem.fromScene(escenaEntorno, 0.04).texture
    escenaEntorno.traverse((o) => {
      const malla = o as THREE.Mesh
      malla.geometry?.dispose()
      const mat = malla.material as THREE.Material | undefined
      mat?.dispose()
    })

    /* Luces — direccional cálida a ~45°, hemisferio de relleno, y unas
       interiores cálidas de baja intensidad que se agregan por cuarto. */
    const amb = new THREE.HemisphereLight(HEX.cieloEntorno, HEX.sueloEntorno, 0.55)
    scene.add(amb)
    const sol = new THREE.DirectionalLight(0xfff2df, 2.2)
    sol.position.set(escalaBase * 0.85, escalaBase * 0.95, escalaBase * 0.55)
    sol.castShadow = true
    sol.shadow.mapSize.width = 2048
    sol.shadow.mapSize.height = 2048
    sol.shadow.camera.near = 1
    sol.shadow.camera.far = escalaBase * 6
    Object.assign(sol.shadow.camera, { left: -escalaBase * 1.6, right: escalaBase * 1.6, top: escalaBase * 1.6, bottom: -escalaBase * 1.2 })
    sol.shadow.bias = -0.0006
    sol.shadow.normalBias = 0.02
    scene.add(sol)
    const relleno = new THREE.DirectionalLight(HEX.reboteEntorno, 0.32)
    relleno.position.set(-escalaBase * 0.7, escalaBase * 0.5, -escalaBase * 0.6)
    scene.add(relleno)
    const interiores: THREE.PointLight[] = []

    const raiz = new THREE.Group()
    scene.add(raiz)
    const gMuros = new THREE.Group()
    const gPisos = new THREE.Group()
    const gFurn = new THREE.Group()
    const gPatio = new THREE.Group()
    raiz.add(gMuros, gPisos, gFurn, gPatio)

    const mallas: Record<string, MallaEspacio> = {}
    const aristas: THREE.LineSegments[] = []
    const materiales: THREE.Material[] = []
    const texturas: THREE.Texture[] = []

    function reg<T extends THREE.Material>(mat: T): T {
      materiales.push(mat)
      return mat
    }
    function regTex<T extends THREE.Texture>(tex: T): T {
      texturas.push(tex)
      return tex
    }

    const texMuro = regTex(texturaMuro(3, 1.2, anisotropy))
    const texPiso = regTex(texturaMadera(Math.max(2, ANCHO / 3), Math.max(2, FONDO / 3), anisotropy))
    const texMarmol = regTex(texturaMarmol(2, 2, anisotropy))
    const texAzulejo = regTex(texturaAzulejo(3, 3, anisotropy))
    const texDeck = regTex(texturaDeck(6, 6, anisotropy))
    const texPasto = regTex(texturaPasto(8, 8, anisotropy))
    const texPiedra = regTex(texturaPiedra(4, 4, anisotropy))

    const matMuro = reg(new THREE.MeshStandardMaterial({ map: texMuro, roughness: 0.88 }))
    const matPisoMadera = reg(new THREE.MeshStandardMaterial({ map: texPiso, roughness: 0.55 }))
    const matMarmol = reg(new THREE.MeshStandardMaterial({ map: texMarmol, roughness: 0.28 }))
    const matDeck = reg(new THREE.MeshStandardMaterial({ map: texDeck, roughness: 0.8 }))
    const matPasto = reg(new THREE.MeshStandardMaterial({ map: texPasto, roughness: 1 }))
    const matPiedra = reg(new THREE.MeshStandardMaterial({ map: texPiedra, roughness: 0.85 }))
    const matVidrio = reg(new THREE.MeshPhysicalMaterial({
      color: HEX.vidrio, roughness: 0.05, metalness: 0, transparent: true, opacity: 0.22,
      clearcoat: 1, clearcoatRoughness: 0.03, side: THREE.DoubleSide,
    }))
    const matAgua = reg(new THREE.MeshPhysicalMaterial({ color: HEX.aguaAlberca, roughness: 0.06, transparent: true, opacity: 0.82, clearcoat: 1 }))
    const matMarco = reg(new THREE.MeshStandardMaterial({ color: HEX.marcoVentana, roughness: 0.4, metalness: 0.6 }))
    const matAcero = reg(new THREE.MeshStandardMaterial({ color: HEX.acero, roughness: 0.28, metalness: 0.85 }))
    const matMaderaMueble = reg(new THREE.MeshStandardMaterial({ color: HEX.maderaMueble, roughness: 0.68 }))
    const matMaderaOscura = reg(new THREE.MeshStandardMaterial({ color: HEX.maderaOscura, roughness: 0.6 }))
    const matTelaOscura = reg(new THREE.MeshStandardMaterial({ color: HEX.telaOscura, roughness: 0.95 }))
    const matTelaClara = reg(new THREE.MeshStandardMaterial({ color: HEX.telaClara, roughness: 0.95 }))
    const matLino = reg(new THREE.MeshStandardMaterial({ color: HEX.lino, roughness: 0.95 }))
    const matTerracota = reg(new THREE.MeshStandardMaterial({ color: HEX.terracota, roughness: 0.85 }))
    const matFollaje = reg(new THREE.MeshStandardMaterial({ color: HEX.follaje, roughness: 1 }))
    const matFollajeClaro = reg(new THREE.MeshStandardMaterial({ color: HEX.follajeClaro, roughness: 1 }))
    const matCorteza = reg(new THREE.MeshStandardMaterial({ color: HEX.corteza, roughness: 1 }))
    const matTealSuave = reg(new THREE.MeshStandardMaterial({ color: HEX.tealSuave, roughness: 0.9 }))
    const matPorcelana = reg(new THREE.MeshStandardMaterial({ color: HEX.porcelana, roughness: 0.15 }))
    const matOscuro = reg(new THREE.MeshStandardMaterial({ color: HEX.carbon, roughness: 0.35 }))
    const matMetalOscuro = reg(new THREE.MeshStandardMaterial({ color: 0x2b3138, roughness: 0.25, metalness: 0.5 }))
    const matAcento = reg(new THREE.MeshStandardMaterial({ color: HEX.oro, roughness: 0.38, metalness: 0.5 }))

    const matsMobiliario: MaterialesMobiliario = {
      madera: matMaderaMueble,
      maderaOscura: matMaderaOscura,
      telaOscura: matTelaOscura,
      telaClara: matTelaClara,
      lino: matLino,
      acero: matAcero,
      terracota: matTerracota,
      follaje: matFollaje,
      follajeClaro: matFollajeClaro,
      corteza: matCorteza,
      tealSuave: matTealSuave,
      porcelana: matPorcelana,
    }
    const matsExterior: MaterialesExterior = {
      ...matsMobiliario,
      deck: matDeck,
      piedra: matPiedra,
      pasto: matPasto,
      agua: matAgua,
      metalOscuro: matMetalOscuro,
      oscuro: matOscuro,
    }

    const niveles = dosNiveles ? [0, 1] : [0]
    const UMBRAL_BORDE = Math.max(ANCHO, FONDO) * 0.1

    niveles.forEach((nv) => {
      const yBase = nv * SEP_NIVEL
      const gNivel = new THREE.Group()
      gNivel.position.y = yBase
      gNivel.userData.nivel = nv
      raiz.add(gNivel)

      const losa = new THREE.Mesh(new THREE.BoxGeometry(ANCHO + 1.2, 0.34, FONDO + 1.2), matOscuro)
      losa.position.set(0, -0.17, 0)
      losa.receiveShadow = true
      gNivel.add(losa)

      const piso = new THREE.Mesh(new THREE.BoxGeometry(ANCHO, 0.07, FONDO), matPisoMadera)
      piso.position.set(0, 0.035, 0)
      piso.receiveShadow = true
      gNivel.add(piso)

      const espaciosDelNivel = espaciosMundo.filter((e) => (dosNiveles ? (e.nivel ?? 0) === nv : true))

      /* Envolvente exterior — un solo tramo con vanos por lado, con ventana
         por cada cuarto que llega a ese borde y una puerta de entrada al
         frente. Reemplaza las 4 cajas macizas que había antes. */
      const ladosEnvolvente: { eje: 'x' | 'z'; fijo: number; desde: number; hasta: number; frente?: boolean }[] = [
        { eje: 'x', fijo: -FONDO / 2, desde: -ANCHO / 2, hasta: ANCHO / 2, frente: true },
        { eje: 'x', fijo: FONDO / 2, desde: -ANCHO / 2, hasta: ANCHO / 2 },
        { eje: 'z', fijo: -ANCHO / 2, desde: -FONDO / 2, hasta: FONDO / 2 },
        { eje: 'z', fijo: ANCHO / 2, desde: -FONDO / 2, hasta: FONDO / 2 },
      ]
      ladosEnvolvente.forEach((lado) => {
        const candidatos = espaciosDelNivel.filter((e) => {
          if (e.cat === 'exterior') return false
          const borde = lado.eje === 'x' ? (lado.fijo < 0 ? e.z0 : e.z1) : (lado.fijo < 0 ? e.x0 : e.x1)
          return Math.abs(borde - lado.fijo) < UMBRAL_BORDE
        })
        let vanos: VanoMuro[] = candidatos.map((e) => {
          const { alturaBase, altura } = parametrosVentana(e.cat, ALTO_MURO)
          const centro = lado.eje === 'x' ? e.ex : e.ez
          const largo = lado.eje === 'x' ? e.ew : e.ed
          return { centro, ancho: Math.min(largo * 0.62, (lado.hasta - lado.desde) * 0.85), alturaBase, altura, cristal: true }
        })
        if (lado.frente) {
          const puerta = parametrosPuerta('social', ALTO_MURO)
          vanos = vanos.filter((v) => Math.abs(v.centro) >= puerta.ancho / 2 + 0.5)
          vanos.push({ centro: 0, ancho: puerta.ancho, alturaBase: 0, altura: puerta.altura, cristal: false })
        }
        const { grupo, aristas: a } = construirMuro({
          eje: lado.eje, fijo: lado.fijo, desde: lado.desde, hasta: lado.hasta,
          alturaMuro: ALTO_MURO, grosor: 0.22, vanos, materiales: { muro: matMuro, vidrio: matVidrio, marco: matMarco },
        })
        gMuros.add(grupo)
        aristas.push(...a)
      })

      /* Candidatas a luz interior — la(s) sala(s) primero. */
      const candidatasLuz = espaciosDelNivel.filter((e) => e.cat === 'social')
      ;(candidatasLuz.length > 0 ? candidatasLuz : espaciosDelNivel.slice(0, 1)).slice(0, dosNiveles ? 1 : 2).forEach((e) => {
        const luz = new THREE.PointLight(HEX.luzInteriorCalida, 0.55, escalaBase * 1.4, 2)
        luz.position.set(e.ex, yBase + ALTO_MURO * 0.6, e.ez)
        scene.add(luz)
        interiores.push(luz)
      })

      /* Espacios de este nivel: piso de color por categoría (para el
         resaltado de "Distribución") + muros interiores con vano real. */
      espaciosDelNivel.forEach((e) => {
        const matSup = reg(new THREE.MeshStandardMaterial({
          color: PALETA_ESPACIOS[e.cat] || 0xd0c8ba,
          map: e.cat === 'humedo' || e.cat === 'cocina' ? texAzulejo : null,
          roughness: 0.82,
          transparent: true,
          opacity: 0.88,
        }))
        const sup = new THREE.Mesh(
          new THREE.BoxGeometry(Math.max(e.ew - 0.22, 0.3), 0.055, Math.max(e.ed - 0.22, 0.3)),
          matSup,
        )
        sup.position.set(e.ex, 0.1, e.ez)
        sup.receiveShadow = true
        gPisos.add(sup)
        mallas[e.id] = { grupo: gPisos, sup, matSup, nivel: nv, base: yBase + 0.1 }

        if (e.cat === 'exterior') {
          const barandal = new THREE.Mesh(new THREE.BoxGeometry(e.ew, ALTO_MURO * 0.62, 0.07), matVidrio)
          barandal.position.set(e.ex, ALTO_MURO * 0.31, e.z1)
          gMuros.add(barandal)
          return
        }

        const lados = [
          { eje: 'x' as const, fijo: e.z0, desde: e.x0, hasta: e.x1, mid: [e.ex, e.z0] as [number, number] },
          { eje: 'x' as const, fijo: e.z1, desde: e.x0, hasta: e.x1, mid: [e.ex, e.z1] as [number, number] },
          { eje: 'z' as const, fijo: e.x0, desde: e.z0, hasta: e.z1, mid: [e.x0, e.ez] as [number, number] },
          { eje: 'z' as const, fijo: e.x1, desde: e.z0, hasta: e.z1, mid: [e.x1, e.ez] as [number, number] },
        ]
        const ladoPuerta = lados.reduce((a, b) => (Math.hypot(...a.mid) <= Math.hypot(...b.mid) ? a : b))
        lados.forEach((lado) => {
          const vanos: VanoMuro[] = []
          if (lado === ladoPuerta) {
            const puerta = parametrosPuerta(e.cat, ALTO_MURO)
            vanos.push({ centro: lado.eje === 'x' ? e.ex : e.ez, ancho: puerta.ancho, alturaBase: 0, altura: puerta.altura, cristal: false })
          }
          const { grupo, aristas: a } = construirMuro({
            eje: lado.eje, fijo: lado.fijo, desde: lado.desde, hasta: lado.hasta,
            alturaMuro: ALTO_MURO, grosor: 0.14, vanos, materiales: { muro: matMuro, vidrio: matVidrio, marco: matMarco },
          })
          gMuros.add(grupo)
          aristas.push(...a)
        })

        if (e.cat === 'social' && Math.min(e.ew, e.ed) > 2.2) {
          construirPlanta(gFurn, matsMobiliario, e.x1 - 0.55, e.z1 - 0.55, 0.85)
        }
      })

      /* Muebles de este nivel — cada tipo usa su función paramétrica; el
         resto queda como caja de esquina redondeada de proporción fija. */
      plantilla.muebles
        .filter((m) => (dosNiveles ? (m.nivel ?? 0) === nv : true))
        .forEach((mb) => {
          const x = mb.x * ANCHO
          const z = mb.z * FONDO
          const w = mb.w * ANCHO
          const d = mb.d * FONDO
          const h = mb.h * escalaBase
          switch (mb.t) {
            case 'sofa':
              construirSofa(gFurn, matsMobiliario, x, z, w)
              break
            case 'cama':
              construirCama(gFurn, matsMobiliario, x, z, w)
              break
            case 'comedor':
              construirComedor(gFurn, matsMobiliario, x, z, w, d)
              break
            case 'tv':
              cajaRedondeada(gFurn, w, h, d, 0.02, matOscuro, x, 0, z)
              break
            case 'barra':
            case 'isla':
              cajaRedondeada(gFurn, w, h, d, 0.03, matMarmol, x, 0, z)
              break
            case 'tumbona':
              cajaRedondeada(gFurn, w, h, d, 0.03, matAcento, x, 0, z)
              break
            default:
              cajaRedondeada(gFurn, w, h, d, 0.025, matMaderaMueble, x, 0, z)
          }
        })
    })

    /* Techo — una sola losa sobre el nivel más alto, solo visible en el
       modo "Entrar a la casa" (en el resto de modos se ve hacia adentro,
       que es justo lo que necesita el panel de Distribución). */
    const techo = new THREE.Mesh(
      new THREE.BoxGeometry(ANCHO + 0.6, 0.16, FONDO + 0.6),
      matPiedra,
    )
    techo.position.set(0, (niveles.length - 1) * SEP_NIVEL + ALTO_MURO + 0.08, 0)
    techo.visible = false
    techo.castShadow = true
    techo.receiveShadow = true
    raiz.add(techo)

    if (dosNiveles) raiz.position.y = -SEP_NIVEL / 2

    if (loteExterior) {
      construirExterior(gPatio, matsExterior, loteExterior)
    }

    /* ================================================================ */
    /*  CÁMARA — dos sistemas: órbita (theta/phi/radio esféricos, con     */
    /*  suavizado hacia un objetivo mutable) y primera persona (posición  */
    /*  + yaw/pitch). `orb` y `fp` son el estado mutable que el resto del  */
    /*  componente lee/escribe vía escena.current — el loop de abajo solo  */
    /*  lee esos dos objetos, nunca al revés.                             */
    /* ================================================================ */
    cam.rotation.order = 'YXZ'
    const objetivoOrbita = new THREE.Vector3(0, dosNiveles ? ALTO_MURO * 0.35 : ALTO_MURO * 0.55, 0)
    const orb = { theta: -Math.PI * 0.32, phi: 1.02, radio: escalaBase * 2.05 }
    const actual = { ...orb }

    const primerPunto = puntosRecorrido[0]
    const fp: EstadoPrimeraPersona = {
      pos: { x: primerPunto?.x ?? 0, z: primerPunto?.z ?? 0 },
      objetivo: { x: primerPunto?.x ?? 0, z: primerPunto?.z ?? 0 },
      yaw: primerPunto?.yaw ?? 0,
      pitch: 0,
      ojoAltura: ALTO_MURO * 0.62,
      teclas: { f: false, b: false, l: false, r: false, s: false },
    }

    const margenLimite = 0.4
    const limX = (loteExterior ? loteExterior.anchoTerreno : ANCHO) / 2 - margenLimite
    const limZ = (loteExterior ? loteExterior.fondoTerreno : FONDO) / 2 - margenLimite
    const limites = { x0: -limX, x1: limX, z0: -limZ, z1: limZ }
    const raizY = raiz.position.y

    function posicionarCamara() {
      if (modoRef.current === 'interior') {
        cam.position.set(fp.pos.x, raizY + fp.ojoAltura, fp.pos.z)
        cam.rotation.set(fp.pitch, fp.yaw, 0)
      } else {
        const { theta, phi, radio } = actual
        cam.position.set(
          objetivoOrbita.x + radio * Math.sin(phi) * Math.sin(theta),
          objetivoOrbita.y + radio * Math.cos(phi),
          objetivoOrbita.z + radio * Math.sin(phi) * Math.cos(theta),
        )
        cam.lookAt(objetivoOrbita)
      }
    }
    posicionarCamara()

    escena.current = {
      scene, cam, rend, raiz, mallas, orb, sol, amb, relleno, interiores,
      girar: girando, escalaBase, techo, aristas, matMuro, matPiedra,
      gMuros, gFurn, gPatio, limites, fp, posCam: posicionarCamara,
    }
    modoAnteriorRef.current = 'volumen'
    aplicarModo(modo)

    /* ================================================================ */
    /*  LOOP DE ANIMACIÓN                                                  */
    /* ================================================================ */
    let idRaf = 0
    let tiempoAnterior = 0
    function animar(ahora: number) {
      idRaf = requestAnimationFrame(animar)
      const dt = tiempoAnterior ? Math.min((ahora - tiempoAnterior) / 1000, 0.1) : 0
      tiempoAnterior = ahora

      if (modoRef.current === 'interior') {
        const vel = (fp.teclas.s ? escalaBase * 0.26 : escalaBase * 0.13) * dt
        const df = (fp.teclas.f ? 1 : 0) - (fp.teclas.b ? 1 : 0)
        const dr = (fp.teclas.r ? 1 : 0) - (fp.teclas.l ? 1 : 0)
        if (df || dr) {
          // Vector de avance = hacia donde mira la cámara con este yaw; el
          // lateral es ese mismo vector rotado 90°. Ver nota en puntosRecorrido.
          const fx = -Math.sin(fp.yaw)
          const fz = -Math.cos(fp.yaw)
          const rx = Math.cos(fp.yaw)
          const rz = -Math.sin(fp.yaw)
          const mx = df * fx + dr * rx
          const mz = df * fz + dr * rz
          const mag = Math.hypot(mx, mz) || 1
          fp.objetivo.x = THREE.MathUtils.clamp(fp.objetivo.x + (mx / mag) * vel, limites.x0, limites.x1)
          fp.objetivo.z = THREE.MathUtils.clamp(fp.objetivo.z + (mz / mag) * vel, limites.z0, limites.z1)
        }
        fp.pos.x += (fp.objetivo.x - fp.pos.x) * 0.16
        fp.pos.z += (fp.objetivo.z - fp.pos.z) * 0.16
      } else {
        if (escena.current.girar) orb.theta += dt * 0.14
        actual.theta += (orb.theta - actual.theta) * 0.13
        actual.phi += (orb.phi - actual.phi) * 0.13
        actual.radio += (orb.radio - actual.radio) * 0.13
      }
      posicionarCamara()
      rend.render(scene, cam)
    }
    idRaf = requestAnimationFrame(animar)
    setListo(true)

    /* ================================================================ */
    /*  CONTROLES — mouse, táctil, rueda y teclado. Todos escriben sobre   */
    /*  `orb` (órbita) o `fp` (interior) directamente; el loop de arriba    */
    /*  es el único que los lee.                                           */
    /* ================================================================ */
    const lienzo = rend.domElement
    lienzo.style.touchAction = 'none'
    lienzo.style.cursor = 'grab'
    let arrastrando = false
    let px = 0
    let py = 0

    function iniciarArrastre(x: number, y: number) {
      arrastrando = true
      px = x
      py = y
      lienzo.style.cursor = 'grabbing'
    }
    function moverArrastre(x: number, y: number) {
      if (!arrastrando) return
      const dx = x - px
      const dy = y - py
      px = x
      py = y
      if (modoRef.current === 'interior') {
        fp.yaw -= dx * 0.0045
        fp.pitch = THREE.MathUtils.clamp(fp.pitch - dy * 0.0045, -1.15, 1.15)
      } else {
        orb.theta -= dx * 0.0055
        orb.phi = THREE.MathUtils.clamp(orb.phi - dy * 0.0055, 0.08, 1.5)
      }
    }
    function terminarArrastre() {
      arrastrando = false
      lienzo.style.cursor = 'grab'
    }

    function aplicarRueda(delta: number) {
      if (modoRef.current === 'interior') {
        if (esMovil) return
        const fx = -Math.sin(fp.yaw)
        const fz = -Math.cos(fp.yaw)
        const paso = delta * escalaBase * 0.0007
        fp.objetivo.x = THREE.MathUtils.clamp(fp.objetivo.x + fx * paso, limites.x0, limites.x1)
        fp.objetivo.z = THREE.MathUtils.clamp(fp.objetivo.z + fz * paso, limites.z0, limites.z1)
      } else {
        orb.radio = THREE.MathUtils.clamp(orb.radio + delta * escalaBase * 0.002, escalaBase * 0.85, escalaBase * 4.5)
      }
    }

    function alMouseDown(e: MouseEvent) {
      iniciarArrastre(e.clientX, e.clientY)
    }
    function alMouseMove(e: MouseEvent) {
      moverArrastre(e.clientX, e.clientY)
    }
    function alMouseUp() {
      terminarArrastre()
    }
    function alWheel(e: WheelEvent) {
      e.preventDefault()
      aplicarRueda(e.deltaY)
    }

    let distanciaPinch = 0
    function alTouchStart(e: TouchEvent) {
      if (e.touches.length === 1) {
        iniciarArrastre(e.touches[0].clientX, e.touches[0].clientY)
      } else if (e.touches.length === 2) {
        arrastrando = false
        distanciaPinch = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY,
        )
      }
    }
    function alTouchMove(e: TouchEvent) {
      if (e.touches.length === 1) {
        e.preventDefault()
        moverArrastre(e.touches[0].clientX, e.touches[0].clientY)
      } else if (e.touches.length === 2) {
        e.preventDefault()
        const dist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY,
        )
        aplicarRueda((distanciaPinch - dist) * 0.6)
        distanciaPinch = dist
      }
    }
    function alTouchEnd() {
      terminarArrastre()
    }

    const MAPA_TECLAS: Record<string, keyof EstadoPrimeraPersona['teclas']> = {
      KeyW: 'f', ArrowUp: 'f', KeyS: 'b', ArrowDown: 'b',
      KeyA: 'l', ArrowLeft: 'l', KeyD: 'r', ArrowRight: 'r',
      ShiftLeft: 's', ShiftRight: 's',
    }
    function alTeclaDown(e: KeyboardEvent) {
      if (modoRef.current !== 'interior') return
      const tecla = MAPA_TECLAS[e.code]
      if (!tecla) return
      e.preventDefault()
      fp.teclas[tecla] = true
    }
    function alTeclaUp(e: KeyboardEvent) {
      const tecla = MAPA_TECLAS[e.code]
      if (!tecla) return
      fp.teclas[tecla] = false
    }

    lienzo.addEventListener('mousedown', alMouseDown)
    window.addEventListener('mousemove', alMouseMove)
    window.addEventListener('mouseup', alMouseUp)
    lienzo.addEventListener('wheel', alWheel, { passive: false })
    lienzo.addEventListener('touchstart', alTouchStart, { passive: true })
    lienzo.addEventListener('touchmove', alTouchMove, { passive: false })
    lienzo.addEventListener('touchend', alTouchEnd)
    lienzo.addEventListener('touchcancel', alTouchEnd)
    if (!esMovil) {
      window.addEventListener('keydown', alTeclaDown)
      window.addEventListener('keyup', alTeclaUp)
    }

    const ro = new ResizeObserver((entradas) => {
      const entrada = entradas[0]
      if (!entrada) return
      const w = Math.max(1, entrada.contentRect.width)
      const h = Math.max(1, entrada.contentRect.height)
      rend.setSize(w, h)
      cam.aspect = w / h
      cam.updateProjectionMatrix()
    })
    ro.observe(nodo)

    return () => {
      cancelAnimationFrame(idRaf)
      ro.disconnect()
      lienzo.removeEventListener('mousedown', alMouseDown)
      window.removeEventListener('mousemove', alMouseMove)
      window.removeEventListener('mouseup', alMouseUp)
      lienzo.removeEventListener('wheel', alWheel)
      lienzo.removeEventListener('touchstart', alTouchStart)
      lienzo.removeEventListener('touchmove', alTouchMove)
      lienzo.removeEventListener('touchend', alTouchEnd)
      lienzo.removeEventListener('touchcancel', alTouchEnd)
      window.removeEventListener('keydown', alTeclaDown)
      window.removeEventListener('keyup', alTeclaUp)

      materiales.forEach((m) => m.dispose())
      texturas.forEach((t) => t.dispose())
      raiz.traverse((obj) => {
        const malla = obj as THREE.Mesh
        malla.geometry?.dispose()
      })
      scene.environment?.dispose()
      pmrem.dispose()
      rend.dispose()
      if (rend.domElement.parentNode === nodo) nodo.removeChild(rend.domElement)
      escena.current = {}
    }
  }, [dimensiones, plantilla, espaciosMundo, dosNiveles, loteExterior, puntosRecorrido])

  /* ---------------- Aplicación de modo (volumen/planta/estructura/interior) ---------------- */
  const modoAnteriorRef = useRef<Modo>('volumen')
  const [pantallaCompleta, setPantallaCompleta] = useState(false)

  function aplicarModo(m: Modo) {
    const es = escena.current
    if (!es.scene || !es.cam) return

    es.cam.fov = m === 'interior' ? 64 : 34
    es.cam.updateProjectionMatrix()

    if (es.gMuros) es.gMuros.scale.y = m === 'planta' ? 0.3 : 1
    if (es.matMuro) {
      es.matMuro.transparent = m === 'estructura'
      es.matMuro.opacity = m === 'estructura' ? 0.16 : 1
    }
    es.aristas?.forEach((a) => {
      a.visible = m === 'estructura'
    })
    if (es.gFurn) es.gFurn.visible = m !== 'estructura'
    if (es.gPatio) es.gPatio.visible = m !== 'estructura'
    if (es.techo) es.techo.visible = m === 'interior'

    es.interiores?.forEach((luz) => {
      luz.intensity = m === 'interior' ? (noche ? 1.05 : 0.7) : noche ? 0.55 : 0.22
    })

    if (es.orb && es.escalaBase) {
      if (m === 'planta') {
        es.orb.phi = 0.14
        es.orb.radio = es.escalaBase * 2.35
      } else if (m !== 'interior' && modoAnteriorRef.current === 'planta') {
        es.orb.phi = 1.02
        es.orb.radio = es.escalaBase * 2.05
      }
    }

    if (m === 'interior' && modoAnteriorRef.current !== 'interior' && es.fp) {
      const punto = puntosRecorrido[0]
      if (punto) {
        es.fp.pos = { x: punto.x, z: punto.z }
        es.fp.objetivo = { x: punto.x, z: punto.z }
        es.fp.yaw = punto.yaw
        es.fp.pitch = 0
      }
    }

    modoAnteriorRef.current = m
  }

  useEffect(() => {
    aplicarModo(modo)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modo, noche])

  useEffect(() => {
    escena.current.girar = girando
  }, [girando])

  useEffect(() => {
    const mallas = escena.current.mallas
    if (!mallas) return
    Object.entries(mallas).forEach(([id, m]) => {
      const activo = id === espacio
      m.matSup.opacity = activo ? 1 : 0.86
      m.matSup.emissive.setHex(activo ? HEX.oro : 0x000000)
      m.matSup.emissiveIntensity = activo ? 0.4 : 0
    })
  }, [espacio])

  useEffect(() => {
    const mallas = escena.current.mallas
    if (!mallas) return
    Object.values(mallas).forEach((m) => {
      m.sup.visible = nivel === 'todos' || String(m.nivel) === nivel
    })
  }, [nivel])

  useEffect(() => {
    function alCambiarPantalla() {
      setPantallaCompleta(document.fullscreenElement === cont.current)
    }
    document.addEventListener('fullscreenchange', alCambiarPantalla)
    return () => document.removeEventListener('fullscreenchange', alCambiarPantalla)
  }, [])

  function resetVista() {
    const es = escena.current
    if (!es.escalaBase) return
    if (modoRef.current === 'interior') {
      const punto = puntosRecorrido[0]
      if (punto && es.fp) {
        es.fp.objetivo = { x: punto.x, z: punto.z }
        es.fp.yaw = punto.yaw
        es.fp.pitch = 0
      }
    } else if (es.orb) {
      es.orb.theta = -Math.PI * 0.32
      es.orb.phi = modo === 'planta' ? 0.14 : 1.02
      es.orb.radio = es.escalaBase * (modo === 'planta' ? 2.35 : 2.05)
    }
  }

  function irAPunto(punto: PuntoRecorrido) {
    const es = escena.current
    if (!es.fp) return
    es.fp.objetivo = { x: punto.x, z: punto.z }
    es.fp.yaw = punto.yaw
    setEspacio(punto.id === '__jardin' ? null : punto.id)
  }

  function alternarPantallaCompleta() {
    if (document.fullscreenElement) {
      document.exitFullscreen()
    } else {
      cont.current?.requestFullscreen()
    }
  }

  function formatoPrecioVisor(precio: { monto: number; moneda: string }): string {
    const monto = new Intl.NumberFormat('es-MX', { maximumFractionDigits: 0 }).format(precio.monto)
    return `$${monto} ${precio.moneda}`
  }

  const MODOS: { id: Modo; etiqueta: string; Icono: LucideIcon }[] = [
    { id: 'volumen', etiqueta: 'Volumen', Icono: Box },
    { id: 'planta', etiqueta: 'Planta', Icono: Layers },
    { id: 'estructura', etiqueta: 'Estructura', Icono: Move3d },
    { id: 'interior', etiqueta: 'Entrar a la casa', Icono: DoorOpen },
  ]

  const ayuda = modo === 'interior'
    ? esMovil
      ? 'Toca «Ir a» para moverte · arrastra para mirar'
      : 'WASD o flechas para caminar · arrastra para mirar · Shift para correr'
    : esMovil
      ? 'Arrastra para girar · pellizca para acercar'
      : 'Arrastra para girar · rueda del mouse para acercar'

  return (
    <div style={{ fontFamily: SANS }} className="relative">
      <div
        className="pointer-events-none absolute -inset-x-6 -top-8 h-28 blur-3xl"
        style={{ background: `radial-gradient(ellipse at left, ${C.oro}22, transparent 70%)` }}
      />

      <div className="relative mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-oro">Recorrido 3D</p>
          <h2 className="mt-1 text-2xl text-marfil" style={{ fontFamily: SERIF }}>{plantilla.nombre}</h2>
          <p className="mt-1 font-mono text-xs text-plata/60">
            {p.folio} · {p.tipo}{p.recamaras ? ` · ${p.recamaras} recámaras` : ''}
          </p>
        </div>
        {p.precio && (
          <p className="text-xl text-oro-claro" style={{ fontFamily: SERIF }}>{formatoPrecioVisor(p.precio)}</p>
        )}
      </div>

      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div className="inline-flex flex-wrap gap-1 rounded-full border border-oro/20 bg-carbon/70 p-1">
          {MODOS.map(({ id, etiqueta, Icono }) => (
            <button
              key={id}
              type="button"
              onClick={() => setModo(id)}
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                modo === id ? 'bg-oro text-onix' : 'text-plata/75 hover:text-marfil'
              }`}
            >
              <Icono size={14} strokeWidth={1.75} />
              <span className={esMovil ? 'sr-only' : ''}>{etiqueta}</span>
            </button>
          ))}
        </div>
        <div className="inline-flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setNoche((n) => !n)}
            aria-label={noche ? 'Cambiar a modo día' : 'Cambiar a modo noche'}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-oro/20 text-plata transition-colors hover:text-oro"
          >
            {noche ? <Moon size={15} /> : <Sun size={15} />}
          </button>
          <button
            type="button"
            onClick={() => setGirando((g) => !g)}
            aria-label={girando ? 'Pausar rotación' : 'Girar automáticamente'}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-oro/20 text-plata transition-colors hover:text-oro"
          >
            {girando ? <Pause size={14} /> : <Play size={14} />}
          </button>
          <button
            type="button"
            onClick={resetVista}
            aria-label="Reiniciar vista"
            className="flex h-8 w-8 items-center justify-center rounded-full border border-oro/20 text-plata transition-colors hover:text-oro"
          >
            <RotateCcw size={14} />
          </button>
        </div>
      </div>

      <AnimatePresence initial={false}>
        {modo === 'interior' && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-3 overflow-hidden"
          >
            <div className="flex flex-wrap items-center gap-1.5 rounded-xl border border-oro/15 bg-carbon/60 p-2">
              <span className="px-1.5 text-[11px] uppercase tracking-wide text-plata/55">Ir a</span>
              {puntosRecorrido.map((punto) => (
                <button
                  key={punto.id}
                  type="button"
                  onClick={() => irAPunto(punto)}
                  className={`rounded-full px-2.5 py-1 text-xs transition-colors ${
                    espacio === punto.id ? 'bg-oro text-onix' : 'bg-onix/60 text-plata/80 hover:text-marfil'
                  }`}
                >
                  {punto.nombre}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid gap-4 lg:grid-cols-[1fr_260px]">
        <div
          className="relative overflow-hidden rounded-2xl border border-oro/15 bg-onix"
          style={{ aspectRatio: esMovil ? '4 / 5' : '16 / 9' }}
        >
          <div ref={cont} className={`h-full w-full transition-opacity duration-700 ${listo ? 'opacity-100' : 'opacity-0'}`} />
          {!listo && (
            <div className="absolute inset-0 flex items-center justify-center text-xs text-plata/45">
              Construyendo el recorrido…
            </div>
          )}
          <div className="absolute bottom-3 left-3 inline-flex max-w-[85%] items-center gap-1.5 rounded-full border border-oro/20 bg-onix/80 px-3 py-1.5 text-[11px] text-plata/85 backdrop-blur">
            <Info size={12} className="shrink-0 text-oro" />
            {!esMovil && (modo === 'interior' ? <Keyboard size={12} className="shrink-0" /> : <MousePointer2 size={12} className="shrink-0" />)}
            <AnimatePresence mode="wait">
              <motion.span
                key={modo + String(esMovil)}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="truncate"
              >
                {ayuda}
              </motion.span>
            </AnimatePresence>
          </div>
          <button
            type="button"
            onClick={alternarPantallaCompleta}
            aria-label={pantallaCompleta ? 'Salir de pantalla completa' : 'Pantalla completa'}
            className="absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-full border border-oro/20 bg-onix/80 text-plata backdrop-blur transition-colors hover:text-oro"
          >
            {pantallaCompleta ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
          </button>
        </div>

        <div className="rounded-2xl border border-oro/10 bg-carbon/50 p-4 lg:max-h-[440px] lg:overflow-y-auto">
          <div className="mb-2 flex items-center justify-between">
            <p className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-plata/60">
              <ListTree size={14} /> Distribución
            </p>
            {espacio && (
              <button
                type="button"
                onClick={() => setEspacio(null)}
                aria-label="Quitar selección"
                className="text-plata/50 transition-colors hover:text-marfil"
              >
                <X size={14} />
              </button>
            )}
          </div>
          {dosNiveles && (
            <div className="mb-2 inline-flex gap-1 rounded-full border border-oro/15 p-0.5">
              {OPCIONES_NIVEL.map(([id, etiqueta]) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setNivel(id)}
                  className={`rounded-full px-2 py-0.5 text-[11px] transition-colors ${
                    nivel === id ? 'bg-oro text-onix' : 'text-plata/70 hover:text-marfil'
                  }`}
                >
                  {etiqueta}
                </button>
              ))}
            </div>
          )}
          <ul className="space-y-1">
            {espacios
              .filter((e) => !dosNiveles || nivel === 'todos' || String(e.nivel ?? 0) === nivel)
              .map((e) => (
                <li key={e.id}>
                  <button
                    type="button"
                    onMouseEnter={() => setEspacio(e.id)}
                    onMouseLeave={() => setEspacio((cur) => (cur === e.id ? null : cur))}
                    onClick={() => setEspacio(e.id)}
                    className={`flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-sm transition-colors ${
                      espacio === e.id ? 'bg-oro/15 text-marfil' : 'text-plata/75 hover:bg-oro/5'
                    }`}
                  >
                    <span>{e.nombre}</span>
                    <span className="font-mono text-xs text-plata/50">{e.m2} m²</span>
                  </button>
                </li>
              ))}
          </ul>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {[
          { Icono: Bed, etiqueta: 'Recámaras', valor: p.recamaras ?? '—' },
          { Icono: Bath, etiqueta: 'Baños', valor: p.banos ?? '—' },
          { Icono: Maximize, etiqueta: 'm² construcción', valor: p.m2 ? p.m2.toLocaleString('es-MX') : '—' },
          { Icono: Car, etiqueta: 'Estacionamientos', valor: p.estacionamientos ?? '—' },
        ].map(({ Icono, etiqueta, valor }) => (
          <div key={etiqueta} className="flex flex-col items-start gap-1 rounded-xl border border-oro/10 bg-carbon/50 px-3 py-2.5">
            <Icono size={16} strokeWidth={1.5} className="text-oro" />
            <span className="text-base text-marfil">{valor}</span>
            <span className="text-[11px] text-plata/55">{etiqueta}</span>
          </div>
        ))}
      </div>

      <p className="mt-4 text-center text-[11px] text-plata/40">
        Modelo ilustrativo generado a partir de los datos de la propiedad — no representa el acabado ni el mobiliario reales de la unidad.
      </p>
    </div>
  )
}
