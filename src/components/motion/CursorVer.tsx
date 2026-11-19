import { motion, useMotionValue, useSpring } from 'framer-motion'
import { useState } from 'react'

// Círculo "Ver" que sigue al cursor dentro de la tarjeta de propiedad.
// Solo escritorio: en móvil no hay cursor que seguir, así que el propio
// hover (que requiere mouse) ya lo excluye de forma natural, reforzado
// con `hidden lg:block` por si un táctil dispara :hover.
export function CursorVer() {
  const [visible, setVisible] = useState(false)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const xSuave = useSpring(x, { stiffness: 400, damping: 30 })
  const ySuave = useSpring(y, { stiffness: 400, damping: 30 })

  function alMoverMouse(evento: React.MouseEvent<HTMLDivElement>) {
    const rect = evento.currentTarget.getBoundingClientRect()
    x.set(evento.clientX - rect.left)
    y.set(evento.clientY - rect.top)
  }

  return (
    <div
      className="absolute inset-0 z-10 hidden lg:block"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      onMouseMove={alMoverMouse}
    >
      {visible && (
        <motion.div
          className="pointer-events-none absolute flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-blanco/90 text-[11px] font-semibold uppercase tracking-wide text-texto shadow-md"
          style={{ left: xSuave, top: ySuave }}
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.6 }}
          transition={{ duration: 0.15 }}
        >
          Ver
        </motion.div>
      )}
    </div>
  )
}
