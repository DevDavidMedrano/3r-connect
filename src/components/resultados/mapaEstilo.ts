import { COLORES } from '../../lib/colores'
import type { Precio } from '../../types/propiedad'

// Estilo claro y limpio: terreno casi blanco, verde muy pálido para
// parques, azul suave para agua, calles blancas con borde gris clarísimo
// y SIN el amarillo/naranja por defecto de Google en avenidas. Colores
// fijos en vez de saturation/lightness relativos: son predecibles, no
// dependen del tono base de Google y no terminan en un gris oscuro por
// accidente.
//
// De los puntos de interés solo queda la geometría de los parques (sin
// ícono ni etiqueta) — negocios, atracciones, gobierno, hospitales,
// escuelas, templos y transporte público se apagan uno por uno para no
// depender de que el `poi: off` genérico no se coma también los parques;
// además se apaga cualquier etiqueta de texto de poi que se cuele.
export const ESTILO_MAPA_CLARO: google.maps.MapTypeStyle[] = [
  { elementType: 'geometry', stylers: [{ color: '#f7f7f5' }] },
  { elementType: 'labels.icon', stylers: [{ visibility: 'off' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#a3a3a0' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#f7f7f5' }] },

  // Colonias/alcaldías: gris discreto, sí visibles.
  { featureType: 'administrative', elementType: 'geometry', stylers: [{ color: '#e3e1db' }] },
  { featureType: 'administrative.land_parcel', stylers: [{ visibility: 'off' }] },
  { featureType: 'administrative.neighborhood', elementType: 'labels.text.fill', stylers: [{ color: '#9a9893' }] },
  { featureType: 'administrative.locality', elementType: 'labels.text.fill', stylers: [{ color: '#8d8b86' }] },

  // Edificios: gris apenas perceptible, sin borde.
  { featureType: 'landscape.man_made', elementType: 'geometry.fill', stylers: [{ color: '#f1f0ec' }] },
  { featureType: 'landscape.man_made', elementType: 'geometry.stroke', stylers: [{ visibility: 'off' }] },

  { featureType: 'poi', elementType: 'labels.text', stylers: [{ visibility: 'off' }] },
  { featureType: 'poi.business', stylers: [{ visibility: 'off' }] },
  { featureType: 'poi.attraction', stylers: [{ visibility: 'off' }] },
  { featureType: 'poi.government', stylers: [{ visibility: 'off' }] },
  { featureType: 'poi.medical', stylers: [{ visibility: 'off' }] },
  { featureType: 'poi.place_of_worship', stylers: [{ visibility: 'off' }] },
  { featureType: 'poi.school', stylers: [{ visibility: 'off' }] },
  { featureType: 'poi.sports_complex', stylers: [{ visibility: 'off' }] },
  { featureType: 'poi.park', elementType: 'geometry', stylers: [{ visibility: 'on' }, { color: '#e4ede3' }] },
  { featureType: 'poi.park', elementType: 'labels', stylers: [{ visibility: 'off' }] },

  { featureType: 'transit', stylers: [{ visibility: 'off' }] },

  // Calles: blancas con borde gris muy claro — incluidas las avenidas
  // principales, que por default Google pinta en amarillo/naranja.
  { featureType: 'road', elementType: 'geometry.fill', stylers: [{ color: '#ffffff' }] },
  { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#e6e4de' }] },
  { featureType: 'road', elementType: 'labels.text.fill', stylers: [{ color: '#b3b1ab' }] },
  { featureType: 'road.arterial', elementType: 'geometry.fill', stylers: [{ color: '#ffffff' }] },
  { featureType: 'road.arterial', elementType: 'geometry.stroke', stylers: [{ color: '#e6e4de' }] },
  { featureType: 'road.highway', elementType: 'geometry.fill', stylers: [{ color: '#fbfaf7' }] },
  { featureType: 'road.highway', elementType: 'geometry.stroke', stylers: [{ color: '#e0ded8' }] },

  // Agua: azul claro suave.
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#c9dce8' }] },
  { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#8fa9bb' }] },
]

const COLOR_PIN = COLORES.vinoVivo
const COLOR_PIN_SELECCIONADO = COLORES.vinoOscuro

function sombraDefs(): string {
  return `
    <filter id="sombra" x="-60%" y="-60%" width="220%" height="220%">
      <feDropShadow dx="0" dy="1.2" stdDeviation="1.3" flood-color="#1a1a1a" flood-opacity="0.4"/>
    </filter>
  `
}

// "$22,792,000 MXN" → "$22.8M" · "$100,000 MXN" → "$100k" ·
// "$1,172,000 USD" → "$1.17M USD". Hasta dos decimales, sin ceros de más.
export function abreviarPrecio(precio: Precio): string {
  const { monto, moneda } = precio
  let base: string

  if (monto >= 1_000_000) {
    base = `$${Number((monto / 1_000_000).toFixed(2))}M`
  } else if (monto >= 1_000) {
    base = `$${Math.round(monto / 1_000)}k`
  } else {
    base = `$${monto}`
  }

  return moneda === 'USD' ? `${base} USD` : base
}

// Etiqueta redondeada con el precio, en vez de una gota simple: llena el
// mapa de información útil de un vistazo. Borde blanco de 2px y sombra
// suave para que se despegue del fondo. El ancho se estima a partir del
// largo del texto — no hay medición real de texto disponible al generar
// un SVG como data URI.
export function iconoPrecio(texto: string, estado: 'normal' | 'resaltado' | 'seleccionado' = 'normal'): google.maps.Icon {
  const escala = estado === 'normal' ? 1 : 1.12
  const fondo = estado === 'seleccionado' ? COLOR_PIN_SELECCIONADO : COLOR_PIN
  const alto = 26
  const ancho = Math.round(texto.length * 6.6 + 22)
  const margen = 5
  const lienzoAncho = ancho + margen * 2
  const lienzoAlto = alto + margen * 2

  const svg = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="${lienzoAncho * escala}" height="${lienzoAlto * escala}" viewBox="${-margen} ${-margen} ${lienzoAncho} ${lienzoAlto}">
      <defs>${sombraDefs()}</defs>
      <g filter="url(#sombra)">
        <rect x="0" y="0" width="${ancho}" height="${alto}" rx="${alto / 2}" fill="${fondo}" stroke="#ffffff" stroke-width="2"/>
        <text x="${ancho / 2}" y="${alto / 2 + 4}" text-anchor="middle" font-family="Inter, system-ui, sans-serif" font-size="11.5" font-weight="700" fill="#ffffff">${texto}</text>
      </g>
    </svg>
  `)}`

  return {
    url: svg,
    scaledSize: new google.maps.Size(lienzoAncho * escala, lienzoAlto * escala),
    anchor: new google.maps.Point((lienzoAncho * escala) / 2, (lienzoAlto * escala) / 2),
  }
}

// Punto pequeño y sólido — para vistas generales (zonas destacadas) donde
// solo importa mostrar dónde hay inventario de 3R, sin precio ni detalle.
// Borde blanco marcado y sombra suave para que no se pierda sobre el mapa.
export function iconoPinPequeno(): google.maps.Icon {
  const diametro = 9
  const margen = 6
  const lienzo = diametro + margen * 2
  const svg = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="${lienzo}" height="${lienzo}" viewBox="0 0 ${lienzo} ${lienzo}">
      <defs>${sombraDefs()}</defs>
      <circle cx="${lienzo / 2}" cy="${lienzo / 2}" r="${diametro / 2}" fill="${COLOR_PIN}" stroke="#ffffff" stroke-width="2" filter="url(#sombra)"/>
    </svg>
  `)}`
  return {
    url: svg,
    scaledSize: new google.maps.Size(lienzo, lienzo),
    anchor: new google.maps.Point(lienzo / 2, lienzo / 2),
  }
}

// Ícono de agrupación (cluster): círculo sólido con el número adentro, con
// la misma sombra suave que los pines, sin depender de las imágenes por
// default de markerclusterer.
export function iconoCluster(cantidad: number): { url: string; width: number; height: number } {
  const diametro = cantidad < 10 ? 38 : cantidad < 100 ? 44 : 50
  const margen = 5
  const lienzo = diametro + margen * 2
  const svg = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="${lienzo}" height="${lienzo}" viewBox="0 0 ${lienzo} ${lienzo}">
      <defs>${sombraDefs()}</defs>
      <circle cx="${lienzo / 2}" cy="${lienzo / 2}" r="${diametro / 2}" fill="${COLOR_PIN}" stroke="#ffffff" stroke-width="2.5" filter="url(#sombra)"/>
    </svg>
  `)}`
  return { url: svg, width: lienzo, height: lienzo }
}
