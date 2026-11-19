import { animate, useInView } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion'

interface ContadorAnimadoProps {
  valor: number
  formato?: (n: number) => string
  duracion?: number
  className?: string
}

// Cuenta de 0 a `valor` cuando el elemento entra en pantalla, una sola vez.
// Con prefers-reduced-motion muestra el número final directo, sin conteo.
export function ContadorAnimado({ valor, formato, duracion = 1.2, className }: ContadorAnimadoProps) {
  const ref = useRef<HTMLSpanElement>(null)
  const enVista = useInView(ref, { once: true, amount: 0.6 })
  const prefiereReducido = usePrefersReducedMotion()
  const [mostrado, setMostrado] = useState(prefiereReducido ? valor : 0)

  useEffect(() => {
    if (!enVista || prefiereReducido) return
    const controles = animate(0, valor, {
      duration: duracion,
      ease: 'easeOut',
      onUpdate: (v) => setMostrado(Math.round(v)),
    })
    return () => controles.stop()
  }, [enVista, valor, duracion, prefiereReducido])

  return (
    <span ref={ref} className={className}>
      {formato ? formato(mostrado) : mostrado}
    </span>
  )
}
