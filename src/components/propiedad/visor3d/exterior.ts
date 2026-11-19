import * as THREE from 'three'
import { cajaRedondeada, cilindro, construirArbol, construirComedor, esferaIrregular } from './mobiliario'
import type { MaterialesMobiliario } from './mobiliario'

/* =================================================================== */
/*  EXTERIOR — deck, pérgola, alberca, asador, juegos, bardas, jardín y  */
/*  cochera. Se construye una sola vez que Visor3D confirma que la      */
/*  propiedad es una casa con terreno mayor que construcción, y todas    */
/*  las medidas salen de esa diferencia real (nunca de valores fijos).   */
/* =================================================================== */

export interface MaterialesExterior extends MaterialesMobiliario {
  deck: THREE.Material
  piedra: THREE.Material
  pasto: THREE.Material
  agua: THREE.Material
  metalOscuro: THREE.Material
  oscuro: THREE.Material
}

export interface LoteExterior {
  anchoConstruccion: number
  fondoConstruccion: number
  anchoTerreno: number
  fondoTerreno: number
}

/** true solo cuando hay terreno real de sobra para justificar jardín/alberca/cochera. */
export function tieneExteriorAprovechable(lote: LoteExterior): boolean {
  return lote.fondoTerreno > lote.fondoConstruccion + 2 && lote.anchoTerreno > lote.anchoConstruccion
}

