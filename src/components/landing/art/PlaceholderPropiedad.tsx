import type { ReactElement } from 'react'
import type { TipoPropiedad } from '../../../types/propiedad'

type PlaceholderPropiedadProps = {
  tipo: TipoPropiedad
  folio: string
  className?: string
}

// Reemplazo de una foto real ausente: nunca una foto de otro tipo de
// inmueble (un terreno no debe verse con foto de casa). Ícono simple por
// tipo sobre fondo neutro — el folio en pequeño es lo único que distingue
// una tarjeta de otra cuando ninguna tiene fotografía todavía.
const ICONO_TIPO: Record<TipoPropiedad, () => ReactElement> = {
  departamento: IconoDepartamento,
  penthouse: IconoPenthouse,
  casa: IconoCasa,
  oficina: IconoOficina,
  'local-comercial': IconoLocal,
  terreno: IconoTerreno,
}

function IconoDepartamento() {
  return (
    <g transform="translate(160,90)" className="stroke-onix/35" fill="none" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <rect x="0" y="0" width="80" height="110" />
      {[0, 1, 2, 3].map((fila) =>
        [0, 1].map((col) => <rect key={`${fila}-${col}`} x={14 + col * 34} y={16 + fila * 24} width="16" height="14" />),
      )}
    </g>
  )
}

function IconoPenthouse() {
  return (
    <g transform="translate(150,80)" className="stroke-onix/35" fill="none" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <rect x="10" y="30" width="80" height="90" />
      {[0, 1, 2].map((fila) =>
        [0, 1].map((col) => <rect key={`${fila}-${col}`} x={24 + col * 34} y={46 + fila * 24} width="16" height="14" />),
      )}
      <line x1="10" y1="30" x2="90" y2="30" />
      <path d="M22,30 L22,6 L78,6 L78,30" />
      <line x1="34" y1="6" x2="34" y2="18" />
      <line x1="50" y1="6" x2="50" y2="18" />
      <line x1="66" y1="6" x2="66" y2="18" />
    </g>
  )
}

function IconoCasa() {
  return (
    <g transform="translate(150,85)" className="stroke-onix/35" fill="none" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <path d="M0,45 L50,0 L100,45" />
      <rect x="12" y="45" width="76" height="65" />
      <rect x="40" y="75" width="20" height="35" />
    </g>
  )
}

function IconoOficina() {
  return (
    <g transform="translate(150,95)" className="stroke-onix/35" fill="none" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <rect x="20" y="14" width="60" height="30" rx="4" />
      <rect x="0" y="44" width="100" height="66" rx="3" />
      <line x1="0" y1="66" x2="100" y2="66" />
    </g>
  )
}

function IconoLocal() {
  return (
    <g transform="translate(150,90)" className="stroke-onix/35" fill="none" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <path d="M0,22 L10,0 L90,0 L100,22" />
      <path d="M0,22 Q12,32 24,22 Q36,32 48,22 Q60,32 72,22 Q84,32 96,22" />
      <rect x="4" y="22" width="92" height="76" />
      <rect x="42" y="62" width="16" height="36" />
    </g>
  )
}

function IconoTerreno() {
  return (
    <g transform="translate(150,100)" className="stroke-onix/35" fill="none" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <rect x="0" y="0" width="100" height="70" strokeDasharray="9 7" />
      <circle cx="0" cy="0" r="4" fill="currentColor" className="fill-onix/35" stroke="none" />
      <circle cx="100" cy="0" r="4" fill="currentColor" className="fill-onix/35" stroke="none" />
      <circle cx="0" cy="70" r="4" fill="currentColor" className="fill-onix/35" stroke="none" />
      <circle cx="100" cy="70" r="4" fill="currentColor" className="fill-onix/35" stroke="none" />
    </g>
  )
}

export function PlaceholderPropiedad({ tipo, folio, className = '' }: PlaceholderPropiedadProps) {
  const Icono = ICONO_TIPO[tipo]
  return (
    <svg
      viewBox="0 0 400 300"
      className={className}
      preserveAspectRatio="xMidYMid slice"
      role="img"
      aria-label={`Sin fotografía todavía — folio ${folio}`}
    >
      <rect x="0" y="0" width="400" height="300" className="fill-marfil" />
      <rect x="0" y="0" width="400" height="300" className="fill-borde/20" />
      <Icono />
      <text x="376" y="284" textAnchor="end" fontSize="13" letterSpacing="0.5" className="fill-texto-suave/70">
        {folio}
      </text>
    </svg>
  )
}
