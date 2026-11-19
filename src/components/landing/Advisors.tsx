import { Mail, MessageCircle, Phone } from 'lucide-react'

const ASESORES = [
  { nombre: 'Mariana Solís', cargo: 'Asesora senior · Polanco y Lomas' },
  { nombre: 'Diego Herrera', cargo: 'Asesor · Preventas y desarrollos' },
  { nombre: 'Renata Cobos', cargo: 'Asesora · Renta y oficinas' },
] as const

function iniciales(nombre: string): string {
  const partes = nombre.split(' ')
  return `${partes[0][0]}${partes[partes.length - 1][0]}`.toUpperCase()
}

export function Advisors() {
  return (
    <section className="bg-marfil px-6 py-24">
      <div className="mx-auto max-w-5xl text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-oro-oscuro">
          Nuestro equipo
        </p>
        <h2 className="mt-3 font-serif text-3xl font-semibold text-onix">Asesores</h2>

        <div className="mt-14 grid grid-cols-1 gap-8 sm:grid-cols-3">
          {ASESORES.map((asesor) => (
            <div key={asesor.nombre} className="rounded-3r-md border border-borde bg-marfil p-8">
              <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-oro font-serif text-xl font-semibold text-onix">
                {iniciales(asesor.nombre)}
              </span>
              <p className="mt-4 text-base font-semibold text-onix">{asesor.nombre}</p>
              <p className="mt-1 text-sm text-onix/55">{asesor.cargo}</p>

              <div className="mt-5 flex justify-center gap-3 text-onix/50">
                <button
                  type="button"
                  aria-label={`Llamar a ${asesor.nombre}`}
                  className="transition-colors hover:text-oro-oscuro"
                >
                  <Phone size={16} strokeWidth={1.75} />
                </button>
                <button
                  type="button"
                  aria-label={`Enviar correo a ${asesor.nombre}`}
                  className="transition-colors hover:text-oro-oscuro"
                >
                  <Mail size={16} strokeWidth={1.75} />
                </button>
                <button
                  type="button"
                  aria-label={`Escribir por WhatsApp a ${asesor.nombre}`}
                  className="transition-colors hover:text-oro-oscuro"
                >
                  <MessageCircle size={16} strokeWidth={1.75} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
