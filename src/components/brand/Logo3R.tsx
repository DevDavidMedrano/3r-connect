import type { CSSProperties } from 'react'
import { img } from '../../assets/img'

interface Logo3RProps {
  /** Ancho en px. Por debajo del breakpoint `sm` es también el ancho móvil. */
  size: number
  /** Ancho en px desde `sm:` en adelante. Si se omite, el logo no cambia de tamaño por breakpoint. */
  sizeSm?: number
  className?: string
}

// Único componente de logo del sistema — el archivo real (PNG con
// transparencia real, verificado por canal alfa) tal cual, sin blend modes:
// mix-blend-mode: multiply desaparecería el logo sobre fondos oscuros
// (Hero, sidebars), y no hace falta ningún truco para disimular fondo — el
// archivo ya es transparente.
export function Logo3R({ size, sizeSm, className = '' }: Logo3RProps) {
  const estilo = {
    '--logo-w': `${size}px`,
    '--logo-w-sm': `${sizeSm ?? size}px`,
  } as CSSProperties

  return (
    <img
      src={img.logo3RConnect}
      alt="3R Connect"
      style={estilo}
      className={`h-auto w-(--logo-w) shrink-0 sm:w-(--logo-w-sm) ${className}`}
    />
  )
}
