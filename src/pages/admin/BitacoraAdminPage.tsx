import { History } from 'lucide-react'
import { EstadoVacio } from '../../components/admin/EstadoVacio'
import { useDatosAdmin } from '../../components/admin/useDatosAdmin'
import { Tarjeta } from '../../components/cliente/Piezas'
import { etiquetaFechaBitacora } from '../../types/bitacora'

export default function BitacoraAdminPage() {
  const { bitacora } = useDatosAdmin()

  return (
    <>
      <h1 className="text-2xl font-bold text-texto">Bitácora</h1>
      <p className="mt-1 text-sm text-texto-suave">Historial de cambios y actividad del equipo.</p>

      <div className="mt-6">
        {bitacora.length === 0 ? (
          <EstadoVacio
            icono={History}
            titulo="No hay actividad registrada todavía"
            descripcion="Cada cambio importante del equipo va a quedar registrado aquí."
          />
        ) : (
          <Tarjeta>
            <div className="divide-y divide-gris-borde">
              {bitacora.map((entrada) => (
                <div key={entrada.id} className="flex items-start justify-between gap-4 py-3">
                  <div className="min-w-0">
                    <p className="text-sm text-texto">
                      <span className="font-semibold">{entrada.actor}</span> {entrada.accion}
                    </p>
                    <p className="mt-0.5 truncate text-xs text-texto-suave">{entrada.detalle}</p>
                  </div>
                  <p className="shrink-0 whitespace-nowrap text-xs text-texto-suave">{etiquetaFechaBitacora(entrada.fecha)}</p>
                </div>
              ))}
            </div>
          </Tarjeta>
        )}
      </div>
    </>
  )
}
