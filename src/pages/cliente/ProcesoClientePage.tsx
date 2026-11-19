import { PasosProceso } from '../../components/cliente/PasosProceso'
import { EncabezadoPagina, Tarjeta } from '../../components/cliente/Piezas'
import { useDatosCliente } from '../../components/cliente/useDatosCliente'
import { pendientesDelCliente } from '../../types/proceso'

export default function ProcesoClientePage() {
  const { proceso } = useDatosCliente()
  const pendientes = pendientesDelCliente(proceso)

  return (
    <div className="space-y-6">
      <EncabezadoPagina
        titulo="Mi proceso"
        descripcion={
          pendientes.length > 0
            ? `Tienes ${pendientes.length} ${pendientes.length === 1 ? 'paso' : 'pasos'} pendientes de tu lado.`
            : 'Por ahora no hay ningún paso pendiente de tu lado.'
        }
      />

      <Tarjeta>
        <PasosProceso pasos={proceso.pasos} />
      </Tarjeta>
    </div>
  )
}
