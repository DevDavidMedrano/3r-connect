import { CalendarClock, CalendarX } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Chip, EncabezadoPagina, Fila, Tarjeta } from '../../components/cliente/Piezas'
import { useSesion } from '../../components/cuenta/SesionContext'

export default function VisitasClientePage() {
  const { visitasCliente } = useSesion()

  return (
    <div className="space-y-6">
      <EncabezadoPagina titulo="Mis visitas" descripcion="Las visitas que agendaste a través de nuestro asistente." />

      {visitasCliente.length === 0 ? (
        <Tarjeta className="flex flex-col items-center justify-center py-16 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-onix/10 text-onix">
            <CalendarX size={26} strokeWidth={1.5} />
          </span>
          <h2 className="mt-4 text-base font-bold text-texto">No tienes visitas agendadas</h2>
          <p className="mt-1.5 max-w-sm text-sm text-texto-suave">
            Cuando agendes una visita a través de nuestro asistente de WhatsApp, la vas a ver aquí.
          </p>
        </Tarjeta>
      ) : (
        <Tarjeta>
          {visitasCliente.map((visita) => (
            <Link key={visita.id} to={`/propiedad/${visita.folio}`} className="block transition-colors hover:bg-marfil">
              <Fila
                icono={CalendarClock}
                titulo={visita.propiedadTitulo}
                descripcion={`${visita.folio} · Con ${visita.asesorNombre}`}
                meta={<Chip variante="accion">{visita.horarioEtiqueta}</Chip>}
              />
            </Link>
          ))}
        </Tarjeta>
      )}
    </div>
  )
}
