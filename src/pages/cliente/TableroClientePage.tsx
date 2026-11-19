import { CalendarDays, FileWarning, Route, Wallet } from 'lucide-react'
import { Link } from 'react-router-dom'
import { PasosProceso } from '../../components/cliente/PasosProceso'
import { Boton, Chip, EncabezadoPagina, EncabezadoTarjeta, Fila, FilaMetricas, Tarjeta, TarjetaMetrica } from '../../components/cliente/Piezas'
import { saludoPorHora, useDatosCliente } from '../../components/cliente/useDatosCliente'
import { useSesion } from '../../components/cuenta/SesionContext'
import { AvatarAsesor } from '../../components/asesores/AvatarAsesor'
import { propiedadesDemo } from '../../data/propiedadesDemo'
import { formatearPrecio, precioMinimo, resumenAtributos } from '../../types/propiedad'
import { etiquetaDocumento, pasoActual, pasosCompletados } from '../../types/proceso'
import type { PasoProceso } from '../../types/proceso'

// Los N pasos que rodean al actual: la mitad atrás (contexto de dónde
// viene), el actual, y la mitad adelante (qué sigue). Si no hay paso
// "actual" (proceso recién iniciado o ya cerrado), cae a los primeros N.
function pasosAlrededorDelActual(pasos: readonly PasoProceso[], cantidad: number): PasoProceso[] {
  const indiceActual = pasos.findIndex((paso) => paso.estado === 'actual')
  if (indiceActual === -1) return pasos.slice(0, cantidad)
  const inicio = Math.max(0, Math.min(indiceActual - Math.floor(cantidad / 2), pasos.length - cantidad))
  return pasos.slice(inicio, inicio + cantidad)
}

