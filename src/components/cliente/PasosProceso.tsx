import { useState } from 'react'
import { Check } from 'lucide-react'
import { StaggerContainer, StaggerItem } from '../motion/StaggerReveal'
import { etiquetaResponsable, pasoActual, pasosCompletados } from '../../types/proceso'
import type { PasoProceso, ProcesoCliente } from '../../types/proceso'
import { Chip } from './Piezas'
import type { VarianteChip } from './Piezas'

// El stepper — usado tal cual por /mi-cuenta/proceso, el tablero de cliente
// y el tablero admin (captación). Círculos negros con línea vertical
// conectora, un chip de "depende de" y el estado en texto debajo de cada
// paso — no solo en el actual, en los tres estados. En móvil "Depende de"
// se mueve junto al estado (sin columna derecha, no hay ancho para eso) y
// la descripción se recorta a 2 líneas con un "Ver más".

function varianteDependeDe(paso: PasoProceso): VarianteChip {
  if (paso.estado === 'completado') return 'exito'
  if (paso.responsable === 'cliente' || paso.responsable === 'ambos') return 'accion'
  return 'espera'
}

function etiquetaEstadoPaso(paso: PasoProceso): string {
  if (paso.estado === 'completado') return `Completado el ${paso.fechaCompletado}`
  if (paso.estado === 'actual') return 'En progreso'
  return 'Pendiente'
}

function MarcaPaso({ paso, esUltimo }: { paso: PasoProceso; esUltimo: boolean }) {
  const circulo = 'flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold'
  return (
    <div className="flex flex-col items-center">
      {paso.estado === 'completado' ? (
        <span className={`${circulo} bg-onix text-blanco`}>
          <Check size={16} strokeWidth={3} />
        </span>
      ) : paso.estado === 'actual' ? (
        <span className={`${circulo} bg-onix text-blanco`}>{paso.orden}</span>
      ) : (
        <span className={`${circulo} border border-gris-borde bg-blanco text-texto-suave`}>{paso.orden}</span>
      )}
      {!esUltimo && <div className={`mt-1 w-[2px] flex-1 ${paso.estado === 'completado' ? 'bg-onix' : 'bg-gris-borde'}`} />}
    </div>
  )
}

function FilaPaso({ paso, esUltimo }: { paso: PasoProceso; esUltimo: boolean }) {
  const [expandido, setExpandido] = useState(false)
  const chip = <Chip variante={varianteDependeDe(paso)}>{etiquetaResponsable(paso.responsable)}</Chip>

  return (
    <div className="flex gap-3.5">
      <MarcaPaso paso={paso} esUltimo={esUltimo} />

      <div className={`min-w-0 flex-1 ${esUltimo ? '' : 'pb-5'}`}>
        <div className="sm:flex sm:flex-wrap sm:items-start sm:justify-between sm:gap-3">
          <div className="min-w-0">
            <p className={`text-[13.5px] font-semibold ${paso.estado === 'pendiente' ? 'text-texto-suave' : 'text-texto'}`}>{paso.titulo}</p>
            <p className={`mt-0.5 text-xs leading-relaxed text-texto-suave sm:line-clamp-none ${expandido ? '' : 'line-clamp-2'}`}>
              {paso.descripcion}
            </p>
            {paso.descripcion.length > 60 && (
              <button
                type="button"
                onClick={() => setExpandido((v) => !v)}
                className="mt-0.5 min-h-[22px] text-[11px] font-semibold text-onix underline sm:hidden"
              >
                {expandido ? 'Ver menos' : 'Ver más'}
              </button>
            )}

            {/* Móvil: estado + "depende de" en la misma línea, sin columna
                aparte. Desde tablet (sm:) este chip se oculta — la columna
                derecha de abajo toma su lugar. */}
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <p
                className={`text-xs font-semibold ${
                  paso.estado === 'completado' ? 'text-exito' : paso.estado === 'actual' ? 'text-onix' : 'text-texto-suave'
                }`}
              >
                {etiquetaEstadoPaso(paso)}
              </p>
              <span className="sm:hidden">{chip}</span>
            </div>
          </div>

          <div className="mt-2 hidden shrink-0 flex-col items-end gap-1 sm:mt-0 sm:flex">
            <p className="text-[10.5px] font-semibold uppercase tracking-wide text-texto-suave">Depende de</p>
            {chip}
          </div>
        </div>
      </div>
    </div>
  )
}

interface PasosProcesoProps {
  pasos: readonly PasoProceso[]
}

export function PasosProceso({ pasos }: PasosProcesoProps) {
  return (
    <StaggerContainer disparador="montaje">
      {pasos.map((paso, indice) => (
        <StaggerItem key={paso.orden}>
          <FilaPaso paso={paso} esUltimo={indice === pasos.length - 1} />
        </StaggerItem>
      ))}
    </StaggerContainer>
  )
}

interface AvanceProcesoProps {
  proceso: ProcesoCliente
}

// Versión compacta: una barra de avance + de quién depende el paso actual,
// sin desplegar los pasos completos. Sin uso hoy en el tablero (la tarjeta
// de métrica "Paso actual" ya cubre ese resumen), se deja disponible por si
// alguna otra pantalla la necesita.
export function AvanceProceso({ proceso }: AvanceProcesoProps) {
  const completados = pasosCompletados(proceso)
  const actual = pasoActual(proceso)
  const porcentaje = Math.round((completados.length / proceso.pasos.length) * 100)

  return (
    <div>
      <div className="flex items-center justify-between gap-3 text-sm">
        <p className="font-semibold text-texto">{actual ? actual.titulo : 'Proceso completado'}</p>
        <p className="shrink-0 text-texto-suave">
          {completados.length} de {proceso.pasos.length} pasos
        </p>
      </div>

      <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-gris-borde">
        <div className="h-full rounded-full bg-onix transition-all" style={{ width: `${porcentaje}%` }} />
      </div>

      {actual && (
        <p className="mt-2 text-xs text-texto-suave">
          Depende de <span className="font-semibold text-texto">{etiquetaResponsable(actual.responsable)}</span>
        </p>
      )}
    </div>
  )
}
