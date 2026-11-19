import * as THREE from 'three'

/* =================================================================== */
/*  PRIMITIVAS + MOBILIARIO PARAMÉTRICO                                 */
/*                                                                       */
/*  `rbGeo` extruye una caja con esquinas redondeadas (en vez del        */
/*  BoxGeometry recto de antes) — es lo que hace que sofás, camas y      */
/*  sillas se lean como mueble y no como bloques apilados. El resto de   */
/*  este archivo son funciones que arman una pieza completa (sofá, cama, */
/*  silla, planta, árbol) a partir de un tamaño y una posición, para que */
/*  el visor las coloque según el cuarto real en vez de traerlas fijas.  */
/* =================================================================== */

export interface MaterialesMobiliario {
  madera: THREE.Material
  maderaOscura: THREE.Material
  telaOscura: THREE.Material
  telaClara: THREE.Material
  lino: THREE.Material
  acero: THREE.Material
  terracota: THREE.Material
  follaje: THREE.Material
  follajeClaro: THREE.Material
  corteza: THREE.Material
  tealSuave: THREE.Material
  porcelana: THREE.Material
}

/** Caja con las cuatro esquinas verticales redondeadas, vía un perfil extruido con bisel. */
export function rbGeo(w: number, h: number, d: number, r: number): THREE.ExtrudeGeometry {
  const radio = Math.max(0.01, Math.min(r, w / 2 - 0.01, d / 2 - 0.01, h / 2 - 0.01))
  const x = w / 2 - radio
  const z = d / 2 - radio
  const forma = new THREE.Shape()
  forma.moveTo(-x, -z - radio)
  forma.lineTo(x, -z - radio)
  forma.absarc(x, -z, radio, -Math.PI / 2, 0, false)
  forma.lineTo(x + radio, z)
  forma.absarc(x, z, radio, 0, Math.PI / 2, false)
  forma.lineTo(-x, z + radio)
  forma.absarc(-x, z, radio, Math.PI / 2, Math.PI, false)
  forma.lineTo(-x - radio, -z)
  forma.absarc(-x, -z, radio, Math.PI, Math.PI * 1.5, false)
  const geo = new THREE.ExtrudeGeometry(forma, {
    depth: h - 2 * radio,
    bevelEnabled: true,
    bevelSize: radio,
    bevelThickness: radio,
    bevelSegments: 3,
    curveSegments: 6,
    steps: 1,
  })
  geo.rotateX(-Math.PI / 2)
  geo.translate(0, radio, 0)
  geo.computeVertexNormals()
  return geo
}

function conSombra<T extends THREE.Object3D>(objeto: T): T {
  if (objeto instanceof THREE.Mesh) {
    objeto.castShadow = true
    objeto.receiveShadow = true
  }
  return objeto
}

/** Caja de esquinas redondeadas ya colocada en el grupo, `y` es la base (no el centro). */
export function cajaRedondeada(
  grupo: THREE.Group,
  w: number,
  h: number,
  d: number,
  r: number,
  mat: THREE.Material,
  x: number,
  y: number,
  z: number,
): THREE.Mesh {
  const mesh = new THREE.Mesh(rbGeo(w, h, d, r), mat)
  mesh.position.set(x, y, z)
  grupo.add(conSombra(mesh))
  return mesh
}

export function cilindro(
  grupo: THREE.Group,
  r1: number,
  r2: number,
  h: number,
  mat: THREE.Material,
  x: number,
  y: number,
  z: number,
  segmentos = 14,
): THREE.Mesh {
  const mesh = new THREE.Mesh(new THREE.CylinderGeometry(r1, r2, h, segmentos), mat)
  mesh.position.set(x, y + h / 2, z)
  grupo.add(conSombra(mesh))
  return mesh
}

/** Esfera con vértices ligeramente aleatorios y achatada en Y — follaje de plantas y árboles. */
export function esferaIrregular(
  grupo: THREE.Group,
  radio: number,
  mat: THREE.Material,
  x: number,
  y: number,
  z: number,
  achatado = 0.88,
): THREE.Mesh {
  const mesh = new THREE.Mesh(new THREE.IcosahedronGeometry(radio, 2), mat)
  const pos = mesh.geometry.attributes.position
  for (let i = 0; i < pos.count; i++) {
    const f = 1 + (Math.random() - 0.5) * 0.16
    pos.setXYZ(i, pos.getX(i) * f, pos.getY(i) * f * achatado, pos.getZ(i) * f)
  }
  mesh.geometry.computeVertexNormals()
  mesh.position.set(x, y, z)
  grupo.add(conSombra(mesh))
  return mesh
}

