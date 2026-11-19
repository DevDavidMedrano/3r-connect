import { motion, type Variants } from 'framer-motion'
import { forwardRef, type ReactNode } from 'react'
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion'
import { contenedorStagger, fadeSoloVariants, fadeSubeVariants } from '../../lib/motionVariants'

interface StaggerContainerProps {
  children: ReactNode
  className?: string
  retraso?: number
  // 'scroll' anima cuando la sección entra en pantalla (whileInView, una
  // sola vez). 'montaje' anima apenas se monta — para lo que ya está
  // arriba del pliegue desde el primer render (pastillas de búsquedas
  // populares, por ejemplo), donde esperar a whileInView no tiene sentido.
  disparador?: 'scroll' | 'montaje'
}

export const StaggerContainer = forwardRef<HTMLDivElement, StaggerContainerProps>(function StaggerContainer(
  { children, className, retraso = 0.08, disparador = 'scroll' },
  ref,
) {
  const prefiereReducido = usePrefersReducedMotion()
  const variantes = prefiereReducido ? { oculto: {}, visible: {} } : contenedorStagger(retraso)

  const propsAnimacion =
    disparador === 'scroll'
      ? { whileInView: 'visible', viewport: { once: true, amount: 0.15 } }
      : { animate: 'visible' }

  return (
    <motion.div ref={ref} className={className} initial="oculto" variants={variantes} {...propsAnimacion}>
      {children}
    </motion.div>
  )
})

export function StaggerItem({
  children,
  className,
  variants,
}: {
  children: ReactNode
  className?: string
  variants?: Variants
}) {
  const prefiereReducido = usePrefersReducedMotion()
  return (
    <motion.div className={className} variants={prefiereReducido ? fadeSoloVariants : (variants ?? fadeSubeVariants)}>
      {children}
    </motion.div>
  )
}
