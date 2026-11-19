import { fotosPropiedades } from '../assets/img/propiedades'
import { COLONIA_BASE } from './coloniasCoordenadas'
import { validarFotosPropiedades } from './validarFotosPropiedades'
import {
  listadoPreventa,
  listadoRenta,
  listadoVenta,
  type Propiedad,
  type PropiedadPreventa,
} from '../types/propiedad'

// ---------------------------------------------------------------------------
// Listados 1–9: datos reales tomados del portal del cliente (precio, moneda,
// operación, atributos y ubicación exactos). Dirección de calle, plazos,
// depósitos, esquema de pagos se completaron con valores razonables para
// la demo — no venían en la lista original. Coordenadas aproximadas por
// colonia, con una variación chica a mano para que no queden todos los
// pines encimados. Fotos: no venía ninguna en la lista original y no hay
// foto real de sobra para prestarles sin que quede de otro tipo de
// inmueble, así que `medios` queda vacío — ResultCard, PropertyCard y
// Galeria caen a PlaceholderPropiedad (ícono por tipo + folio) en vez de
// mostrar una fotografía que no les corresponde.
//
// `detalles` (piso, año de construcción, mantenimiento, condición,
// disposición, estacionamientos, fecha de publicación) y `codigoPostal`
// tampoco venían en la lista original: son valores demo razonables para
// que la ficha de propiedad no se vea vacía, marcados como tal aquí.
//
// Listados 10–11: DEMO, inventados para que la sección de preventa no se
// vea vacía (en la lista real solo hay una preventa, el #9). Desarrollador
// y datos de obra son ficticios.
// ---------------------------------------------------------------------------

const localAnzures: Propiedad = {
  folio: '3R-101',
  estado: 'disponible',
  tipo: 'local-comercial',
  banos: 1,
  m2Construccion: 120,
  medios: [],
  descripcion: 'Local en planta baja con acceso directo a calle, ideal para showroom u oficina de atención al público.',
  ubicacion: {
    colonia: 'Lomas de Chapultepec I Sección',
    alcaldia: 'Miguel Hidalgo',
    ciudad: 'Ciudad de México',
    codigoPostal: '11000',
    direccion: 'Paseo de las Palmas 1245',
  },
  coordenadas: { lat: COLONIA_BASE['lomas de chapultepec'].lat + 0.0015, lng: COLONIA_BASE['lomas de chapultepec'].lng + 0.001 },
  detalles: {
    fechaPublicacion: '2026-06-20',
    estacionamientos: 2,
    anoConstruccion: 2015,
    condicion: 'usado',
    disposicion: 'esquina',
  },
  listados: [
    listadoRenta({
      precio: { monto: 175_000, moneda: 'MXN' },
      plazoMinimoMeses: 12,
      amueblado: false,
      incluyeMantenimiento: true,
      deposito: { monto: 175_000, moneda: 'MXN' },
    }),
  ],
}

// Fuera de las colonias con tabla de coordenadas: Álvaro Obregón, valor
// aproximado a mano.
const terrenoPinoSuarez: Propiedad = {
  folio: '3R-102',
  estado: 'disponible',
  tipo: 'terreno',
  m2Terreno: 4_979,
  medios: [
    { tipo: 'fotografia', url: fotosPropiedades.terrenoAlvaroObregon4979, alt: 'Terreno en José María Pino Suárez, Álvaro Obregón' },
  ],
  descripcion: 'Terreno plano en zona residencial consolidada, apto para desarrollo unifamiliar o de baja densidad.',
  ubicacion: {
    colonia: 'José María Pino Suárez',
    alcaldia: 'Álvaro Obregón',
    ciudad: 'Ciudad de México',
    codigoPostal: '01030',
    direccion: 'José María Pino Suárez 88',
  },
  coordenadas: { lat: 19.3805, lng: -99.201 },
  detalles: { fechaPublicacion: '2026-05-15' },
  listados: [listadoVenta({ precio: { monto: 210_000_000, moneda: 'MXN' }, escriturado: true, creditosAceptados: [] })],
}

