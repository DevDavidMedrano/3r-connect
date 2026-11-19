import {
  Bath,
  BedDouble,
  Building2,
  CalendarDays,
  Car,
  CheckCircle2,
  Clock,
  Compass,
  Maximize2,
  Square,
  Wrench,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { etiquetaCondicion, etiquetaDisposicion, formatearPrecio, publicadoHace } from '../../types/propiedad'
import type { Propiedad } from '../../types/propiedad'

const formatoM2 = new Intl.NumberFormat('es-MX')

// Un dato por fila si aplica, nunca si no: una oficina no tiene
// recámaras, un terreno no tiene piso ni año de construcción.
function construirDatos(propiedad: Propiedad): { icono: LucideIcon; texto: string }[] {
  const { detalles } = propiedad
  const datos: { icono: LucideIcon; texto: string }[] = [
    { icono: Clock, texto: `Publicado ${publicadoHace(detalles.fechaPublicacion)}` },
  ]

  if ('recamaras' in propiedad) datos.push({ icono: BedDouble, texto: `${propiedad.recamaras} recámaras` })
  if ('banos' in propiedad) datos.push({ icono: Bath, texto: `${propiedad.banos} baños` })
  if (detalles.estacionamientos) {
    datos.push({ icono: Car, texto: `${detalles.estacionamientos} estacionamientos` })
  }
  if ('m2Construccion' in propiedad) {
    datos.push({ icono: Maximize2, texto: `${formatoM2.format(propiedad.m2Construccion)} m² de construcción` })
  }
  if ('m2Terreno' in propiedad) {
    datos.push({ icono: Square, texto: `${formatoM2.format(propiedad.m2Terreno)} m² de terreno` })
  }
  if (detalles.piso) datos.push({ icono: Building2, texto: `Piso ${detalles.piso}` })
  if (detalles.anoConstruccion) datos.push({ icono: CalendarDays, texto: `Construido en ${detalles.anoConstruccion}` })
  if (detalles.mantenimiento) {
    datos.push({ icono: Wrench, texto: `Mantenimiento ${formatearPrecio(detalles.mantenimiento)}/mes` })
  }
  if (detalles.condicion) datos.push({ icono: CheckCircle2, texto: etiquetaCondicion(detalles.condicion) })
  if (detalles.disposicion) datos.push({ icono: Compass, texto: `Disposición ${etiquetaDisposicion(detalles.disposicion)}` })

  return datos
}

export function DatosPrincipales({ propiedad }: { propiedad: Propiedad }) {
  const datos = construirDatos(propiedad)

  return (
    <div className="grid grid-cols-1 gap-x-8 gap-y-3 sm:grid-cols-2">
      {datos.map(({ icono: Icono, texto }, indice) => (
        <div key={indice} className="flex items-center gap-2.5 text-sm text-texto">
          <Icono size={17} strokeWidth={1.5} className="shrink-0 text-texto-suave" />
          {texto}
        </div>
      ))}
    </div>
  )
}
