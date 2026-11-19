import { useMemo, useState } from 'react'
import { Clock, KeyRound, MapPin, Plus, TrendingUp, Wallet } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Boton, Chip, EncabezadoPagina, Tarjeta, type VarianteChip } from '../../components/cliente/Piezas'
import { useDatosAdmin } from '../../components/admin/useDatosAdmin'
import { asesorParaPropiedad } from '../../data/asesoresDemo'
import { propiedadesDemo } from '../../data/propiedadesDemo'
import { PropertyArt } from '../../components/landing/art/PropertyArt'
import { ETIQUETA_TIPO, formatearPrecio, type Precio, type Propiedad } from '../../types/propiedad'
import type { ProcesoCliente } from '../../types/proceso'
import type { ApartadoMock, EstadoApartado } from '../../types/apartado'

interface ApartadoVista {
  id: string
  folio: string
  propiedad: Propiedad
  clienteNombre: string
  asesorNombre: string
  estado: EstadoApartado
  anticipo: Precio
  precioTotal: Precio
  fechaVencimiento: string
}

// El apartado del cliente Demo (folio 3R-110) no vive en apartadosMock: se
// arma en tiempo de render a partir de procesoCompra (useDatosAdmin), el
// mismo dato que /mi-cuenta/proceso — así los dos leen exactamente los
// mismos números, sin un mock aparte que se pueda desincronizar. El resto
// de apartadosMock vive en SesionContext, compartido con "Registrar
// apartado" de Prospectos de Venta.
const ID_APARTADO_DEMO = 'apartado-demo-3r-110'

const ETIQUETA_ESTADO: Record<EstadoApartado, string> = {
  activo: 'Activo',
  por_vencer: 'Por vencer',
  vencido: 'Vencido',
  convertido: 'Convertido',
}

const VARIANTE_ESTADO: Record<EstadoApartado, VarianteChip> = {
  activo: 'exito',
  por_vencer: 'accion',
  vencido: 'alerta',
  convertido: 'vino',
}

const TABS: { valor: EstadoApartado | 'todos'; etiqueta: string }[] = [
  { valor: 'todos', etiqueta: 'Todos' },
  { valor: 'activo', etiqueta: 'Activos' },
  { valor: 'por_vencer', etiqueta: 'Por vencer' },
  { valor: 'vencido', etiqueta: 'Vencidos' },
  { valor: 'convertido', etiqueta: 'Convertidos' },
]

// El precio de una operación de venta/preventa — nunca precioMinimo(): esa
// función puede devolver el precio de renta si es menor (p. ej. una unidad
// que también se ofrece en renta), y un apartado siempre es sobre el
// precio de compra de la unidad.
function precioDeVenta(propiedad: Propiedad): Precio {
  const listado = propiedad.listados.find((l) => l.operacion === 'venta' || l.operacion === 'preventa')
  return listado ? listado.precio : propiedad.listados[0].precio
}

function iniciales(nombre: string): string {
  const partes = nombre.trim().split(/\s+/)
  return `${partes[0][0]}${partes[partes.length - 1][0]}`.toUpperCase()
}

function diasParaVencer(fechaISO: string): number {
  const msPorDia = 1000 * 60 * 60 * 24
  return Math.ceil((new Date(fechaISO).getTime() - Date.now()) / msPorDia)
}

function textoVencimiento(estado: EstadoApartado, dias: number): string {
  if (estado === 'convertido') return 'Convertido en venta'
  if (estado === 'vencido' || dias < 0) return `Venció hace ${Math.abs(dias)} día${Math.abs(dias) === 1 ? '' : 's'}`
  return `Vence en ${dias} día${dias === 1 ? '' : 's'}`
}

function claseVencimiento(estado: EstadoApartado, dias: number): string {
  if (estado === 'convertido') return 'text-texto-suave'
  if (estado === 'vencido' || dias < 0) return 'text-alerta'
  if (dias < 7) return 'text-coral'
  return 'text-texto-suave'
}

function esFotoPlaceholder(url: string): boolean {
  return url.startsWith('/media/')
}

function construirApartadoDemo(proceso: ProcesoCliente, convertido: boolean): ApartadoVista | null {
  const propiedad = propiedadesDemo.find((p) => p.folio === proceso.folio)
  if (!propiedad) return null

  const anticipoMonto = proceso.movimientos
    .filter((movimiento) => movimiento.estado === 'pagado')
    .reduce((suma, movimiento) => suma + movimiento.monto.monto, 0)
  const moneda = proceso.movimientos[0]?.monto.moneda ?? 'MXN'
  const movimientoEnganche = proceso.movimientos.find((movimiento) => movimiento.id === 'mov-enganche')

  return {
    id: ID_APARTADO_DEMO,
    folio: proceso.folio,
    propiedad,
    clienteNombre: 'Demo',
    asesorNombre: asesorParaPropiedad(proceso.folio).nombre,
    estado: convertido ? 'convertido' : 'activo',
    anticipo: { monto: anticipoMonto, moneda },
    precioTotal: precioDeVenta(propiedad),
    fechaVencimiento: movimientoEnganche?.fecha ?? proceso.cierreEstimado,
  }
}