/* ---------- piezas ---------- */

/** Sofá de tres cuerpos (asiento, respaldo, brazos) + cojines — `ancho` es el único parámetro de tamaño. */
export function construirSofa(
  padre: THREE.Group,
  mats: MaterialesMobiliario,
  x: number,
  z: number,
  ancho: number,
  rot = 0,
): THREE.Group {
  const g = new THREE.Group()
  g.position.set(x, 0, z)
  g.rotation.y = rot
  padre.add(g)

  cajaRedondeada(g, ancho, 0.34, 0.92, 0.07, mats.telaOscura, 0, 0, 0)
  cajaRedondeada(g, ancho - 0.34, 0.22, 0.78, 0.09, mats.telaClara, 0, 0.34, 0.02)
  cajaRedondeada(g, ancho, 0.52, 0.24, 0.09, mats.telaOscura, 0, 0.34, -0.36)
  cajaRedondeada(g, 0.22, 0.42, 0.92, 0.08, mats.telaOscura, -ancho / 2 + 0.11, 0.34, 0)
  cajaRedondeada(g, 0.22, 0.42, 0.92, 0.08, mats.telaOscura, ancho / 2 - 0.11, 0.34, 0)

  const cojines = Math.max(2, Math.round(ancho / 0.9))
  for (let i = 0; i < cojines; i++) {
    const t = cojines > 1 ? i / (cojines - 1) : 0.5
    cajaRedondeada(g, 0.42, 0.14, 0.42, 0.07, mats.lino, -ancho / 2 + 0.42 + t * (ancho - 0.84), 0.56, -0.24)
  }
  return g
}

/** Cama con buró y lámpara a cada lado — `ancho` define matrimonial vs individual. */
export function construirCama(
  padre: THREE.Group,
  mats: MaterialesMobiliario,
  x: number,
  z: number,
  ancho: number,
  rot = 0,
): THREE.Group {
  const g = new THREE.Group()
  g.position.set(x, 0, z)
  g.rotation.y = rot
  padre.add(g)

  cajaRedondeada(g, ancho, 0.28, 2.0, 0.04, mats.maderaOscura, 0, 0, 0)
  cajaRedondeada(g, ancho - 0.12, 0.26, 1.94, 0.09, mats.lino, 0, 0.28, 0)
  cajaRedondeada(g, ancho - 0.06, 0.14, 1.32, 0.1, mats.tealSuave, 0, 0.5, 0.3)
  cajaRedondeada(g, ancho + 0.16, 0.68, 0.12, 0.05, mats.madera, 0, 0.28, -1.04)

  const anchoAlmohada = (ancho - 0.3) / 2
  cajaRedondeada(g, anchoAlmohada, 0.13, 0.42, 0.09, mats.lino, -ancho / 4, 0.52, -0.72)
  cajaRedondeada(g, anchoAlmohada, 0.13, 0.42, 0.09, mats.lino, ancho / 4, 0.52, -0.72)

  ;[-1, 1].forEach((s) => {
    cajaRedondeada(g, 0.46, 0.5, 0.42, 0.03, mats.madera, s * (ancho / 2 + 0.36), 0, -0.8)
    cilindro(g, 0.05, 0.05, 0.3, mats.acero, s * (ancho / 2 + 0.36), 0.5, -0.8)
    cilindro(g, 0.13, 0.16, 0.18, mats.lino, s * (ancho / 2 + 0.36), 0.78, -0.8, 12)
  })
  return g
}