const deptoPolancoIIIUsd: Propiedad = {
  folio: '3R-103',
  estado: 'disponible',
  tipo: 'departamento',
  recamaras: 3,
  banos: 3,
  m2Construccion: 183,
  medios: [
    { tipo: 'fotografia', url: fotosPropiedades.deptoPolancoThTerraza183, alt: 'Sala de departamento en Polanco III Sección' },
    { tipo: 'fotografia', url: fotosPropiedades.deptoPolancoThTerraza183B, alt: 'Terraza de departamento en Polanco III Sección' },
  ],
  descripcion: 'Departamento con acabados de lujo y vista despejada, a pasos de Av. Presidente Masaryk.',
  ubicacion: {
    colonia: 'Polanco III Sección',
    alcaldia: 'Miguel Hidalgo',
    ciudad: 'Ciudad de México',
    codigoPostal: '11560',
    direccion: 'Calle Oscar Wilde 130',
  },
  coordenadas: { lat: COLONIA_BASE.polanco.lat - 0.0008, lng: COLONIA_BASE.polanco.lng + 0.0008 },
  detalles: {
    fechaPublicacion: '2026-07-01',
    estacionamientos: 2,
    piso: 8,
    anoConstruccion: 2018,
    mantenimiento: { monto: 8_500, moneda: 'MXN' },
    condicion: 'usado',
    disposicion: 'norte',
  },
  listados: [listadoVenta({ precio: { monto: 1_172_000, moneda: 'USD' }, escriturado: true, creditosAceptados: [] })],
}

const deptoLomasV: Propiedad = {
  folio: '3R-104',
  estado: 'apartada',
  tipo: 'departamento',
  recamaras: 3,
  banos: 3,
  m2Construccion: 400,
  medios: [
    { tipo: 'fotografia', url: fotosPropiedades.phLomasTerraza400, alt: 'Terraza con vista a la ciudad en Lomas de Chapultepec V Sección' },
  ],
  descripcion: 'Departamento de gran formato con doble altura en sala y terraza privada.',
  ubicacion: {
    colonia: 'Lomas de Chapultepec V Sección',
    alcaldia: 'Miguel Hidalgo',
    ciudad: 'Ciudad de México',
    codigoPostal: '11000',
    direccion: 'Sierra Amatepec 220',
  },
  coordenadas: { lat: COLONIA_BASE['lomas de chapultepec'].lat - 0.001, lng: COLONIA_BASE['lomas de chapultepec'].lng - 0.0012 },
  detalles: {
    fechaPublicacion: '2026-06-10',
    estacionamientos: 3,
    piso: 2,
    anoConstruccion: 2012,
    mantenimiento: { monto: 12_000, moneda: 'MXN' },
    condicion: 'usado',
    disposicion: 'sur',
  },
  listados: [listadoVenta({ precio: { monto: 19_000_000, moneda: 'MXN' }, escriturado: true, creditosAceptados: ['bancario'] })],
}

const deptoPolancoIII: Propiedad = {
  folio: '3R-105',
  estado: 'disponible',
  tipo: 'departamento',
  recamaras: 2,
  banos: 2,
  m2Construccion: 176,
  medios: [],
  descripcion: 'Departamento de dos recámaras con estudio, en uno de los edificios mejor ubicados de Polanco III.',
  ubicacion: {
    colonia: 'Polanco III Sección',
    alcaldia: 'Miguel Hidalgo',
    ciudad: 'Ciudad de México',
    codigoPostal: '11560',
    direccion: 'Calle Homero 1350',
  },
  coordenadas: { lat: COLONIA_BASE.polanco.lat + 0.0012, lng: COLONIA_BASE.polanco.lng + 0.0004 },
  detalles: {
    fechaPublicacion: '2026-07-10',
    estacionamientos: 2,
    piso: 5,
    anoConstruccion: 2016,
    mantenimiento: { monto: 7_200, moneda: 'MXN' },
    condicion: 'usado',
    disposicion: 'oriente',
  },
  listados: [
    listadoVenta({ precio: { monto: 22_792_000, moneda: 'MXN' }, escriturado: true, creditosAceptados: ['bancario', 'cofinavit'] }),
  ],
}

const deptoPolancoV: Propiedad = {
  folio: '3R-106',
  estado: 'vendida',
  tipo: 'departamento',
  recamaras: 2,
  banos: 2,
  m2Construccion: 161,
  medios: [],
  descripcion: 'Departamento seminuevo con balcón y dos cajones de estacionamiento techados.',
  ubicacion: {
    colonia: 'Polanco V Sección',
    alcaldia: 'Miguel Hidalgo',
    ciudad: 'Ciudad de México',
    codigoPostal: '11560',
    direccion: 'Calle Temístocles 210',
  },
  coordenadas: { lat: COLONIA_BASE.polanco.lat - 0.0005, lng: COLONIA_BASE.polanco.lng - 0.0013 },
  detalles: {
    fechaPublicacion: '2026-06-28',
    estacionamientos: 2,
    piso: 4,
    anoConstruccion: 2019,
    mantenimiento: { monto: 6_800, moneda: 'MXN' },
    condicion: 'usado',
    disposicion: 'poniente',
  },
  listados: [listadoVenta({ precio: { monto: 19_900_000, moneda: 'MXN' }, escriturado: true, creditosAceptados: ['bancario'] })],
}

