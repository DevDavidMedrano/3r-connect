import type { TipoPropiedad } from '../../../types/propiedad'

type PropertyArtProps = {
  tipo: TipoPropiedad
  className?: string
}

// Composiciones arquitectónicas sobrias en lugar de fotografía: cada tipo de
// inmueble tiene una silueta propia, siempre en los tokens de marca
// (onix/carbon de masa construida, oro de acento, marfil/borde de cielo).
function TorreResidencial() {
  return (
    <>
      <rect x="0" y="0" width="400" height="300" className="fill-marfil" />
      <rect x="150" y="40" width="100" height="230" className="fill-onix" />
      <rect x="150" y="40" width="100" height="6" className="fill-oro" />
      {Array.from({ length: 8 }).map((_, fila) =>
        Array.from({ length: 4 }).map((_, col) => (
          <rect
            key={`${fila}-${col}`}
            x={162 + col * 20}
            y={58 + fila * 26}
            width="10"
            height="14"
            className={col === 1 || col === 2 ? 'fill-oro-claro/70' : 'fill-marfil/25'}
          />
        )),
      )}
      <rect x="0" y="266" width="400" height="34" className="fill-carbon" />
    </>
  )
}

function Casa() {
  return (
    <>
      <rect x="0" y="0" width="400" height="300" className="fill-marfil" />
      <rect x="110" y="150" width="180" height="110" className="fill-onix" />
      <path d="M95,150 L200,80 L305,150 Z" className="fill-carbon" />
      <path d="M95,150 L200,80 L305,150" fill="none" strokeWidth="3" className="stroke-oro" />
      <rect x="190" y="200" width="30" height="60" className="fill-oro-claro/60" />
      <rect x="130" y="175" width="24" height="24" className="fill-marfil/30" />
      <rect x="246" y="175" width="24" height="24" className="fill-marfil/30" />
      <rect x="0" y="260" width="400" height="40" className="fill-borde/60" />
    </>
  )
}

function Oficina() {
  return (
    <>
      <rect x="0" y="0" width="400" height="300" className="fill-marfil" />
      <rect x="50" y="90" width="300" height="170" className="fill-onix" />
      <rect x="50" y="90" width="300" height="6" className="fill-oro" />
      {Array.from({ length: 5 }).map((_, fila) =>
        Array.from({ length: 10 }).map((_, col) => (
          <rect
            key={`${fila}-${col}`}
            x={62 + col * 28}
            y={106 + fila * 28}
            width="18"
            height="18"
            className="fill-marfil/20"
          />
        )),
      )}
      <rect x="0" y="256" width="400" height="44" className="fill-carbon" />
    </>
  )
}

function Terreno() {
  return (
    <>
      <rect x="0" y="0" width="400" height="300" className="fill-marfil" />
      <rect x="40" y="120" width="320" height="130" fill="none" strokeWidth="3" strokeDasharray="10 8" className="stroke-oro-oscuro" />
      {[40, 120, 200, 280, 360].map((x) => (
        <line key={x} x1={x} y1="120" x2={x} y2="250" strokeWidth="1" className="stroke-borde" />
      ))}
      <circle cx="40" cy="120" r="5" className="fill-onix" />
      <circle cx="360" cy="120" r="5" className="fill-onix" />
      <circle cx="40" cy="250" r="5" className="fill-onix" />
      <circle cx="360" cy="250" r="5" className="fill-onix" />
      <rect x="0" y="250" width="400" height="50" className="fill-borde/50" />
    </>
  )
}

function LocalComercial() {
  return (
    <>
      <rect x="0" y="0" width="400" height="300" className="fill-marfil" />
      <rect x="60" y="120" width="280" height="140" className="fill-onix" />
      <rect x="60" y="120" width="280" height="10" className="fill-oro" />
      <rect x="80" y="150" width="100" height="110" className="fill-marfil/15" />
      <rect x="220" y="150" width="100" height="110" className="fill-marfil/15" />
      <rect x="0" y="256" width="400" height="44" className="fill-carbon" />
    </>
  )
}

export function PropertyArt({ tipo, className = '' }: PropertyArtProps) {
  return (
    <svg
      viewBox="0 0 400 300"
      className={className}
      preserveAspectRatio="xMidYMid slice"
      role="img"
      aria-label="Composición arquitectónica ilustrativa"
    >
      {tipo === 'departamento' || tipo === 'penthouse' ? <TorreResidencial /> : null}
      {tipo === 'casa' ? <Casa /> : null}
      {tipo === 'oficina' ? <Oficina /> : null}
      {tipo === 'local-comercial' ? <LocalComercial /> : null}
      {tipo === 'terreno' ? <Terreno /> : null}
    </svg>
  )
}
