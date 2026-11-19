import { useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { Phone, Send } from 'lucide-react'
import { EncabezadoPagina, Tarjeta } from '../../components/cliente/Piezas'
import { useDatosCliente } from '../../components/cliente/useDatosCliente'
import { AvatarAsesor } from '../../components/asesores/AvatarAsesor'

interface MensajeAsesor {
  id: string
  de: 'cliente' | 'asesor'
  texto: string
  hora: string
}

// DEMO — sin backend real detrás: rota entre unas cuantas respuestas
// genéricas en vez de contestar de verdad. El agente de IA de verdad vive
// en WhatsAppModal, atado a la ficha de una propiedad puntual; esta
// conversación es el hilo general con el asesor ya asignado.
const RESPUESTAS_DEMO = [
  'Claro, dame un momento y te confirmo.',
  'Perfecto, ya quedó anotado. Te aviso en cuanto tenga novedades.',
  'Buena pregunta, permíteme revisarlo con el equipo y te contesto en breve.',
]

function horaActual(): string {
  return new Intl.DateTimeFormat('es-MX', { hour: 'numeric', minute: '2-digit' }).format(new Date())
}

export default function AsesorClientePage() {
  const { asesor, proceso } = useDatosCliente()

  const [mensajes, setMensajes] = useState<MensajeAsesor[]>(() => [
    {
      id: 'inicial',
      de: 'asesor',
      texto: `Hola, soy ${asesor.nombre}, tu asesor en 3R Connect. Voy a acompañarte en todo el proceso de la propiedad ${proceso.folio}. ¿En qué te puedo ayudar hoy?`,
      hora: horaActual(),
    },
  ])
  const [entrada, setEntrada] = useState('')
  const [escribiendo, setEscribiendo] = useState(false)
  const idRef = useRef(1)
  const respuestaIndiceRef = useRef(0)

  function nuevoId(): string {
    idRef.current += 1
    return `m${idRef.current}`
  }

  function enviarMensaje(evento: FormEvent) {
    evento.preventDefault()
    const texto = entrada.trim()
    if (!texto || escribiendo) return

    setEntrada('')
    setMensajes((actual) => [...actual, { id: nuevoId(), de: 'cliente', texto, hora: horaActual() }])
    setEscribiendo(true)

    setTimeout(() => {
      const respuesta = RESPUESTAS_DEMO[respuestaIndiceRef.current % RESPUESTAS_DEMO.length]
      respuestaIndiceRef.current += 1
      setEscribiendo(false)
      setMensajes((actual) => [...actual, { id: nuevoId(), de: 'asesor', texto: respuesta, hora: horaActual() }])
    }, 1000)
  }

  return (
    <div className="space-y-6">
      <EncabezadoPagina titulo="Mi asesor" descripcion="Tu contacto directo en 3R Connect durante todo el proceso." />

      <Tarjeta tono="marfil">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <AvatarAsesor asesor={asesor} className="h-12 w-12 text-sm" />
            <div>
              <p className="text-sm font-bold text-texto">{asesor.nombre}</p>
              <p className="text-xs text-texto-suave">Asesor desde {asesor.asesorDesde}</p>
            </div>
          </div>

          <a
            href={`tel:${asesor.telefono.replace(/\s+/g, '')}`}
            className="flex items-center gap-2 rounded-3r-md border border-gris-borde px-4 py-2.5 text-sm font-semibold text-texto transition-colors hover:border-onix hover:text-onix"
          >
            <Phone size={15} strokeWidth={2} />
            Llamar
          </a>
        </div>
      </Tarjeta>

      <Tarjeta className="flex h-[520px] flex-col">
        <div className="flex-1 space-y-3 overflow-y-auto pr-1">
          {mensajes.map((mensaje) => (
            <div key={mensaje.id} className={`flex ${mensaje.de === 'cliente' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[75%] rounded-3r-md px-3.5 py-2.5 text-sm ${
                  mensaje.de === 'cliente' ? 'bg-onix text-blanco' : 'bg-marfil text-texto'
                }`}
              >
                <p className="whitespace-pre-wrap">{mensaje.texto}</p>
                <p className={`mt-1 text-[10px] ${mensaje.de === 'cliente' ? 'text-blanco/70' : 'text-texto-suave'}`}>
                  {mensaje.hora}
                </p>
              </div>
            </div>
          ))}

          {escribiendo && (
            <div className="flex justify-start">
              <div className="rounded-3r-md bg-marfil px-3.5 py-2.5 text-sm text-texto-suave">Escribiendo…</div>
            </div>
          )}
        </div>

        <form onSubmit={enviarMensaje} className="mt-4 flex items-center gap-2 border-t border-gris-borde pt-4">
          <input
            type="text"
            value={entrada}
            onChange={(evento) => setEntrada(evento.target.value)}
            placeholder="Escribe un mensaje a tu asesor"
            className="min-w-0 flex-1 rounded-3r-md border border-gris-borde bg-marfil px-4 py-2.5 text-sm text-texto placeholder:text-texto-suave focus:outline-none"
          />
          <button
            type="submit"
            disabled={!entrada.trim() || escribiendo}
            aria-label="Enviar"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-onix text-blanco transition-opacity disabled:opacity-50"
          >
            <Send size={16} strokeWidth={2} />
          </button>
        </form>
      </Tarjeta>
    </div>
  )
}