const deptoPolancoIVRenta: Propiedad = {
  folio: '3R-107',
  estado: 'disponible',
  tipo: 'departamento',
  recamaras: 3,
  banos: 2,
  m2Construccion: 200,
  medios: [
    { tipo: 'fotografia', url: fotosPropiedades.deptoPolancoRentaParquet200, alt: 'Departamento en renta en Polanco IV Sección con parquet' },
  ],
  descripcion: 'Departamento amueblable de tres recámaras, edificio con seguridad 24 horas.',
  ubicacion: {
    colonia: 'Polanco IV Sección',
    alcaldia: 'Miguel Hidalgo',
    ciudad: 'Ciudad de México',
    codigoPostal: '11560',
    direccion: 'Calle Musset 88',
  },
  coordenadas: { lat: COLONIA_BASE.polanco.lat - 0.0016, lng: COLONIA_BASE.polanco.lng + 0.0015 },
  detalles: {
    fechaPublicacion: '2026-07-15',
    estacionamientos: 2,
    piso: 6,
    anoConstruccion: 2017,
    mantenimiento: { monto: 5_000, moneda: 'MXN' },
    condicion: 'usado',
    disposicion: 'norte',
  },
  listados: [
    listadoRenta({
      precio: { monto: 100_000, moneda: 'MXN' },
      plazoMinimoMeses: 12,
      amueblado: false,
      incluyeMantenimiento: true,
      deposito: { monto: 100_000, moneda: 'MXN' },
    }),
  ],
}

const oficinaAnzures: Propiedad = {
  folio: '3R-108',
  estado: 'disponible',
  tipo: 'oficina',
  banos: 3,
  m2Construccion: 200,
  medios: [
    { tipo: 'fotografia', url: fotosPropiedades.oficinaPolancoRenta200, alt: 'Interior de oficina con salas de junta acristaladas' },
  ],
  descripcion: 'Piso corporativo de planta libre, con estacionamiento y recepción compartida.',
  ubicacion: {
    colonia: 'Anzures',
    alcaldia: 'Miguel Hidalgo',
    ciudad: 'Ciudad de México',
    codigoPostal: '11590',
    direccion: 'Av. Ejército Nacional 505',
  },
  coordenadas: { lat: COLONIA_BASE.anzures.lat - 0.0004, lng: COLONIA_BASE.anzures.lng + 0.0013 },
  detalles: {
    fechaPublicacion: '2026-06-05',
    estacionamientos: 6,
    piso: 3,
    anoConstruccion: 2014,
    mantenimiento: { monto: 18_000, moneda: 'MXN' },
    condicion: 'usado',
  },
  listados: [
    listadoRenta({
      precio: { monto: 235_950, moneda: 'MXN' },
      plazoMinimoMeses: 24,
      amueblado: false,
      incluyeMantenimiento: true,
      deposito: { monto: 235_950, moneda: 'MXN' },
    }),
  ],
}

const preventaPolancoII: PropiedadPreventa = {
  folio: '3R-109',
  estado: 'disponible',
  tipo: 'departamento',
  recamaras: 3,
  banos: 3,
  m2Construccion: 271,
  medios: [],
  descripcion: 'Torre boutique en preventa, unidades de tres recámaras con roof garden compartido.',
  ubicacion: {
    colonia: 'Polanco II Sección',
    alcaldia: 'Miguel Hidalgo',
    ciudad: 'Ciudad de México',
    codigoPostal: '11560',
    referencia: 'A dos cuadras de Av. Presidente Masaryk',
  },
  coordenadas: { lat: COLONIA_BASE.polanco.lat + 0.0014, lng: COLONIA_BASE.polanco.lng - 0.002 },
  detalles: { fechaPublicacion: '2026-04-20', estacionamientos: 2, piso: 9, condicion: 'nuevo' },
  listados: [
    listadoPreventa({
      precio: { monto: 27_300_000, moneda: 'MXN' },
      desarrollador: 'Grupo Constructor 3R Desarrollos',
      fechaEntregaEstimada: '2028-03',
      avanceObra: 20,
      esquemaPagos: '30% enganche durante obra, 70% contra entrega',
      unidadesDisponibles: 9,
      unidadesTotales: 22,
    }),
  ],
}

