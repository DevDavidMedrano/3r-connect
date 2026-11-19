import { EncabezadoPagina, Tarjeta } from '../../components/cliente/Piezas'
import { useDatosCliente } from '../../components/cliente/useDatosCliente'

export default function PerfilClientePage() {
  const { usuario } = useDatosCliente()

  return (
    <div className="space-y-6">
      <EncabezadoPagina titulo="Mi perfil" descripcion="Los datos de tu cuenta en 3R Connect." />

      <Tarjeta>
        <div className="flex items-center gap-3">
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-onix text-lg font-bold text-blanco">
            {usuario?.iniciales}
          </span>
          <div className="min-w-0">
            <p className="truncate text-base font-bold text-texto">{usuario?.nombre}</p>
            <p className="truncate text-sm text-texto-suave">{usuario?.correo}</p>
          </div>
        </div>
      </Tarjeta>
    </div>
  )
}
