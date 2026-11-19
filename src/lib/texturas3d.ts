import * as THREE from 'three'
import { COLORES, hexNum } from './colores'

/* =================================================================== */
/*  TEXTURAS PROCEDURALES — generadas en <canvas>, no imágenes cargadas. */
/*  Cada una envuelve con RepeatWrapping y trae anisotropy, para que se  */
/*  vean nítidas sobre superficies grandes (piso, deck, pasto…) vistas   */
/*  en ángulo bajo, como en el modo "Entrar a la casa".                  */
/*                                                                       */
/*  Todo color sale de COLORES (lib/colores.ts) — aquí no hay hex suelto,*/
/*  solo los tonos de vetas/ruido se derivan aritméticamente del color   */
/*  base de cada textura.                                                */
/* =================================================================== */

type Pintor = (ctx: CanvasRenderingContext2D, ancho: number, alto: number) => void

function componentes(hex: string): [number, number, number] {
  const n = hexNum(hex)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

function tono([r, g, b]: [number, number, number], delta: number): string {
  const ajustar = (c: number) => Math.max(0, Math.min(255, Math.round(c + delta)))
  return `rgb(${ajustar(r)},${ajustar(g)},${ajustar(b)})`
}

function tonoAlfa([r, g, b]: [number, number, number], delta: number, alfa: number): string {
  const ajustar = (c: number) => Math.max(0, Math.min(255, Math.round(c + delta)))
  return `rgba(${ajustar(r)},${ajustar(g)},${ajustar(b)},${alfa})`
}

function ruido(
  ctx: CanvasRenderingContext2D,
  ancho: number,
  alto: number,
  cantidad: number,
  alfaMax: number,
  base: [number, number, number],
  delta: number,
) {
  for (let i = 0; i < cantidad; i++) {
    ctx.fillStyle = tonoAlfa(base, delta, Number((Math.random() * alfaMax).toFixed(3)))
    ctx.fillRect(Math.random() * ancho, Math.random() * alto, Math.random() * 3 + 1, Math.random() * 3 + 1)
  }
}

function crearTextura(tam: number, pintar: Pintor, repeatX = 1, repeatY = 1, anisotropy = 8): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = tam
  canvas.height = tam
  const ctx = canvas.getContext('2d')
  if (ctx) pintar(ctx, tam, tam)
  const textura = new THREE.CanvasTexture(canvas)
  textura.wrapS = THREE.RepeatWrapping
  textura.wrapT = THREE.RepeatWrapping
  textura.repeat.set(repeatX, repeatY)
  textura.colorSpace = THREE.SRGBColorSpace
  textura.anisotropy = anisotropy
  textura.needsUpdate = true
  return textura
}

/** Piso de madera con vetas — franjas horizontales de tono variable y curvas finas imitando el grano. */
export function texturaMadera(repeatX = 4, repeatY = 4, anisotropy = 8): THREE.CanvasTexture {
  const base = componentes(COLORES.pisoMadera)
  return crearTextura(512, (ctx, w, h) => {
    ctx.fillStyle = COLORES.pisoMadera
    ctx.fillRect(0, 0, w, h)
    const franjas = 8
    for (let i = 0; i < franjas; i++) {
      const y = (i * h) / franjas
      ctx.fillStyle = tono(base, 18 + Math.random() * 22)
      ctx.fillRect(0, y, w, h / franjas - 1)
      ctx.strokeStyle = tonoAlfa([70, 45, 20], 0, 0.25)
      ctx.lineWidth = 1.4
      ctx.beginPath()
      ctx.moveTo(0, y + h / franjas - 1)
      ctx.lineTo(w, y + h / franjas - 1)
      ctx.stroke()
      for (let k = 0; k < 26; k++) {
        ctx.strokeStyle = tonoAlfa([96, 66, 34], 0, Number((0.05 + Math.random() * 0.12).toFixed(2)))
        ctx.lineWidth = 0.8 + Math.random()
        const yy = y + Math.random() * (h / franjas)
        ctx.beginPath()
        ctx.moveTo(0, yy)
        ctx.bezierCurveTo(w * 0.3, yy + 4, w * 0.6, yy - 4, w, yy)
        ctx.stroke()
      }
    }
  }, repeatX, repeatY, anisotropy)
}