// --- DEMO: no forman parte de la lista real del cliente ---------------------

// Fuera de las colonias con tabla de coordenadas: Bosques de las Lomas,
// valor aproximado a mano.
const preventaBosquesDemo: PropiedadPreventa = {
  folio: '3R-DEMO-01',
  estado: 'disponible',
  tipo: 'penthouse',
  recamaras: 3,
  banos: 4,
  m2Construccion: 320,
  medios: [{ tipo: 'recorrido-360', url: '/media/3r-demo-01-360.json', alt: 'Recorrido 360 del penthouse modelo' }],
  descripcion: 'Penthouse con terraza privada y doble altura, último nivel de torre en preventa.',
  ubicacion: {
    colonia: 'Bosques de las Lomas',
    alcaldia: 'Cuajimalpa de Morelos',
    ciudad: 'Ciudad de México',
    codigoPostal: '11700',
    referencia: 'Frente a Bosque de Duraznos',
  },
  coordenadas: { lat: 19.386, lng: -99.254 },
  detalles: { fechaPublicacion: '2026-03-15', estacionamientos: 3, piso: 14, condicion: 'nuevo' },
  listados: [
    listadoPreventa({
      precio: { monto: 34_500_000, moneda: 'MXN' },
      desarrollador: 'Desarrollos AltaVista (demo)',
      fechaEntregaEstimada: '2027-11',
      avanceObra: 35,
      esquemaPagos: '20% enganche, 80% mensualidades durante obra',
      unidadesDisponibles: 4,
      unidadesTotales: 12,
    }),
  ],
}

const preventaNuevoPolancoDemo: PropiedadPreventa = {
  folio: '3R-DEMO-02',
  estado: 'disponible',
  tipo: 'departamento',
  recamaras: 2,
  banos: 2,
  m2Construccion: 140,
  medios: [],
  descripcion: 'Torre de uso mixto con amenidades compartidas, entrega por etapas.',
  ubicacion: {
    colonia: 'Nuevo Polanco',
    alcaldia: 'Miguel Hidalgo',
    ciudad: 'Ciudad de México',
    codigoPostal: '11520',
    referencia: 'A cinco minutos del Museo Soumaya',
  },
  coordenadas: { lat: COLONIA_BASE['nuevo polanco'].lat + 0.0008, lng: COLONIA_BASE['nuevo polanco'].lng - 0.0015 },
  detalles: { fechaPublicacion: '2026-02-10', estacionamientos: 2, piso: 6, condicion: 'nuevo' },
  listados: [
    listadoPreventa({
      precio: { monto: 12_800_000, moneda: 'MXN' },
      desarrollador: 'Grupo Inmobiliario Cumbre (demo)',
      fechaEntregaEstimada: '2027-06',
      avanceObra: 45,
      esquemaPagos: '25% enganche, 75% contra entrega',
      unidadesDisponibles: 15,
      unidadesTotales: 60,
    }),
  ],
}

// --- Fotos reales (con marca de agua oficial de 3R Connect) ----------------
// Precio, dirección exacta, desarrollador y datos de obra no venían en la
// lista de fotos entregada: se completaron con valores razonables para la
// demo, igual que el resto del archivo, hasta que lleguen los datos reales.

const preventaPolanco213: PropiedadPreventa = {
  folio: '3R-110',
  estado: 'disponible',
  tipo: 'departamento',
  recamaras: 3,
  banos: 3.5,
  m2Construccion: 213.79,
  medios: [
    { tipo: 'fotografia', url: fotosPropiedades.preventaPolanco213, alt: 'Fachada de torre en preventa en Polanco' },
    { tipo: 'fotografia', url: fotosPropiedades.roofgardenCondominio, alt: 'Roof garden del condominio en preventa' },
  ],
  descripcion: 'Unidad en preventa con bodega y balcón, en torre boutique ya en obra en Polanco.',
  ubicacion: {
    colonia: 'Polanco',
    alcaldia: 'Miguel Hidalgo',
    ciudad: 'Ciudad de México',
    codigoPostal: '11560',
    referencia: 'A unas cuadras de Av. Presidente Masaryk',
  },
  coordenadas: { lat: COLONIA_BASE.polanco.lat + 0.0003, lng: COLONIA_BASE.polanco.lng - 0.0003 },
  detalles: { fechaPublicacion: '2026-07-20', estacionamientos: 2, piso: 7, condicion: 'nuevo', disposicion: 'norte' },
  listados: [
    listadoPreventa({
      precio: { monto: 15_800_000, moneda: 'MXN' },
      desarrollador: 'Grupo Constructor 3R Desarrollos',
      fechaEntregaEstimada: '2027-09',
      avanceObra: 40,
      esquemaPagos: '30% enganche durante obra, 70% contra entrega',
      unidadesDisponibles: 6,
      unidadesTotales: 18,
    }),
  ],
}

