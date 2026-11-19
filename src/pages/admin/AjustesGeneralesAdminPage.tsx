import { Settings } from 'lucide-react'
import { EstadoVacio } from '../../components/admin/EstadoVacio'

export default function AjustesGeneralesAdminPage() {
  return (
    <>
      <h1 className="text-2xl font-bold text-texto">Ajustes Generales</h1>
      <p className="mt-1 text-sm text-texto-suave">Configuración de la inmobiliaria dentro de 3R Connect.</p>

      <div className="mt-6">
        <EstadoVacio
          icono={Settings}
          titulo="Todavía no hay ajustes que configurar"
          descripcion="El perfil de la inmobiliaria, sus datos de contacto y preferencias van a vivir aquí."
        />
      </div>
    </>
  )
}
