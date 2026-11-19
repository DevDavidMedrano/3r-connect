import { SlidersHorizontal } from 'lucide-react'
import { EstadoVacio } from '../../components/admin/EstadoVacio'

export default function PlantillasDocumentosAdminPage() {
  return (
    <>
      <h1 className="text-2xl font-bold text-texto">Plantillas de Documentos</h1>
      <p className="mt-1 text-sm text-texto-suave">Los catálogos de documentos que usa Confianza y Validación.</p>

      <div className="mt-6">
        <EstadoVacio
          icono={SlidersHorizontal}
          titulo="Todavía no hay plantillas personalizadas"
          descripcion="Vas a poder ajustar qué documentos se piden en cada bloque del expediente desde aquí."
        />
      </div>
    </>
  )
}
