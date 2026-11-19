import { useState } from 'react'

export function Descripcion({ texto }: { texto: string }) {
  const [expandido, setExpandido] = useState(false)

  return (
    <div>
      <h2 className="text-sm font-bold uppercase tracking-wide text-texto">Descripción</h2>
      <p className={`mt-3 text-sm leading-relaxed text-texto-suave ${expandido ? '' : 'line-clamp-3'}`}>{texto}</p>
      <button
        type="button"
        onClick={() => setExpandido((v) => !v)}
        className="mt-2 text-sm font-semibold text-vino-vivo transition-colors hover:text-vino"
      >
        {expandido ? 'Ver menos' : 'Ver más'}
      </button>
    </div>
  )
}
