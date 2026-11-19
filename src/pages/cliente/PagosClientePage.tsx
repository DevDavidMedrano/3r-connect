import { Wallet } from 'lucide-react'
import { Chip, EncabezadoPagina, Fila, Tarjeta } from '../../components/cliente/Piezas'
import type { VarianteChip } from '../../components/cliente/Piezas'
import { useDatosCliente } from '../../components/cliente/useDatosCliente'
import { formatearPrecio } from '../../types/propiedad'
import { etiquetaMovimiento } from '../../types/proceso'
import type { EstadoMovimiento } from '../../types/proceso'

const VARIANTE_POR_ESTADO_MOVIMIENTO: Record<EstadoMovimiento, VarianteChip> = {
  pagado: 'exito',
  programado: 'accion',
  pendiente: 'espera',
}

export default function PagosClientePage() {
  const { proceso } = useDatosCliente()
  const { movimientos } = proceso

  // Los montos demo del proceso están todos en la misma moneda: se suman
  // directo, sin conversión. Si algún día conviven monedas distintas en un
  // mismo proceso, esta barra necesita agrupar por `moneda` antes de sumar.
  const moneda = movimientos[0]?.monto.moneda ?? 'MXN'
  const totalMonto = movimientos.reduce((suma, movimiento) => suma + movimiento.monto.monto, 0)
  const pagadoMonto = movimientos
    .filter((movimiento) => movimiento.estado === 'pagado')
    .reduce((suma, movimiento) => suma + movimiento.monto.monto, 0)
  const porcentajePagado = totalMonto > 0 ? Math.round((pagadoMonto / totalMonto) * 100) : 0

  return (
    <div className="space-y-6">
      <EncabezadoPagina titulo="Pagos" descripcion="Cuánto llevas pagado del total de tu proceso." />

      <Tarjeta>
        <div className="flex items-center justify-between gap-3 text-sm">
          <p className="font-semibold text-texto">{porcentajePagado}% pagado</p>
          <p className="text-texto-suave">
            {formatearPrecio({ monto: pagadoMonto, moneda })} de {formatearPrecio({ monto: totalMonto, moneda })}
          </p>
        </div>
        <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-gris-borde">
          <div className="h-full rounded-full bg-onix transition-all" style={{ width: `${porcentajePagado}%` }} />
        </div>
      </Tarjeta>

      <Tarjeta>
        <h2 className="text-base font-bold text-texto">Movimientos</h2>
        <div className="mt-2">
          {movimientos.map((movimiento) => (
            <Fila
              key={movimiento.id}
              icono={Wallet}
              titulo={movimiento.concepto}
              descripcion={movimiento.fecha}
              meta={
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-texto">{formatearPrecio(movimiento.monto)}</p>
                  <Chip variante={VARIANTE_POR_ESTADO_MOVIMIENTO[movimiento.estado]}>
                    {etiquetaMovimiento(movimiento.estado)}
                  </Chip>
                </div>
              }
            />
          ))}
        </div>
      </Tarjeta>
    </div>
  )
}