export function construirExterior(padre: THREE.Group, mats: MaterialesExterior, lote: LoteExterior): void {
  const bordeCasa = lote.fondoConstruccion / 2
  const bordeLote = lote.fondoTerreno / 2
  const profundidadPatio = Math.max(bordeLote - bordeCasa, 1.5)
  const anchoPatio = Math.min(lote.anchoTerreno * 0.94, lote.anchoConstruccion * 1.35)
  const anchoLote = lote.anchoTerreno
  const fondoLote = lote.fondoTerreno

  /* ---------- deck junto a la casa ---------- */
  const profDeck = Math.min(profundidadPatio * 0.32, 3.6)
  const zDeck = bordeCasa + profDeck / 2
  const deck = new THREE.Mesh(new THREE.BoxGeometry(anchoPatio, 0.16, profDeck), mats.deck)
  deck.position.set(0, -0.08, zDeck)
  deck.receiveShadow = true
  padre.add(deck)
  const bordeDeck = new THREE.Mesh(new THREE.BoxGeometry(anchoPatio, 0.1, 0.3), mats.piedra)
  bordeDeck.position.set(0, -0.05, bordeCasa - 0.1)
  bordeDeck.receiveShadow = true
  padre.add(bordeDeck)

  /* ---------- pérgola sobre parte del deck ---------- */
  const anchoPergola = Math.min(anchoPatio * 0.7, 6.4)
  const fondoPergola = profDeck * 0.9
  const alturaPostes = 2.5
  const zPergola = zDeck
  ;[-1, 1].forEach((sx) => {
    ;[-1, 1].forEach((sz) => {
      cilindro(
        padre,
        0.09,
        0.09,
        alturaPostes,
        mats.maderaOscura,
        sx * (anchoPergola / 2 - 0.15),
        0,
        zPergola + (sz * fondoPergola) / 2,
        10,
      )
    })
  })
  ;[zPergola - fondoPergola / 2, zPergola + fondoPergola / 2].forEach((z) => {
    cajaRedondeada(padre, anchoPergola, 0.14, 0.14, 0.02, mats.maderaOscura, 0, alturaPostes, z)
  })
  const vigas = Math.max(6, Math.round(anchoPergola / 0.55))
  for (let i = 0; i < vigas; i++) {
    const x = -anchoPergola / 2 + (i * anchoPergola) / (vigas - 1)
    cajaRedondeada(padre, 0.09, 0.1, fondoPergola + 0.4, 0.02, mats.maderaOscura, x, alturaPostes + 0.12, zPergola)
  }

  /* ---------- comedor y sala exterior, a los lados del deck ---------- */
  construirComedor(padre, mats, -anchoPatio * 0.24, zDeck, anchoPatio * 0.4, profDeck * 0.85)
  const salaX = anchoPatio * 0.26
  cajaRedondeada(padre, 1.9, 0.34, 0.85, 0.07, mats.telaOscura, salaX, 0, zDeck - 0.05)
  cajaRedondeada(padre, 1.7, 0.16, 0.7, 0.09, mats.telaClara, salaX, 0.34, zDeck - 0.03)
  cajaRedondeada(padre, 1.7, 0.42, 0.2, 0.09, mats.telaClara, salaX, 0.34, zDeck - 0.4)
  cajaRedondeada(padre, 0.4, 0.14, 0.4, 0.07, mats.tealSuave, salaX - 0.55, 0.5, zDeck + 0.15)
  cajaRedondeada(padre, 0.4, 0.14, 0.4, 0.07, mats.terracota, salaX + 0.55, 0.5, zDeck + 0.15)
  cajaRedondeada(padre, 0.9, 0.3, 0.55, 0.03, mats.maderaOscura, salaX, 0, zDeck + 0.85)

  /* ---------- alberca con camastros ---------- */
  const anchoAlberca = Math.min(anchoPatio * 0.52, 5.6)
  const fondoAlberca = Math.min(profundidadPatio * 0.42, 3.6)
  const zAlberca = bordeCasa + profDeck + 0.7 + fondoAlberca / 2
  if (bordeLote - (zAlberca + fondoAlberca / 2) > 0.5) {
    const xAlberca = -anchoPatio * 0.1
    const borde = new THREE.Mesh(new THREE.BoxGeometry(anchoAlberca + 0.9, 0.16, fondoAlberca + 0.9), mats.piedra)
    borde.position.set(xAlberca, -0.13, zAlberca)
    borde.receiveShadow = true
    padre.add(borde)
    const vaso = new THREE.Mesh(new THREE.BoxGeometry(anchoAlberca, 0.58, fondoAlberca), mats.oscuro)
    vaso.position.set(xAlberca, -0.55, zAlberca)
    padre.add(vaso)
    const agua = new THREE.Mesh(new THREE.BoxGeometry(anchoAlberca - 0.18, 0.5, fondoAlberca - 0.18), mats.agua)
    agua.position.set(xAlberca, -0.25, zAlberca)
    agua.receiveShadow = true
    padre.add(agua)

    const xCamastros = xAlberca + anchoAlberca / 2 + 0.9
    for (let i = 0; i < 2; i++) {
      const z = zAlberca - fondoAlberca / 4 + i * (fondoAlberca / 2)
      const c = new THREE.Group()
      c.position.set(xCamastros, 0, z)
      padre.add(c)
      cajaRedondeada(c, 1.9, 0.12, 0.6, 0.05, mats.lino, 0, 0, 0)
      cajaRedondeada(c, 0.55, 0.12, 0.58, 0.05, mats.lino, -0.72, 0.16, 0)
      ;[-0.8, 0.8].forEach((ox) => {
        cilindro(c, 0.035, 0.035, 0.22, mats.acero, ox, 0, 0.22, 8)
        cilindro(c, 0.035, 0.035, 0.22, mats.acero, ox, 0, -0.22, 8)
      })
    }
  }

  /* ---------- asador ---------- */
  const xAsador = anchoPatio / 2 + 0.6
  if (xAsador + 0.8 < anchoLote / 2) {
    cajaRedondeada(padre, 1.4, 0.9, 0.6, 0.05, mats.piedra, xAsador, 0, bordeCasa + 0.5)
    cajaRedondeada(padre, 1.46, 0.06, 0.66, 0.02, mats.acero, xAsador, 0.96, bordeCasa + 0.5)
    cajaRedondeada(padre, 0.85, 0.46, 0.46, 0.03, mats.oscuro, xAsador, 1.02, bordeCasa + 0.5)
  }

  /* ---------- juegos infantiles ---------- */
  const zJuegos = bordeLote - profundidadPatio * 0.22
  const xJuegos = anchoPatio * 0.32
  if (zJuegos - bordeCasa > profDeck + 1.5 && xJuegos + 1.6 < anchoLote / 2) {
    cajaRedondeada(padre, 1.6, 1.0, 1.6, 0.05, mats.terracota, xJuegos, 0, zJuegos)
    cajaRedondeada(padre, 1.9, 0.1, 1.9, 0.03, mats.madera, xJuegos, 1.0, zJuegos)
    const postesX = [xJuegos - 0.75, xJuegos + 0.75]
    postesX.forEach((x) => cilindro(padre, 0.06, 0.06, 2.1, mats.maderaOscura, x, 0, zJuegos + 1.4, 8))
    cajaRedondeada(padre, 1.7, 0.12, 0.12, 0.03, mats.acero, xJuegos, 2.05, zJuegos + 1.4)
    ;[xJuegos - 0.35, xJuegos + 0.35].forEach((x) => {
      cilindro(padre, 0.015, 0.015, 0.9, mats.oscuro, x, 1.05, zJuegos + 1.4, 6)
      cajaRedondeada(padre, 0.4, 0.06, 0.22, 0.03, mats.terracota, x, 1.0, zJuegos + 1.4)
    })
  }

  /* ---------- bardas perimetrales ---------- */
  const alturaBarda = 0.6
  const grosorBarda = 0.18
  const bardas: [number, number, number, number][] = [
    [0, fondoLote / 2 - grosorBarda / 2, anchoLote, grosorBarda],
    [-anchoLote / 2 + grosorBarda / 2, bordeCasa + profundidadPatio / 2, grosorBarda, profundidadPatio],
    [anchoLote / 2 - grosorBarda / 2, bordeCasa + profundidadPatio / 2, grosorBarda, profundidadPatio],
  ]
  bardas.forEach(([x, z, w, d]) => {
    const barda = new THREE.Mesh(new THREE.BoxGeometry(w, alturaBarda, d), mats.piedra)
    barda.position.set(x, alturaBarda / 2, z)
    barda.castShadow = true
    barda.receiveShadow = true
    padre.add(barda)
  })

  /* ---------- jardín: pasto de fondo + árboles ---------- */
  const pasto = new THREE.Mesh(new THREE.PlaneGeometry(anchoLote, fondoLote), mats.pasto)
  pasto.rotation.x = -Math.PI / 2
  pasto.position.set(0, -0.02, (bordeCasa + bordeLote) / 2)
  pasto.receiveShadow = true
  padre.add(pasto)

  const areaJardin = anchoLote * profundidadPatio
  const numArboles = Math.max(2, Math.min(8, Math.round(areaJardin / 35)))
  for (let i = 0; i < numArboles; i++) {
    const t = numArboles > 1 ? i / (numArboles - 1) : 0.5
    const ladoIzq = i % 2 === 0
    const x = ladoIzq ? -anchoLote / 2 + 0.9 : anchoLote / 2 - 0.9
    const z = bordeCasa + 0.9 + t * (profundidadPatio - 1.8)
    construirArbol(padre, mats, x, z, 0.75 + Math.random() * 0.4)
  }
  esferaIrregular(padre, 0.4, mats.follajeClaro, -anchoPatio * 0.44, 0.34, zDeck + profDeck * 0.6)

  /* ---------- cochera con auto, al frente ---------- */
  const zCochera = -bordeCasa - Math.max((lote.fondoTerreno - lote.fondoConstruccion) / 2, 2) * 0.6
  const xCochera = lote.anchoConstruccion / 2 + 1.6
  if (xCochera + 1.6 < anchoLote / 2 && zCochera - 2.2 > -bordeLote) {
    const piso = new THREE.Mesh(new THREE.BoxGeometry(4.6, 0.12, 4.2), mats.piedra)
    piso.position.set(xCochera, -0.06, zCochera)
    piso.receiveShadow = true
    padre.add(piso)
    ;[-1.9, 1.9].forEach((oz) => {
      ;[-1.9, 1.9].forEach((ox) => {
        cilindro(padre, 0.08, 0.08, 2.3, mats.oscuro, xCochera + ox, 0, zCochera + oz, 8)
      })
    })
    cajaRedondeada(padre, 4.4, 0.14, 4.4, 0.03, mats.madera, xCochera, 2.3, zCochera)

    const auto = new THREE.Group()
    auto.position.set(xCochera, 0, zCochera)
    padre.add(auto)
    cajaRedondeada(auto, 4.3, 0.62, 1.86, 0.24, mats.metalOscuro, 0, 0.32, 0)
    cajaRedondeada(auto, 2.5, 0.5, 1.7, 0.3, mats.metalOscuro, -0.15, 0.9, 0)
    ;[
      [1.42, 0.78],
      [1.42, -0.78],
      [-1.42, 0.78],
      [-1.42, -0.78],
    ].forEach(([px, pz]) => {
      const llanta = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.32, 0.22, 16), mats.oscuro)
      llanta.rotation.z = Math.PI / 2
      llanta.position.set(px, 0.32, pz)
      llanta.castShadow = true
      auto.add(llanta)
    })
  }
}
