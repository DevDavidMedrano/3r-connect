import { ChevronDown } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'

// Piezas de UI compartidas por todo el módulo de cliente — nada de estilos
// sueltos repetidos entre páginas, todo pasa por aquí.

export type VarianteChip = 'exito' | 'accion' | 'espera' | 'alerta' | 'vino'

// 'accion' es "te toca a ti / en curso" — dorado, no coral (coral quedó
// solo para alertas puntuales fuera de estos chips). 'vino' se quedó con
// ese nombre por compatibilidad con quien ya lo usa, pero el color de marca
// ahora es onix, no vino.
const ESTILOS_CHIP: Record<VarianteChip, string> = {
  exito: 'bg-exito/10 text-exito',
  accion: 'bg-oro/15 text-oro-oscuro',
  espera: 'bg-gris-borde text-texto-suave',
  alerta: 'bg-alerta/10 text-alerta',
  vino: 'bg-onix/10 text-onix',
}

interface ChipProps {
  variante: VarianteChip
  children: ReactNode
  className?: string
}

export function Chip({ variante, children, className = '' }: ChipProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${ESTILOS_CHIP[variante]} ${className}`}
    >
      {children}
    </span>
  )
}

interface TarjetaProps {
  children: ReactNode
  tono?: 'blanco' | 'marfil'
  className?: string
}

// rosa-suave (#f2a08c) es un acento puntual, nunca fondo de tarjeta — se
// ve como un salmón saturado si se usa en un área grande.
export function Tarjeta({ children, tono = 'blanco', className = '' }: TarjetaProps) {
  const fondo = tono === 'marfil' ? 'bg-marfil' : 'bg-blanco'
  return <div className={`rounded-3r-lg ${fondo} p-5 shadow-sm ${className}`}>{children}</div>
}

interface EncabezadoPaginaProps {
  titulo: ReactNode
  descripcion?: string
  accion?: ReactNode
}

export function EncabezadoPagina({ titulo, descripcion, accion }: EncabezadoPaginaProps) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold text-texto sm:text-3xl">{titulo}</h1>
        {descripcion && <p className="mt-1 text-sm text-texto-suave">{descripcion}</p>}
      </div>
      {accion && <div className="shrink-0">{accion}</div>}
    </div>
  )
}

type BotonVariante = 'solido' | 'contorno'

// Onix, no vino — mismo botón en /mi-cuenta y en /admin (ver la nota al
// final de SidebarAdmin/SidebarCliente): si alguno de los dos se ve
// distinto es porque no está pasando por aquí.
const ESTILOS_BOTON: Record<BotonVariante, string> = {
  solido: 'bg-onix text-blanco hover:bg-carbon',
  contorno: 'border border-gris-borde text-texto hover:border-onix hover:text-onix',
}

interface BotonProps {
  children: ReactNode
  variante?: BotonVariante
  to?: string
  type?: 'button' | 'submit'
  onClick?: () => void
  disabled?: boolean
  className?: string
}

// Un solo componente para los dos casos de uso: si trae `to` navega (Link),
// si no, es un <button> normal. Evita repetir las mismas clases de pill en
// cada página que necesita una acción primaria o secundaria.
export function Boton({ children, variante = 'solido', to, type = 'button', onClick, disabled, className = '' }: BotonProps) {
  const clases = `inline-flex items-center justify-center gap-2 rounded-3r-md px-4 py-2.5 text-sm font-semibold transition-colors disabled:cursor-default disabled:opacity-50 ${ESTILOS_BOTON[variante]} ${className}`

  if (to) {
    return (
      <Link to={to} className={clases}>
        {children}
      </Link>
    )
  }

  return (
    <button type={type} onClick={onClick} disabled={disabled} className={clases}>
      {children}
    </button>
  )
}

interface FilaProps {
  titulo: string
  descripcion?: string
  icono?: LucideIcon
  meta?: ReactNode
  className?: string
}

// Renglón genérico para listas (documentos, movimientos, visitas): icono a
// la izquierda, título + descripción al centro, algo (chip, monto) a la
// derecha. Sin bordes redondeados propios — vive dentro de una Tarjeta.
export function Fila({ titulo, descripcion, icono: Icono, meta, className = '' }: FilaProps) {
  return (
    <div className={`flex items-center gap-3 border-b border-gris-borde py-3 last:border-b-0 ${className}`}>
      {Icono && (
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-marfil text-onix">
          <Icono size={16} strokeWidth={1.75} />
        </span>
      )}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-texto">{titulo}</p>
        {descripcion && <p className="truncate text-xs text-texto-suave">{descripcion}</p>}
      </div>
      {meta && <div className="shrink-0">{meta}</div>}
    </div>
  )
}

interface TarjetaMetricaProps {
  etiqueta: string
  valor: ReactNode
  detalle: ReactNode
  // Cuadro gris redondeado a la izquierda del título — opcional para no
  // romper páginas viejas que todavía llaman a esta pieza sin ícono.
  icono?: LucideIcon
  // 'invertida' rompe el ritmo en negro (la tarjeta más importante de la
  // fila) — la usan tanto /admin (Vistas este mes) como /mi-cuenta (Paso
  // actual): mismo componente, mismo aspecto.
  variante?: 'normal' | 'invertida'
  // Slot para algo chico junto al ícono, arriba a la derecha — hoy solo lo
  // usa el tablero admin para su mini gráfica de tendencia.
  graficaSecundaria?: ReactNode
}

// Tarjeta de KPI para la fila de métricas del tablero: etiqueta chica,
// valor grande en serif, detalle abajo. Compartida por /mi-cuenta y por
// /admin — deben verse idénticos; si no, es un bug en quien la llama, no en
// esta pieza.
export function TarjetaMetrica({ etiqueta, valor, detalle, icono: Icono, variante = 'normal', graficaSecundaria }: TarjetaMetricaProps) {
  if (variante === 'invertida') {
    return (
      <div className="rounded-3r-lg bg-onix p-5 text-blanco shadow-sm">
        <div className="flex items-start justify-between gap-3">
          {Icono && (
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blanco/10">
              <Icono size={18} strokeWidth={1.6} />
            </span>
          )}
          {graficaSecundaria}
        </div>
        <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-blanco/60">{etiqueta}</p>
        <p className="mt-1 font-serif text-2xl font-bold leading-tight text-blanco">{valor}</p>
        <div className="mt-1 text-xs text-blanco/70">{detalle}</div>
      </div>
    )
  }

  return (
    <Tarjeta className={Icono ? 'flex items-start gap-3' : ''}>
      {Icono && (
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#f0f0f2] text-onix">
          <Icono size={18} strokeWidth={1.6} />
        </span>
      )}
      <div className={Icono ? 'min-w-0 flex-1' : ''}>
        <p className="text-xs font-semibold uppercase tracking-wide text-texto-suave">{etiqueta}</p>
        <p className="mt-1.5 font-serif text-2xl font-bold leading-tight text-texto">{valor}</p>
        <div className="mt-1 text-xs text-texto-suave">{detalle}</div>
      </div>
    </Tarjeta>
  )
}

// Fila de 4 tarjetas de métrica: carrusel horizontal con snap en móvil (nunca
// apiladas — eso empuja todo lo demás fuera de la pantalla), 2 columnas en
// tablet, 4 en escritorio. Cada hijo se envuelve para el ancho/snap del
// carrusel sin que TarjetaMetrica necesite saberlo.
export function FilaMetricas({ children }: { children: ReactNode }) {
  return (
    <div className="-mx-3 flex snap-x snap-mandatory gap-4 overflow-x-auto px-3 pb-1 sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 sm:pb-0 lg:grid-cols-4">
      {Array.isArray(children)
        ? children.map((hijo, indice) => (
            <div key={indice} className="w-[78%] shrink-0 snap-start sm:w-auto sm:shrink">
              {hijo}
            </div>
          ))
        : children}
    </div>
  )
}

// Fila de tabla convertida en tarjeta para móvil — las tablas con scroll
// horizontal son el problema que esto evita (ver el encargo de responsive):
// `resumen` son las 3-4 columnas esenciales, siempre visibles; `detalle` es
// el resto, se despliega al tocar. Se usa junto a un <table> normal que se
// oculta en móvil (`hidden sm:block`) — mismos datos, dos presentaciones.
export function TarjetaFilaExpandible({ resumen, detalle }: { resumen: ReactNode; detalle?: ReactNode }) {
  const [abierto, setAbierto] = useState(false)

  return (
    <div className="rounded-xl border border-gris-borde bg-blanco">
      <button
        type="button"
        onClick={() => detalle && setAbierto((v) => !v)}
        className="flex min-h-11 w-full items-center gap-2.5 p-3.5 text-left"
      >
        <div className="min-w-0 flex-1">{resumen}</div>
        {detalle && (
          <ChevronDown size={16} strokeWidth={2} className={`shrink-0 text-texto-suave transition-transform ${abierto ? 'rotate-180' : ''}`} />
        )}
      </button>
      {abierto && detalle && <div className="space-y-2 border-t border-gris-borde p-3.5">{detalle}</div>}
    </div>
  )
}

interface EncabezadoTarjetaProps {
  titulo: string
  subtitulo?: string
  accion?: ReactNode
}

// Cabecera con línea divisoria, sangrada hasta el borde de la Tarjeta que
// la contiene (cancela su padding con -mx-5/-mt-5 y lo repone con px-5).
// Para usarla, la Tarjeta debe envolverla directo (o con un wrapper sin
// padding propio) — el sangrado asume el p-5 de Tarjeta.
export function EncabezadoTarjeta({ titulo, subtitulo, accion }: EncabezadoTarjetaProps) {
  return (
    <div className="-mx-5 -mt-5 mb-4 flex items-center justify-between gap-3 border-b border-gris-borde px-5 py-4">
      <div className="min-w-0">
        <h2 className="text-[14.5px] font-bold text-texto">{titulo}</h2>
        {subtitulo && <p className="mt-0.5 text-xs text-texto-suave">{subtitulo}</p>}
      </div>
      {accion && <div className="shrink-0">{accion}</div>}
    </div>
  )
}
