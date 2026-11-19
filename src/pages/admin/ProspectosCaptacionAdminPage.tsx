import { useEffect, useMemo, useRef, useState } from 'react'
import { CalendarPlus, MoreVertical, Pencil, Percent, Phone, Plus, Search, TrendingUp, UserCheck, UserPlus } from 'lucide-react'
import { Boton, Chip, EncabezadoPagina, Tarjeta, TarjetaFilaExpandible } from '../../components/cliente/Piezas'
import { EstadoVacio } from '../../components/admin/EstadoVacio'
import { useDatosAdmin } from '../../components/admin/useDatosAdmin'
import { asesoresDemo } from '../../data/asesoresDemo'
import { ETIQUETA_TIPO } from '../../types/propiedad'
import {
  ETIQUETA_ETAPA,
  ETIQUETA_ORIGEN,
  formatearPrecioProspecto,
  type EtapaProspecto,
  type Prospecto,
} from '../../types/prospecto'

const OPCIONES_ETAPA: { valor: EtapaProspecto | 'todas'; etiqueta: string }[] = [
  { valor: 'todas', etiqueta: 'Todas las etapas' },
  { valor: 'nuevo', etiqueta: ETIQUETA_ETAPA.nuevo },
  { valor: 'contactado', etiqueta: ETIQUETA_ETAPA.contactado },
  { valor: 'valuacion_agendada', etiqueta: ETIQUETA_ETAPA.valuacion_agendada },
  { valor: 'exclusiva_firmada', etiqueta: ETIQUETA_ETAPA.exclusiva_firmada },
  { valor: 'en_inventario', etiqueta: ETIQUETA_ETAPA.en_inventario },
]

// Gris, vino y verde ya existen como variante de Chip; contactado (azul) y
// valuación agendada (ámbar) no tienen token de marca — se resuelven aparte
// con la paleta neutra de Tailwind en vez de forzar un token que no existe.
const CLASE_ETAPA: Record<EtapaProspecto, string> = {
  nuevo: 'bg-gris-borde text-texto-suave',
  contactado: 'bg-blue-50 text-blue-700',
  valuacion_agendada: 'bg-oro/15 text-oro-oscuro',
  exclusiva_firmada: 'bg-vino/10 text-vino',
  en_inventario: 'bg-exito/10 text-exito',
}

function EtiquetaEtapa({ etapa }: { etapa: EtapaProspecto }) {
  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${CLASE_ETAPA[etapa]}`}>
      {ETIQUETA_ETAPA[etapa]}
    </span>
  )
}

function iniciales(nombre: string): string {
  const partes = nombre.trim().split(/\s+/)
  return `${partes[0][0]}${partes[partes.length - 1][0]}`.toUpperCase()
}

function TarjetaKpi({
  icono: Icono,
  clase,
  etiqueta,
  valor,
}: {
  icono: typeof TrendingUp
  clase: string
  etiqueta: string
  valor: string
}) {
  return (
    <Tarjeta className="flex items-center gap-3.5">
      <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${clase}`}>
        <Icono size={20} strokeWidth={1.75} />
      </span>
      <div className="min-w-0">
        <p className="truncate text-xs font-semibold text-texto-suave">{etiqueta}</p>
        <p className="mt-0.5 truncate font-serif text-xl font-bold text-texto">{valor}</p>
      </div>
    </Tarjeta>
  )
}

function MenuAcciones({ prospecto, onPasarACaptacion }: { prospecto: Prospecto; onPasarACaptacion: () => void }) {
  const [abierto, setAbierto] = useState(false)
  const contenedorRef = useRef<HTMLDivElement>(null)
  const puedePasarACaptacion = prospecto.etapa === 'exclusiva_firmada'

  useEffect(() => {
    function alClicFuera(evento: MouseEvent) {
      if (contenedorRef.current && !contenedorRef.current.contains(evento.target as Node)) setAbierto(false)
    }
    document.addEventListener('mousedown', alClicFuera)
    return () => document.removeEventListener('mousedown', alClicFuera)
  }, [])

  return (
    <div className="relative" ref={contenedorRef}>
      <button
        type="button"
        aria-label="Más acciones"
        onClick={() => setAbierto((v) => !v)}
        className="flex h-7 w-7 items-center justify-center rounded-full text-texto-suave transition-colors hover:bg-marfil hover:text-texto"
      >
        <MoreVertical size={15} strokeWidth={2} />
      </button>

      {abierto && (
        <div className="absolute right-0 top-full z-20 mt-1 w-52 rounded-xl border border-gris-borde bg-blanco py-1.5 shadow-lg">
          {puedePasarACaptacion ? (
            <button
              type="button"
              onClick={() => {
                onPasarACaptacion()
                setAbierto(false)
              }}
              className="block w-full px-3.5 py-2 text-left text-sm font-medium text-texto transition-colors hover:bg-marfil"
            >
              Pasar a Captación
            </button>
          ) : (
            <p className="px-3.5 py-2 text-xs text-texto-suave">
              {prospecto.etapa === 'en_inventario' ? 'Ya está en Captación de Propiedades.' : 'Sin acciones disponibles todavía.'}
            </p>
          )}
        </div>
      )}
    </div>
  )
}

