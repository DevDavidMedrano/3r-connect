import { motion } from 'framer-motion'
import { img } from '../../assets/img'
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion'
import { useEffect } from 'react'
import { Logo3R } from '../brand/Logo3R'

const DURACION_MS = 2500
const ANCHO_LOGO = 150

interface PreloaderProps {
  logoLayoutId: string
  onTerminar: () => void
}

export function Preloader({ logoLayoutId, onTerminar }: PreloaderProps) {
  const prefiereReducido = usePrefersReducedMotion()

  useEffect(() => {
    const temporizador = setTimeout(onTerminar, DURACION_MS)
    return () => clearTimeout(temporizador)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden bg-onix"
      exit={{ opacity: 0, transition: { duration: 0.4, ease: 'easeInOut' } }}
    >
      {/* Degradado radial muy sutil, sin retícula — solo aclara el centro */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{ background: 'radial-gradient(circle at 50% 45%, rgba(255,255,255,0.07), transparent 55%)' }}
      />

      {/* logo — layoutId compartido con el del header, para que la
          transición se sienta como el mismo logo cambiando de lugar */}
      <motion.div
        layoutId={logoLayoutId}
        className="relative z-10"
        initial={prefiereReducido ? false : { opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        <div className="relative inline-block leading-none">
          <Logo3R size={ANCHO_LOGO} className="block" />

          {/* Barrido de luz — franja diagonal recortada a la silueta del
              logo (mask-image), moviéndose de -100% a 200% en 1.8s,
              mezclada en 'overlay' para que se lea como reflejo sobre
              metal y no como una barra encima. Entra cuando el logo ya es
              visible (delay ≈ el fade de arriba). */}
          {!prefiereReducido && (
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 overflow-hidden"
              style={{
                maskImage: `url(${img.logo3RConnect})`,
                WebkitMaskImage: `url(${img.logo3RConnect})`,
                maskSize: 'contain',
                WebkitMaskSize: 'contain',
                maskRepeat: 'no-repeat',
                WebkitMaskRepeat: 'no-repeat',
                maskPosition: 'center',
                WebkitMaskPosition: 'center',
              }}
            >
              <motion.div
                className="h-full w-1/3 -skew-x-12"
                style={{
                  background: 'linear-gradient(90deg, transparent, rgba(255,247,224,0.9), transparent)',
                  mixBlendMode: 'overlay',
                }}
                initial={{ x: '-160%' }}
                animate={{ x: '360%' }}
                transition={{ duration: 1.8, delay: 0.55, ease: 'easeInOut' }}
              />
            </div>
          )}
        </div>
      </motion.div>

      <motion.p
        className="relative z-10 mt-7 text-sm text-plata"
        initial={prefiereReducido ? false : { opacity: 0 }}
        animate={prefiereReducido ? { opacity: 1 } : { opacity: [0.4, 1, 0.4] }}
        transition={
          prefiereReducido
            ? { duration: 0.4 }
            : { opacity: { duration: 2.6, repeat: Infinity, ease: 'easeInOut', delay: 0.3 } }
        }
      >
        Cargando experiencia...
      </motion.p>
    </motion.div>
  )
}
