import type { LucideIcon } from 'lucide-react'

interface EstadoVacioProps {
  icono: LucideIcon
  titulo: string
  descripcion: string
}

// Pantalla de relleno para las secciones del panel que todavía no tienen
// contenido real — nunca una página en blanco.
export function EstadoVacio({ icono: Icono, titulo, descripcion }: EstadoVacioProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl bg-blanco px-6 py-20 text-center shadow-sm">
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-vino-vivo/10 text-vino-vivo">
        <Icono size={26} strokeWidth={1.5} />
      </span>
      <h2 className="mt-4 text-base font-bold text-texto">{titulo}</h2>
      <p className="mt-1.5 max-w-sm text-sm text-texto-suave">{descripcion}</p>
    </div>
  )
}
