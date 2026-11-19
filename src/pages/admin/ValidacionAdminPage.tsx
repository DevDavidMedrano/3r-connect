import { useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { AlertTriangle, CheckCircle2, Clock, MessageCircleWarning, ShieldCheck, X } from 'lucide-react'
import { Boton, Chip, EncabezadoPagina, Tarjeta } from '../../components/cliente/Piezas'
import { useDatosAdmin } from '../../components/admin/useDatosAdmin'
import { asesoresDemo } from '../../data/asesoresDemo'
import { propiedadesDemo } from '../../data/propiedadesDemo'
import {
  calcularProgreso,
  evaluarAprobacion,
  type ProgresoExpediente,
} from '../../types/expedienteValidacion'
import {
  documentoVencido,
  etiquetaCategoriaDocumento,
  etiquetaDocumento,
  type CategoriaDocumento,
  type DocumentoExpediente,
  type ProcesoCliente,
} from '../../types/proceso'
import { ID_PROSPECTO_DEMO } from '../../types/prospectoVenta'
import type { CasoValidacion } from '../../types/expedienteValidacion'

// ---------------------------------------------------------------------------
// Un "caso" en este módulo puede venir de tres fuentes: el proceso de compra
// del cliente Demo (procesoCompra), un proceso de publicación de Captación
// (procesosPublicacion — De la Casa/Del Vendedor/Exención de ISR) o un caso
// suelto sin ProcesoCliente propio (casosValidacion). Los tres se leen tal
// cual son en SesionContext — este archivo solo los presenta juntos, nunca
// copia sus documentos a una lista aparte.
// ---------------------------------------------------------------------------

export type FuenteCaso = 'compra' | 'publicacion' | 'caso'

export interface CasoUnificado {
  fuente: FuenteCaso
  id: string
  folio: string
  clienteNombre: string
  asesorId: string | null
  documentos: DocumentoExpediente[]
  fechaInicio: string
  aprobado: boolean
}

// Los procesos de publicación no guardan el nombre del propietario (ver
// types/proceso.ts) — solo para mostrarlo en el listado, no es un dato que
// se use en ningún cálculo.
const PROPIETARIO_POR_FOLIO: Record<string, string> = {
  '3R-114': 'Familia Contreras',
  '3R-117': 'Ricardo Villaseñor',
}

const CATEGORIAS: CategoriaDocumento[] = ['comprador', 'casa', 'vendedor', 'isr']

function diasDesde(fechaISO: string, ahora: Date = new Date()): number {
  return Math.max(0, Math.floor((ahora.getTime() - new Date(fechaISO).getTime()) / 86_400_000))
}

// "Días en revisión" desde que el documento más antiguo todavía pendiente se
// tocó por última vez — no desde que se abrió el expediente completo, que
// exageraría el número en casos que ya llevan meses abiertos por otras
// razones (ver la nota en el mismo lugar en el mensaje del encargo).
export function diasEnRevision(caso: CasoUnificado): number {
  const fechas = caso.documentos
    .filter((d) => d.estado !== 'validado')
    .map((d) => d.fechaActualizacion)
    .filter((f): f is string => Boolean(f))
  if (fechas.length === 0) return diasDesde(caso.fechaInicio)
  const masAntigua = Math.min(...fechas.map((f) => new Date(f).getTime()))
  return diasDesde(new Date(masAntigua).toISOString())
}

// Une los tres orígenes de expediente (compra del cliente Demo, procesos de
// publicación de Captación, casos sueltos) en una sola lista — exportada
// para que el tablero de admin pueda contar "expedientes en revisión" sin
// reconstruir este cruce ni duplicar los datos.
export function construirCasosValidacion(
  procesoCompra: ProcesoCliente,
  procesosPublicacion: ProcesoCliente[],
  casosValidacion: CasoValidacion[],
): CasoUnificado[] {
  const compra: CasoUnificado = {
    fuente: 'compra',
    id: 'demo',
    folio: procesoCompra.folio,
    clienteNombre: 'Demo',
    asesorId: asesoresDemo.find((a) => a.zonasDominio.some((z) => z.toLowerCase().includes('polanco')))?.id ?? null,
    documentos: [...procesoCompra.documentos],
    fechaInicio: procesoCompra.iniciado,
    aprobado: procesoCompra.pasos.find((p) => p.titulo === 'Validación')?.estado === 'completado',
  }
  const publicacion: CasoUnificado[] = procesosPublicacion.map((proceso) => ({
    fuente: 'publicacion',
    id: proceso.folio,
    folio: proceso.folio,
    clienteNombre: PROPIETARIO_POR_FOLIO[proceso.folio] ?? 'Propietario',
    asesorId: null,
    documentos: [...proceso.documentos],
    fechaInicio: proceso.iniciado,
    aprobado: proceso.pasos.find((p) => p.titulo === 'Validación')?.estado === 'completado',
  }))
  const sueltos: CasoUnificado[] = casosValidacion.map((caso) => ({
    fuente: 'caso',
    id: caso.id,
    folio: caso.folio,
    clienteNombre: caso.clienteNombre,
    asesorId: caso.asesorId,
    documentos: caso.documentos,
    fechaInicio: caso.fechaInicio,
    aprobado: caso.estado === 'aprobado',
  }))
  return [compra, ...publicacion, ...sueltos]
}

const FORMATO_FECHA = new Intl.DateTimeFormat('es-MX', { day: 'numeric', month: 'short', year: 'numeric' })

function etiquetaFecha(iso: string): string {
  return FORMATO_FECHA.format(new Date(iso))
}

// ---------------------------------------------------------------------------
// Piezas de UI
// ---------------------------------------------------------------------------

function BarraProgreso({ progreso }: { progreso: ProgresoExpediente }) {
  const pct = (n: number) => (progreso.total > 0 ? (n / progreso.total) * 100 : 0)
  return (
    <div>
      <div className="flex h-1.5 w-full overflow-hidden rounded-full bg-gris-borde">
        <div className="h-full bg-exito" style={{ width: `${pct(progreso.validados)}%` }} />
        <div className="h-full bg-oro" style={{ width: `${pct(progreso.enRevision)}%` }} />
      </div>
      <p className="mt-1 text-[11px] text-texto-suave">
        {progreso.validados} validados · {progreso.enRevision} en revisión · {progreso.faltantes} faltantes
      </p>
    </div>
  )
}

function Overlay({ children, onClose }: { children: ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/50" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="h-full w-full max-w-xl overflow-y-auto bg-blanco shadow-2xl">
        {children}
      </div>
    </div>
  )
}

function TarjetaCaso({ caso, onAbrir }: { caso: CasoUnificado; onAbrir: () => void }) {
  const propiedad = propiedadesDemo.find((p) => p.folio === caso.folio)
  const progreso = calcularProgreso(caso.documentos)
  const dias = diasEnRevision(caso)
  const vencida = dias > 5 && !caso.aprobado
  const asesor = asesoresDemo.find((a) => a.id === caso.asesorId)

  return (
    <button type="button" onClick={onAbrir} className="flex w-full items-center gap-3.5 py-3.5 text-left">
      <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-marfil">
        {propiedad?.medios[0] && <img src={propiedad.medios[0].url} alt={propiedad.medios[0].alt} className="h-full w-full object-cover" />}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate text-sm font-semibold text-texto">{caso.clienteNombre}</p>
          {caso.aprobado && (
            <span className="flex shrink-0 items-center gap-1 text-[11px] font-semibold text-exito">
              <CheckCircle2 size={12} strokeWidth={2.5} /> Aprobado
            </span>
          )}
        </div>
        <p className="truncate text-xs text-texto-suave">
          {caso.folio} · {propiedad?.ubicacion.colonia ?? '—'} {asesor && `· ${asesor.nombre}`}
        </p>
        <div className="mt-2 max-w-xs">
          <BarraProgreso progreso={progreso} />
        </div>
      </div>

      <span
        className={`flex shrink-0 items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${
          vencida ? 'bg-alerta/10 text-alerta' : 'bg-gris-borde text-texto-suave'
        }`}
      >
        <Clock size={12} strokeWidth={2} />
        {dias} d en revisión
      </span>
    </button>
  )
}

function FilaDocumento({
  documento,
  onValidar,
  onRechazar,
  onSolicitar,
  solicitado,
}: {
  documento: DocumentoExpediente
  onValidar: () => void
  onRechazar: () => void
  onSolicitar: () => void
  solicitado: boolean
}) {
  const vencido = documentoVencido(documento)
  const faltante = documento.estado === 'pendiente' || documento.estado === 'rechazado'

  return (
    <div className="group relative flex flex-wrap items-center gap-2.5 border-b border-gris-borde py-3 last:border-b-0">
      <div className="min-w-[160px] flex-1">
        <p className="text-sm text-texto">
          {documento.nombre}
          {documento.opcional && <span className="ml-1.5 text-[10.5px] font-medium text-texto-suave">(opcional)</span>}
        </p>
        {documento.estado === 'rechazado' && documento.motivoRechazo && (
          <p className="mt-0.5 text-xs text-alerta">Motivo: {documento.motivoRechazo}</p>
        )}
      </div>

      {vencido && (
        <span className="flex shrink-0 items-center gap-1 rounded-full bg-alerta/10 px-2.5 py-1 text-[11px] font-semibold text-alerta">
          <AlertTriangle size={11} strokeWidth={2.5} /> Vencido
        </span>
      )}

      <Chip
        variante={
          documento.estado === 'validado' ? 'exito' : documento.estado === 'en_revision' ? 'accion' : documento.estado === 'rechazado' ? 'alerta' : 'espera'
        }
      >
        {etiquetaDocumento(documento.estado)}
      </Chip>

      {documento.estado === 'validado' && documento.validadoPor && (
        <div className="pointer-events-none absolute right-0 top-full z-10 mt-1 hidden w-56 rounded-xl border border-gris-borde bg-blanco p-2.5 text-xs shadow-lg group-hover:block">
          <p className="font-semibold text-texto">{documento.validadoPor}</p>
          <p className="text-texto-suave">{documento.validadoEn ? etiquetaFecha(documento.validadoEn) : '—'}</p>
        </div>
      )}

      <div className="flex shrink-0 items-center gap-1.5">
        {documento.estado !== 'validado' && (
          <button
            type="button"
            onClick={onValidar}
            className="rounded-full border border-gris-borde px-3 py-1 text-xs font-semibold text-exito transition-colors hover:border-exito"
          >
            Validar
          </button>
        )}
        {documento.estado !== 'rechazado' && (
          <button
            type="button"
            onClick={onRechazar}
            className="rounded-full border border-gris-borde px-3 py-1 text-xs font-semibold text-alerta transition-colors hover:border-alerta"
          >
            Rechazar
          </button>
        )}
        {faltante &&
          (solicitado ? (
            <span className="flex items-center gap-1 text-[11px] font-semibold text-exito">
              <CheckCircle2 size={12} strokeWidth={2.5} /> Solicitado
            </span>
          ) : (
            <button
              type="button"
              onClick={onSolicitar}
              className="flex items-center gap-1 rounded-full border border-gris-borde px-3 py-1 text-xs font-semibold text-texto transition-colors hover:border-vino-vivo"
            >
              <MessageCircleWarning size={12} strokeWidth={2} /> Solicitar al cliente
            </button>
          ))}
      </div>
    </div>
  )
}

function ModalRechazo({ documento, onCancelar, onConfirmar }: { documento: DocumentoExpediente; onCancelar: () => void; onConfirmar: (motivo: string) => void }) {
  const [motivo, setMotivo] = useState('')
  return (
    <div className="fixed inset-0 z-[60] bg-black/50 sm:flex sm:items-center sm:justify-center sm:px-4" onClick={onCancelar}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="flex h-full w-full flex-col justify-center bg-blanco p-5 sm:h-auto sm:w-full sm:max-w-md sm:rounded-2xl sm:shadow-2xl"
      >
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-texto">Rechazar documento</h3>
          <button type="button" onClick={onCancelar} aria-label="Cerrar" className="text-texto-suave hover:text-texto">
            <X size={18} strokeWidth={2} />
          </button>
        </div>
        <p className="mt-1 text-sm text-texto-suave">{documento.nombre}</p>
        <label className="mt-3 block">
          <span className="text-xs font-semibold uppercase tracking-wide text-texto-suave">Motivo (se le muestra al cliente)</span>
          <textarea
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
            rows={3}
            placeholder="Ej. La fecha no es legible."
            className="mt-1.5 w-full rounded-3r-md border border-gris-borde px-3.5 py-2.5 text-sm text-texto outline-none focus:border-vino-vivo"
          />
        </label>
        <div className="mt-4 flex justify-end gap-2.5">
          <Boton variante="contorno" onClick={onCancelar}>
            Cancelar
          </Boton>
          <Boton variante="solido" disabled={!motivo.trim()} onClick={() => onConfirmar(motivo.trim())}>
            Rechazar
          </Boton>
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------

export default function ValidacionAdminPage() {
  const {
    usuario,
    procesoCompra,
    actualizarDocumentoProcesoCompra,
    avanzarProcesoCompra,
    procesosPublicacion,
    actualizarDocumentoProcesoPublicacion,
    avanzarPasoPublicacion,
    casosValidacion,
    actualizarDocumentoCasoValidacion,
    aprobarCasoValidacion,
    conversaciones,
    enviarMensajeInbox,
    registrarBitacora,
  } = useDatosAdmin()

  const [detalleId, setDetalleId] = useState<string | null>(null)
  const [rechazando, setRechazando] = useState<DocumentoExpediente | null>(null)
  const [solicitados, setSolicitados] = useState<string[]>([])

  const actor = usuario?.nombre ?? 'Sistema'

  const casos: CasoUnificado[] = useMemo(
    () => construirCasosValidacion(procesoCompra, procesosPublicacion, casosValidacion),
    [procesoCompra, procesosPublicacion, casosValidacion],
  )

  const totalPendientes = casos.filter((c) => !c.aprobado).length
  const totalVencidos = casos.filter((c) => diasEnRevision(c) > 5 && !c.aprobado).length
  const totalAprobados = casos.filter((c) => c.aprobado).length

  const caso = casos.find((c) => c.id === detalleId) ?? null

  function actualizarDocumento(destino: CasoUnificado, documentoId: string, cambios: Partial<DocumentoExpediente>) {
    if (destino.fuente === 'compra') actualizarDocumentoProcesoCompra(documentoId, cambios)
    else if (destino.fuente === 'publicacion') actualizarDocumentoProcesoPublicacion(destino.folio, documentoId, cambios)
    else actualizarDocumentoCasoValidacion(destino.id, documentoId, cambios)
  }

  function validar(destino: CasoUnificado, documento: DocumentoExpediente) {
    actualizarDocumento(destino, documento.id, {
      estado: 'validado',
      validadoPor: actor,
      validadoEn: new Date().toISOString(),
      motivoRechazo: undefined,
    })
    registrarBitacora({ actor, accion: 'validó un documento', detalle: `${documento.nombre} · ${destino.clienteNombre} (${destino.folio})` })

    // De la Casa + Del Vendedor completos y sin escrituración de por medio
    // (procesos de publicación): el paso 'Documentación' de Captación se
    // completa solo, sin que el admin tenga que ir a esa pantalla aparte.
    if (destino.fuente === 'publicacion') {
      const documentosActualizados = destino.documentos.map((d) => (d.id === documento.id ? { ...d, estado: 'validado' as const } : d))
      const relevantes = documentosActualizados.filter((d) => d.categoria === 'casa' || d.categoria === 'vendedor')
      if (relevantes.every((d) => d.opcional || d.estado === 'validado')) {
        avanzarPasoPublicacion(destino.folio, 'Documentación')
      }
    }
  }

  function confirmarRechazo(destino: CasoUnificado, documento: DocumentoExpediente, motivo: string) {
    actualizarDocumento(destino, documento.id, {
      estado: 'rechazado',
      motivoRechazo: motivo,
      fechaActualizacion: new Date().toISOString().slice(0, 10),
    })
    registrarBitacora({
      actor,
      accion: 'rechazó un documento',
      detalle: `${documento.nombre} · ${destino.clienteNombre} (${destino.folio}) — ${motivo}`,
    })
    setRechazando(null)
  }

  function solicitarAlCliente(destino: CasoUnificado, documento: DocumentoExpediente) {
    if (destino.fuente === 'compra') {
      const conversacion = conversaciones.find((c) => c.prospectoVentaId === ID_PROSPECTO_DEMO)
      if (conversacion) {
        enviarMensajeInbox(conversacion.id, `Nos falta tu "${documento.nombre}" para continuar con tu expediente. ¿Nos lo puedes compartir?`)
      }
    }
    registrarBitacora({
      actor,
      accion: 'solicitó un documento al cliente',
      detalle: `${documento.nombre} · ${destino.clienteNombre} (${destino.folio})`,
    })
    setSolicitados((actual) => [...actual, documento.id])
  }

  function aprobarExpediente(destino: CasoUnificado) {
    if (destino.fuente === 'compra') avanzarProcesoCompra()
    else if (destino.fuente === 'caso') aprobarCasoValidacion(destino.id)
    else avanzarPasoPublicacion(destino.folio, 'Validación')
    registrarBitacora({ actor, accion: 'aprobó un expediente', detalle: `${destino.clienteNombre} (${destino.folio})` })
    setDetalleId(null)
  }

  const evaluacion = caso ? evaluarAprobacion(caso.documentos) : null

  return (
    <div className="space-y-5">
      <EncabezadoPagina titulo="Confianza y Validación" descripcion="Expedientes de compradores, vendedores y propiedades, en un solo lugar." />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Tarjeta className="flex items-center gap-3.5">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-vino-vivo/10 text-vino-vivo">
            <ShieldCheck size={20} strokeWidth={1.75} />
          </span>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-texto-suave">En revisión</p>
            <p className="mt-0.5 font-serif text-xl font-bold text-texto">{totalPendientes}</p>
          </div>
        </Tarjeta>
        <Tarjeta className={`flex items-center gap-3.5 ${totalVencidos > 0 ? 'border border-alerta/30' : ''}`}>
          <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${totalVencidos > 0 ? 'bg-alerta/10 text-alerta' : 'bg-oro/15 text-oro-oscuro'}`}>
            <AlertTriangle size={20} strokeWidth={1.75} />
          </span>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-texto-suave">Más de 5 días en revisión</p>
            <p className="mt-0.5 font-serif text-xl font-bold text-texto">{totalVencidos}</p>
          </div>
        </Tarjeta>
        <Tarjeta className="flex items-center gap-3.5">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-exito/10 text-exito">
            <CheckCircle2 size={20} strokeWidth={1.75} />
          </span>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-texto-suave">Aprobados</p>
            <p className="mt-0.5 font-serif text-xl font-bold text-texto">{totalAprobados}</p>
          </div>
        </Tarjeta>
      </div>

      <Tarjeta>
        <h2 className="text-base font-bold text-texto">Expedientes</h2>
        <div className="mt-1 divide-y divide-gris-borde">
          {casos.map((c) => (
            <TarjetaCaso key={c.id} caso={c} onAbrir={() => setDetalleId(c.id)} />
          ))}
        </div>
      </Tarjeta>

      {caso && (
        <Overlay onClose={() => setDetalleId(null)}>
          <div className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-texto">{caso.clienteNombre}</h2>
                <p className="text-xs text-texto-suave">
                  {caso.folio} · {propiedadesDemo.find((p) => p.folio === caso.folio)?.ubicacion.colonia}
                </p>
              </div>
              <button type="button" onClick={() => setDetalleId(null)} aria-label="Cerrar" className="text-texto-suave hover:text-texto">
                <X size={20} strokeWidth={2} />
              </button>
            </div>

            <div className="mt-4">
              <BarraProgreso progreso={calcularProgreso(caso.documentos)} />
            </div>

            <div className="mt-6 space-y-6">
              {CATEGORIAS.map((categoria) => {
                const documentos = caso.documentos.filter((d) => d.categoria === categoria)
                return (
                  <div key={categoria}>
                    <h3 className="text-sm font-bold text-texto">{etiquetaCategoriaDocumento(categoria)}</h3>
                    {documentos.length === 0 ? (
                      <p className="mt-1.5 text-xs text-texto-suave">No aplica para este caso.</p>
                    ) : (
                      <div className="mt-1">
                        {documentos.map((documento) => (
                          <FilaDocumento
                            key={documento.id}
                            documento={documento}
                            solicitado={solicitados.includes(documento.id)}
                            onValidar={() => validar(caso, documento)}
                            onRechazar={() => setRechazando(documento)}
                            onSolicitar={() => solicitarAlCliente(caso, documento)}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            <div className="sticky bottom-0 mt-6 -mx-5 border-t border-gris-borde bg-blanco px-5 py-4">
              {evaluacion && !evaluacion.puedeAprobar && <p className="mb-2.5 text-xs font-medium text-alerta">{evaluacion.razon}</p>}
              {caso.aprobado ? (
                <p className="flex items-center gap-1.5 text-sm font-semibold text-exito">
                  <CheckCircle2 size={16} strokeWidth={2.5} /> Expediente aprobado
                </p>
              ) : (
                <Boton variante="solido" disabled={!evaluacion?.puedeAprobar} onClick={() => aprobarExpediente(caso)} className="w-full">
                  Aprobar expediente
                </Boton>
              )}
            </div>
          </div>
        </Overlay>
      )}

      {rechazando && caso && (
        <ModalRechazo documento={rechazando} onCancelar={() => setRechazando(null)} onConfirmar={(motivo) => confirmarRechazo(caso, rechazando, motivo)} />
      )}
    </div>
  )
}
