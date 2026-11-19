import type { Variants } from 'framer-motion'

// Duraciones cortas a propósito (200–400ms): la regla es que la animación
// nunca debe notarse más que el contenido.
export const DURACION_CORTA = 0.2
export const DURACION_MEDIA = 0.4

export const fadeSubeVariants: Variants = {
  oculto: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: DURACION_MEDIA, ease: 'easeOut' } },
}

export const fadeVariants: Variants = {
  oculto: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: DURACION_MEDIA, ease: 'easeOut' } },
}

export const deslizaDesdeDerechaVariants: Variants = {
  oculto: { opacity: 0, x: 40 },
  visible: { opacity: 1, x: 0, transition: { duration: DURACION_MEDIA, ease: 'easeOut' } },
}

export const rebotaVariants: Variants = {
  oculto: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { type: 'spring', stiffness: 300, damping: 14 },
  },
}

// Contenedor con stagger — se usa con whileInView="visible" o animate y
// cada hijo trae su propio variants (fadeSubeVariants, etc.).
export function contenedorStagger(retraso = 0.08): Variants {
  return {
    oculto: {},
    visible: { transition: { staggerChildren: retraso, delayChildren: 0.05 } },
  }
}

// Versión sin movimiento — para prefers-reduced-motion: solo cambia
// opacidad, sin desplazamientos, escalas ni rebotes.
export const fadeSoloVariants: Variants = {
  oculto: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2 } },
}
