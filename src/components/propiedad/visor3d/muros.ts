import * as THREE from 'three'
import { COLORES, hexNum } from '../../../lib/colores'

/* =================================================================== */
/*  MUROS CON VANOS REALES                                              */
/*                                                                       */
/*  Un muro es un tramo (`desde` → `hasta` a lo largo de `eje`, a la     */
/*  altura fija `fijo` del otro eje) con una lista de vanos: aberturas   */
/*  con centro, ancho, altura base y altura. El tramo se corta en        */
/*  segmentos sólidos alrededor de cada vano — igual que picar un muro   */
/*  macizo para dejar el hueco de una ventana o una puerta. Las ventanas */
/*  llevan cristal + marco + montantes; las puertas son huecos solos.    */
/* =================================================================== */

export interface VanoMuro {
  centro: number
  ancho: number
  alturaBase: number
  altura: number
  cristal: boolean
}

export interface MaterialesMuro {
  muro: THREE.Material
  vidrio: THREE.Material
  marco: THREE.Material
}

export interface OpcionesMuro {
  eje: 'x' | 'z'
  fijo: number
  desde: number
  hasta: number
  alturaMuro: number
  grosor: number
  vanos: VanoMuro[]
  materiales: MaterialesMuro
}

export interface MuroConstruido {
  grupo: THREE.Group
  aristas: THREE.LineSegments[]
}

const COLOR_ARISTA = hexNum(COLORES.oro)

export function construirMuro(opts: OpcionesMuro): MuroConstruido {
  const { eje, fijo, desde, hasta, alturaMuro, grosor, vanos, materiales } = opts
  const grupo = new THREE.Group()
  const aristas: THREE.LineSegments[] = []

  function segmento(p0: number, p1: number, y0: number, y1: number) {
    if (p1 - p0 < 0.02 || y1 - y0 < 0.02) return
    const ancho = eje === 'x' ? p1 - p0 : grosor
    const fondo = eje === 'x' ? grosor : p1 - p0
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(ancho, y1 - y0, fondo), materiales.muro)
    mesh.position.set(
      eje === 'x' ? (p0 + p1) / 2 : fijo,
      (y0 + y1) / 2,
      eje === 'x' ? fijo : (p0 + p1) / 2,
    )
    mesh.castShadow = true
    mesh.receiveShadow = true
    grupo.add(mesh)

    const arista = new THREE.LineSegments(
      new THREE.EdgesGeometry(mesh.geometry),
      new THREE.LineBasicMaterial({ color: COLOR_ARISTA, transparent: true, opacity: 0.85 }),
    )
    arista.position.copy(mesh.position)
    arista.visible = false
    grupo.add(arista)
    aristas.push(arista)
  }

  function vano(p0: number, p1: number, y0: number, h: number, cristal: boolean) {
    if (!cristal) return
    const cx = eje === 'x' ? (p0 + p1) / 2 : fijo
    const cz = eje === 'x' ? fijo : (p0 + p1) / 2
    const anchoVidrio = eje === 'x' ? p1 - p0 : 0.05
    const fondoVidrio = eje === 'x' ? 0.05 : p1 - p0
    const vidrio = new THREE.Mesh(new THREE.BoxGeometry(anchoVidrio, h, fondoVidrio), materiales.vidrio)
    vidrio.position.set(cx, y0 + h / 2, cz)
    vidrio.castShadow = false
    grupo.add(vidrio)

    const anchoMarco = eje === 'x' ? p1 - p0 : 0.09
    const fondoMarco = eje === 'x' ? 0.09 : p1 - p0
    ;[y0, y0 + h].forEach((yy) => {
      const marco = new THREE.Mesh(new THREE.BoxGeometry(anchoMarco, 0.06, fondoMarco), materiales.marco)
      marco.position.set(cx, yy, cz)
      marco.castShadow = false
      grupo.add(marco)
    })

    const montantes = Math.max(1, Math.round((p1 - p0) / 1.3))
    for (let i = 0; i <= montantes; i++) {
      const t = p0 + ((p1 - p0) * i) / montantes
      const montante = new THREE.Mesh(
        new THREE.BoxGeometry(eje === 'x' ? 0.06 : 0.09, h, eje === 'x' ? 0.09 : 0.06),
        materiales.marco,
      )
      montante.position.set(eje === 'x' ? t : fijo, y0 + h / 2, eje === 'x' ? fijo : t)
      montante.castShadow = false
      grupo.add(montante)
    }
  }

  const ordenados = [...vanos].sort((a, b) => a.centro - b.centro)
  let cursor = desde
  ordenados.forEach((v) => {
    const s = v.centro - v.ancho / 2
    const e = v.centro + v.ancho / 2
    segmento(cursor, s, 0, alturaMuro)
    if (v.alturaBase > 0.01) segmento(s, e, 0, v.alturaBase)
    if (v.alturaBase + v.altura < alturaMuro - 0.01) segmento(s, e, v.alturaBase + v.altura, alturaMuro)
    vano(s, e, v.alturaBase, v.altura, v.cristal)
    cursor = e
  })
  segmento(cursor, hasta, 0, alturaMuro)

  return { grupo, aristas }
}
