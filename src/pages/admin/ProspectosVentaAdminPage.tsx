import { useEffect, useMemo, useRef, useState } from 'react'
import { CalendarPlus, Clock, MoreVertical, Pencil, Percent, Phone, Plus, Search, UserCheck, Users } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Boton, Chip, EncabezadoPagina, Tarjeta, TarjetaFilaExpandible } from '../../components/cliente/Piezas'
import { EstadoVacio } from '../../components/admin/EstadoVacio'
import { useDatosAdmin } from '../../components/admin/useDatosAdmin'
import { asesoresDemo } from '../../data/asesoresDemo'
import { OPCIONES_COLONIA } from '../../data/colonias'
import { propiedadesDemo } from '../../data/propiedadesDemo'
import { construirTitulo, formatearPrecio } from '../../types/propiedad'
import {
  ETIQUETA_ETAPA_VENTA,
  ETIQUETA_ORIGEN_VENTA,
  diasDesde,
  precioParaOperacion,
  propiedadesSugeridas,
  type EtapaProspectoVenta,
  type ProspectoVenta,
} from '../../types/prospectoVenta'

const ETIQUETA_COLONIA_LOOKUP = Object.fromEntries(OPCIONES_COLONIA.map((c) => [c.valor, c.etiqueta]))

const OPCIONES_ETAPA: { valor: EtapaProspectoVenta | 'todas'; etiqueta: string }[] = [
  { valor: 'todas', etiqueta: 'Todas las etapas' },
  { valor: 'nuevo', etiqueta: ETIQUETA_ETAPA_VENTA.nuevo },
  { valor: 'calificado', etiqueta: ETIQUETA_ETAPA_VENTA.calificado },
  { valor: 'mostrando', etiqueta: ETIQUETA_ETAPA_VENTA.mostrando },
  { valor: 'negociacion', etiqueta: ETIQUETA_ETAPA_VENTA.negociacion },
  { valor: 'cerrado', etiqueta: ETIQUETA_ETAPA_VENTA.cerrado },
]

// Gris y verde ya existen como variante de Chip; calificado (azul) y
// mostrando (ámbar) no tienen token de marca — igual que en Prospectos de
// Captación, se resuelven con la paleta neutra de Tailwind en vez de forzar
// un token que no existe. Negociación reusa 'vino' (Chip ya lo trae).
const CLASE_ETAPA: Record<EtapaProspectoVenta, string> = {
  nuevo: 'bg-gris-borde text-texto-suave',
  calificado: 'bg-blue-50 text-blue-700',
  mostrando: 'bg-oro/15 text-oro-oscuro',
  negociacion: 'bg-vino/10 text-vino',
  cerrado: 'bg-exito/10 text-exito',
}

