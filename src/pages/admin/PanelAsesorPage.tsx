import { useState } from 'react'
import { Calendar as IconoCalendario, Eye, FileWarning, MessageSquare, Route } from 'lucide-react'
import { Link } from 'react-router-dom'
import { PasosProceso } from '../../components/cliente/PasosProceso'
import { MiniSparkline } from '../../components/admin/MiniSparkline'
import { Boton, Chip, EncabezadoTarjeta, Fila, FilaMetricas, Tarjeta, TarjetaMetrica } from '../../components/cliente/Piezas'
import { GuiaInicioRapido } from '../../components/admin/GuiaInicioRapido'
import { useDatosAdmin } from '../../components/admin/useDatosAdmin'
import { propiedadesDemo } from '../../data/propiedadesDemo'
import { solicitudesDemo, vistasEsteMesPorFolio, vistasMesAnteriorPorFolio } from '../../data/solicitudesDemo'
import { formatearPrecio, precioMinimo, resumenAtributos } from '../../types/propiedad'
import { etiquetaDocumento, pasoActual, pasosCompletados } from '../../types/proceso'

function saludoPorHora(): string {
  const hora = new Date().getHours()
  if (hora < 12) return 'Buenos días'
  if (hora < 19) return 'Buenas tardes'
  return 'Buenas noches'
}

