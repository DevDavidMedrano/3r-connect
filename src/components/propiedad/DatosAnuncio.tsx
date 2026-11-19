import { useState, type ReactNode } from 'react'
import { Check, Copy } from 'lucide-react'
import { ETIQUETA_TIPO, etiquetaOperacion } from '../../types/propiedad'
import type { Propiedad } from '../../types/propiedad'

export function DatosAnuncio({ propiedad }: { propiedad: Propiedad }) {
  const [copiado, setCopiado] = useState(false)

  async function copiarFolio() {
    await navigator.clipboard.writeText(propiedad.folio)
    setCopiado(true)
    setTimeout(() => setCopiado(false), 1800)
  }

  const operaciones = [...new Set(propiedad.listados.map((l) => etiquetaOperacion(l.operacion)))].join(' · ')

  const filas: [string, ReactNode][] = [
    [
      'ID del anuncio',
      <span key="folio" className="flex items-center gap-2">
        {propiedad.folio}
        <button
          type="button"
          aria-label="Copiar ID del anuncio"
          onClick={copiarFolio}
          className="flex items-center gap-1 text-xs font-medium text-vino-vivo transition-colors hover:text-vino"
        >
          {copiado ? <Check size={13} strokeWidth={2} /> : <Copy size={13} strokeWidth={2} />}
          {copiado ? 'Copiado' : 'Copiar'}
        </button>
      </span>,
    ],
    ['Operación', operaciones],
    ['Tipo de inmueble', ETIQUETA_TIPO[propiedad.tipo]],
    ['Colonia', propiedad.ubicacion.colonia],
    ['Código postal', propiedad.ubicacion.codigoPostal],
  ]

  return (
    <div>
      <h2 className="text-sm font-bold uppercase tracking-wide text-texto">Datos del anuncio</h2>
      <div className="mt-3 divide-y divide-gris-borde rounded-2xl border border-gris-borde">
        {filas.map(([etiqueta, valor]) => (
          <div key={etiqueta} className="flex items-center justify-between px-4 py-2.5 text-sm">
            <span className="text-texto-suave">{etiqueta}</span>
            <span className="font-medium text-texto">{valor}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