function construirApartadoDesdeMock(mock: ApartadoMock): ApartadoVista | null {
  const propiedad = propiedadesDemo.find((p) => p.folio === mock.folio)
  if (!propiedad) return null
  const precioTotal = precioDeVenta(propiedad)

  return {
    id: mock.id,
    folio: mock.folio,
    propiedad,
    clienteNombre: mock.clienteNombre,
    asesorNombre: asesorParaPropiedad(mock.folio).nombre,
    estado: mock.estado,
    anticipo: { monto: mock.anticipoMonto, moneda: precioTotal.moneda },
    precioTotal,
    fechaVencimiento: mock.fechaVencimiento,
  }
}

function TarjetaKpi({ icono: Icono, clase, etiqueta, valor }: { icono: LucideIcon; clase: string; etiqueta: string; valor: string }) {
  return (
    <Tarjeta className="flex items-center gap-3.5">
      <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${clase}`}>
        <Icono size={20} strokeWidth={1.75} />
      </span>
      <div className="min-w-0">
        <p className="truncate text-xs font-semibold text-texto-suave">{etiqueta}</p>
        <p className="mt-0.5 truncate font-serif text-xl font-bold text-texto">{valor}</p>
      </div>
    </Tarjeta>
  )
}

function TarjetaApartado({ apartado, onConvertir }: { apartado: ApartadoVista; onConvertir: () => void }) {
  const primeraFoto = apartado.propiedad.medios.find((medio) => !esFotoPlaceholder(medio.url))
  const faltaPorPagar = apartado.precioTotal.monto - apartado.anticipo.monto
  const porcentaje = Math.min(100, Math.round((apartado.anticipo.monto / apartado.precioTotal.monto) * 100))
  const dias = diasParaVencer(apartado.fechaVencimiento)
  const muestraConvertir = apartado.estado === 'activo' || apartado.estado === 'por_vencer'

  return (
    <article className="overflow-hidden rounded-2xl border border-gris-borde bg-blanco">
      <div className="relative h-40 w-full overflow-hidden">
        {primeraFoto ? (
          <img src={primeraFoto.url} alt={primeraFoto.alt} className="h-full w-full object-cover" />
        ) : (
          <PropertyArt tipo={apartado.propiedad.tipo} className="h-full w-full" />
        )}
        <Chip variante={VARIANTE_ESTADO[apartado.estado]} className="absolute right-2.5 top-2.5">
          {ETIQUETA_ESTADO[apartado.estado]}
        </Chip>
      </div>

      <div className="p-4">
        <h3 className="truncate text-sm font-bold text-texto">{ETIQUETA_TIPO[apartado.propiedad.tipo]}</h3>
        <p className="mt-0.5 flex items-center gap-1 truncate text-xs text-texto-suave">
          <MapPin size={12} strokeWidth={2} className="shrink-0" />
          {apartado.propiedad.ubicacion.colonia}
        </p>

        <div className="mt-3.5 flex items-center gap-2.5 border-t border-gris-borde pt-3.5">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-vino-vivo text-xs font-bold text-blanco">
            {iniciales(apartado.clienteNombre)}
          </span>
          <div className="min-w-0">
            <p className="truncate text-xs font-semibold text-texto">{apartado.clienteNombre}</p>
            <p className="text-[11px] text-texto-suave">Cliente</p>
          </div>
        </div>

        <div className="mt-3.5 grid grid-cols-2 gap-3">
          <div>
            <p className="text-[10.5px] font-semibold uppercase tracking-wide text-texto-suave">Anticipo</p>
            <p className="mt-0.5 truncate text-sm font-bold text-exito">{formatearPrecio(apartado.anticipo)}</p>
          </div>
          <div className="text-right">
            <p className="text-[10.5px] font-semibold uppercase tracking-wide text-texto-suave">Falta por pagar</p>
            <p className="mt-0.5 truncate text-sm font-bold text-texto">
              {formatearPrecio({ monto: faltaPorPagar, moneda: apartado.precioTotal.moneda })}
            </p>
          </div>
        </div>

        <div className="mt-3">
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-gris-borde">
            <div className="h-full rounded-full bg-vino-vivo" style={{ width: `${porcentaje}%` }} />
          </div>
          <div className="mt-1 flex items-center justify-between text-[11px] text-texto-suave">
            <span>{porcentaje}% pagado</span>
            <span>{formatearPrecio(apartado.precioTotal)}</span>
          </div>
        </div>

        <div className="mt-3.5 flex items-center justify-between gap-2 border-t border-gris-borde pt-3.5 text-xs">
          <span className={`flex items-center gap-1.5 ${claseVencimiento(apartado.estado, dias)}`}>
            <Clock size={13} strokeWidth={2} className="shrink-0" />
            {textoVencimiento(apartado.estado, dias)}
          </span>
          <span className="truncate text-texto-suave">{apartado.asesorNombre}</span>
        </div>

        <div className="mt-3.5 flex gap-2">
          <Boton variante="contorno" className="flex-1 text-xs">
            Ver detalle
          </Boton>
          {muestraConvertir && (
            <Boton variante="solido" className="flex-1 text-xs" onClick={onConvertir}>
              Convertir en venta
            </Boton>
          )}
        </div>
      </div>
    </article>
  )
}

export default function SeparacionAdminPage() {
  const { procesoCompra, avanzarProcesoCompra, apartadosMock, actualizarEstadoApartado } = useDatosAdmin()
  const [demoConvertido, setDemoConvertido] = useState(false)
  const [tab, setTab] = useState<EstadoApartado | 'todos'>('todos')

  const apartados = useMemo(() => {
    const demo = construirApartadoDemo(procesoCompra, demoConvertido)
    const resto = apartadosMock.map(construirApartadoDesdeMock)
    return [demo, ...resto].filter((a): a is ApartadoVista => a !== null)
  }, [procesoCompra, demoConvertido, apartadosMock])

  function convertirEnVenta(id: string) {
    if (id === ID_APARTADO_DEMO) {
      // Avanza el paso actual del proceso de compra compartido — el mismo
      // cambio que ve el cliente en /mi-cuenta/proceso.
      avanzarProcesoCompra()
      setDemoConvertido(true)
      return
    }
    actualizarEstadoApartado(id, 'convertido')
  }

  const enCurso = apartados.filter((a) => a.estado === 'activo' || a.estado === 'por_vencer')
  const anticiposRecibidos = enCurso.reduce((suma, a) => suma + a.anticipo.monto, 0)
  const valorTotalApartado = enCurso.reduce((suma, a) => suma + a.precioTotal.monto, 0)
  const monedaKpi = enCurso[0]?.precioTotal.moneda ?? 'MXN'

  const apartadosFiltrados = tab === 'todos' ? apartados : apartados.filter((a) => a.estado === tab)

  return (
    <div className="space-y-5">
      <EncabezadoPagina titulo="Separación de Propiedades" descripcion="Administra apartados, anticipos y conversión a ventas." />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <TarjetaKpi
          icono={KeyRound}
          clase="bg-vino-vivo/10 text-vino-vivo"
          etiqueta="Apartados activos"
          valor={String(apartados.filter((a) => a.estado === 'activo').length)}
        />
        <TarjetaKpi
          icono={Clock}
          clase="bg-oro/15 text-oro-oscuro"
          etiqueta="Por vencer"
          valor={String(apartados.filter((a) => a.estado === 'por_vencer').length)}
        />
        <TarjetaKpi
          icono={Wallet}
          clase="bg-exito/10 text-exito"
          etiqueta="Anticipos recibidos"
          valor={formatearPrecio({ monto: anticiposRecibidos, moneda: monedaKpi })}
        />
        <TarjetaKpi
          icono={TrendingUp}
          clase="bg-vino/10 text-vino"
          etiqueta="Valor total apartado"
          valor={formatearPrecio({ monto: valorTotalApartado, moneda: monedaKpi })}
        />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-1 rounded-full border border-gris-borde bg-blanco p-1">
          {TABS.map((opcion) => (
            <button
              key={opcion.valor}
              type="button"
              onClick={() => setTab(opcion.valor)}
              className={`rounded-full px-3.5 py-1.5 text-sm font-semibold transition-colors ${
                tab === opcion.valor ? 'bg-vino-vivo text-blanco' : 'text-texto-suave hover:text-texto'
              }`}
            >
              {opcion.etiqueta}
            </button>
          ))}
        </div>

        <Boton variante="solido" className="shrink-0">
          <Plus size={16} strokeWidth={2.5} />
          Nuevo apartado
        </Boton>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {apartadosFiltrados.map((apartado) => (
          <TarjetaApartado key={apartado.id} apartado={apartado} onConvertir={() => convertirEnVenta(apartado.id)} />
        ))}
      </div>
    </div>
  )
}