// Caso real de doble listado: la misma unidad se ofrece en venta y en
// renta al mismo tiempo — el motivo por el que `listados` es un arreglo.
const phPolancoVenta542: Propiedad = {
  folio: '3R-111',
  estado: 'apartada',
  tipo: 'penthouse',
  recamaras: 4,
  banos: 4.5,
  m2Construccion: 542,
  medios: [
    { tipo: 'fotografia', url: fotosPropiedades.phPolancoVenta542, alt: 'Penthouse en venta en Polanco con terraza' },
  ],
  descripcion: 'Penthouse de gran formato con terraza propia, en uno de los edificios más consolidados de Polanco.',
  ubicacion: {
    colonia: 'Polanco',
    alcaldia: 'Miguel Hidalgo',
    ciudad: 'Ciudad de México',
    codigoPostal: '11560',
    direccion: 'Calle Arquímedes 320',
  },
  coordenadas: { lat: COLONIA_BASE.polanco.lat - 0.0002, lng: COLONIA_BASE.polanco.lng + 0.0018 },
  detalles: {
    fechaPublicacion: '2026-07-25',
    estacionamientos: 4,
    piso: 16,
    anoConstruccion: 2020,
    mantenimiento: { monto: 22_000, moneda: 'MXN' },
    condicion: 'usado',
    disposicion: 'esquina',
  },
  listados: [
    listadoVenta({ precio: { monto: 65_000_000, moneda: 'MXN' }, escriturado: true, creditosAceptados: [] }),
    listadoRenta({
      precio: { monto: 380_000, moneda: 'MXN' },
      plazoMinimoMeses: 12,
      amueblado: true,
      incluyeMantenimiento: true,
      deposito: { monto: 380_000, moneda: 'MXN' },
    }),
  ],
}

const phPolancoIIVenta525: Propiedad = {
  folio: '3R-112',
  estado: 'disponible',
  tipo: 'penthouse',
  recamaras: 8,
  banos: 8,
  m2Construccion: 525,
  medios: [
    {
      tipo: 'fotografia',
      url: fotosPropiedades.phPolancoIIVenta525,
      alt: 'Penthouse en venta en Polanco II Sección con terrazas y balcones',
    },
    { tipo: 'video', url: `${import.meta.env.BASE_URL}videos/3R-112.mp4`, alt: 'Recorrido en video del penthouse en venta en Polanco II Sección' },
  ],
  descripcion: 'Penthouse de ocho recámaras con múltiples terrazas y balcones, en Polanco II Sección.',
  ubicacion: {
    colonia: 'Polanco II Sección',
    alcaldia: 'Miguel Hidalgo',
    ciudad: 'Ciudad de México',
    codigoPostal: '11560',
    direccion: 'Calle Homero 780',
  },
  coordenadas: { lat: COLONIA_BASE.polanco.lat + 0.0019, lng: COLONIA_BASE.polanco.lng - 0.0012 },
  detalles: {
    fechaPublicacion: '2026-07-18',
    estacionamientos: 4,
    piso: 18,
    anoConstruccion: 2021,
    mantenimiento: { monto: 25_000, moneda: 'MXN' },
    condicion: 'usado',
    disposicion: 'poniente',
  },
  listados: [listadoVenta({ precio: { monto: 40_000_000, moneda: 'MXN' }, escriturado: true, creditosAceptados: [] })],
}

