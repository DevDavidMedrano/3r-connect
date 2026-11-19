import { ListChecks } from 'lucide-react'
import { EstadoVacio } from '../../components/admin/EstadoVacio'

export default function SeguimientoAdminPage() {
  return (
    <>
      <h1 className="text-2xl font-bold text-texto">Seguimiento de Clientes</h1>
      <p className="mt-1 text-sm text-texto-suave">En qué paso va cada cliente, de principio a fin.</p>

      <div className="mt-6">
        <EstadoVacio
          icono={ListChecks}
          titulo="No hay clientes en seguimiento todavía"
          descripcion="Cuando un prospecto avance a cliente, su proceso completo se va a ver aquí."
        />
      </div>
    </>
  )
}
