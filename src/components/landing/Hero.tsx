import { motion, useMotionValue, useSpring, useTransform, type MotionValue } from 'framer-motion'
import type { MouseEvent as ReactMouseEvent } from 'react'
import { GALERIA } from '../../assets/img'
import { useEsMovil, usePuedeSeguirMouse } from '../../hooks/useMediaQuery'
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion'
import { contenedorStagger, fadeSoloVariants, fadeSubeVariants } from '../../lib/motionVariants'
import { SearchBar, SearchTabs } from './SearchCard'

const TITULO_LINEA_1 = 'Encuentra tu próximo hogar'
// 'de México' va junto en un solo span (igual que 'en el'): son
// inline-block, así que si la línea no alcanza, el que se va solo a la
// siguiente línea es el bloque completo — nunca separa "de" de "México".
const TITULO_LINEA_2 = ['en el', 'corazón', 'de México']

type FotoFlotanteProps = {
  className: string
  posicion: string
  indice: number
  desde: 'izquierda' | 'derecha'
  orden: number
  mouseX: MotionValue<number>
  mouseY: MotionValue<number>
  // Solo las 2-3 que se quedan visibles en móvil lo activan — en el resto
  // no importa, ya vienen ocultas por className (hidden sm:block).
  amplitudReducida?: boolean
}