const deptoPolancoVRentaReal: Propiedad = {
  folio: '3R-113',
  estado: 'disponible',
  tipo: 'departamento',
  recamaras: 2,
  banos: 2.5,
  m2Construccion: 253,
  medios: [
    { tipo: 'fotografia', url: fotosPropiedades.deptoPolancoVRenta253, alt: 'Departamento en renta en Polanco V Sección con balcón' },
  ],
  descripcion: 'Departamento con balcón, listo para entrega inmediata en Polanco V Sección.',
  ubicacion: {
    colonia: 'Polanco V Sección',
    alcaldia: 'Miguel Hidalgo',
    ciudad: 'Ciudad de México',
    codigoPostal: '11560',
    direccion: 'Calle Temístocles 455',
  },
  coordenadas: { lat: COLONIA_BASE.polanco.lat - 0.0011, lng: COLONIA_BASE.polanco.lng - 0.0009 },
  detalles: {
    fechaPublicacion: '2026-07-22',
    estacionamientos: 2,
    piso: 5,
    anoConstruccion: 2018,
    mantenimiento: { monto: 6_500, moneda: 'MXN' },
    condicion: 'usado',
    disposicion: 'sur',
  },
  listados: [
    listadoRenta({
      precio: { monto: 100_000, moneda: 'MXN' },
      plazoMinimoMeses: 12,
      amueblado: false,
      incluyeMantenimiento: true,
      deposito: { monto: 100_000, moneda: 'MXN' },
    }),
  ],
}

const deptoLomasVenta230: Propiedad = {
  folio: '3R-114',
  estado: 'vendida',
  tipo: 'departamento',
  recamaras: 3,
  banos: 3.5,
  m2Construccion: 230,
  medios: [
    { tipo: 'fotografia', url: fotosPropiedades.deptoLomasVenta230, alt: 'Departamento en venta en Lomas de Chapultepec' },
  ],
  descripcion: 'Departamento de tres recámaras en una de las zonas más consolidadas de Lomas de Chapultepec.',
  ubicacion: {
    colonia: 'Lomas de Chapultepec',
    alcaldia: 'Miguel Hidalgo',
    ciudad: 'Ciudad de México',
    codigoPostal: '11000',
    direccion: 'Paseo de las Palmas 890',
  },
  coordenadas: { lat: COLONIA_BASE['lomas de chapultepec'].lat + 0.0008, lng: COLONIA_BASE['lomas de chapultepec'].lng + 0.0007 },
  detalles: {
    fechaPublicacion: '2026-07-28',
    estacionamientos: 2,
    piso: 3,
    anoConstruccion: 2015,
    mantenimiento: { monto: 9_000, moneda: 'MXN' },
    condicion: 'usado',
    disposicion: 'oriente',
  },
  listados: [listadoVenta({ precio: { monto: 28_000_000, moneda: 'MXN' }, escriturado: true, creditosAceptados: [] })],
}

// --- Fotos reales agregadas después (con marca de agua oficial) ------------
// Precio y detalles no venían en la lista de fotos entregada: valores
// demo razonables, mismo criterio que el resto del archivo.

const deptoPolancoBalcon180: Propiedad = {
  folio: '3R-115',
  estado: 'disponible',
  tipo: 'departamento',
  recamaras: 2,
  banos: 2,
  m2Construccion: 180,
  medios: [
    { tipo: 'fotografia', url: fotosPropiedades.deptoPolancoBalcon180, alt: 'Departamento en renta en Polanco con balcón y vista panorámica' },
    { tipo: 'video', url: `${import.meta.env.BASE_URL}videos/3R-115.mp4`, alt: 'Recorrido en video del departamento en renta en Polanco' },
  ],
  descripcion: 'Departamento con balcón y vista panorámica a la ciudad, listo para entrada inmediata en Polanco.',
  ubicacion: {
    colonia: 'Polanco',
    alcaldia: 'Miguel Hidalgo',
    ciudad: 'Ciudad de México',
    codigoPostal: '11560',
    direccion: 'Calle Séneca 210',
  },
  coordenadas: { lat: COLONIA_BASE.polanco.lat + 0.0006, lng: COLONIA_BASE.polanco.lng + 0.0011 },
  detalles: {
    fechaPublicacion: '2026-07-30',
    estacionamientos: 3,
    piso: 6,
    anoConstruccion: 2019,
    mantenimiento: { monto: 6_000, moneda: 'MXN' },
    condicion: 'usado',
    disposicion: 'poniente',
  },
  listados: [
    listadoRenta({
      precio: { monto: 68_000, moneda: 'MXN' },
      plazoMinimoMeses: 12,
      amueblado: false,
      incluyeMantenimiento: true,
      deposito: { monto: 68_000, moneda: 'MXN' },
    }),
  ],
}

