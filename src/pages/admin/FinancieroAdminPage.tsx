import { useMemo, useState } from 'react'
import {
  AlertTriangle,
  ArrowDownCircle,
  ArrowUpCircle,
  Calendar,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  TrendingDown,
  TrendingUp,
} from 'lucide-react'
import { Boton, Chip, EncabezadoPagina, Tarjeta, TarjetaFilaExpandible } from '../../components/cliente/Piezas'
import { useDatosAdmin } from '../../components/admin/useDatosAdmin'
import { AvatarAsesor } from '../../components/asesores/AvatarAsesor'
import { useEsMovil } from '../../hooks/useMediaQuery'
import { asesorParaPropiedad, asesoresDemo } from '../../data/asesoresDemo'
import { propiedadesDemo } from '../../data/propiedadesDemo'
import type { Asesor } from '../../types/asesor'
import type { ApartadoMock } from '../../types/apartado'
import {
  PROBABILIDAD_APARTADO,
  PROBABILIDAD_NEGOCIACION,
  TASA_COMISION_VENTA,
  calcularComisionOperacion,
  comisionEsperadaApartado,
  diasEntre,
  esApartadoEnPipeline,
  estadoComision,
  precioComoTexto,
} from '../../types/finanzas'
import type { ProspectoVenta } from '../../types/prospectoVenta'

// ---------------------------------------------------------------------------
// Todo lo que sigue lee prospectosVenta y apartadosMock de useDatosAdmin —
// nada se guarda aparte. Si en la demo un apartado se convierte en venta o
// un prospecto pasa a 'cerrado', el número correcto sale solo en el
// siguiente render: no hay una libreta de comisiones paralela que
// mantener sincronizada.
// ---------------------------------------------------------------------------

export function precioVentaPropiedad(folio: string): number {
  const propiedad = propiedadesDemo.find((p) => p.folio === folio)
  if (!propiedad) return 0
  const listado = propiedad.listados.find((l) => l.operacion === 'venta' || l.operacion === 'preventa')
  return listado ? listado.precio.monto : 0
}

function asesorDeApartado(folio: string): Asesor {
  return asesorParaPropiedad(folio)
}

function formatoCompacto(monto: number): string {
  const signo = monto < 0 ? '-' : ''
  const abs = Math.abs(monto)
  if (abs >= 1_000_000) return `${signo}$${(abs / 1_000_000).toFixed(1)}M`
  if (abs >= 1_000) return `${signo}$${Math.round(abs / 1_000)}K`
  return `${signo}$${Math.round(abs)}`
}

// ---------------------------------------------------------------------------
// Snapshot financiero a un instante dado — pasar `ahora` = fin del mes
// pasado da exactamente los mismos números que hubiera mostrado esta
// pantalla ese día, así "variación contra el mes anterior" compara el
// mismo cálculo en dos momentos, no dos fórmulas distintas.
// ---------------------------------------------------------------------------

export interface Snapshot {
  ingresosMes: number
  porCobrarMonto: number
  porCobrarCount: number
  devengadaMonto: number
  pipeline: number
}

export function snapshotFinanciero(prospectos: ProspectoVenta[], apartados: ApartadoMock[], ahora: Date): Snapshot {
  const inicioMes = new Date(ahora.getFullYear(), ahora.getMonth(), 1)

  const ingresosMes = prospectos
    .filter((p) => p.etapa === 'cerrado' && p.estadoPago === 'cobrado' && p.fechaCobro)
    .filter((p) => {
      const fecha = new Date(p.fechaCobro!)
      return fecha >= inicioMes && fecha <= ahora
    })
    .reduce((suma, p) => suma + calcularComisionOperacion(p).comisionInmobiliaria, 0)

  const pendientes = prospectos.filter(
    (p) => p.etapa === 'cerrado' && p.estadoPago === 'pendiente' && p.fechaCierre && new Date(p.fechaCierre) <= ahora,
  )
  const porCobrarMonto = pendientes.reduce((suma, p) => suma + calcularComisionOperacion(p).comisionInmobiliaria, 0)

  const devengada = prospectos.filter((p) => estadoComision(p) === 'devengada' && p.fechaCierre && new Date(p.fechaCierre) <= ahora)
  const devengadaMonto = devengada.reduce((suma, p) => suma + calcularComisionOperacion(p).comisionAsesor, 0)

  const negociacionVigente = prospectos.filter((p) => p.etapa === 'negociacion' && new Date(p.fecha) <= ahora)
  const pipelineNegociacion = negociacionVigente.reduce(
    (suma, p) => suma + calcularComisionOperacion(p).comisionInmobiliaria * PROBABILIDAD_NEGOCIACION,
    0,
  )
  const pipelineApartados = apartados
    .filter(esApartadoEnPipeline)
    .reduce((suma, a) => suma + comisionEsperadaApartado(precioVentaPropiedad(a.folio), a.estado), 0)

  return {
    ingresosMes,
    porCobrarMonto,
    porCobrarCount: pendientes.length,
    devengadaMonto,
    pipeline: pipelineNegociacion + pipelineApartados,
  }
}

function proximoCorte(hoy: Date): Date {
  const dia = hoy.getDate()
  if (dia < 15) return new Date(hoy.getFullYear(), hoy.getMonth(), 15)
  const finMes = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0)
  if (dia < finMes.getDate()) return finMes
  return new Date(hoy.getFullYear(), hoy.getMonth() + 1, 15)
}

const FORMATO_FECHA_CORTA = new Intl.DateTimeFormat('es-MX', { day: 'numeric', month: 'short' })