// Dos capas: la de afuera solo sigue al cursor (mouseX/mouseY, motion values
// "vivas" vía style — no re-renderiza React en cada mousemove); la de
// adentro hace la entrada al cargar y después el flote idle continuo. Dos
// elementos porque framer no puede animar y trackear el mismo canal
// (transform) desde dos fuentes distintas en el mismo nodo.
function FotoFlotante({ className, posicion, indice, desde, orden, mouseX, mouseY, amplitudReducida }: FotoFlotanteProps) {
  const src = GALERIA[indice % GALERIA.length]
  const prefiereReducido = usePrefersReducedMotion()
  const desplazamientoEntrada = desde === 'izquierda' ? -48 : 48
  const amplitudBase = desde === 'izquierda' ? -7 : 7
  const amplitudIdle = amplitudReducida ? amplitudBase * 0.5 : amplitudBase
  const duracionIdle = 4.5 + orden * 0.7

  return (
    <motion.div
      className={`pointer-events-none absolute ${className}`}
      style={prefiereReducido ? undefined : { x: mouseX, y: mouseY, willChange: 'transform' }}
    >
      <motion.div
        className="h-full w-full rounded-2xl shadow-[0_18px_35px_-10px_rgba(0,0,0,0.6),0_0_45px_12px_rgba(255,199,44,0.22)]"
        initial={prefiereReducido ? false : { opacity: 0, x: desplazamientoEntrada }}
        animate={
          prefiereReducido
            ? { opacity: 1 }
            : { opacity: 1, x: 0, y: [0, amplitudIdle, 0] }
        }
        transition={
          prefiereReducido
            ? { duration: 0.3 }
            : {
                opacity: { duration: 0.5, delay: 0.5 + orden * 0.08, ease: 'easeOut' },
                x: { duration: 0.5, delay: 0.5 + orden * 0.08, ease: 'easeOut' },
                y: { duration: duracionIdle, repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut', delay: 0.9 + orden * 0.08 },
              }
        }
      >
        {/* Envoltura aparte para el recorte redondeado — el glow de arriba
            vive en el elemento padre porque overflow-hidden recorta su
            propia box-shadow, no solo el contenido. */}
        <div className="h-full w-full overflow-hidden rounded-2xl">
          <img src={src} alt="" aria-hidden="true" className="h-full w-full object-cover" style={{ objectPosition: posicion }} />
        </div>
      </motion.div>
    </motion.div>
  )
}

export function Hero() {
  const prefiereReducido = usePrefersReducedMotion()
  const puedeSeguirMouse = usePuedeSeguirMouse()
  const esMovil = useEsMovil()

  const mouseXRaw = useMotionValue(0)
  const mouseYRaw = useMotionValue(0)
  const resorte = { stiffness: 60, damping: 20, mass: 0.6 }
  const fotoX = useSpring(useTransform(mouseXRaw, [-1, 1], [-8, 8]), resorte)
  const fotoY = useSpring(useTransform(mouseYRaw, [-1, 1], [-8, 8]), resorte)
  const rotacionFondo = useSpring(useTransform(mouseXRaw, [-1, 1], [-1, 1]), resorte)

  // En táctil (hover: none) no hay cursor que seguir — además de no
  // aportar nada, mantener el listener y el spring corriendo gasta batería
  // de más sin razón.
  function alMoverMouse(evento: ReactMouseEvent<HTMLDivElement>) {
    if (prefiereReducido || !puedeSeguirMouse) return
    const rect = evento.currentTarget.getBoundingClientRect()
    mouseXRaw.set(((evento.clientX - rect.left) / rect.width) * 2 - 1)
    mouseYRaw.set(((evento.clientY - rect.top) / rect.height) * 2 - 1)
  }

  function alSalirMouse() {
    mouseXRaw.set(0)
    mouseYRaw.set(0)
  }

  return (
    <section className="relative overflow-x-hidden bg-blanco px-4 pb-24 pt-6 sm:px-6 lg:px-10">
      <div className="relative mx-auto max-w-6xl">
        <motion.div
          onMouseMove={alMoverMouse}
          onMouseLeave={alSalirMouse}
          className="relative rounded-[3rem] bg-onix px-6 pb-20 pt-14 sm:rounded-[4rem] sm:pb-24 sm:pt-16"
          style={prefiereReducido ? undefined : { rotate: rotacionFondo, willChange: 'transform' }}
          initial={prefiereReducido ? false : { opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          {/* Capa aparte, recortada al radio del hero — el buscador y las
              fotos NO viven aquí adentro: necesitan poder sobresalir del
              bloque (overflow-hidden en el contenedor de arriba cortaría
              el buscador flotante). */}
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden rounded-[3rem] sm:rounded-[4rem]">
            {/* Plano de luz diagonal amplio, con el borde apenas insinuado en dorado */}
            <div className="absolute -inset-y-1/4 left-[15%] w-[55%] rotate-[18deg] bg-gradient-to-r from-transparent via-oro-brillante/[0.07] to-transparent blur-3xl" />
            <div className="absolute -inset-y-1/4 left-[38%] w-[4%] rotate-[18deg] bg-gradient-to-b from-transparent via-oro-brillante/25 to-transparent blur-md" />
          </div>

          {/* Solo 3 de las 6 se quedan en móvil (top-left, top-right,
              bottom-right) — el resto se oculta entero, no se encoge, para
              que el título respire en una pantalla angosta. Las 6 vuelven
              desde tablet (sm:). */}
          <FotoFlotante
            className="-left-3 top-4 h-20 w-16 -rotate-3 sm:-left-6 sm:top-10 sm:h-44 sm:w-32"
            posicion="center top"
            indice={0}
            desde="izquierda"
            orden={0}
            mouseX={fotoX}
            mouseY={fotoY}
            amplitudReducida={esMovil}
          />
          <FotoFlotante
            className="hidden sm:block sm:left-16 sm:top-1/2 sm:h-60 sm:w-40 sm:-translate-y-1/2"
            posicion="center center"
            indice={1}
            desde="izquierda"
            orden={1}
            mouseX={fotoX}
            mouseY={fotoY}
          />
          <FotoFlotante
            className="hidden sm:block sm:-left-4 sm:bottom-20 sm:h-32 sm:w-32 sm:rotate-2"
            posicion="center bottom"
            indice={2}
            desde="izquierda"
            orden={2}
            mouseX={fotoX}
            mouseY={fotoY}
          />

          <FotoFlotante
            className="-right-3 top-8 h-16 w-16 rotate-3 sm:-right-6 sm:top-14 sm:h-36 sm:w-32"
            posicion="center top"
            indice={3}
            desde="derecha"
            orden={0}
            mouseX={fotoX}
            mouseY={fotoY}
            amplitudReducida={esMovil}
          />
          <FotoFlotante
            className="hidden sm:block sm:right-16 sm:top-1/2 sm:h-64 sm:w-40 sm:-translate-y-1/2"
            posicion="center center"
            indice={4}
            desde="derecha"
            orden={1}
            mouseX={fotoX}
            mouseY={fotoY}
          />
          <FotoFlotante
            className="-right-3 bottom-16 h-20 w-20 -rotate-2 sm:-right-4 sm:bottom-24 sm:h-28 sm:w-36"
            posicion="center bottom"
            indice={5}
            desde="derecha"
            orden={2}
            mouseX={fotoX}
            mouseY={fotoY}
            amplitudReducida={esMovil}
          />

          <div className="relative z-10 mx-auto max-w-3xl text-center">
            <motion.h1
              className="mx-auto font-sans text-3xl font-extrabold leading-[1.15] text-blanco sm:text-5xl lg:text-6xl"
              initial="oculto"
              animate="visible"
              variants={prefiereReducido ? { oculto: {}, visible: {} } : contenedorStagger(0.06)}
            >
              <motion.span className="inline-block" variants={prefiereReducido ? fadeSoloVariants : fadeSubeVariants}>
                {TITULO_LINEA_1}
              </motion.span>
              <br />
              {TITULO_LINEA_2.map((palabra) => (
                <motion.span
                  key={palabra}
                  className={`inline-block ${palabra === 'corazón' ? 'text-oro-brillante' : ''}`}
                  variants={prefiereReducido ? fadeSoloVariants : fadeSubeVariants}
                >
                  {palabra}&nbsp;
                </motion.span>
              ))}
            </motion.h1>

            <motion.p
              className="mx-auto mt-6 max-w-md text-base text-marfil/70"
              initial={prefiereReducido ? false : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.55, ease: 'easeOut' }}
            >
              Somos una inmobiliaria boutique: conocemos cada calle de Polanco y
              acompañamos de cerca cada decisión, con una selección curada de
              propiedades, no un catálogo interminable.
            </motion.p>
          </div>

          <motion.div
            className="relative z-10 mt-10 flex justify-center"
            initial={prefiereReducido ? false : { opacity: 0, y: 24, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ type: 'spring', stiffness: 280, damping: 16, delay: 0.65 }}
          >
            <SearchTabs />
          </motion.div>

          <motion.div
            className="absolute inset-x-4 bottom-0 z-20 translate-y-1/2 sm:inset-x-10 lg:inset-x-16"
            initial={prefiereReducido ? false : { opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ type: 'spring', stiffness: 280, damping: 18, delay: 0.75 }}
          >
            <SearchBar />
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
