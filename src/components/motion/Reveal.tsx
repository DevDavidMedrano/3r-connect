import { motion, type Variants } from 'framer-motion'
import type { ReactNode } from 'react'
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion'
import { fadeSoloVariants, fadeSubeVariants } from '../../lib/motionVariants'

interface RevealProps {
  children: ReactNode
  className?: string
  variants?: Variants
  delay?: number
}

// Fade + desplazamiento hacia arriba al entrar en pantalla, una sola vez
// (viewport once: true). Con prefers-reduced-motion cae a solo opacidad,
// sin desplazamiento.
export function Reveal({ children, className, variants, delay = 0 }: RevealProps) {
  const prefiereReducido = usePrefersReducedMotion()

  return (
    <motion.div
      className={className}
      initial="oculto"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      variants={prefiereReducido ? fadeSoloVariants : (variants ?? fadeSubeVariants)}
      transition={{ delay: prefiereReducido ? 0 : delay }}
    >
      {children}
    </motion.div>
  )
}
