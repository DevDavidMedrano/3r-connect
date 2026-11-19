import {
  AirVent,
  Building2,
  Car,
  Dumbbell,
  Flame,
  Fence,
  Home,
  Landmark,
  ShieldCheck,
  Sparkles,
  SquareParking,
  Sun,
  Trees,
  Waves,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { TipoPropiedad } from '../../types/propiedad'

interface Item {
  icono: LucideIcon
  texto: string
}

interface Categoria {
  nombre: string
  items: Item[]
}

// No venía en los datos del cliente: son características típicas
// razonables por tipo de inmueble, agrupadas igual que en la referencia
// (Exterior · General · Amenidades). Cuando haya datos reales por
// propiedad, esta función se reemplaza por un campo en propiedadesDemo.ts.
function caracteristicasPorTipo(tipo: TipoPropiedad): Categoria[] {
  switch (tipo) {
    case 'departamento':
    case 'penthouse':
      return [
        {
          nombre: 'Exterior',
          items: [
            { icono: Sun, texto: 'Balcón' },
            { icono: Building2, texto: 'Vista panorámica' },
          ],
        },
        {
          nombre: 'General',
          items: [
            { icono: AirVent, texto: 'Aire acondicionado' },
            { icono: Flame, texto: 'Calefacción' },
            { icono: Home, texto: 'Cocina integral' },
          ],
        },
        {
          nombre: 'Amenidades',
          items: [
            { icono: Dumbbell, texto: 'Gimnasio' },
            { icono: Sparkles, texto: 'Roof garden' },
            { icono: ShieldCheck, texto: 'Seguridad 24 horas' },
          ],
        },
      ]
    case 'casa':
      return [
        {
          nombre: 'Exterior',
          items: [
            { icono: Trees, texto: 'Jardín' },
            { icono: Sun, texto: 'Terraza' },
            { icono: SquareParking, texto: 'Cochera techada' },
          ],
        },
        {
          nombre: 'General',
          items: [
            { icono: AirVent, texto: 'Aire acondicionado' },
            { icono: Home, texto: 'Cocina integral' },
          ],
        },
        {
          nombre: 'Amenidades',
          items: [
            { icono: Waves, texto: 'Alberca' },
            { icono: ShieldCheck, texto: 'Circuito cerrado de seguridad' },
          ],
        },
      ]
    case 'oficina':
    case 'local-comercial':
      return [
        {
          nombre: 'Exterior',
          items: [
            { icono: Building2, texto: 'Fachada a calle' },
            { icono: Car, texto: 'Estacionamiento de visitas' },
          ],
        },
        {
          nombre: 'General',
          items: [
            { icono: AirVent, texto: 'Aire acondicionado' },
            { icono: Home, texto: 'Planta libre' },
          ],
        },
        {
          nombre: 'Amenidades',
          items: [
            { icono: ShieldCheck, texto: 'Seguridad 24 horas' },
            { icono: Landmark, texto: 'Recepción compartida' },
          ],
        },
      ]
    case 'terreno':
      return [
        { nombre: 'Exterior', items: [{ icono: Fence, texto: 'Barda perimetral' }] },
        { nombre: 'General', items: [{ icono: Home, texto: 'Uso de suelo habitacional' }] },
        { nombre: 'Amenidades', items: [{ icono: Landmark, texto: 'Servicios urbanos disponibles' }] },
      ]
  }
}

export function Caracteristicas({ tipo }: { tipo: TipoPropiedad }) {
  const categorias = caracteristicasPorTipo(tipo)

  return (
    <div>
      <h2 className="text-sm font-bold uppercase tracking-wide text-texto">Características</h2>
      <div className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-3">
        {categorias.map((categoria) => (
          <div key={categoria.nombre}>
            <p className="text-xs font-semibold uppercase tracking-wide text-texto-suave">{categoria.nombre}</p>
            <ul className="mt-2.5 space-y-2">
              {categoria.items.map((item) => (
                <li key={item.texto} className="flex items-center gap-2.5 text-sm text-texto">
                  <item.icono size={16} strokeWidth={1.5} className="shrink-0 text-texto-suave" />
                  {item.texto}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  )
}