const deptoPolancoAmenidades330: Propiedad = {
  folio: '3R-116',
  estado: 'apartada',
  tipo: 'departamento',
  recamaras: 3,
  banos: 3.5,
  m2Construccion: 330,
  medios: [
    { tipo: 'fotografia', url: fotosPropiedades.deptoPolancoAmenidades330, alt: 'Departamento en renta en Polanco con amenidades, pisos de mármol y terraza' },
  ],
  descripcion: 'Departamento con amenidades, pisos de mármol y terraza, en una de las torres más consolidadas de Polanco.',
  ubicacion: {
    colonia: 'Polanco',
    alcaldia: 'Miguel Hidalgo',
    ciudad: 'Ciudad de México',
    codigoPostal: '11560',
    direccion: 'Calle Emilio Castelar 155',
  },
  coordenadas: { lat: COLONIA_BASE.polanco.lat - 0.0009, lng: COLONIA_BASE.polanco.lng + 0.0021 },
  detalles: {
    fechaPublicacion: '2026-07-29',
    estacionamientos: 3,
    piso: 9,
    anoConstruccion: 2021,
    mantenimiento: { monto: 9_500, moneda: 'MXN' },
    condicion: 'usado',
    disposicion: 'norte',
  },
  listados: [
    listadoRenta({
      precio: { monto: 130_000, moneda: 'MXN' },
      plazoMinimoMeses: 12,
      amueblado: false,
      incluyeMantenimiento: true,
      deposito: { monto: 130_000, moneda: 'MXN' },
    }),
  ],
}

const phPolancoTerraza260: Propiedad = {
  folio: '3R-117',
  estado: 'disponible',
  tipo: 'penthouse',
  recamaras: 3,
  banos: 3.5,
  m2Construccion: 260,
  medios: [{ tipo: 'fotografia', url: fotosPropiedades.phPolancoTerraza260, alt: 'Penthouse en venta en Polanco con terraza' }],
  descripcion: 'Penthouse con terraza propia y acabados de lujo, en el corazón de Polanco.',
  ubicacion: {
    colonia: 'Polanco',
    alcaldia: 'Miguel Hidalgo',
    ciudad: 'Ciudad de México',
    codigoPostal: '11560',
    direccion: 'Calle Julio Verne 88',
  },
  coordenadas: { lat: COLONIA_BASE.polanco.lat + 0.0021, lng: COLONIA_BASE.polanco.lng + 0.0006 },
  detalles: {
    fechaPublicacion: '2026-07-27',
    estacionamientos: 3,
    piso: 12,
    anoConstruccion: 2020,
    mantenimiento: { monto: 14_000, moneda: 'MXN' },
    condicion: 'usado',
    disposicion: 'esquina',
  },
  listados: [listadoVenta({ precio: { monto: 34_900_000, moneda: 'MXN' }, escriturado: true, creditosAceptados: [] })],
}

// Fuera de la Ciudad de México: Tecamachalco es parte de Naucalpan de
// Juárez, Estado de México — no tiene "alcaldía" en sentido estricto (ese
// término es privativo de CDMX), pero se usa el mismo campo para no
// abrir una rama de tipo aparte por un solo caso.
const deptoTecamachalco333: Propiedad = {
  folio: '3R-118',
  estado: 'disponible',
  tipo: 'departamento',
  recamaras: 3,
  banos: 3.5,
  m2Construccion: 333,
  medios: [
    { tipo: 'fotografia', url: fotosPropiedades.deptoTecamachalco333, alt: 'Departamento en venta en Tecamachalco con terraza comunal y áreas verdes' },
    { tipo: 'video', url: `${import.meta.env.BASE_URL}videos/3R-118.mp4`, alt: 'Recorrido en video del departamento en venta en Tecamachalco' },
  ],
  descripcion: 'Departamento con terraza comunal, áreas verdes y juegos infantiles, en un desarrollo familiar de Tecamachalco.',
  ubicacion: {
    colonia: 'Tecamachalco',
    alcaldia: 'Naucalpan de Juárez',
    ciudad: 'Estado de México',
    codigoPostal: '53950',
    direccion: 'Bosque de Ciruelos 145',
  },
  coordenadas: { lat: COLONIA_BASE.tecamachalco.lat + 0.0007, lng: COLONIA_BASE.tecamachalco.lng - 0.0009 },
  detalles: {
    fechaPublicacion: '2026-07-26',
    estacionamientos: 4,
    piso: 3,
    anoConstruccion: 2017,
    mantenimiento: { monto: 8_000, moneda: 'MXN' },
    condicion: 'usado',
    disposicion: 'sur',
  },
  listados: [listadoVenta({ precio: { monto: 15_500_000, moneda: 'MXN' }, escriturado: true, creditosAceptados: ['bancario'] })],
}

