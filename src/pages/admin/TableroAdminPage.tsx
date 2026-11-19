import { useState } from 'react'
import {
  AlertTriangle,
  BookmarkCheck,
  Building2,
  Calendar as IconoCalendario,
  CheckCircle2,
  FileCheck2,
  Headset,
  Inbox as IconoInbox,
  TrendingDown,
  TrendingUp,
  Wallet,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { Boton, Chip, EncabezadoTarjeta, FilaMetricas, Tarjeta, TarjetaMetrica } from '../../components/cliente/Piezas'
import { useDatosAdmin } from '../../components/admin/useDatosAdmin'
import { AvatarAsesor } from '../../components/asesores/AvatarAsesor'
import { asesoresDemo } from '../../data/asesoresDemo'
import { propiedadesDemo } from '../../data/propiedadesDemo'
import PanelAsesorPage from './PanelAsesorPage'
import { esperaVencida } from './AsignacionAsesoresAdminPage'
import { GraficaFinanciera, construirDatosMes, construirPipeline, snapshotFinanciero } from './FinancieroAdminPage'
import {
  OPCIONES_PERIODO,
  calcularEmbudo,
  dentroDePeriodo,
  rangoPeriodo,
  type Periodo,
} from './ProductividadAdminPage'
import { construirCasosValidacion, diasEnRevision } from './ValidacionAdminPage'
import { calcularComisionOperacion, diasEntre } from '../../types/finanzas'
import { sinResponder } from '../../types/conversacion'
import { formatearPrecio } from '../../types/propiedad'
import { primerNombreVisible } from '../../lib/nombreUsuario'

function diasHasta(fechaISO: string, ahora: Date = new Date()): number {
  return Math.floor((new Date(fechaISO).getTime() - ahora.getTime()) / 86_400_000)
}

function formatoCompacto(monto: number): string {
  if (monto >= 1_000_000) return `$${(monto / 1_000_000).toFixed(1)}M`
  if (monto >= 1_000) return `$${Math.round(monto / 1_000)}K`
  return `$${Math.round(monto)}`
}

function Delta({ actual, anterior }: { actual: number; anterior: number }) {
  if (anterior <= 0) return <span className="text-[11px] font-medium text-texto-suave">Sin datos previos</span>
  const cambio = ((actual - anterior) / anterior) * 100
  const positivo = cambio >= 0
  return (
    <span className={`inline-flex items-center gap-0.5 text-[11px] font-semibold ${positivo ? 'text-exito' : 'text-alerta'}`}>
      {positivo ? <TrendingUp size={11} strokeWidth={2.5} /> : <TrendingDown size={11} strokeWidth={2.5} />}
      {Math.abs(Math.round(cambio))}% vs. periodo anterior
    </span>
  )
}

interface ItemAtencion {
  icono: typeof AlertTriangle
  etiqueta: string
  valor: number
  detalle?: string
  to: string
}

function FilaAtencion({ item }: { item: ItemAtencion }) {
  const alerta = item.valor > 0
  return (
    <Link
      to={item.to}
      className={`flex items-center gap-3 rounded-xl border px-3.5 py-3 transition-colors ${
        alerta ? 'border-alerta/25 bg-alerta/5 hover:border-alerta/50' : 'border-gris-borde hover:border-onix/30'
      }`}
    >
      <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${alerta ? 'bg-alerta/10 text-alerta' : 'bg-marfil text-onix'}`}>
        <item.icono size={16} strokeWidth={1.75} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-texto">{item.etiqueta}</p>
        {item.detalle && <p className={`text-xs ${alerta ? 'text-alerta' : 'text-texto-suave'}`}>{item.detalle}</p>}
      </div>
      <p className={`shrink-0 font-serif text-xl font-bold ${alerta ? 'text-alerta' : 'text-texto'}`}>{item.valor}</p>
    </Link>
  )
}

// El tablero del admin — el negocio completo. El tablero del asesor (la
// propiedad que tiene en captación, su stepper, lo pendiente de validar)
// vive en PanelAsesorPage.tsx: esta misma ruta (/admin) muestra uno u otro
// según el rol, nunca los dos combinados.
export default function TableroAdminPage() {
  const { usuario, rol, prospectosCaptacion, prospectosVenta, apartadosMock, conversaciones, procesoCompra, procesosPublicacion, casosValidacion } =
    useDatosAdmin()

  const [periodo, setPeriodo] = useState<Periodo>('mes')

  if (rol === 'asesor') return <PanelAsesorPage />

  const nombre = usuario ? primerNombreVisible(usuario) : ''

  const periodoActual = rangoPeriodo(periodo, false)
  const periodoAnterior = rangoPeriodo(periodo, true)

  // ---- 4 métricas principales ---------------------------------------------

  function ingresosEnRango(rango: ReturnType<typeof rangoPeriodo>) {
    return prospectosVenta
      .filter((p) => p.etapa === 'cerrado' && p.estadoPago === 'cobrado' && p.fechaCobro && dentroDePeriodo(p.fechaCobro, rango))
      .reduce((suma, p) => suma + calcularComisionOperacion(p).comisionInmobiliaria, 0)
  }
  function cerradasEnRango(rango: ReturnType<typeof rangoPeriodo>) {
    return prospectosVenta.filter((p) => p.etapa === 'cerrado' && p.fechaCierre && dentroDePeriodo(p.fechaCierre, rango)).length
  }

  const ingresosActual = ingresosEnRango(periodoActual)
  const ingresosAnterior = ingresosEnRango(periodoAnterior)
  const cerradasActual = cerradasEnRango(periodoActual)
  const cerradasAnterior = cerradasEnRango(periodoAnterior)

  const pipelineActual = snapshotFinanciero(prospectosVenta, apartadosMock, new Date()).pipeline
  const pipelineAnterior = snapshotFinanciero(prospectosVenta, apartadosMock, periodoActual.inicio).pipeline

  const propiedadesActivas = propiedadesDemo.filter((p) => p.estado === 'disponible').length
  const propiedadesActivasAnterior = propiedadesDemo.filter(
    (p) => p.estado === 'disponible' && new Date(p.detalles.fechaPublicacion) < periodoActual.inicio,
  ).length

  // ---- Requiere tu atención ------------------------------------------------

  const propiedadesSinAsignar = prospectosCaptacion.filter((p) => !p.asesorId)
  const prospectosSinAsignar = prospectosVenta.filter((p) => !p.asesorId)
  const totalSinAsignar = propiedadesSinAsignar.length + prospectosSinAsignar.length
  const sinAsignarVencidas = [...propiedadesSinAsignar, ...prospectosSinAsignar].filter((p) => esperaVencida(p.fecha)).length

  const casos = construirCasosValidacion(procesoCompra, procesosPublicacion, casosValidacion)
  const expedientesVencidos = casos.filter((c) => !c.aprobado && diasEnRevision(c) > 5).length

  const cuentasVencidas = prospectosVenta.filter(
    (p) => p.etapa === 'cerrado' && p.estadoPago === 'pendiente' && p.fechaCierre && diasEntre(p.fechaCierre) > 60,
  ).length

  const apartadosPorVencerSemana = apartadosMock.filter((a) => {
    if (a.estado !== 'activo' && a.estado !== 'por_vencer') return false
    const dias = diasHasta(a.fechaVencimiento)
    return dias >= 0 && dias <= 7
  }).length

  const conversacionesSinResponder = conversaciones.filter(sinResponder).length

  const itemsAtencion: ItemAtencion[] = [
    {
      icono: Headset,
      etiqueta: 'Propiedades sin asignar',
      valor: totalSinAsignar,
      detalle: sinAsignarVencidas > 0 ? `${sinAsignarVencidas} con más de 24h esperando` : undefined,
      to: '/admin/asignacion-asesores',
    },
    {
      icono: FileCheck2,
      etiqueta: 'Expedientes en revisión +5 días',
      valor: expedientesVencidos,
      to: '/admin/validacion',
    },
    {
      icono: Wallet,
      etiqueta: 'Cuentas por cobrar vencidas',
      valor: cuentasVencidas,
      detalle: cuentasVencidas > 0 ? 'Más de 60 días sin cobrar' : undefined,
      to: '/admin/financiero',
    },
    {
      icono: BookmarkCheck,
      etiqueta: 'Apartados por vencer esta semana',
      valor: apartadosPorVencerSemana,
      to: '/admin/separacion',
    },
    {
      icono: IconoInbox,
      etiqueta: 'Conversaciones sin responder',
      valor: conversacionesSinResponder,
      to: '/admin/inbox',
    },
  ]

  const lineaEstadoPartes: string[] = []
  if (totalSinAsignar > 0) lineaEstadoPartes.push(`${totalSinAsignar} propiedad${totalSinAsignar === 1 ? '' : 'es'} sin asignar`)
  if (expedientesVencidos > 0)
    lineaEstadoPartes.push(`${expedientesVencidos} expediente${expedientesVencidos === 1 ? '' : 's'} lleva${expedientesVencidos === 1 ? '' : 'n'} más de 5 días en revisión`)
  const lineaEstado = lineaEstadoPartes.length > 0 ? `${lineaEstadoPartes.join(' y ')}.` : 'Todo el negocio está al día.'

  // ---- Gráfica de ingresos --------------------------------------------------

  const pipelineItems = construirPipeline(prospectosVenta, apartadosMock)
  const datosMes = construirDatosMes(prospectosVenta, apartadosMock, pipelineItems, new Date().getFullYear())

  // ---- Embudo del negocio ---------------------------------------------------

  const embudoNegocio = calcularEmbudo(prospectosVenta)
  const ETAPAS_EMBUDO: { clave: keyof typeof embudoNegocio; etiqueta: string }[] = [
    { clave: 'leads', etiqueta: 'Leads' },
    { clave: 'contactados', etiqueta: 'Contactados' },
    { clave: 'citas', etiqueta: 'Citas' },
    { clave: 'ofertas', etiqueta: 'Apartados' },
    { clave: 'cerrados', etiqueta: 'Cerrados' },
  ]

  // ---- Ranking de asesores ---------------------------------------------------

  const rankingAsesores = asesoresDemo
    .map((asesor) => {
      const cerrados = prospectosVenta.filter((p) => p.asesorId === asesor.id && p.etapa === 'cerrado')
      const escrituradas = cerrados.filter((p) => p.estadoCierre === 'formalizado').length
      const valorGenerado = cerrados.reduce((suma, p) => suma + calcularComisionOperacion(p).comisionInmobiliaria, 0)
      return { asesor, escrituradas, valorGenerado }
    })
    .sort((a, b) => b.valorGenerado - a.valorGenerado)
    .slice(0, 5)

  // ---- Últimas operaciones ---------------------------------------------------

  const ultimasOperaciones = prospectosVenta
    .filter((p) => p.etapa === 'cerrado' && p.fechaCierre)
    .sort((a, b) => new Date(b.fechaCierre!).getTime() - new Date(a.fechaCierre!).getTime())
    .slice(0, 5)
    .map((p) => ({
      prospecto: p,
      asesor: asesoresDemo.find((a) => a.id === p.asesorId),
      monto: calcularComisionOperacion(p).comisionInmobiliaria,
      cobrada: p.estadoPago === 'cobrado',
    }))

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-texto sm:text-3xl">
            Bienvenido, <strong>{nombre}</strong>.
          </h1>
          <p className={`mt-1 text-sm ${totalSinAsignar > 0 || expedientesVencidos > 0 ? 'text-alerta' : 'text-texto-suave'}`}>{lineaEstado}</p>
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-2.5">
          <div className="flex gap-1 rounded-full border border-gris-borde bg-blanco p-1">
            {OPCIONES_PERIODO.map((opcion) => (
              <button
                key={opcion.valor}
                type="button"
                onClick={() => setPeriodo(opcion.valor)}
                className={`rounded-full px-3.5 py-1.5 text-sm font-semibold transition-colors ${
                  periodo === opcion.valor ? 'bg-onix text-blanco' : 'text-texto-suave hover:text-texto'
                }`}
              >
                {opcion.etiqueta}
              </button>
            ))}
          </div>
          <span className="flex items-center gap-2 rounded-full border border-gris-borde bg-blanco px-4 py-2.5 text-sm text-texto-suave">
            <IconoCalendario size={16} strokeWidth={1.8} />
            {new Intl.DateTimeFormat('es-MX', { day: 'numeric', month: 'long' }).format(new Date())}
          </span>
        </div>
      </div>

      <FilaMetricas>
        <TarjetaMetrica
          icono={Wallet}
          etiqueta="Ingresos del mes"
          valor={formatoCompacto(ingresosActual)}
          detalle={<Delta actual={ingresosActual} anterior={ingresosAnterior} />}
        />
        <TarjetaMetrica
          icono={CheckCircle2}
          etiqueta="Operaciones cerradas"
          valor={String(cerradasActual)}
          detalle={<Delta actual={cerradasActual} anterior={cerradasAnterior} />}
        />
        <TarjetaMetrica
          icono={TrendingUp}
          etiqueta="Pipeline proyectado"
          valor={formatoCompacto(pipelineActual)}
          detalle={<Delta actual={pipelineActual} anterior={pipelineAnterior} />}
        />
        <TarjetaMetrica
          variante="invertida"
          icono={Building2}
          etiqueta="Propiedades activas"
          valor={String(propiedadesActivas)}
          detalle={<Delta actual={propiedadesActivas} anterior={propiedadesActivasAnterior} />}
        />
      </FilaMetricas>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.6fr_1fr]">
        <div className="space-y-4">
          <Tarjeta>
            <EncabezadoTarjeta titulo="Ingresos vs. comisiones" subtitulo="Por mes, con proyección punteada sobre el pipeline." />
            <GraficaFinanciera datosMes={datosMes} acumulado={false} />
          </Tarjeta>

          <Tarjeta>
            <EncabezadoTarjeta titulo="Embudo del negocio" subtitulo="De cada 100 leads, cuántos llegan al siguiente paso." />
            <div className="grid grid-cols-5 gap-2">
              {ETAPAS_EMBUDO.map((etapa, indice) => {
                const valor = embudoNegocio[etapa.clave]
                const anterior = indice > 0 ? embudoNegocio[ETAPAS_EMBUDO[indice - 1].clave] : null
                const pct = anterior !== null && anterior > 0 ? Math.round((valor / anterior) * 100) : null
                return (
                  <div key={etapa.clave} className="rounded-xl bg-marfil px-1.5 py-3 text-center">
                    <p className="text-[9.5px] font-semibold uppercase leading-tight tracking-wide text-texto-suave">{etapa.etiqueta}</p>
                    <p className="mt-1 font-serif text-xl font-bold text-texto">{valor}</p>
                    {pct !== null && <p className="mt-0.5 text-[10.5px] text-texto-suave">{pct}%</p>}
                  </div>
                )
              })}
            </div>
          </Tarjeta>

          <Tarjeta>
            <EncabezadoTarjeta
              titulo="Ranking de asesores"
              subtitulo="Top 5 por valor generado"
              accion={
                <Boton to="/admin/productividad" variante="contorno" className="px-3 py-1.5 text-xs">
                  Ver Productividad
                </Boton>
              }
            />
            <div className="divide-y divide-gris-borde">
              {rankingAsesores.map((fila, indice) => (
                <div key={fila.asesor.id} className="flex items-center gap-3 py-2.5">
                  <span className="w-5 shrink-0 text-center font-serif text-sm font-bold text-texto-suave">{indice + 1}</span>
                  <AvatarAsesor asesor={fila.asesor} className="h-8 w-8 text-xs" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-texto">{fila.asesor.nombre}</p>
                    <p className="text-xs text-texto-suave">{fila.escrituradas} operaciones escrituradas</p>
                  </div>
                  <p className="shrink-0 font-serif text-sm font-bold text-texto">{formatoCompacto(fila.valorGenerado)}</p>
                </div>
              ))}
            </div>
          </Tarjeta>

          <Tarjeta>
            <EncabezadoTarjeta titulo="Últimas operaciones" />
            {ultimasOperaciones.length === 0 ? (
              <p className="text-sm text-texto-suave">Todavía no hay operaciones cerradas.</p>
            ) : (
              <div className="divide-y divide-gris-borde">
                {ultimasOperaciones.map((op) => (
                  <div key={op.prospecto.id} className="flex flex-wrap items-center gap-3 py-2.5">
                    <div className="min-w-[160px] flex-1">
                      <p className="truncate text-sm font-semibold text-texto">{op.prospecto.nombre}</p>
                      <p className="truncate text-xs text-texto-suave">
                        {op.prospecto.zonas[0] ?? 'Sin zona'} · {op.asesor ? op.asesor.nombre : 'Sin asesor'}
                      </p>
                    </div>
                    <p className="shrink-0 text-sm font-semibold text-texto">{formatearPrecio({ monto: Math.round(op.monto), moneda: 'MXN' })}</p>
                    <Chip variante={op.cobrada ? 'exito' : 'espera'} className="shrink-0">
                      {op.cobrada ? 'Cobrada' : 'Por cobrar'}
                    </Chip>
                  </div>
                ))}
              </div>
            )}
          </Tarjeta>
        </div>

        <div className="space-y-4">
          <Tarjeta>
            <h2 className="flex items-center gap-2 text-base font-bold text-texto">
              <AlertTriangle size={17} strokeWidth={2} className="text-alerta" />
              Requiere tu atención
            </h2>
            <p className="mt-0.5 text-xs text-texto-suave">Lo que está detenido y de quién depende.</p>
            <div className="mt-3 space-y-2">
              {itemsAtencion.map((item) => (
                <FilaAtencion key={item.etiqueta} item={item} />
              ))}
            </div>
          </Tarjeta>
        </div>
      </div>
    </div>
  )
}
