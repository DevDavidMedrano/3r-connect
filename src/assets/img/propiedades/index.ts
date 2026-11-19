// Fotos reales del portal de 3R Connect, ya con su marca de agua oficial.
// Un único punto de entrada, igual que src/assets/img: los componentes
// nunca importan un archivo de aquí directamente.

import preventaPolanco213 from './preventa-polanco-213.jpg'
import phPolancoVenta542 from './ph-polanco-venta-542.jpg'
import phPolancoIIVenta525 from './ph-polanco-ii-venta-525.jpg'
import deptoPolancoVRenta253 from './depto-polanco-v-renta-253.jpg'
import deptoLomasVenta230 from './depto-lomas-venta-230.jpg'
import roofgardenCondominio from './roofgarden-condominio.jpg'
import deptoPolancoBalcon180 from './depto-polanco-balcon-180.jpg'
import deptoPolancoAmenidades330 from './depto-polanco-amenidades-330.jpg'
import phPolancoTerraza260 from './ph-polanco-terraza-260.jpg'
import deptoTecamachalco333 from './depto-tecamachalco-333.jpg'
// Pendiente de optimizar: estas 4 llegaron en .png (mucho más pesadas que
// los .jpg de arriba — hasta 5x). Falta pasarlas a .jpg o webp; se dejan
// así por ahora para no bloquear la asignación de fotos.
import terrenoAlvaroObregon4979 from './terreno-alvaro-obregon-4979.png'
import deptoPolancoThTerraza183 from './depto-polanco-th-terraza-183.png'
import deptoPolancoRentaParquet200 from './depto-polanco-renta-parquet-200.png'
import casaLomasLadrillo385 from './casa-lomas-ladrillo-385.png'
// Llegaron como .png otra vez, pese al nombre .jpg con el que se pidieron
// — mismo pendiente de optimización que el bloque anterior.
import phLomasTerraza400 from './ph-lomas-terraza-400.png'
import oficinaPolancoRenta200 from './oficina-polanco-renta-200.png'
import deptoPolancoThTerraza183B from './depto-polanco-th-terraza-183-b.png'

export const fotosPropiedades = {
  preventaPolanco213,
  phPolancoVenta542,
  phPolancoIIVenta525,
  deptoPolancoVRenta253,
  deptoLomasVenta230,
  roofgardenCondominio,
  deptoPolancoBalcon180,
  deptoPolancoAmenidades330,
  phPolancoTerraza260,
  deptoTecamachalco333,
  terrenoAlvaroObregon4979,
  deptoPolancoThTerraza183,
  deptoPolancoRentaParquet200,
  casaLomasLadrillo385,
  phLomasTerraza400,
  oficinaPolancoRenta200,
  deptoPolancoThTerraza183B,
} as const