export default function TableroClientePage() {
  const { nombre, proceso, asesor } = useDatosCliente()
  const { visitasCliente } = useSesion()

  const propiedad = propiedadesDemo.find((p) => p.folio === proceso.folio)

  const completados = pasosCompletados(proceso)
  const ultimoCompletado = completados[completados.length - 1]
  const faseActiva = ultimoCompletado ? `${ultimoCompletado.titulo} activo` : null
  const pasoApartado = proceso.pasos.find((paso) => paso.titulo === 'Apartado')

  const actual = pasoActual(proceso)

  const documentosPendientes = proceso.documentos.filter(
    (documento) => documento.origen === 'sube_cliente' && documento.estado !== 'validado',
  )

  const proximaVisita = visitasCliente[0]

  // Los montos demo del proceso están todos en la misma moneda: se suman
  // directo, sin conversión.
  const moneda = proceso.movimientos[0]?.monto.moneda ?? 'MXN'
  const totalMonto = proceso.movimientos.reduce((suma, movimiento) => suma + movimiento.monto.monto, 0)
  const pagadoMonto = proceso.movimientos
    .filter((movimiento) => movimiento.estado === 'pagado')
    .reduce((suma, movimiento) => suma + movimiento.monto.monto, 0)
  const saldoPendiente = totalMonto - pagadoMonto

  const descripcionPagina =
    `Vas en el paso ${actual ? actual.orden : proceso.pasos.length} de ${proceso.pasos.length}.` +
    (documentosPendientes.length > 0
      ? ` Ahora te toca a ti: faltan ${documentosPendientes.length} documento${documentosPendientes.length === 1 ? '' : 's'}.`
      : ' Ya no tienes nada pendiente de tu lado.')

  return (
    <div className="space-y-4">
      <EncabezadoPagina titulo={`${saludoPorHora()}, ${nombre}.`} descripcion={descripcionPagina} />

      <FilaMetricas>
        <TarjetaMetrica
          variante="invertida"
          icono={Route}
          etiqueta="Paso actual"
          valor={
            <>
              {actual ? actual.orden : proceso.pasos.length}
              <span className="text-base font-normal text-blanco/60">/{proceso.pasos.length}</span>
            </>
          }
          detalle={actual ? actual.titulo : 'Proceso completado'}
        />

        <TarjetaMetrica
          icono={FileWarning}
          etiqueta="Pendientes de tu lado"
          valor={documentosPendientes.length}
          detalle={
            documentosPendientes.length > 0 ? (
              <span className="text-alerta">Fecha límite: {proceso.cierreEstimado}</span>
            ) : (
              <span className="text-exito">Estás al día</span>
            )
          }
        />

        <TarjetaMetrica
          icono={CalendarDays}
          etiqueta="Próxima cita"
          valor={proximaVisita ? proximaVisita.horarioEtiqueta : 'Sin citas agendadas'}
          detalle={
            proximaVisita ? (
              <span className="line-clamp-1">{proximaVisita.propiedadTitulo}</span>
            ) : (
              <Link to="/mi-cuenta/visitas" className="font-semibold text-onix hover:underline">
                Ver mis visitas
              </Link>
            )
          }
        />

        <TarjetaMetrica
          icono={Wallet}
          etiqueta="Saldo por cubrir"
          valor={formatearPrecio({ monto: saldoPendiente, moneda })}
          detalle={`Anticipo pagado: ${formatearPrecio({ monto: pagadoMonto, moneda })}`}
        />
      </FilaMetricas>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.55fr_1fr]">
        <div className="space-y-4">
          {propiedad && (
            <Tarjeta>
              <EncabezadoTarjeta
                titulo="Propiedad en proceso"
                subtitulo={pasoApartado?.fechaCompletado ? `Apartada desde el ${pasoApartado.fechaCompletado}` : undefined}
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
          )}

          <Tarjeta>
            <EncabezadoTarjeta
              titulo="Cómo va tu proceso"
              subtitulo="Cada paso indica de quién depende avanzar"
              accion={
                <Boton to="/mi-cuenta/proceso" variante="contorno" className="px-3 py-1.5 text-xs">
                  Ver detalle
                </Boton>
              }
            />
            <PasosProceso pasos={pasosAlrededorDelActual(proceso.pasos, 5)} />
          </Tarjeta>
        </div>

        <div className="space-y-4">
          <Tarjeta>
            <EncabezadoTarjeta titulo="Lo que falta de tu lado" />
            {documentosPendientes.length === 0 ? (
              <p className="text-sm text-texto-suave">Ya subiste todo lo que te tocaba. Buen trabajo.</p>
            ) : (
              <div>
                {documentosPendientes.map((documento) => (
                  <Fila
                    key={documento.id}
                    icono={FileWarning}
                    titulo={documento.nombre}
                    descripcion={etiquetaDocumento(documento.estado)}
                    meta={
                      <Boton to="/mi-cuenta/documentos" variante="contorno" className="px-3 py-1.5 text-xs">
                        Subir
                      </Boton>
                    }
                  />
                ))}
              </div>
            )}
            <Link to="/mi-cuenta/documentos" className="mt-3 inline-block text-xs font-semibold text-onix hover:underline">
              Ir a documentos
            </Link>
          </Tarjeta>

          <Tarjeta>
            <EncabezadoTarjeta titulo="Próxima cita" />
            {proximaVisita ? (
              <>
                <p className="text-sm font-semibold text-texto">{proximaVisita.propiedadTitulo}</p>
                <p className="mt-1 text-xs leading-relaxed text-texto-suave">
                  {proximaVisita.horarioEtiqueta}
                  <br />
                  Con {proximaVisita.asesorNombre} · {proximaVisita.folio}
                </p>
                <div className="mt-3.5 flex gap-2">
                  <Boton variante="solido" className="flex-1 text-xs">
                    Confirmar
                  </Boton>
                  <Boton variante="contorno" className="flex-1 text-xs">
                    Reagendar
                  </Boton>
                </div>
              </>
            ) : (
              <>
                <p className="text-sm text-texto-suave">No tienes visitas agendadas todavía.</p>
                <Link to="/mi-cuenta/visitas" className="mt-3 inline-block text-xs font-semibold text-onix hover:underline">
                  Ver mis visitas
                </Link>
              </>
            )}
          </Tarjeta>

          <Tarjeta>
            <EncabezadoTarjeta titulo="Tu asesor" />
            <div className="flex items-center gap-3">
              <AvatarAsesor asesor={asesor} className="h-11 w-11 text-sm" />
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-texto">{asesor.nombre}</p>
                <p className="text-xs text-texto-suave">Tu asesor en 3R Connect</p>
              </div>
            </div>

            <Boton to="/mi-cuenta/asesor" variante="solido" className="mt-3.5 w-full">
              Enviar mensaje
            </Boton>
          </Tarjeta>
        </div>
      </div>
    </div>
  )
}