function EtiquetaEtapa({ etapa }: { etapa: EtapaProspectoVenta }) {
  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${CLASE_ETAPA[etapa]}`}>
      {ETIQUETA_ETAPA_VENTA[etapa]}
    </span>
  )
}

function iniciales(nombre: string): string {
  const partes = nombre.trim().split(/\s+/)
  return `${partes[0][0]}${partes[partes.length - 1][0]}`.toUpperCase()
}

function fechaDentroDelMesActual(fechaISO: string): boolean {
  const fecha = new Date(fechaISO)
  const hoy = new Date()
  return fecha.getFullYear() === hoy.getFullYear() && fecha.getMonth() === hoy.getMonth()
}

function TarjetaKpi({ icono: Icono, clase, etiqueta, valor }: { icono: LucideIcon; clase: string; etiqueta: string; valor: string }) {
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

function MenuAcciones({
  prospecto,
  tieneCoincidencia,
  onRegistrarApartado,
}: {
  prospecto: ProspectoVenta
  tieneCoincidencia: boolean
  onRegistrarApartado: () => void
}) {
  const [abierto, setAbierto] = useState(false)
  const contenedorRef = useRef<HTMLDivElement>(null)
  const puedeRegistrar = prospecto.etapa === 'negociacion'

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
        <div className="absolute right-0 top-full z-20 mt-1 w-56 rounded-xl border border-gris-borde bg-blanco py-1.5 shadow-lg">
          {puedeRegistrar ? (
            tieneCoincidencia ? (
              <button
                type="button"
                onClick={() => {
                  onRegistrarApartado()
                  setAbierto(false)
                }}
                className="block w-full px-3.5 py-2 text-left text-sm font-medium text-texto transition-colors hover:bg-marfil"
              >
                Registrar apartado
              </button>
            ) : (
              <p className="px-3.5 py-2 text-xs text-texto-suave">Sin propiedad de inventario que empate todavía.</p>
            )
          ) : (
            <p className="px-3.5 py-2 text-xs text-texto-suave">
              {prospecto.etapa === 'cerrado' ? 'Este prospecto ya está cerrado.' : 'Sin acciones disponibles todavía.'}
            </p>
          )}
        </div>
      )}
    </div>
  )
}

export default function ProspectosVentaAdminPage() {
  const { prospectosVenta, agregarApartado, actualizarEtapaProspectoVenta } = useDatosAdmin()
  const [busqueda, setBusqueda] = useState('')
  const [etapaFiltro, setEtapaFiltro] = useState<EtapaProspectoVenta | 'todas'>('todas')

  const total = prospectosVenta.length
  const cerrados = prospectosVenta.filter((p) => p.etapa === 'cerrado').length
  const tasaConversion = total > 0 ? Math.round((cerrados / total) * 100) : 0
  const cerradosEsteMes = prospectosVenta.filter((p) => p.fechaCierre && fechaDentroDelMesActual(p.fechaCierre)).length

  const coincidenciasPorProspecto = useMemo(() => {
    const mapa = new Map<string, ReturnType<typeof propiedadesSugeridas>>()
    for (const prospecto of prospectosVenta) {
      mapa.set(prospecto.id, propiedadesSugeridas(prospecto, propiedadesDemo))
    }
    return mapa
  }, [prospectosVenta])

  const prospectosFiltrados = useMemo(() => {
    const objetivo = busqueda.trim().toLowerCase()
    return prospectosVenta.filter((p) => {
      if (etapaFiltro !== 'todas' && p.etapa !== etapaFiltro) return false
      if (!objetivo) return true
      if (p.nombre.toLowerCase().includes(objetivo)) return true
      const coincidencias = coincidenciasPorProspecto.get(p.id) ?? []
      return coincidencias.some(
        (propiedad) => propiedad.folio.toLowerCase().includes(objetivo) || propiedad.ubicacion.colonia.toLowerCase().includes(objetivo),
      )
    })
  }, [prospectosVenta, busqueda, etapaFiltro, coincidenciasPorProspecto])

  function registrarApartado(prospecto: ProspectoVenta) {
    const coincidencias = coincidenciasPorProspecto.get(prospecto.id) ?? []
    const principal = coincidencias[0]
    if (!principal) return

    const precio = precioParaOperacion(principal, prospecto.operacion)
    if (!precio) return

    const hoy = new Date()
    const vencimiento = new Date(hoy.getTime() + 45 * 24 * 60 * 60 * 1000)

    agregarApartado({
      id: `apartado-${prospecto.id}`,
      folio: principal.folio,
      clienteNombre: prospecto.nombre,
      estado: 'activo',
      anticipoMonto: Math.round(precio.monto * 0.1),
      fechaVencimiento: vencimiento.toISOString().slice(0, 10),
    })
    actualizarEtapaProspectoVenta(prospecto.id, 'cerrado', hoy.toISOString().slice(0, 10))
  }

  return (
    <div className="space-y-5">
      <EncabezadoPagina titulo="Prospectos de Venta" descripcion="Compradores e inquilinos interesados en el inventario." />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <TarjetaKpi
          icono={Users}
          clase="bg-vino-vivo/10 text-vino-vivo"
          etiqueta="Prospectos activos"
          valor={String(total - cerrados)}
        />
        <TarjetaKpi
          icono={Clock}
          clase="bg-vino/10 text-vino"
          etiqueta="En negociación"
          valor={String(prospectosVenta.filter((p) => p.etapa === 'negociacion').length)}
        />
        <TarjetaKpi icono={UserCheck} clase="bg-exito/10 text-exito" etiqueta="Cerrados este mes" valor={String(cerradosEsteMes)} />
        <TarjetaKpi icono={Percent} clase="bg-oro/15 text-oro-oscuro" etiqueta="Tasa de conversión" valor={`${tasaConversion}%`} />
      </div>

      <div className="flex flex-wrap items-center gap-2.5">
        <div className="flex min-w-[220px] flex-1 items-center gap-2 rounded-full border border-gris-borde bg-blanco px-4 py-2.5">
          <Search size={15} strokeWidth={2} className="shrink-0 text-texto-suave" />
          <input
            type="text"
            value={busqueda}
            onChange={(evento) => setBusqueda(evento.target.value)}
            placeholder="Buscar por nombre o propiedad..."
            className="w-full min-w-0 bg-transparent text-sm text-texto outline-none placeholder:text-texto-suave"
          />
        </div>

        <select
          value={etapaFiltro}
          onChange={(evento) => setEtapaFiltro(evento.target.value as EtapaProspectoVenta | 'todas')}
          className="cursor-pointer rounded-full border border-gris-borde bg-blanco px-4 py-2.5 text-sm font-medium text-texto outline-none transition-colors hover:border-texto-suave"
        >
          {OPCIONES_ETAPA.map((opcion) => (
            <option key={opcion.valor} value={opcion.valor}>
              {opcion.etiqueta}
            </option>
          ))}
        </select>

        <Boton to="/admin/prospectos-venta/nuevo" variante="solido" className="shrink-0">
          <Plus size={16} strokeWidth={2.5} />
          Nuevo prospecto
        </Boton>
      </div>

      {prospectosFiltrados.length === 0 ? (
        <EstadoVacio icono={Users} titulo="Ningún prospecto coincide" descripcion="Prueba con otra búsqueda o quita el filtro de etapa." />
      ) : (
        <>
          <div className="space-y-2.5 sm:hidden">
            {prospectosFiltrados.map((prospecto) => {
              const asesor = asesoresDemo.find((a) => a.id === prospecto.asesorId)
              const coincidencias = coincidenciasPorProspecto.get(prospecto.id) ?? []
              const principal = coincidencias[0]
              const dias = diasDesde(prospecto.ultimoContacto)
              return (
                <TarjetaFilaExpandible
                  key={prospecto.id}
                  resumen={
                    <div className="flex items-center gap-2.5">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-vino-vivo text-xs font-bold text-blanco">
                        {iniciales(prospecto.nombre)}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-texto">{prospecto.nombre}</p>
                        <p className="truncate text-xs text-texto-suave">
                          {formatearPrecio({ monto: prospecto.presupuestoMin, moneda: prospecto.moneda })} –{' '}
                          {formatearPrecio({ monto: prospecto.presupuestoMax, moneda: prospecto.moneda })}
                        </p>
                      </div>
                      <div className="shrink-0 text-right">
                        <p className="text-xs text-texto-suave">{principal ? principal.folio : 'Sin match'}</p>
                        <div className="mt-0.5">
                          <EtiquetaEtapa etapa={prospecto.etapa} />
                        </div>
                      </div>
                    </div>
                  }
                  detalle={
                    <>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-texto-suave">Origen</span>
                        <Chip variante="espera">{ETIQUETA_ORIGEN_VENTA[prospecto.origen]}</Chip>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-texto-suave">Asesor</span>
                        <span className="text-texto">{asesor ? asesor.nombre : 'Sin asignar'}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-texto-suave">Último contacto</span>
                        <span className={dias > 5 ? 'text-coral' : 'text-texto'}>
                          {dias === 0 ? 'Hoy' : `Hace ${dias} día${dias === 1 ? '' : 's'}`}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 pt-1">
                        <a
                          href={`tel:${prospecto.telefono.replace(/\s+/g, '')}`}
                          className="flex h-11 flex-1 items-center justify-center gap-1.5 rounded-3r-md border border-gris-borde text-sm font-semibold text-texto"
                        >
                          <Phone size={15} strokeWidth={2} />
                          Llamar
                        </a>
                        {coincidencias.length > 0 && prospecto.etapa === 'negociacion' && (
                          <button
                            type="button"
                            onClick={() => registrarApartado(prospecto)}
                            className="flex h-11 flex-1 items-center justify-center rounded-3r-md border border-gris-borde text-sm font-semibold text-texto"
                          >
                            Registrar apartado
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
          <table className="w-full min-w-[1200px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-gris-borde text-[10.5px] font-semibold uppercase tracking-wide text-texto-suave">
                <th className="px-4 py-3 font-semibold">Prospecto</th>
                <th className="px-4 py-3 font-semibold">Busca</th>
                <th className="px-4 py-3 font-semibold">Propiedad de interés</th>
                <th className="px-4 py-3 font-semibold">Etapa</th>
                <th className="px-4 py-3 font-semibold">Origen</th>
                <th className="px-4 py-3 font-semibold">Asesor</th>
                <th className="px-4 py-3 font-semibold">Último contacto</th>
                <th className="px-4 py-3 font-semibold">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {prospectosFiltrados.map((prospecto) => {
                const asesor = asesoresDemo.find((a) => a.id === prospecto.asesorId)
                const coincidencias = coincidenciasPorProspecto.get(prospecto.id) ?? []
                const principal = coincidencias[0]
                const dias = diasDesde(prospecto.ultimoContacto)
                const zonasTexto =
                  prospecto.zonas.length > 0
                    ? prospecto.zonas.map((z) => ETIQUETA_COLONIA_LOOKUP[z] ?? z).join(', ')
                    : 'Cualquier zona'

                return (
                  <tr key={prospecto.id} className="border-b border-gris-borde last:border-b-0 hover:bg-marfil/60">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-vino-vivo text-xs font-bold text-blanco">
                          {iniciales(prospecto.nombre)}
                        </span>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-texto">{prospecto.nombre}</p>
                          <p className="truncate text-xs text-texto-suave">{prospecto.correo}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="whitespace-nowrap text-sm text-texto">
                        {formatearPrecio({ monto: prospecto.presupuestoMin, moneda: prospecto.moneda })} –{' '}
                        {formatearPrecio({ monto: prospecto.presupuestoMax, moneda: prospecto.moneda })}
                      </p>
                      <p className="truncate text-xs text-texto-suave">{zonasTexto}</p>
                    </td>
                    <td className="px-4 py-3">
                      {principal ? (
                        <>
                          <p className="text-sm font-semibold text-texto">{principal.folio}</p>
                          <p className="truncate text-xs text-texto-suave">
                            {construirTitulo(principal)}
                            {coincidencias.length > 1 && (
                              <span className="ml-1 font-semibold text-vino-vivo">+{coincidencias.length - 1}</span>
                            )}
                          </p>
                        </>
                      ) : (
                        <p className="text-xs text-texto-suave">Sin coincidencias</p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <EtiquetaEtapa etapa={prospecto.etapa} />
                    </td>
                    <td className="px-4 py-3">
                      <Chip variante="espera">{ETIQUETA_ORIGEN_VENTA[prospecto.origen]}</Chip>
                    </td>
                    <td className="px-4 py-3 text-sm text-texto-suave">{asesor ? asesor.nombre : 'Sin asignar'}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">
                      <span className={dias > 5 ? 'text-coral' : 'text-texto-suave'}>
                        {dias === 0 ? 'Hoy' : `Hace ${dias} día${dias === 1 ? '' : 's'}`}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          aria-label="Agendar visita"
                          className="flex h-7 w-7 items-center justify-center rounded-full text-texto-suave transition-colors hover:bg-marfil hover:text-texto"
                        >
                          <CalendarPlus size={15} strokeWidth={2} />
                        </button>
                        <a
                          href={`tel:${prospecto.telefono.replace(/\s+/g, '')}`}
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
                        <MenuAcciones
                          prospecto={prospecto}
                          tieneCoincidencia={coincidencias.length > 0}
                          onRegistrarApartado={() => registrarApartado(prospecto)}
                        />
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
