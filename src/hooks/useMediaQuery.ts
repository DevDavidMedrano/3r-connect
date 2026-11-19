import { useEffect, useState } from 'react'

// Genérico — mismo patrón que usePrefersReducedMotion.ts. Se usa para
// decisiones que dependen del tamaño de pantalla o del tipo de puntero
// (mouse real vs. táctil) y que no se pueden resolver solo con clases de
// Tailwind porque afectan valores de JS (framer-motion, arreglos, etc.).
export function useMediaQuery(consulta: string): boolean {
  const [coincide, setCoincide] = useState(() => typeof window !== 'undefined' && window.matchMedia(consulta).matches)

  useEffect(() => {
    const medio = window.matchMedia(consulta)
    function alCambiar() {
      setCoincide(medio.matches)
    }
    alCambiar()
    medio.addEventListener('change', alCambiar)
    return () => medio.removeEventListener('change', alCambiar)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [consulta])

  return coincide
}

// Tiene un mouse/trackpad real — en táctil (hover: none) el seguimiento del
// cursor no aplica y solo consume batería de más.
export function usePuedeSeguirMouse(): boolean {
  return useMediaQuery('(hover: hover) and (pointer: fine)')
}

// Punto de corte "móvil" del encargo de responsive — 640px, mismo valor que
// el breakpoint `sm` de Tailwind.
export function useEsMovil(): boolean {
  return useMediaQuery('(max-width: 640px)')
}