/** Silla de cuatro patas — la unidad que rodea mesas de comedor generadas por construirComedor. */
export function construirSilla(padre: THREE.Group, mats: MaterialesMobiliario, x: number, z: number, rot = 0): THREE.Group {
  const c = new THREE.Group()
  c.position.set(x, 0, z)
  c.rotation.y = rot
  padre.add(c)

  cajaRedondeada(c, 0.44, 0.06, 0.44, 0.03, mats.maderaOscura, 0, 0.44, 0)
  cajaRedondeada(c, 0.42, 0.5, 0.07, 0.03, mats.maderaOscura, 0, 0.5, -0.19)
  ;[
    [-0.18, -0.18],
    [0.18, -0.18],
    [-0.18, 0.18],
    [0.18, 0.18],
  ].forEach(([px, pz]) => {
    cilindro(c, 0.022, 0.022, 0.44, mats.maderaOscura, px, 0, pz, 8)
  })
  return c
}

/** Mesa de comedor con sillas alrededor, dimensionada a la zona real que le tocó en la plantilla. */
export function construirComedor(
  padre: THREE.Group,
  mats: MaterialesMobiliario,
  x: number,
  z: number,
  anchoZona: number,
  fondoZona: number,
  rot = 0,
): THREE.Group {
  const g = new THREE.Group()
  g.position.set(x, 0, z)
  g.rotation.y = rot
  padre.add(g)

  const anchoMesa = Math.max(1.1, Math.min(anchoZona * 0.68, 2.4))
  const fondoMesa = Math.max(0.75, Math.min(fondoZona * 0.55, 1.1))

  cajaRedondeada(g, anchoMesa, 0.07, fondoMesa, 0.03, mats.madera, 0, 0.72, 0)
  ;[-1, 1].forEach((sx) =>
    [-1, 1].forEach((sz) => {
      cilindro(g, 0.045, 0.045, 0.72, mats.maderaOscura, sx * (anchoMesa / 2 - 0.14), 0, sz * (fondoMesa / 2 - 0.1))
    }),
  )
  cilindro(g, 0.09, 0.06, 0.2, mats.porcelana, 0, 0.79, 0, 12)

  construirSilla(g, mats, -anchoMesa / 4, -(fondoMesa / 2 + 0.35), 0)
  construirSilla(g, mats, anchoMesa / 4, -(fondoMesa / 2 + 0.35), 0)
  construirSilla(g, mats, -anchoMesa / 4, fondoMesa / 2 + 0.35, Math.PI)
  construirSilla(g, mats, anchoMesa / 4, fondoMesa / 2 + 0.35, Math.PI)
  if (anchoMesa > 1.6) {
    construirSilla(g, mats, -(anchoMesa / 2 + 0.35), 0, Math.PI / 2)
    construirSilla(g, mats, anchoMesa / 2 + 0.35, 0, -Math.PI / 2)
  }
  return g
}

/** Planta de interior en maceta — follaje hecho de esferas irregulares apiladas. */
export function construirPlanta(padre: THREE.Group, mats: MaterialesMobiliario, x: number, z: number, escala = 1): THREE.Group {
  const p = new THREE.Group()
  p.position.set(x, 0, z)
  p.scale.setScalar(escala)
  padre.add(p)

  cilindro(p, 0.2, 0.16, 0.34, mats.terracota, 0, 0, 0, 14)
  esferaIrregular(p, 0.34, mats.follaje, 0, 0.6, 0)
  esferaIrregular(p, 0.24, mats.follajeClaro, 0.16, 0.86, 0.08)
  esferaIrregular(p, 0.2, mats.follajeClaro, -0.18, 0.8, -0.1)
  return p
}

/** Árbol de jardín — tronco + copa de varias esferas irregulares, para el exterior. */
export function construirArbol(padre: THREE.Group, mats: MaterialesMobiliario, x: number, z: number, escala = 1): THREE.Group {
  const t = new THREE.Group()
  t.position.set(x, 0, z)
  t.scale.setScalar(escala)
  padre.add(t)

  cilindro(t, 0.14, 0.2, 1.7, mats.corteza, 0, 0, 0, 10)
  esferaIrregular(t, 1.0, mats.follaje, 0, 2.4, 0)
  esferaIrregular(t, 0.72, mats.follajeClaro, 0.7, 2.0, 0.3)
  esferaIrregular(t, 0.66, mats.follajeClaro, -0.6, 2.1, -0.35)
  esferaIrregular(t, 0.6, mats.follaje, 0.15, 3.0, -0.2)
  return t
}