// ---------------------------------------------------------------------------
// Pipeline — negociación + apartados activos/por vencer, cada uno con su
// fecha estimada de cierre. Alimenta el Flujo Proyectado a 90 días y la
// línea de proyección de la gráfica: un solo cálculo para las dos cosas.
// ---------------------------------------------------------------------------

export interface ItemPipeline {
  id: string
  descripcion: string
  montoBase: number
  probabilidad: number
  montoEsperado: number
  fechaEstimada: Date
}

export function construirPipeline(prospectos: ProspectoVenta[], apartados: ApartadoMock[]): ItemPipeline[] {
  const items: ItemPipeline[] = []

  for (const p of prospectos) {
    if (p.etapa !== 'negociacion') continue
    const { comisionInmobiliaria } = calcularComisionOperacion(p)
    items.push({
      id: `neg-${p.id}`,
      descripcion: `${p.nombre} · ${p.operacion === 'rentar' ? 'renta' : 'venta'}`,
      montoBase: comisionInmobiliaria,
      probabilidad: PROBABILIDAD_NEGOCIACION,
      montoEsperado: comisionInmobiliaria * PROBABILIDAD_NEGOCIACION,
      fechaEstimada: new Date(new Date(p.ultimoContacto).getTime() + 20 * 86_400_000),
    })
  }

  for (const a of apartados) {
    if (!esApartadoEnPipeline(a)) continue
    const comisionBase = precioVentaPropiedad(a.folio) * TASA_COMISION_VENTA
    const probabilidad = PROBABILIDAD_APARTADO[a.estado]
    items.push({
      id: `apt-${a.id}`,
      descripcion: `${a.clienteNombre} · apartado ${a.folio}`,
      montoBase: comisionBase,
      probabilidad,
      montoEsperado: comisionBase * probabilidad,
      fechaEstimada: new Date(a.fechaVencimiento),
    })
  }

  return items.sort((a, b) => a.fechaEstimada.getTime() - b.fechaEstimada.getTime())
}

function semanaDe(fecha: Date, hoy: Date): number {
  const dias = (fecha.getTime() - hoy.getTime()) / 86_400_000
  return Math.max(1, Math.min(13, Math.ceil(dias / 7) || 1))
}

function etiquetaSemana(numero: number, hoy: Date): string {
  const inicio = new Date(hoy.getTime() + (numero - 1) * 7 * 86_400_000)
  const fin = new Date(inicio.getTime() + 6 * 86_400_000)
  return `Semana ${numero} · ${FORMATO_FECHA_CORTA.format(inicio)} – ${FORMATO_FECHA_CORTA.format(fin)}`
}

// ---------------------------------------------------------------------------
// Gráfica — ingresos vs comisiones por mes, con proyección punteada para
// los meses que faltan del año. SVG a mano: la app no trae una librería de
// gráficas, y esto no necesita una — dos series de 12 barras y una línea.
// ---------------------------------------------------------------------------

export interface DatoMes {
  mes: number
  ingresos: number
  comisiones: number
  venta: number
  renta: number
  apartados: number
  proyeccion: number | null
  esProyeccion: boolean
}

export function construirDatosMes(prospectos: ProspectoVenta[], apartados: ApartadoMock[], pipeline: ItemPipeline[], anio: number): DatoMes[] {
  const hoy = new Date()
  const mesActual = hoy.getFullYear() === anio ? hoy.getMonth() : 11
  const cerrados = prospectos.filter((p) => p.etapa === 'cerrado' && p.fechaCierre && new Date(p.fechaCierre).getFullYear() === anio)

  const base = Array.from({ length: 12 }, (_, mes) => {
    const delMes = cerrados.filter((p) => new Date(p.fechaCierre!).getMonth() === mes)
    const ingresos = delMes.reduce((s, p) => s + calcularComisionOperacion(p).comisionInmobiliaria, 0)
    const comisiones = delMes.reduce((s, p) => s + calcularComisionOperacion(p).comisionAsesor, 0)
    const venta = delMes.filter((p) => p.operacion === 'comprar').reduce((s, p) => s + calcularComisionOperacion(p).comisionInmobiliaria, 0)
    const renta = delMes.filter((p) => p.operacion === 'rentar').reduce((s, p) => s + calcularComisionOperacion(p).comisionInmobiliaria, 0)
    const apartadosMes = apartados
      .filter((a) => esApartadoEnPipeline(a) && new Date(a.fechaVencimiento).getMonth() === mes && new Date(a.fechaVencimiento).getFullYear() === anio)
      .reduce((s, a) => s + comisionEsperadaApartado(precioVentaPropiedad(a.folio), a.estado), 0)
    return { mes, ingresos, comisiones, venta, renta, apartados: apartadosMes, proyeccion: null, esProyeccion: mes > mesActual }
  })

  const mesesTranscurridos = mesActual + 1
  const promedioHistorico = base.slice(0, mesesTranscurridos).reduce((s, d) => s + d.ingresos, 0) / mesesTranscurridos

  return base.map((d) => {
    if (!d.esProyeccion) return d
    const delPipelineEnMes = pipeline
      .filter((item) => item.fechaEstimada.getFullYear() === anio && item.fechaEstimada.getMonth() === d.mes)
      .reduce((s, item) => s + item.montoEsperado, 0)
    return { ...d, proyeccion: promedioHistorico + delPipelineEnMes }
  })
}

const ALTO_SVG = 230
const ANCHO_SVG = 900
const PAD = { arriba: 16, abajo: 26, izquierda: 8, derecha: 8 }
const ANCHO_UTIL = ANCHO_SVG - PAD.izquierda - PAD.derecha
const ALTO_UTIL = ALTO_SVG - PAD.arriba - PAD.abajo
const ANCHO_MES = ANCHO_UTIL / 12
const NOMBRES_MES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']

