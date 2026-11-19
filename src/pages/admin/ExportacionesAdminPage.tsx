import { FileSliders } from 'lucide-react'
import { EstadoVacio } from '../../components/admin/EstadoVacio'

export default function ExportacionesAdminPage() {
  return (
    <>
      <h1 className="text-2xl font-bold text-texto">Exportaciones</h1>
      <p className="mt-1 text-sm text-texto-suave">Descarga la información del panel en el formato que necesites.</p>

      <div className="mt-6">
        <EstadoVacio
          icono={FileSliders}
          titulo="Todavía no hay exportaciones disponibles"
          descripcion="Vas a poder exportar inventario, prospectos y movimientos financieros desde aquí."
        />
      </div>
    </>
  )
}
