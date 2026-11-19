import { useState } from 'react'
import { ChevronRight, Circle, X } from 'lucide-react'

interface Paso {
  titulo: string
  descripcion: string
}

const PASOS: Paso[] = [
  {
    titulo: 'Completa el perfil de la inmobiliaria',
    descripcion: 'Agrega logo, teléfono y una breve descripción.',
  },
  {
    titulo: 'Invita a tu equipo',
    descripcion: 'Da de alta a tus asesores desde Usuarios y Roles.',
  },
  {
    titulo: 'Capta tu primera propiedad',
    descripcion: 'Empieza desde Captación de Propiedades.',
  },
]

export function GuiaInicioRapido() {
  // Sin localStorage: si se recarga la página, la guía vuelve a
  // mostrarse. Aceptable para la demo.
  const [visible, setVisible] = useState(true)
  if (!visible) return null

  return (
    <div className="relative rounded-2xl bg-blanco p-6 shadow-sm">
      <button
        type="button"
        aria-label="Cerrar guía"
        onClick={() => setVisible(false)}
        className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-texto-suave transition-colors hover:bg-marfil hover:text-texto"
      >
        <X size={18} strokeWidth={2} />
      </button>

      <h2 className="text-base font-bold text-texto">Guía de inicio rápido</h2>
      <p className="mt-1 text-sm text-texto-suave">Completa estos pasos para configurar el panel.</p>

      <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {PASOS.map((paso) => (
          <button
            key={paso.titulo}
            type="button"
            className="flex items-start gap-3 rounded-xl border border-gris-borde p-4 text-left transition-colors hover:border-vino-vivo"
          >
            <Circle size={20} strokeWidth={1.75} className="mt-0.5 shrink-0 text-texto-suave" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-texto">{paso.titulo}</p>
              <p className="mt-0.5 text-xs leading-relaxed text-texto-suave">{paso.descripcion}</p>
            </div>
            <ChevronRight size={16} strokeWidth={2} className="mt-1 shrink-0 text-texto-suave" />
          </button>
        ))}
      </div>
    </div>
  )
}
