import type { Asesor } from '../../types/asesor'

interface AvatarAsesorProps {
  asesor: Asesor
  // Tamaño y tipografía (p.ej. "h-9 w-9 text-xs") — cada lugar donde
  // aparece un asesor trae su propia medida, así que las controla quien
  // llama; este componente solo decide entre foto e iniciales.
  className: string
}

export function AvatarAsesor({ asesor, className }: AvatarAsesorProps) {
  if (asesor.foto) {
    return <img src={asesor.foto} alt={asesor.nombre} className={`shrink-0 rounded-full object-cover ${className}`} />
  }

  return (
    <span
      className={`flex shrink-0 items-center justify-center rounded-full font-bold text-blanco ${className}`}
      style={{ backgroundColor: asesor.colorAvatar }}
    >
      {asesor.iniciales}
    </span>
  )
}