/** Duela de deck exterior — franjas más anchas y marcadas que el piso interior, tono más oscuro. */
export function texturaDeck(repeatX = 6, repeatY = 6, anisotropy = 8): THREE.CanvasTexture {
  const base = componentes(COLORES.deckMadera)
  return crearTextura(512, (ctx, w, h) => {
    ctx.fillStyle = COLORES.deckMadera
    ctx.fillRect(0, 0, w, h)
    const duelas = 12
    for (let i = 0; i < duelas; i++) {
      const y = (i * h) / duelas
      ctx.fillStyle = tono(base, Math.random() * 20)
      ctx.fillRect(0, y + 1, w, h / duelas - 3)
      for (let k = 0; k < 14; k++) {
        ctx.strokeStyle = tonoAlfa([70, 48, 26], 0, 0.1)
        const yy = y + Math.random() * (h / duelas)
        ctx.beginPath()
        ctx.moveTo(0, yy)
        ctx.lineTo(w, yy + (Math.random() * 3 - 1.5))
        ctx.stroke()
      }
    }
  }, repeatX, repeatY, anisotropy)
}

/** Pasto — mota de puntos verdes densos más un leve degradado de franjas para romper la uniformidad. */
export function texturaPasto(repeatX = 8, repeatY = 8, anisotropy = 8): THREE.CanvasTexture {
  const base = componentes(COLORES.pasto)
  return crearTextura(512, (ctx, w, h) => {
    ctx.fillStyle = COLORES.pasto
    ctx.fillRect(0, 0, w, h)
    for (let i = 0; i < 9000; i++) {
      const t = Math.random()
      ctx.fillStyle = tonoAlfa(base, -20 + t * 60, 0.55)
      ctx.fillRect(Math.random() * w, Math.random() * h, 2, 3)
    }
    for (let j = 0; j < 10; j++) {
      ctx.fillStyle = 'rgba(255,255,255,0.03)'
      ctx.fillRect(0, (j * h) / 10, w, h / 20)
    }
  }, repeatX, repeatY, anisotropy)
}

/** Muro con grano — ruido fino oscuro y claro sobre el tono hueso base, para que no se vea plano. */
export function texturaMuro(repeatX = 3, repeatY = 1.2, anisotropy = 8): THREE.CanvasTexture {
  const base = componentes(COLORES.muroHueso)
  return crearTextura(256, (ctx, w, h) => {
    ctx.fillStyle = COLORES.muroHueso
    ctx.fillRect(0, 0, w, h)
    ruido(ctx, w, h, 2600, 0.05, base, -140)
    ruido(ctx, w, h, 1400, 0.05, [255, 255, 255], 0)
  }, repeatX, repeatY, anisotropy)
}

/** Piedra — ruido irregular más grueso, para pisos de acceso y guarniciones exteriores. */
export function texturaPiedra(repeatX = 4, repeatY = 4, anisotropy = 8): THREE.CanvasTexture {
  const base = componentes(COLORES.piedra)
  return crearTextura(256, (ctx, w, h) => {
    ctx.fillStyle = COLORES.piedra
    ctx.fillRect(0, 0, w, h)
    ruido(ctx, w, h, 3000, 0.07, base, -110)
  }, repeatX, repeatY, anisotropy)
}

/** Mármol con vetas — curvas suaves de baja opacidad sobre fondo casi blanco. */
export function texturaMarmol(repeatX = 2, repeatY = 2, anisotropy = 8): THREE.CanvasTexture {
  const base = componentes(COLORES.marmol)
  return crearTextura(256, (ctx, w, h) => {
    ctx.fillStyle = COLORES.marmol
    ctx.fillRect(0, 0, w, h)
    for (let i = 0; i < 16; i++) {
      ctx.strokeStyle = tonoAlfa(base, -130, Number((0.05 + Math.random() * 0.13).toFixed(2)))
      ctx.lineWidth = 0.6 + Math.random() * 1.6
      const y = Math.random() * h
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.bezierCurveTo(w * 0.3, y + Math.random() * 50 - 25, w * 0.7, y + Math.random() * 50 - 25, w, y + Math.random() * 30 - 15)
      ctx.stroke()
    }
  }, repeatX, repeatY, anisotropy)
}

/** Azulejo — cuadrícula de juntas sobre el tono base, para baños y cocina. */
export function texturaAzulejo(repeatX = 3, repeatY = 3, anisotropy = 8): THREE.CanvasTexture {
  const base = componentes(COLORES.azulejo)
  return crearTextura(256, (ctx, w, h) => {
    ctx.fillStyle = COLORES.azulejo
    ctx.fillRect(0, 0, w, h)
    ctx.strokeStyle = COLORES.azulejoJunta
    ctx.lineWidth = 3
    const div = 4
    for (let i = 0; i <= div; i++) {
      ctx.beginPath()
      ctx.moveTo((i * w) / div, 0)
      ctx.lineTo((i * w) / div, h)
      ctx.stroke()
      ctx.beginPath()
      ctx.moveTo(0, (i * h) / div)
      ctx.lineTo(w, (i * h) / div)
      ctx.stroke()
    }
    ruido(ctx, w, h, 900, 0.04, base, -120)
  }, repeatX, repeatY, anisotropy)
}