export default function ProspectosCaptacionAdminPage() {
  const { prospectosCaptacion, pasarACaptacion } = useDatosAdmin()
  const [busqueda, setBusqueda] = useState('')
  const [etapaFiltro, setEtapaFiltro] = useState<EtapaProspecto | 'todas'>('todas')

  const total = prospectosCaptacion.length
  const enInventario = prospectosCaptacion.filter((p) => p.etapa === 'en_inventario').length
  const tasaCaptacion = total > 0 ? Math.round((enInventario / total) * 100) : 0

  const prospectosFiltrados = useMemo(() => {
    const objetivo = busqueda.trim().toLowerCase()
    return prospectosCaptacion.filter((p) => {
      if (etapaFiltro !== 'todas' && p.etapa !== etapaFiltro) return false
      if (!objetivo) return true
      return p.propietarioNombre.toLowerCase().includes(objetivo) || p.colonia.toLowerCase().includes(objetivo)
    })
  }, [prospectosCaptacion, busqueda, etapaFiltro])

  return (
    <div className="space-y-5">
      <EncabezadoPagina
        titulo="Prospectos de Captación"
        descripcion="Dueños interesados en publicar su propiedad con la inmobiliaria."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <TarjetaKpi
          icono={UserPlus}
          clase="bg-vino-vivo/10 text-vino-vivo"
          etiqueta="Captaciones activas"
          valor={String(total - enInventario)}
        />
        <TarjetaKpi
          icono={CalendarPlus}
          clase="bg-oro/15 text-oro-oscuro"
          etiqueta="Valuaciones agendadas"
          valor={String(prospectosCaptacion.filter((p) => p.etapa === 'valuacion_agendada').length)}
        />
        <TarjetaKpi
          icono={UserCheck}
          clase="bg-vino/10 text-vino"
          etiqueta="Exclusivas firmadas"
          valor={String(prospectosCaptacion.filter((p) => p.etapa === 'exclusiva_firmada').length)}
        />
        <TarjetaKpi icono={Percent} clase="bg-exito/10 text-exito" etiqueta="Tasa de captación" valor={`${tasaCaptacion}%`} />
      </div>

      <div className="flex flex-wrap items-center gap-2.5">
        <div className="flex min-w-[220px] flex-1 items-center gap-2 rounded-full border border-gris-borde bg-blanco px-4 py-2.5">
          <Search size={15} strokeWidth={2} className="shrink-0 text-texto-suave" />
          <input
            type="text"
            value={busqueda}
            onChange={(evento) => setBusqueda(evento.target.value)}
            placeholder="Buscar por nombre o zona..."
            className="w-full min-w-0 bg-transparent text-sm text-texto outline-none placeholder:text-texto-suave"
          />
        </div>

        <select
          value={etapaFiltro}
          onChange={(evento) => setEtapaFiltro(evento.target.value as EtapaProspecto | 'todas')}
          className="cursor-pointer rounded-full border border-gris-borde bg-blanco px-4 py-2.5 text-sm font-medium text-texto outline-none transition-colors hover:border-texto-suave"
        >
          {OPCIONES_ETAPA.map((opcion) => (
            <option key={opcion.valor} value={opcion.valor}>
              {opcion.etiqueta}
            </option>
          ))}
        </select>

        <Boton to="/admin/prospectos-captacion/nuevo" variante="solido" className="shrink-0">
          <Plus size={16} strokeWidth={2.5} />
          Nuevo prospecto
        </Boton>
      </div>

      {prospectosFiltrados.length === 0 ? (
        <EstadoVacio
          icono={UserPlus}
          titulo="Ningún prospecto coincide"
          descripcion="Prueba con otra búsqueda o quita el filtro de etapa."
        />
      ) : (
        <>
          {/* Móvil: tarjetas apiladas, sin scroll horizontal — 4 columnas
              esenciales (propietario, propiedad, precio, etapa), el resto
              al tocar. */}
          <div className="space-y-2.5 sm:hidden">
            {prospectosFiltrados.map((prospecto) => {
              const asesor = asesoresDemo.find((a) => a.id === prospecto.asesorId)
              return (
                <TarjetaFilaExpandible
                  key={prospecto.id}
                  resumen={
                    <div className="flex items-center gap-2.5">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-vino-vivo text-xs font-bold text-blanco">
                        {iniciales(prospecto.propietarioNombre)}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-texto">{prospecto.propietarioNombre}</p>
                        <p className="truncate text-xs text-texto-suave">
                          {ETIQUETA_TIPO[prospecto.tipoPropiedad]} · {prospecto.colonia}
                        </p>
                      </div>
                      <div className="shrink-0 text-right">
                        <p className="text-sm font-semibold text-texto">{formatearPrecioProspecto(prospecto)}</p>
                        <div className="mt-0.5">
                          <EtiquetaEtapa etapa={prospecto.etapa} />
                        </div>
                      </div>
                    </div>
                  }
                  detalle={
                    <>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-texto-suave">Operación</span>
                        <span className="capitalize text-texto">{prospecto.operaciones.join(' · ')}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-texto-suave">Origen</span>
                        <Chip variante="espera">{ETIQUETA_ORIGEN[prospecto.origen]}</Chip>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-texto-suave">Asesor</span>
                        <span className="text-texto">{asesor ? asesor.nombre : 'Sin asignar'}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-texto-suave">Fecha</span>
                        <span className="text-texto">{prospecto.fecha}</span>
                      </div>
                      <div className="flex items-center gap-2 pt-1">
                        <a
                          href={`tel:${prospecto.propietarioTelefono.replace(/\s+/g, '')}`}
                          className="flex h-11 flex-1 items-center justify-center gap-1.5 rounded-3r-md border border-gris-borde text-sm font-semibold text-texto"
                        >
                          <Phone size={15} strokeWidth={2} />
                          Llamar
                        </a>
                        {prospecto.etapa === 'exclusiva_firmada' && (
                          <button
                            type="button"
                            onClick={() => pasarACaptacion(prospecto.id)}
                            className="flex h-11 flex-1 items-center justify-center rounded-3r-md border border-gris-borde text-sm font-semibold text-texto"
                          >
                            Pasar a Captación
                          </button>
                        )}
                      </div>
                    </>
                  }
                />
              )
            })}
          </div>

          <div className="hidden overflow-x-auto rounded-2xl border border-gris-borde bg-blanco sm:block">
          <table className="w-full min-w-[1100px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-gris-borde text-[10.5px] font-semibold uppercase tracking-wide text-texto-suave">
                <th className="px-4 py-3 font-semibold">Propietario</th>
                <th className="px-4 py-3 font-semibold">Propiedad</th>
                <th className="px-4 py-3 font-semibold">Operación</th>
                <th className="px-4 py-3 font-semibold">Precio est.</th>
                <th className="px-4 py-3 font-semibold">Etapa</th>
                <th className="px-4 py-3 font-semibold">Origen</th>
                <th className="px-4 py-3 font-semibold">Asesor</th>
                <th className="px-4 py-3 font-semibold">Fecha</th>
                <th className="px-4 py-3 font-semibold">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {prospectosFiltrados.map((prospecto) => {
                const asesor = asesoresDemo.find((a) => a.id === prospecto.asesorId)
                return (
                  <tr key={prospecto.id} className="border-b border-gris-borde last:border-b-0 hover:bg-marfil/60">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-vino-vivo text-xs font-bold text-blanco">
                          {iniciales(prospecto.propietarioNombre)}
                        </span>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-texto">{prospecto.propietarioNombre}</p>
                          <p className="truncate text-xs text-texto-suave">{prospecto.propietarioCorreo}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm text-texto">{ETIQUETA_TIPO[prospecto.tipoPropiedad]}</p>
                      <p className="text-xs capitalize text-texto-suave">{prospecto.colonia}</p>
                    </td>
                    <td className="px-4 py-3 text-sm capitalize text-texto-suave">
                      {prospecto.operaciones.join(' · ')}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-semibold text-texto">
                      {formatearPrecioProspecto(prospecto)}
                    </td>
                    <td className="px-4 py-3">
                      <EtiquetaEtapa etapa={prospecto.etapa} />
                    </td>
                    <td className="px-4 py-3">
                      <Chip variante="espera">{ETIQUETA_ORIGEN[prospecto.origen]}</Chip>
                    </td>
                    <td className="px-4 py-3 text-sm text-texto-suave">{asesor ? asesor.nombre : 'Sin asignar'}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-xs text-texto-suave">{prospecto.fecha}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          aria-label="Agendar"
                          className="flex h-7 w-7 items-center justify-center rounded-full text-texto-suave transition-colors hover:bg-marfil hover:text-texto"
                        >
                          <CalendarPlus size={15} strokeWidth={2} />
                        </button>
                        <a
                          href={`tel:${prospecto.propietarioTelefono.replace(/\s+/g, '')}`}
                          aria-label="Llamar"
                          className="flex h-7 w-7 items-center justify-center rounded-full text-texto-suave transition-colors hover:bg-marfil hover:text-texto"
                        >
                          <Phone size={15} strokeWidth={2} />
                        </a>
                        <button
                          type="button"
                          aria-label="Editar"
                          className="flex h-7 w-7 items-center justify-center rounded-full text-texto-suave transition-colors hover:bg-marfil hover:text-texto"
                        >
                          <Pencil size={15} strokeWidth={2} />
                        </button>
                        <MenuAcciones prospecto={prospecto} onPasarACaptacion={() => pasarACaptacion(prospecto.id)} />
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          </div>
        </>
      )}
    </div>
  )
}
