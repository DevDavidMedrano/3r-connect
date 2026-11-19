import { lazy, Suspense } from 'react'
import { Loader2, X } from 'lucide-react'
import type { Propiedad } from '../../types/propiedad'

// Lazy a propósito: three.js pesa mucho y no debe entrar al bundle
// inicial de la landing. Solo se descarga cuando se abre este modal.
const Visor3D = lazy(() => import('./Visor3D'))

function CargandoVisor() {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-blanco/60">
      <Loader2 size={26} strokeWidth={2} className="animate-spin" />
      <p className="text-sm">Cargando visor 3D…</p>
    </div>
  )
}

interface Visor3DModalProps {
  propiedad: Propiedad
  onClose: () => void
}

export function Visor3DModal({ propiedad, onClose }: Visor3DModalProps) {
  return (
    <div className="fixed inset-0 z-50 bg-black/85 sm:p-8">
      <div className="flex h-full w-full flex-col rounded-none bg-onix sm:rounded-2xl">
        <div className="flex justify-end p-3">
          <button
            type="button"
            aria-label="Cerrar"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full text-blanco transition-colors hover:bg-blanco/10"
          >
            <X size={20} strokeWidth={2} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 pb-5">
          <Suspense fallback={<CargandoVisor />}>
            <Visor3D propiedad={propiedad} />
          </Suspense>
        </div>
      </div>
    </div>
  )
}