// "Mi panel" del asesor — la propiedad que tiene en captación, cómo va ese
// proceso y lo que le falta de su lado. El negocio completo (números de
// toda la inmobiliaria) es el tablero del admin, no este — ver
// TableroAdminPage.tsx.
export default function PanelAsesorPage() {
  const { nombre, procesosPublicacion } = useDatosAdmin()

  const [folioSeleccionado, setFolioSeleccionado] = useState<string | null>(procesosPublicacion[0]?.folio ?? null)
  const [fecha, setFecha] = useState(() => new Date().toISOString().slice(0, 10))

  const procesoSeleccionado = procesosPublicacion.find((proceso) => proceso.folio === folioSeleccionado) ?? null
  const propiedad = procesoSeleccionado ? propiedadesDemo.find((p) => p.folio === procesoSeleccionado.folio) : undefined

  const completados = procesoSeleccionado ? pasosCompletados(procesoSeleccionado) : []
  const ultimoCompletado = completados[completados.length - 1]
  const faseActiva = ultimoCompletado ? `${ultimoCompletado.titulo} activo` : null

  const actual = procesoSeleccionado ? pasoActual(procesoSeleccionado) : undefined

  const documentosPendientes = procesoSeleccionado
    ? procesoSeleccionado.documentos.filter((documento) => documento.origen === 'sube_cliente' && documento.estado !== 'validado')
    : []

  const solicitudesDeLaPropiedad = folioSeleccionado ? solicitudesDemo.filter((solicitud) => solicitud.folio === folioSeleccionado) : []
  const solicitudesSinResponder = solicitudesDeLaPropiedad.filter((solicitud) => !solicitud.respondida).length
  const ultimasSolicitudes = [...solicitudesDeLaPropiedad].sort((a, b) => (a.fecha < b.fecha ? 1 : -1)).slice(0, 3)

  const vistas = folioSeleccionado ? (vistasEsteMesPorFolio[folioSeleccionado] ?? 0) : 0
  const vistasAnterior = folioSeleccionado ? (vistasMesAnteriorPorFolio[folioSeleccionado] ?? 0) : 0
  const cambioVistas = vistasAnterior > 0 ? Math.round(((vistas - vistasAnterior) / vistasAnterior) * 100) : 0

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-texto sm:text-3xl">
            {saludoPorHora()}, <strong>{nombre}</strong>.
          </h1>
          <p className="mt-1 text-sm text-texto-suave">
            {propiedad && procesoSeleccionado
              ? `La propiedad de ${propiedad.ubicacion.colonia} va en el paso ${actual ? actual.orden : procesoSeleccionado.pasos.length} de ${procesoSeleccionado.pasos.length}.`
              : 'Capta tu primera propiedad para empezar a dar seguimiento aquí.'}
          </p>
        </div>
        <label className="flex shrink-0 items-center gap-2.5 rounded-full border border-gris-borde bg-blanco px-4 py-2.5 text-sm text-texto">
          <IconoCalendario size={16} strokeWidth={1.8} className="text-texto-suave" />
          <input
            type="date"
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
            className="bg-transparent text-sm text-texto outline-none [color-scheme:light]"
          />
        </label>
      </div>

      {!propiedad && <GuiaInicioRapido />}

      {propiedad && procesoSeleccionado && (
        <>
          <FilaMetricas>
            <TarjetaMetrica
              icono={Route}
              etiqueta="Paso actual"
              valor={
                <>
                  {actual ? actual.orden : procesoSeleccionado.pasos.length}
                  <span className="text-base font-normal text-texto-suave">/{procesoSeleccionado.pasos.length}</span>
                </>
              }
              detalle={actual ? actual.titulo : 'Proceso completado'}
            />

            <TarjetaMetrica
              icono={FileWarning}
              etiqueta="Pendientes de validar"
              valor={documentosPendientes.length}
              detalle={
                documentosPendientes.length > 0 ? (
                  <span className="text-alerta">Fecha límite: {procesoSeleccionado.cierreEstimado}</span>
                ) : (
                  <span className="text-exito">Al día</span>
                )
              }
            />

            <TarjetaMetrica
              icono={MessageSquare}
              etiqueta="Solicitudes"
              valor={solicitudesSinResponder}
              detalle={solicitudesSinResponder > 0 ? <span className="text-alerta">Sin responder</span> : <span className="text-exito">Todo contestado</span>}
            />

            <TarjetaMetrica
              variante="invertida"
              icono={Eye}
              etiqueta="Vistas este mes"
              valor={vistas}
              detalle={
                <span className={cambioVistas >= 0 ? 'text-oro-brillante' : ''}>
                  {cambioVistas >= 0 ? '+' : ''}
                  {cambioVistas}% vs. mes anterior
                </span>
              }
              graficaSecundaria={<MiniSparkline valorAnterior={vistasAnterior} valorActual={vistas} className="h-9 w-24" />}
            />
          </FilaMetricas>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.55fr_1fr]">
            <div className="space-y-4">
              {procesosPublicacion.length > 1 && (
                <div className="flex flex-wrap gap-2">
                  {procesosPublicacion.map((proceso) => {
                    const prop = propiedadesDemo.find((p) => p.folio === proceso.folio)
                    return (
                      <button
                        key={proceso.folio}
                        type="button"
                        onClick={() => setFolioSeleccionado(proceso.folio)}
                        className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
                          proceso.folio === folioSeleccionado
                            ? 'border-onix bg-onix text-blanco'
                            : 'border-gris-borde text-texto-suave hover:border-onix hover:text-onix'
                        }`}
                      >
                        {prop ? prop.ubicacion.colonia : proceso.folio}
                      </button>
                    )
                  })}
                </div>
              )}

              <Tarjeta>
                <EncabezadoTarjeta
                  titulo="Propiedad en captación"
                  subtitulo={`En captación desde el ${procesoSeleccionado.iniciado}`}
                  accion={faseActiva && <Chip variante="accion">{faseActiva}</Chip>}
                />

                <div className="flex flex-wrap items-center gap-4">
                  {propiedad.medios[0] && (
                    <img
                      src={propiedad.medios[0].url}
                      alt={propiedad.medios[0].alt}
                      className="h-[70px] w-24 shrink-0 rounded-3r-md object-cover"
                    />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-texto-suave">{propiedad.folio}</p>
                    <p className="font-serif text-lg font-bold text-texto">{formatearPrecio(precioMinimo(propiedad))}</p>
                    <p className="truncate text-xs text-texto-suave">{resumenAtributos(propiedad).join(' · ')}</p>
                    <p className="truncate text-xs text-texto-suave">
                      {propiedad.ubicacion.colonia}, {propiedad.ubicacion.alcaldia}
                    </p>
                  </div>
                  <Boton to={`/propiedad/${propiedad.folio}`} variante="contorno" className="shrink-0 text-xs">
                    Ver ficha
                  </Boton>
                </div>
              </Tarjeta>

              <Tarjeta>
                <EncabezadoTarjeta
                  titulo="Cómo va la captación"
                  subtitulo="Cada paso indica de quién depende avanzar"
                  accion={
                    <Boton to="/admin/inventario" variante="contorno" className="px-3 py-1.5 text-xs">
                      Ver detalle
                    </Boton>
                  }
                />
                <PasosProceso pasos={procesoSeleccionado.pasos} />
              </Tarjeta>
            </div>

            <div className="space-y-4">
              <Tarjeta>
                <EncabezadoTarjeta titulo="Pendiente de validar" />
                {documentosPendientes.length === 0 ? (
                  <p className="text-sm text-texto-suave">No hay documentos pendientes de validación.</p>
                ) : (
                  <div>
                    {documentosPendientes.map((documento) => (
                      <Fila
                        key={documento.id}
                        icono={FileWarning}
                        titulo={documento.nombre}
                        descripcion={etiquetaDocumento(documento.estado)}
                        meta={
                          <Boton to="/admin/validacion" variante="contorno" className="px-3 py-1.5 text-xs">
                            Revisar
                          </Boton>
                        }
                      />
                    ))}
                  </div>
                )}
                <Link to="/admin/validacion" className="mt-3 inline-block text-xs font-semibold text-onix hover:underline">
                  Ir a Confianza y Validación
                </Link>
              </Tarjeta>

              <Tarjeta>
                <EncabezadoTarjeta titulo="Últimas solicitudes" />
                {ultimasSolicitudes.length === 0 ? (
                  <p className="text-sm text-texto-suave">Todavía no hay solicitudes para esta propiedad.</p>
                ) : (
                  <div>
                    {ultimasSolicitudes.map((solicitud) => (
                      <Fila
                        key={solicitud.id}
                        icono={MessageSquare}
                        titulo={solicitud.nombreProspecto}
                        descripcion={solicitud.mensaje}
                        meta={<Chip variante={solicitud.respondida ? 'exito' : 'accion'}>{solicitud.respondida ? 'Respondida' : 'Sin responder'}</Chip>}
                      />
                    ))}
                  </div>
                )}
                <Link to="/admin/prospectos-venta" className="mt-3 inline-block text-xs font-semibold text-onix hover:underline">
                  Ver todas las solicitudes
                </Link>
              </Tarjeta>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
