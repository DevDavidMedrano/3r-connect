import { useEffect, useState } from 'react'

const CONSULTA = '(prefers-reduced-motion: reduce)'

export function usePrefersReducedMotion(): boolean {
  const [prefiereReducido, setPrefiereReducido] = useState(
    () => typeof window !== 'undefined' && window.matchMedia(CONSULTA).matches,
  )

  useEffect(() => {
    const medio = window.matchMedia(CONSULTA)
    function alCambiar() {
      setPrefiereReducido(medio.matches)
    }
    medio.addEventListener('change', alCambiar)
    return () => medio.removeEventListener('change', alCambiar)
  }, [])

  return prefiereReducido
}
