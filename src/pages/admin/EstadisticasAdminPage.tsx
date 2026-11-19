import { LineChart } from 'lucide-react'
import { EstadoVacio } from '../../components/admin/EstadoVacio'

export default function EstadisticasAdminPage() {
  return (
    <>
      <h1 className="text-2xl font-bold text-texto">Estadísticas</h1>
      <p className="mt-1 text-sm text-texto-suave">Tendencias del negocio a lo largo del tiempo.</p>

      <div className="mt-6">
        <EstadoVacio
          icono={LineChart}
          titulo="Todavía no hay estadísticas que mostrar"
          descripcion="En cuanto haya suficiente historia acumulada, las tendencias del negocio se van a ver aquí."
        />
      </div>
    </>
  )
}
