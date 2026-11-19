// Línea de tendencia chica para la tarjeta "Vistas este mes" del tablero.
// Solo hay dos números reales (mes actual, mes anterior) — no hay una
// serie diaria en los datos: en vez de inventar puntos falsos, se traza
// una curva suave entre esos dos valores reales, igual que cualquier
// dashboard resume una tendencia de dos periodos.
interface MiniSparklineProps {
  valorAnterior: number
  valorActual: number
  className?: string
}

const ANCHO = 120
const ALTO = 36
const PUNTOS = 8

export function MiniSparkline({ valorAnterior, valorActual, className = '' }: MiniSparklineProps) {
  const maximo = Math.max(valorAnterior, valorActual, 1)
  const minimo = Math.min(valorAnterior, valorActual, 0)
  const rango = Math.max(1, maximo - minimo)

  const coordenadas = Array.from({ length: PUNTOS }, (_, i) => {
    const t = i / (PUNTOS - 1)
    // easeInOut simple para que la curva no sea una recta perfecta.
    const suavizado = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2
    const valor = valorAnterior + (valorActual - valorAnterior) * suavizado
    const x = t * ANCHO
    const y = ALTO - ((valor - minimo) / rango) * (ALTO - 6) - 3
    return `${x},${y}`
  })

  return (
    <svg viewBox={`0 0 ${ANCHO} ${ALTO}`} className={className} preserveAspectRatio="none" role="presentation">
      <polyline points={coordenadas.join(' ')} fill="none" stroke="var(--color-oro-brillante)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={ANCHO} cy={coordenadas[coordenadas.length - 1].split(',')[1]} r="2.5" fill="var(--color-oro-brillante)" />
    </svg>
  )
}
