// Único punto de entrada para las fotos reales del proyecto. Los
// componentes nunca importan un archivo de imagen directamente: toman de
// GALERIA por índice (rotando con %), así que agregar una foto nueva aquí
// se reparte sola por toda la landing sin tocar componentes.

import heroCasaPolanco from './hero-casa-polanco.png'
import logo3RConnect from './logo3RCONNET.png'
import { fotosPropiedades } from './propiedades'

export const img = {
  heroCasaPolanco,
  logo3RConnect,
} as const

// 6 fotos reales del catálogo (Hero flotantes + fallback de ReviewsCarousel),
// elegidas por presentables como miniatura: fachadas, terrazas e interiores
// amplios — nunca el terreno (vista aérea) ni la oficina, que no venden
// "hogar". Orden = el mismo en que Hero.tsx consume `indice` (0 a 5, top-left
// → left-center → left-bottom → top-right → right-center → bottom-right), así
// que agregar/quitar una foto aquí basta para que se reparta sola. Si algún
// día hay menos de 6 aptas, quitar de este arreglo en vez de repetir: Hero
// usa `GALERIA.length`, se ajusta solo.
export const GALERIA = [
  fotosPropiedades.casaLomasLadrillo385,
  fotosPropiedades.phPolancoVenta542,
  fotosPropiedades.deptoPolancoRentaParquet200,
  fotosPropiedades.phLomasTerraza400,
  fotosPropiedades.deptoPolancoBalcon180,
  fotosPropiedades.deptoPolancoVRenta253,
] as const
