import { useState } from 'react'
import { Send, X } from 'lucide-react'
import { enviarLead } from './enviarLead'
import type { Asesor } from '../../types/asesor'

interface LeadModalProps {
  abierto: boolean
  onClose: () => void
  folio: string
  colonia: string
  asesor: Asesor
}

export function LeadModal({ abierto, onClose, folio, colonia, asesor }: LeadModalProps) {
  const [nombre, setNombre] = useState('')
  const [telefono, setTelefono] = useState('')
  const [correo, setCorreo] = useState('')
  const [mensaje, setMensaje] = useState(
    `Me interesa la propiedad ${folio} en ${colonia}. ¿Podría darme más información?`,
  )
  const [enviando, setEnviando] = useState(false)
  const [enviado, setEnviado] = useState(false)

  if (!abierto) return null

  function cerrarYReiniciar() {
    onClose()
    setEnviando(false)
    setEnviado(false)
    setNombre('')
    setTelefono('')
    setCorreo('')
    setMensaje(`Me interesa la propiedad ${folio} en ${colonia}. ¿Podría darme más información?`)
  }

  async function alEnviar(evento: React.FormEvent) {
    evento.preventDefault()
    setEnviando(true)
    await enviarLead({ nombre, telefono, correo, mensaje, folio, canal: 'mensaje' })
    setEnviando(false)
    setEnviado(true)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="w-full max-w-md rounded-2xl bg-blanco p-6 shadow-2xl">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-lg font-bold text-texto">Enviar mensaje</h2>
            <p className="mt-0.5 text-sm text-texto-suave">
              A {asesor.nombre.split(' ')[0]}, sobre la propiedad {folio}
            </p>
          </div>
          <button
            type="button"
            aria-label="Cerrar"
            onClick={cerrarYReiniciar}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-texto-suave transition-colors hover:bg-marfil hover:text-texto"
          >
            <X size={18} strokeWidth={2} />
          </button>
        </div>

        {enviado ? (
          <div className="mt-6 flex flex-col items-center py-4 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-vino-vivo/10 text-vino-vivo">
              <Send size={22} strokeWidth={1.75} />
            </span>
            <p className="mt-3 text-base font-semibold text-texto">Tu mensaje fue enviado.</p>
            <p className="mt-1 text-sm text-texto-suave">
              Un asesor te contactará por WhatsApp en breve para darte seguimiento.
            </p>
            <button
              type="button"
              onClick={cerrarYReiniciar}
              className="mt-5 rounded-full bg-vino-vivo px-5 py-2 text-sm font-semibold text-blanco transition-colors hover:bg-vino"
            >
              Entendido
            </button>
          </div>
        ) : (
          <form className="mt-4 space-y-3" onSubmit={alEnviar}>
            <label className="block">
              <span className="text-xs font-medium text-texto-suave">Nombre</span>
              <input
                type="text"
                required
                value={nombre}
                onChange={(evento) => setNombre(evento.target.value)}
                className="mt-1 w-full rounded-lg border border-gris-borde px-3 py-2 text-sm text-texto outline-none focus:border-vino-vivo"
              />
            </label>

            <label className="block">
              <span className="text-xs font-medium text-texto-suave">Teléfono</span>
              <input
                type="tel"
                required
                value={telefono}
                onChange={(evento) => setTelefono(evento.target.value)}
                className="mt-1 w-full rounded-lg border border-gris-borde px-3 py-2 text-sm text-texto outline-none focus:border-vino-vivo"
              />
            </label>

            <label className="block">
              <span className="text-xs font-medium text-texto-suave">Correo</span>
              <input
                type="email"
                required
                value={correo}
                onChange={(evento) => setCorreo(evento.target.value)}
                className="mt-1 w-full rounded-lg border border-gris-borde px-3 py-2 text-sm text-texto outline-none focus:border-vino-vivo"
              />
            </label>

            <label className="block">
              <span className="text-xs font-medium text-texto-suave">Mensaje</span>
              <textarea
                required
                rows={3}
                value={mensaje}
                onChange={(evento) => setMensaje(evento.target.value)}
                className="mt-1 w-full resize-none rounded-lg border border-gris-borde px-3 py-2 text-sm text-texto outline-none focus:border-vino-vivo"
              />
            </label>

            <button
              type="submit"
              disabled={enviando}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-vino-vivo px-5 py-2.5 text-sm font-semibold text-blanco transition-colors hover:bg-vino disabled:opacity-60"
            >
              <Send size={15} strokeWidth={2} />
              {enviando ? 'Enviando…' : 'Enviar mensaje'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