export function GraficaFinanciera({ datosMes, acumulado }: { datosMes: DatoMes[]; acumulado: boolean }) {
  const [hoverMes, setHoverMes] = useState<number | null>(null)
  const esMovil = useEsMovil()

  const datosVisibles = useMemo(() => {
    if (!acumulado) return datosMes
    let accIngresos = 0
    let accComisiones = 0
    let accProyeccion = 0
    return datosMes.map((d) => {
      if (!d.esProyeccion) {
        accIngresos += d.ingresos
        accComisiones += d.comisiones
        return { ...d, ingresos: accIngresos, comisiones: accComisiones, proyeccion: null }
      }
      accProyeccion += d.proyeccion ?? 0
      return { ...d, ingresos: accIngresos, comisiones: accComisiones, proyeccion: accIngresos + accProyeccion }
    })
  }, [datosMes, acumulado])

  const maxValor = Math.max(1, ...datosVisibles.flatMap((d) => [d.ingresos, d.comisiones, d.proyeccion ?? 0]))
  const alturaBarra = (valor: number) => (valor / maxValor) * ALTO_UTIL
  const yTope = (valor: number) => PAD.arriba + ALTO_UTIL - alturaBarra(valor)
  const xCentro = (mes: number) => PAD.izquierda + ANCHO_MES * mes + ANCHO_MES / 2

  const primerReal = datosVisibles.findIndex((d) => d.esProyeccion) - 1
  const puntosProyeccion = datosVisibles
    .map((d, mes) => (d.esProyeccion && d.proyeccion !== null ? `${xCentro(mes)},${yTope(d.proyeccion)}` : null))
    .filter(Boolean) as string[]
  const inicioLinea = primerReal >= 0 ? `${xCentro(primerReal)},${yTope(datosVisibles[primerReal].ingresos)}` : null
  const rutaProyeccion = inicioLinea ? `M ${inicioLinea} L ${puntosProyeccion.join(' L ')}` : null

  const detalle = hoverMes !== null ? datosMes[hoverMes] : null

  return (
    <div className="relative">
      {/* overflow-x-auto propio del recuadro de la gráfica, nunca de la
          página: en móvil el SVG no se encoge por debajo de un ancho
          legible, se recorre con scroll horizontal ahí adentro. */}
      <div className="overflow-x-auto">
      <svg viewBox={`0 0 ${ANCHO_SVG} ${ALTO_SVG}`} className="w-full min-w-[560px]" role="img" aria-label="Ingresos y comisiones por mes">
        {[0.25, 0.5, 0.75, 1].map((frac) => (
          <line
            key={frac}
            x1={PAD.izquierda}
            x2={ANCHO_SVG - PAD.derecha}
            y1={PAD.arriba + ALTO_UTIL * (1 - frac)}
            y2={PAD.arriba + ALTO_UTIL * (1 - frac)}
            stroke="#eaeaea"
            strokeWidth="1"
          />
        ))}

        {datosVisibles.map((d, mes) => (
          <g key={mes}>
            {!d.esProyeccion && (
              <>
                <rect
                  x={xCentro(mes) - ANCHO_MES * 0.16}
                  y={yTope(d.ingresos)}
                  width={ANCHO_MES * 0.14}
                  height={alturaBarra(d.ingresos)}
                  fill="#a81f45"
                  rx="1.5"
                />
                <rect
                  x={xCentro(mes) + ANCHO_MES * 0.02}
                  y={yTope(d.comisiones)}
                  width={ANCHO_MES * 0.14}
                  height={alturaBarra(d.comisiones)}
                  fill="#c9a227"
                  rx="1.5"
                />
              </>
            )}
            {(!esMovil || mes % 2 === 0) && (
              <text x={xCentro(mes)} y={ALTO_SVG - 8} textAnchor="middle" fontSize="10.5" fill="#6b6b6b">
                {NOMBRES_MES[mes]}
              </text>
            )}
            <rect
              x={PAD.izquierda + ANCHO_MES * mes}
              y={PAD.arriba}
              width={ANCHO_MES}
              height={ALTO_UTIL}
              fill="transparent"
              onMouseEnter={() => setHoverMes(mes)}
              onMouseLeave={() => setHoverMes((actual) => (actual === mes ? null : actual))}
              style={{ cursor: 'pointer' }}
            />
            {hoverMes === mes && (
              <line
                x1={xCentro(mes)}
                x2={xCentro(mes)}
                y1={PAD.arriba}
                y2={PAD.arriba + ALTO_UTIL}
                stroke="#c9a227"
                strokeWidth="1"
                strokeDasharray="3 3"
              />
            )}
          </g>
        ))}

        {rutaProyeccion && <path d={rutaProyeccion} fill="none" stroke="#a81f45" strokeWidth="2" strokeDasharray="6 5" opacity="0.65" />}
        {datosVisibles.map(
          (d, mes) =>
            d.esProyeccion &&
            d.proyeccion !== null && <circle key={`p-${mes}`} cx={xCentro(mes)} cy={yTope(d.proyeccion)} r="2.5" fill="#a81f45" opacity="0.65" />,
        )}
      </svg>
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-texto-suave">
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-vino-vivo" /> Ingresos
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-oro" /> Comisiones
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-0.5 w-3.5 rounded-full bg-vino-vivo opacity-65" style={{ borderTop: '2px dashed' }} /> Proyección
        </span>
      </div>

      {detalle && (
        <div className="pointer-events-none absolute right-2 top-2 w-48 rounded-xl border border-gris-borde bg-blanco p-3 text-xs shadow-lg">
          <p className="mb-1.5 font-bold text-texto">{NOMBRES_MES[detalle.mes]} {detalle.esProyeccion ? '(proyectado)' : ''}</p>
          <div className="flex items-center justify-between">
            <span className="text-texto-suave">Ingresos</span>
            <span className="font-semibold text-texto">{formatoCompacto(detalle.ingresos)}</span>
          </div>
          <div className="mt-1 flex items-center justify-between">
            <span className="text-texto-suave">Comisiones</span>
            <span className="font-semibold text-texto">{formatoCompacto(detalle.comisiones)}</span>
          </div>
          <div className="mt-1.5 border-t border-gris-borde pt-1.5">
            <div className="flex items-center justify-between">
              <span className="text-texto-suave">De venta</span>
              <span className="text-texto">{formatoCompacto(detalle.venta)}</span>
            </div>
            <div className="mt-1 flex items-center justify-between">
              <span className="text-texto-suave">De renta</span>
              <span className="text-texto">{formatoCompacto(detalle.renta)}</span>
            </div>
            <div className="mt-1 flex items-center justify-between">
              <span className="text-texto-suave">De apartados</span>
              <span className="text-texto">{formatoCompacto(detalle.apartados)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Piezas de UI
// ---------------------------------------------------------------------------

function Delta({ actual, anterior }: { actual: number; anterior: number }) {
  if (anterior <= 0) return <span className="text-[11px] font-medium text-texto-suave">Sin datos previos</span>
  const cambio = ((actual - anterior) / anterior) * 100
  const positivo = cambio >= 0
  return (
    <span className={`inline-flex items-center gap-0.5 text-[11px] font-semibold ${positivo ? 'text-exito' : 'text-alerta'}`}>
      {positivo ? <TrendingUp size={11} strokeWidth={2.5} /> : <TrendingDown size={11} strokeWidth={2.5} />}
      {Math.abs(Math.round(cambio))}% vs. mes anterior
    </span>
  )
}

const BUCKETS = [
  { clave: 'al_corriente', etiqueta: 'Al corriente', prueba: (d: number) => d <= 0 },
  { clave: 'd1_30', etiqueta: '1–30 días', prueba: (d: number) => d > 0 && d <= 30 },
  { clave: 'd31_60', etiqueta: '31–60 días', prueba: (d: number) => d > 30 && d <= 60 },
  { clave: 'mas_60', etiqueta: 'Más de 60 días', prueba: (d: number) => d > 60 },
] as const

type ClaveBucket = (typeof BUCKETS)[number]['clave']

function claveBucket(dias: number): ClaveBucket {
  return BUCKETS.find((b) => b.prueba(dias))?.clave ?? 'al_corriente'
}

// ---------------------------------------------------------------------------

export default function FinancieroAdminPage() {
  const { prospectosVenta, apartadosMock } = useDatosAdmin()
  const [vistaGrafica, setVistaGrafica] = useState<'mes' | 'acumulado'>('mes')
  const [seguimientoRegistrado, setSeguimientoRegistrado] = useState<string[]>([])
  const [ordenRentabilidad, setOrdenRentabilidad] = useState<'asc' | 'desc'>('desc')
  const [filtroTipo, setFiltroTipo] = useState<'todos' | 'venta' | 'renta' | 'apartado' | 'comision'>('todos')
  const [filtroEstado, setFiltroEstado] = useState<'todos' | 'pagado' | 'pendiente' | 'vencido'>('todos')

  const hoy = new Date()
  const finMesAnterior = new Date(hoy.getFullYear(), hoy.getMonth(), 0)

  const actual = useMemo(() => snapshotFinanciero(prospectosVenta, apartadosMock, hoy), [prospectosVenta, apartadosMock]) // eslint-disable-line react-hooks/exhaustive-deps
  const anterior = useMemo(() => snapshotFinanciero(prospectosVenta, apartadosMock, finMesAnterior), [prospectosVenta, apartadosMock]) // eslint-disable-line react-hooks/exhaustive-deps

  const pipeline = useMemo(() => construirPipeline(prospectosVenta, apartadosMock), [prospectosVenta, apartadosMock])
  const datosMes = useMemo(() => construirDatosMes(prospectosVenta, apartadosMock, pipeline, hoy.getFullYear()), [prospectosVenta, apartadosMock, pipeline]) // eslint-disable-line react-hooks/exhaustive-deps

  // Flujo proyectado a 90 días — el pipeline agrupado por semana, con
  // acumulado corrido.
  const semanas = useMemo(() => {
    const porSemana = new Map<number, ItemPipeline[]>()
    for (const item of pipeline) {
      const semana = semanaDe(item.fechaEstimada, hoy)
      porSemana.set(semana, [...(porSemana.get(semana) ?? []), item])
    }
    let acumulado = 0
    return Array.from({ length: 13 }, (_, indice) => {
      const numero = indice + 1
      const items = porSemana.get(numero) ?? []
      const subtotal = items.reduce((s, i) => s + i.montoEsperado, 0)
      acumulado += subtotal
      return { numero, items, subtotal, acumulado }
    })
  }, [pipeline, hoy])

  const totalFlujo90Dias = semanas[semanas.length - 1]?.acumulado ?? 0

  // Cuentas por cobrar con antigüedad.
  const cuentasPorCobrar = useMemo(
    () =>
      prospectosVenta
        .filter((p) => p.etapa === 'cerrado' && p.estadoPago === 'pendiente' && p.fechaCierre)
        .map((p) => {
          const dias = diasEntre(p.fechaCierre!)
          return {
            prospecto: p,
            monto: calcularComisionOperacion(p).comisionInmobiliaria,
            dias,
            bucket: claveBucket(dias),
            asesor: asesoresDemo.find((a) => a.id === p.asesorId),
          }
        })
        .sort((a, b) => b.dias - a.dias),
    [prospectosVenta],
  )

  const resumenBuckets = BUCKETS.map((b) => {
    const del = cuentasPorCobrar.filter((c) => c.bucket === b.clave)
    return { ...b, cantidad: del.length, monto: del.reduce((s, c) => s + c.monto, 0) }
  })

  // Desglose de comisiones por asesor.
  const desgloseComisiones = useMemo(
    () =>
      asesoresDemo.map((asesor) => {
        const delAsesor = prospectosVenta.filter((p) => p.asesorId === asesor.id && p.etapa === 'cerrado')
        let provisionada = 0
        let devengada = 0
        let pagada = 0
        for (const p of delAsesor) {
          const { comisionAsesor } = calcularComisionOperacion(p)
          const estado = estadoComision(p)
          if (estado === 'provisionada') provisionada += comisionAsesor
          else if (estado === 'devengada') devengada += comisionAsesor
          else if (estado === 'pagada') pagada += comisionAsesor
        }
        return { asesor, provisionada, devengada, pagada }
      }),
    [prospectosVenta],
  )

  const apartadosPorVencer = apartadosMock.filter((a) => a.estado === 'por_vencer')

  // Rentabilidad por operación.
  const rentabilidad = useMemo(() => {
    const filas = prospectosVenta
      .filter((p) => p.etapa === 'cerrado')
      .map((p) => ({ prospecto: p, asesor: asesoresDemo.find((a) => a.id === p.asesorId), ...calcularComisionOperacion(p) }))
    filas.sort((a, b) => (ordenRentabilidad === 'desc' ? b.margenNeto - a.margenNeto : a.margenNeto - b.margenNeto))
    return filas
  }, [prospectosVenta, ordenRentabilidad])

  // Movimientos recientes.
  const movimientos = useMemo(() => {
    const lista: {
      id: string
      tipo: 'venta' | 'renta' | 'apartado' | 'comision'
      estado: 'pagado' | 'pendiente' | 'vencido'
      monto: number
      fecha: string
      propiedad: string
      asesor: string
      cliente: string
    }[] = []

    for (const p of prospectosVenta.filter((p) => p.etapa === 'cerrado' && p.fechaCierre)) {
      const { comisionInmobiliaria, comisionAsesor } = calcularComisionOperacion(p)
      const asesor = asesoresDemo.find((a) => a.id === p.asesorId)
      const dias = diasEntre(p.fechaCierre!)
      lista.push({
        id: `ing-${p.id}`,
        tipo: p.operacion === 'rentar' ? 'renta' : 'venta',
        estado: p.estadoPago === 'cobrado' ? 'pagado' : dias > 60 ? 'vencido' : 'pendiente',
        monto: comisionInmobiliaria,
        fecha: p.fechaCierre!,
        propiedad: p.zonas[0] ?? '—',
        asesor: asesor?.nombre ?? 'Sin asignar',
        cliente: p.nombre,
      })

      const estado = estadoComision(p)
      if (estado) {
        lista.push({
          id: `com-${p.id}`,
          tipo: 'comision',
          estado: estado === 'pagada' ? 'pagado' : 'pendiente',
          monto: comisionAsesor,
          fecha: p.fechaCierre!,
          propiedad: p.zonas[0] ?? '—',
          asesor: asesor?.nombre ?? 'Sin asignar',
          cliente: p.nombre,
        })
      }
    }

    for (const a of apartadosMock) {
      const asesor = asesorDeApartado(a.folio)
      lista.push({
        id: `apt-${a.id}`,
        tipo: 'apartado',
        estado: a.estado === 'vencido' ? 'vencido' : a.estado === 'convertido' ? 'pagado' : 'pendiente',
        monto: a.anticipoMonto,
        fecha: a.fechaVencimiento,
        propiedad: a.folio,
        asesor: asesor.nombre,
        cliente: a.clienteNombre,
      })
    }

    return lista.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
  }, [prospectosVenta, apartadosMock])

  const movimientosFiltrados = movimientos
    .filter((m) => filtroTipo === 'todos' || m.tipo === filtroTipo)
    .filter((m) => filtroEstado === 'todos' || m.estado === filtroEstado)

  function registrarSeguimiento(id: string) {
    setSeguimientoRegistrado((actual) => [...actual, id])
  }

  return (
    <div className="space-y-5">
      <EncabezadoPagina titulo="Control Financiero" descripcion="No es un resumen: proyecta el pipeline y alerta lo que se está perdiendo." />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Tarjeta>
          <p className="text-xs font-semibold uppercase tracking-wide text-texto-suave">Ingresos del mes</p>
          <p className="mt-2 font-serif text-2xl font-bold text-texto">{formatoCompacto(actual.ingresosMes)}</p>
          <div className="mt-1.5">
            <Delta actual={actual.ingresosMes} anterior={anterior.ingresosMes} />
          </div>
        </Tarjeta>

        <Tarjeta className="border border-oro/30 bg-oro/5">
          <p className="text-xs font-semibold uppercase tracking-wide text-oro-oscuro">Por cobrar</p>
          <p className="mt-2 font-serif text-2xl font-bold text-texto">{formatoCompacto(actual.porCobrarMonto)}</p>
          <p className="mt-1 text-[11px] font-medium text-oro-oscuro">{actual.porCobrarCount} operaciones</p>
        </Tarjeta>

        <Tarjeta>
          <p className="text-xs font-semibold uppercase tracking-wide text-texto-suave">Comisiones por pagar</p>
          <p className="mt-2 font-serif text-2xl font-bold text-texto">{formatoCompacto(actual.devengadaMonto)}</p>
          <p className="mt-1 flex items-center gap-1 text-[11px] font-medium text-texto-suave">
            <Calendar size={11} strokeWidth={2} />
            Próximo corte: {FORMATO_FECHA_CORTA.format(proximoCorte(hoy))}
          </p>
        </Tarjeta>

        <Tarjeta className="border border-vino-vivo/20">
          <p className="text-xs font-semibold uppercase tracking-wide text-vino-vivo">Pipeline proyectado</p>
          <p className="mt-2 font-serif text-2xl font-bold text-texto">{formatoCompacto(actual.pipeline)}</p>
          <div className="mt-1.5">
            <Delta actual={actual.pipeline} anterior={anterior.pipeline} />
          </div>
        </Tarjeta>
      </div>

      <Tarjeta>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-texto">Ingresos vs. comisiones</h2>
            <p className="mt-0.5 text-sm text-texto-suave">{hoy.getFullYear()} · línea punteada = proyección sobre el pipeline y el ritmo histórico.</p>
          </div>
          <div className="flex gap-1 rounded-full border border-gris-borde bg-blanco p-1">
            {(['mes', 'acumulado'] as const).map((opcion) => (
              <button
                key={opcion}
                type="button"
                onClick={() => setVistaGrafica(opcion)}
                className={`rounded-full px-3.5 py-1.5 text-sm font-semibold capitalize transition-colors ${
                  vistaGrafica === opcion ? 'bg-vino-vivo text-blanco' : 'text-texto-suave hover:text-texto'
                }`}
              >
                {opcion === 'mes' ? 'Por mes' : 'Acumulado'}
              </button>
            ))}
          </div>
        </div>
        <div className="mt-4">
          <GraficaFinanciera datosMes={datosMes} acumulado={vistaGrafica === 'acumulado'} />
        </div>
      </Tarjeta>

      <Tarjeta>
        <h2 className="text-base font-bold text-texto">Flujo proyectado a 90 días</h2>
        <p className="mt-0.5 text-sm text-texto-suave">Lo que se espera cobrar, semana por semana, del pipeline en negociación y de los apartados activos.</p>

        <div className="mt-3 max-h-[420px] overflow-y-auto rounded-xl border border-gris-borde">
          {semanas.map((semana) => (
            <div key={semana.numero} className="border-b border-gris-borde last:border-b-0">
              <div className="flex items-center justify-between bg-marfil px-4 py-2">
                <p className="text-xs font-bold text-texto">{etiquetaSemana(semana.numero, hoy)}</p>
                <p className="text-xs font-semibold text-texto-suave">
                  Subtotal: <span className="text-texto">{precioComoTexto(semana.subtotal)}</span>
                </p>
              </div>
              {semana.items.length > 0 ? (
                <div className="divide-y divide-gris-borde px-4">
                  {semana.items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between gap-3 py-2 text-sm">
                      <span className="min-w-0 truncate text-texto">{item.descripcion}</span>
                      <span className="shrink-0 text-xs text-texto-suave">{Math.round(item.probabilidad * 100)}% prob.</span>
                      <span className="shrink-0 font-semibold text-texto">{precioComoTexto(item.montoEsperado)}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="px-4 py-2 text-xs text-texto-suave">Sin operaciones esperadas esta semana.</p>
              )}
            </div>
          ))}
        </div>

        <div className="mt-3 flex items-center justify-between rounded-xl bg-vino-vivo/5 px-4 py-3">
          <p className="text-sm font-bold text-texto">Acumulado a 90 días</p>
          <p className="font-serif text-lg font-bold text-vino-vivo">{precioComoTexto(totalFlujo90Dias)}</p>
        </div>
      </Tarjeta>

      <Tarjeta>
        <h2 className="text-base font-bold text-texto">Cuentas por cobrar con antigüedad</h2>
        <p className="mt-0.5 text-sm text-texto-suave">Comisión facturada al cerrar la operación y todavía no cobrada.</p>

        <div className="mt-3 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
          {resumenBuckets.map((b) => (
            <div key={b.clave} className={`rounded-xl px-3 py-2.5 ${b.clave === 'mas_60' && b.cantidad > 0 ? 'bg-alerta/10' : 'bg-marfil'}`}>
              <p className={`text-[10.5px] font-semibold uppercase tracking-wide ${b.clave === 'mas_60' && b.cantidad > 0 ? 'text-alerta' : 'text-texto-suave'}`}>
                {b.etiqueta}
              </p>
              <p className={`mt-1 font-serif text-lg font-bold ${b.clave === 'mas_60' && b.cantidad > 0 ? 'text-alerta' : 'text-texto'}`}>
                {formatoCompacto(b.monto)}
              </p>
              <p className="text-[11px] text-texto-suave">{b.cantidad} operaciones</p>
            </div>
          ))}
        </div>

        {cuentasPorCobrar.length === 0 ? (
          <p className="mt-4 text-sm text-texto-suave">No hay comisiones pendientes de cobro.</p>
        ) : (
          <div className="mt-4 divide-y divide-gris-borde">
            {cuentasPorCobrar.map((c) => {
              const enAlerta = c.bucket === 'mas_60'
              const registrado = seguimientoRegistrado.includes(c.prospecto.id)
              return (
                <div key={c.prospecto.id} className={`flex flex-wrap items-center gap-3 py-3 ${enAlerta ? 'bg-alerta/5' : ''}`}>
                  {enAlerta && <AlertTriangle size={16} strokeWidth={2} className="shrink-0 text-alerta" />}
                  <div className="min-w-[160px] flex-1">
                    <p className="truncate text-sm font-semibold text-texto">{c.prospecto.nombre}</p>
                    <p className="truncate text-xs text-texto-suave">{c.asesor?.nombre ?? 'Sin asesor'}</p>
                  </div>
                  <Chip variante={enAlerta ? 'alerta' : c.bucket === 'al_corriente' ? 'exito' : 'espera'}>
                    {BUCKETS.find((b) => b.clave === c.bucket)?.etiqueta} · {c.dias}d
                  </Chip>
                  <p className={`shrink-0 font-serif text-sm font-bold ${enAlerta ? 'text-alerta' : 'text-texto'}`}>{precioComoTexto(c.monto)}</p>
                  {registrado ? (
                    <span className="flex shrink-0 items-center gap-1 text-xs font-semibold text-exito">
                      <CheckCircle2 size={14} strokeWidth={2} /> Seguimiento registrado
                    </span>
                  ) : (
                    <Boton variante="contorno" onClick={() => registrarSeguimiento(c.prospecto.id)} className="shrink-0">
                      Registrar seguimiento
                    </Boton>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </Tarjeta>

      <Tarjeta>
        <h2 className="text-base font-bold text-texto">Desglose de comisiones por asesor</h2>
        <p className="mt-0.5 text-sm text-texto-suave">
          Provisionada (cerró, no ha escriturado) · Devengada (ya escrituró, se le debe) · Pagada. La provisionada nunca se paga hasta formalizar.
        </p>

        <div className="mt-3 space-y-2.5 sm:hidden">
          {desgloseComisiones.map((fila) => (
            <TarjetaFilaExpandible
              key={fila.asesor.id}
              resumen={
                <div className="flex items-center gap-2.5">
                  <AvatarAsesor asesor={fila.asesor} className="h-8 w-8 text-[10px]" />
                  <span className="min-w-0 flex-1 truncate font-semibold text-texto">{fila.asesor.nombre}</span>
                  <span className="shrink-0 text-sm font-semibold text-texto">{precioComoTexto(fila.devengada)}</span>
                </div>
              }
              detalle={
                <>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-texto-suave">Provisionada</span>
                    <span className="font-medium text-oro-oscuro">{precioComoTexto(fila.provisionada)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-texto-suave">Devengada</span>
                    <span className="font-semibold text-texto">{precioComoTexto(fila.devengada)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-texto-suave">Pagada</span>
                    <span className="text-exito">{precioComoTexto(fila.pagada)}</span>
                  </div>
                </>
              }
            />
          ))}
        </div>

        <div className="mt-3 hidden overflow-x-auto sm:block">
          <table className="w-full min-w-[560px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-gris-borde text-[10.5px] font-semibold uppercase tracking-wide text-texto-suave">
                <th className="px-3 py-2.5">Asesor</th>
                <th className="px-3 py-2.5">Provisionada</th>
                <th className="px-3 py-2.5">Devengada</th>
                <th className="px-3 py-2.5">Pagada</th>
              </tr>
            </thead>
            <tbody>
              {desgloseComisiones.map((fila) => (
                <tr key={fila.asesor.id} className="border-b border-gris-borde last:border-b-0">
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-2.5">
                      <AvatarAsesor asesor={fila.asesor} className="h-7 w-7 text-[10px]" />
                      <span className="font-semibold text-texto">{fila.asesor.nombre}</span>
                    </div>
                  </td>
                  <td className="px-3 py-3 font-medium text-oro-oscuro">{precioComoTexto(fila.provisionada)}</td>
                  <td className="px-3 py-3 font-semibold text-texto">{precioComoTexto(fila.devengada)}</td>
                  <td className="px-3 py-3 text-exito">{precioComoTexto(fila.pagada)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {apartadosPorVencer.length > 0 && (
          <div className="mt-3 flex items-start gap-2 rounded-3r-md bg-oro/10 px-3.5 py-2.5 text-xs text-oro-oscuro">
            <AlertTriangle size={14} strokeWidth={2} className="mt-0.5 shrink-0" />
            <p>
              {apartadosPorVencer.map((a) => `${a.clienteNombre} (${a.folio})`).join(', ')} — apartado por vencer el{' '}
              {apartadosPorVencer.map((a) => FORMATO_FECHA_CORTA.format(new Date(a.fechaVencimiento))).join(', ')}. Si no se convierte en venta, no
              hay comisión que provisionar: no aparece en esta tabla hasta que cierre de verdad.
            </p>
          </div>
        )}
      </Tarjeta>

      <Tarjeta>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-texto">Rentabilidad por operación</h2>
            <p className="mt-0.5 text-sm text-texto-suave">A veces una renta deja mejor margen que una venta con ticket mayor.</p>
          </div>
          <button
            type="button"
            onClick={() => setOrdenRentabilidad((o) => (o === 'desc' ? 'asc' : 'desc'))}
            className="flex items-center gap-1 rounded-full border border-gris-borde px-3.5 py-1.5 text-xs font-semibold text-texto transition-colors hover:border-vino-vivo"
          >
            Margen {ordenRentabilidad === 'desc' ? <ChevronDown size={13} strokeWidth={2.5} /> : <ChevronUp size={13} strokeWidth={2.5} />}
          </button>
        </div>

        <div className="mt-3 max-h-[420px] space-y-2.5 overflow-y-auto sm:hidden">
          {rentabilidad.map((fila) => (
            <TarjetaFilaExpandible
              key={fila.prospecto.id}
              resumen={
                <div className="flex items-center gap-2.5">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-texto">{fila.prospecto.nombre}</p>
                    <p className="text-xs text-texto-suave">{precioComoTexto(fila.precioFinal)}</p>
                  </div>
                  <Chip variante={fila.prospecto.operacion === 'rentar' ? 'vino' : 'espera'}>
                    {fila.prospecto.operacion === 'rentar' ? 'Renta' : 'Venta'}
                  </Chip>
                  <span className="shrink-0 text-sm font-bold text-exito">{precioComoTexto(fila.margenNeto)}</span>
                </div>
              }
              detalle={
                <>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-texto-suave">Comisión inmobiliaria</span>
                    <span className="text-texto">{precioComoTexto(fila.comisionInmobiliaria)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-texto-suave">Comisión asesor</span>
                    <span className="text-texto">{precioComoTexto(fila.comisionAsesor)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-texto-suave">Margen neto</span>
                    <span className="font-bold text-exito">{precioComoTexto(fila.margenNeto)}</span>
                  </div>
                </>
              }
            />
          ))}
        </div>

        <div className="mt-3 hidden max-h-[420px] overflow-y-auto overflow-x-auto rounded-xl border border-gris-borde sm:block">
          <table className="w-full min-w-[720px] border-collapse text-left text-sm">
            <thead className="sticky top-0 bg-blanco">
              <tr className="border-b border-gris-borde text-[10.5px] font-semibold uppercase tracking-wide text-texto-suave">
                <th className="px-3 py-2.5">Cliente</th>
                <th className="px-3 py-2.5">Operación</th>
                <th className="px-3 py-2.5">Precio</th>
                <th className="px-3 py-2.5">Comisión inmobiliaria</th>
                <th className="px-3 py-2.5">Comisión asesor</th>
                <th className="px-3 py-2.5">Margen neto</th>
              </tr>
            </thead>
            <tbody>
              {rentabilidad.map((fila) => (
                <tr key={fila.prospecto.id} className="border-b border-gris-borde last:border-b-0 hover:bg-marfil/60">
                  <td className="px-3 py-3 text-texto">{fila.prospecto.nombre}</td>
                  <td className="px-3 py-3">
                    <Chip variante={fila.prospecto.operacion === 'rentar' ? 'vino' : 'espera'}>
                      {fila.prospecto.operacion === 'rentar' ? 'Renta' : 'Venta'}
                    </Chip>
                  </td>
                  <td className="px-3 py-3 whitespace-nowrap text-texto-suave">{precioComoTexto(fila.precioFinal)}</td>
                  <td className="px-3 py-3 whitespace-nowrap text-texto-suave">{precioComoTexto(fila.comisionInmobiliaria)}</td>
                  <td className="px-3 py-3 whitespace-nowrap text-texto-suave">{precioComoTexto(fila.comisionAsesor)}</td>
                  <td className="px-3 py-3 whitespace-nowrap font-bold text-exito">{precioComoTexto(fila.margenNeto)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Tarjeta>

      <Tarjeta>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-base font-bold text-texto">Movimientos recientes</h2>
          <div className="flex flex-wrap gap-2">
            <select
              value={filtroTipo}
              onChange={(e) => setFiltroTipo(e.target.value as typeof filtroTipo)}
              className="rounded-full border border-gris-borde bg-blanco px-3.5 py-1.5 text-xs font-medium text-texto outline-none transition-colors hover:border-texto-suave"
            >
              <option value="todos">Todos los tipos</option>
              <option value="venta">Venta</option>
              <option value="renta">Renta</option>
              <option value="apartado">Apartado</option>
              <option value="comision">Comisión</option>
            </select>
            <select
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value as typeof filtroEstado)}
              className="rounded-full border border-gris-borde bg-blanco px-3.5 py-1.5 text-xs font-medium text-texto outline-none transition-colors hover:border-texto-suave"
            >
              <option value="todos">Todos los estados</option>
              <option value="pagado">Pagado</option>
              <option value="pendiente">Pendiente</option>
              <option value="vencido">Vencido</option>
            </select>
          </div>
        </div>

        <p className="mt-1 text-xs text-texto-suave">
          Mostrando {Math.min(30, movimientosFiltrados.length)} de {movimientosFiltrados.length} movimientos.
        </p>

        <div className="mt-3 max-h-[420px] overflow-y-auto divide-y divide-gris-borde">
          {movimientosFiltrados.slice(0, 30).map((m) => (
            <div key={m.id} className="flex flex-wrap items-center gap-3 py-2.5">
              <span
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                  m.tipo === 'comision' ? 'bg-oro/15 text-oro-oscuro' : m.tipo === 'apartado' ? 'bg-vino/10 text-vino' : 'bg-vino-vivo/10 text-vino-vivo'
                }`}
              >
                {m.tipo === 'apartado' ? <ArrowDownCircle size={15} strokeWidth={1.75} /> : <ArrowUpCircle size={15} strokeWidth={1.75} />}
              </span>
              <div className="min-w-[160px] flex-1">
                <p className="truncate text-sm font-semibold text-texto">
                  {m.cliente} <span className="font-normal text-texto-suave">· {m.propiedad}</span>
                </p>
                <p className="truncate text-xs text-texto-suave">{m.asesor}</p>
              </div>
              <Chip variante="espera" className="capitalize">
                {m.tipo}
              </Chip>
              <Chip variante={m.estado === 'pagado' ? 'exito' : m.estado === 'vencido' ? 'alerta' : 'espera'} className="capitalize">
                {m.estado}
              </Chip>
              <p className="shrink-0 whitespace-nowrap text-xs text-texto-suave">{FORMATO_FECHA_CORTA.format(new Date(m.fecha))}</p>
              <p className="w-28 shrink-0 text-right font-semibold text-texto">{precioComoTexto(m.monto)}</p>
            </div>
          ))}
          {movimientosFiltrados.length === 0 && <p className="py-6 text-center text-sm text-texto-suave">Ningún movimiento coincide con los filtros.</p>}
        </div>
      </Tarjeta>
    </div>
  )
}