// Única casa del catálogo demo: sin ella, ninguna propiedad calificaba para
// el exterior del Visor3D (deck, alberca, jardín, cochera), que solo aplica
// a terreno > construcción.
const casaLomas: Propiedad = {
  folio: '3R-119',
  estado: 'disponible',
  tipo: 'casa',
  recamaras: 4,
  banos: 4.5,
  m2Construccion: 320,
  m2Terreno: 385,
  medios: [
    { tipo: 'fotografia', url: fotosPropiedades.casaLomasLadrillo385, alt: 'Fachada de casa en Lomas de Chapultepec con jardín y alberca' },
    { tipo: 'video', url: `${import.meta.env.BASE_URL}videos/3R-119.mp4`, alt: 'Recorrido en video de la casa en Lomas de Chapultepec' },
  ],
  descripcion: 'Casa de un nivel con jardín amplio, alberca y cochera techada, en una de las secciones más arboladas de Lomas de Chapultepec.',
  ubicacion: {
    colonia: 'Lomas de Chapultepec III Sección',
    alcaldia: 'Miguel Hidalgo',
    ciudad: 'Ciudad de México',
    codigoPostal: '11000',
    direccion: 'Prado Sur 320',
  },
  coordenadas: { lat: COLONIA_BASE['lomas de chapultepec'].lat + 0.0025, lng: COLONIA_BASE['lomas de chapultepec'].lng - 0.0018 },
  detalles: {
    fechaPublicacion: '2026-07-30',
    estacionamientos: 4,
    anoConstruccion: 2012,
    condicion: 'remodelado',
    disposicion: 'poniente',
  },
  listados: [listadoVenta({ precio: { monto: 62_000_000, moneda: 'MXN' }, escriturado: true, creditosAceptados: [] })],
}

export const propiedadesDemo: Propiedad[] = [
  localAnzures,
  terrenoPinoSuarez,
  deptoPolancoIIIUsd,
  deptoLomasV,
  deptoPolancoIII,
  deptoPolancoV,
  deptoPolancoIVRenta,
  oficinaAnzures,
  preventaPolancoII,
  preventaBosquesDemo,
  preventaNuevoPolancoDemo,
  preventaPolanco213,
  phPolancoVenta542,
  phPolancoIIVenta525,
  deptoPolancoVRentaReal,
  deptoLomasVenta230,
  deptoPolancoBalcon180,
  deptoPolancoAmenidades330,
  phPolancoTerraza260,
  deptoTecamachalco333,
  casaLomas,
]

function tieneFotoReal(propiedad: Propiedad): boolean {
  return propiedad.medios.some((medio) => !medio.url.startsWith('/media/'))
}

// Portal público: nunca lista una propiedad que todavía no tiene
// fotografía real (rejilla de resultados, destacadas, mapa, propiedades
// similares) — solo inventario ya fotografiado se muestra ahí. Sigue
// existiendo en `propiedadesDemo` para el panel administrativo (Inventario,
// Captación…), que sí debe verla con su placeholder: es inventario real,
// solo le falta la sesión de fotos.
export const propiedadesPublicas: Propiedad[] = propiedadesDemo.filter(tieneFotoReal)

export const preventasDemo: PropiedadPreventa[] = [
  preventaPolancoII,
  preventaBosquesDemo,
  preventaNuevoPolancoDemo,
  preventaPolanco213,
]

// Curaduría para "Propiedades destacadas" en la landing: las cinco fotos
// reales del portal original (fachadas y unidades ya fotografiadas), no
// las ilustraciones de PropertyArt. Se suman las 3 propiedades con video
// que no estaban ya en esta lista (115, 118, 119) — la landing debe poder
// mostrar las 4 propiedades con video primero, igual que resultados
// (ver `priorizarConVideo` en resultadosLogica.ts).
export const propiedadesConFotoReal: Propiedad[] = [
  preventaPolanco213,
  phPolancoVenta542,
  phPolancoIIVenta525,
  deptoPolancoVRentaReal,
  deptoLomasVenta230,
  deptoPolancoBalcon180,
  deptoTecamachalco333,
  casaLomas,
]

if (import.meta.env.DEV) {
  validarFotosPropiedades(propiedadesDemo)
}
