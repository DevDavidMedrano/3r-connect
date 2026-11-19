import { useState } from 'react'
import type { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { Boton, EncabezadoPagina, Tarjeta } from '../../components/cliente/Piezas'
import { useDatosAdmin } from '../../components/admin/useDatosAdmin'
import { asesoresDemo } from '../../data/asesoresDemo'
import { OPCIONES_COLONIA } from '../../data/colonias'
import { ETIQUETA_TIPO, type Moneda, type TipoPropiedad } from '../../types/propiedad'
import { ETIQUETA_ETAPA, ETIQUETA_ORIGEN, type EtapaProspecto, type OperacionProspecto, type OrigenProspecto, type Prospecto } from '../../types/prospecto'

const TIPOS: TipoPropiedad[] = ['departamento', 'casa', 'penthouse', 'oficina', 'local-comercial', 'terreno']

const ORIGENES: OrigenProspecto[] = ['web', 'llamada', 'referido', 'redes_sociales', 'portal']

const ETAPAS: EtapaProspecto[] = ['nuevo', 'contactado', 'valuacion_agendada', 'exclusiva_firmada', 'en_inventario']

const CLASE_INPUT =
  'w-full rounded-3r-md border border-gris-borde px-3.5 py-2.5 text-sm text-texto outline-none focus:border-vino-vivo'

function clasesPill(activo: boolean): string {
  return `rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors ${
    activo ? 'border-vino-vivo bg-vino-vivo text-blanco' : 'border-gris-borde text-texto hover:border-vino-vivo hover:text-vino-vivo'
  }`
}

function Campo({ etiqueta, children, nota }: { etiqueta: string; children: ReactNode; nota?: string }) {
  return (
    <label className="block">
      <span className="text-xs font-semibold uppercase tracking-wide text-texto-suave">{etiqueta}</span>
      <div className="mt-1.5">{children}</div>
      {nota && <p className="mt-1 text-xs text-texto-suave">{nota}</p>}
    </label>
  )
}

interface Borrador {
  propietarioNombre: string
  propietarioCorreo: string
  propietarioTelefono: string
  origen: OrigenProspecto

  tipo: TipoPropiedad | null
  operaciones: OperacionProspecto[]
  colonia: string
  direccion: string
  recamaras: string
  banos: string
  m2Construccion: string
  m2Terreno: string
  precioMonto: string
  precioMoneda: Moneda

  asesorId: string
  etapa: EtapaProspecto
}

const BORRADOR_INICIAL: Borrador = {
  propietarioNombre: '',
  propietarioCorreo: '',
  propietarioTelefono: '',
  origen: 'web',
  tipo: null,
  operaciones: [],
  colonia: '',
  direccion: '',
  recamaras: '',
  banos: '',
  m2Construccion: '',
  m2Terreno: '',
  precioMonto: '',
  precioMoneda: 'MXN',
  asesorId: '',
  etapa: 'nuevo',
}

function formularioValido(b: Borrador): boolean {
  if (!b.propietarioNombre.trim() || !b.propietarioCorreo.trim() || !b.propietarioTelefono.trim()) return false
  if (!b.tipo || b.operaciones.length === 0 || !b.colonia || !b.direccion.trim()) return false
  if (!b.precioMonto || Number(b.precioMonto) <= 0) return false
  if (b.tipo === 'terreno') return Number(b.m2Terreno) > 0
  if (b.tipo === 'oficina' || b.tipo === 'local-comercial') return Number(b.banos) > 0 && Number(b.m2Construccion) > 0
  return Number(b.recamaras) > 0 && Number(b.banos) > 0 && Number(b.m2Construccion) > 0
}

export default function NuevoProspectoCaptacionPage() {
  const navigate = useNavigate()
  const { agregarProspecto } = useDatosAdmin()
  const [b, setB] = useState<Borrador>(BORRADOR_INICIAL)

  function actualizar(cambios: Partial<Borrador>) {
    setB((actual) => ({ ...actual, ...cambios }))
  }

  function alternarOperacion(operacion: OperacionProspecto) {
    actualizar({
      operaciones: b.operaciones.includes(operacion)
        ? b.operaciones.filter((o) => o !== operacion)
        : [...b.operaciones, operacion],
    })
  }

  const muestraRecamaras = b.tipo === 'departamento' || b.tipo === 'penthouse' || b.tipo === 'casa'
  const muestraBanos = b.tipo !== null && b.tipo !== 'terreno'
  const muestraM2Construccion = b.tipo !== null && b.tipo !== 'terreno'
  const muestraM2Terreno = b.tipo === 'terreno'

  function guardar() {
    if (!b.tipo || !formularioValido(b)) return

    const prospecto: Prospecto = {
      id: `prospecto-${Date.now()}`,
      propietarioNombre: b.propietarioNombre.trim(),
      propietarioCorreo: b.propietarioCorreo.trim(),
      propietarioTelefono: b.propietarioTelefono.trim(),
      origen: b.origen,
      tipoPropiedad: b.tipo,
      operaciones: b.operaciones,
      colonia: b.colonia,
      direccion: b.direccion.trim(),
      ...(muestraRecamaras ? { recamaras: Number(b.recamaras) } : {}),
      ...(muestraBanos ? { banos: Number(b.banos) } : {}),
      ...(muestraM2Construccion ? { m2Construccion: Number(b.m2Construccion) } : {}),
      ...(muestraM2Terreno ? { m2Terreno: Number(b.m2Terreno) } : {}),
      precioEstimado: { monto: Number(b.precioMonto), moneda: b.precioMoneda },
      etapa: b.etapa,
      pasoCaptacion: null,
      asesorId: b.asesorId || null,
      fecha: new Date().toISOString().slice(0, 10),
    }

    agregarProspecto(prospecto)
    navigate('/admin/prospectos-captacion')
  }

  const puedeGuardar = formularioValido(b)

  return (
    <div className="space-y-5 pb-20 sm:pb-0">
      <EncabezadoPagina titulo="Nuevo prospecto" descripcion="Da de alta a un dueño interesado en publicar su propiedad." />

      <Tarjeta className="space-y-5">
        <h2 className="text-base font-bold text-texto">Datos del propietario</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Campo etiqueta="Nombre">
            <input
              type="text"
              value={b.propietarioNombre}
              onChange={(evento) => actualizar({ propietarioNombre: evento.target.value })}
              className={CLASE_INPUT}
            />
          </Campo>
          <Campo etiqueta="Correo">
            <input
              type="email"
              value={b.propietarioCorreo}
              onChange={(evento) => actualizar({ propietarioCorreo: evento.target.value })}
              className={CLASE_INPUT}
            />
          </Campo>
          <Campo etiqueta="Teléfono">
            <input
              type="tel"
              value={b.propietarioTelefono}
              onChange={(evento) => actualizar({ propietarioTelefono: evento.target.value })}
              placeholder="+52 55 0000 0000"
              className={CLASE_INPUT}
            />
          </Campo>
          <Campo etiqueta="¿Cómo nos contactó?">
            <select
              value={b.origen}
              onChange={(evento) => actualizar({ origen: evento.target.value as OrigenProspecto })}
              className={CLASE_INPUT}
            >
              {ORIGENES.map((origen) => (
                <option key={origen} value={origen}>
                  {ETIQUETA_ORIGEN[origen]}
                </option>
              ))}
            </select>
          </Campo>
        </div>
      </Tarjeta>

      <Tarjeta className="space-y-5">
        <h2 className="text-base font-bold text-texto">Datos de la propiedad</h2>

        <Campo etiqueta="Tipo de propiedad">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {TIPOS.map((tipo) => (
              <button
                key={tipo}
                type="button"
                onClick={() => actualizar({ tipo })}
                className={`rounded-3r-md border px-3 py-2.5 text-sm font-semibold transition-colors ${
                  b.tipo === tipo ? 'border-vino-vivo bg-vino-vivo/5 text-vino-vivo' : 'border-gris-borde text-texto hover:border-vino-vivo'
                }`}
              >
                {ETIQUETA_TIPO[tipo]}
              </button>
            ))}
          </div>
        </Campo>

        <Campo etiqueta="Operación" nota="Puedes marcar las dos: se puede ofrecer en venta y en renta a la vez.">
          <div className="flex gap-2">
            <button type="button" onClick={() => alternarOperacion('venta')} className={clasesPill(b.operaciones.includes('venta'))}>
              Venta
            </button>
            <button type="button" onClick={() => alternarOperacion('renta')} className={clasesPill(b.operaciones.includes('renta'))}>
              Renta
            </button>
          </div>
        </Campo>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Campo etiqueta="Colonia">
            <select value={b.colonia} onChange={(evento) => actualizar({ colonia: evento.target.value })} className={CLASE_INPUT}>
              <option value="">Selecciona una colonia</option>
              {OPCIONES_COLONIA.map((colonia) => (
                <option key={colonia.valor} value={colonia.valor}>
                  {colonia.etiqueta}
                </option>
              ))}
            </select>
          </Campo>
          <Campo etiqueta="Dirección">
            <input
              type="text"
              value={b.direccion}
              onChange={(evento) => actualizar({ direccion: evento.target.value })}
              placeholder="Calle y número"
              className={CLASE_INPUT}
            />
          </Campo>
        </div>

        {b.tipo && (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {muestraRecamaras && (
              <Campo etiqueta="Recámaras">
                <input
                  type="number"
                  min="1"
                  value={b.recamaras}
                  onChange={(evento) => actualizar({ recamaras: evento.target.value })}
                  className={CLASE_INPUT}
                />
              </Campo>
            )}
            {muestraBanos && (
              <Campo etiqueta="Baños">
                <input
                  type="number"
                  min="0.5"
                  step="0.5"
                  value={b.banos}
                  onChange={(evento) => actualizar({ banos: evento.target.value })}
                  className={CLASE_INPUT}
                />
              </Campo>
            )}
            {muestraM2Construccion && (
              <Campo etiqueta="M² de construcción">
                <input
                  type="number"
                  min="1"
                  value={b.m2Construccion}
                  onChange={(evento) => actualizar({ m2Construccion: evento.target.value })}
                  className={CLASE_INPUT}
                />
              </Campo>
            )}
            {muestraM2Terreno && (
              <Campo etiqueta="M² de terreno">
                <input
                  type="number"
                  min="1"
                  value={b.m2Terreno}
                  onChange={(evento) => actualizar({ m2Terreno: evento.target.value })}
                  className={CLASE_INPUT}
                />
              </Campo>
            )}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Campo etiqueta="Precio estimado">
            <input
              type="number"
              min="1"
              value={b.precioMonto}
              onChange={(evento) => actualizar({ precioMonto: evento.target.value })}
              className={CLASE_INPUT}
            />
          </Campo>
          <Campo etiqueta="Moneda">
            <div className="flex gap-2">
              {(['MXN', 'USD'] as const).map((moneda) => (
                <button
                  key={moneda}
                  type="button"
                  onClick={() => actualizar({ precioMoneda: moneda })}
                  className={clasesPill(b.precioMoneda === moneda)}
                >
                  {moneda}
                </button>
              ))}
            </div>
          </Campo>
        </div>
      </Tarjeta>

      <Tarjeta className="space-y-5">
        <h2 className="text-base font-bold text-texto">Asignación</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Campo etiqueta="Asesor captador">
            <select value={b.asesorId} onChange={(evento) => actualizar({ asesorId: evento.target.value })} className={CLASE_INPUT}>
              <option value="">Sin asignar</option>
              {asesoresDemo.map((asesor) => (
                <option key={asesor.id} value={asesor.id}>
                  {asesor.nombre}
                </option>
              ))}
            </select>
          </Campo>
          <Campo etiqueta="Etapa inicial">
            <select
              value={b.etapa}
              onChange={(evento) => actualizar({ etapa: evento.target.value as EtapaProspecto })}
              className={CLASE_INPUT}
            >
              {ETAPAS.map((etapa) => (
                <option key={etapa} value={etapa}>
                  {ETIQUETA_ETAPA[etapa]}
                </option>
              ))}
            </select>
          </Campo>
        </div>
      </Tarjeta>

      <div className="fixed inset-x-0 bottom-0 z-30 flex items-center justify-end gap-3 border-t border-gris-borde bg-blanco px-4 py-3 sm:static sm:z-auto sm:border-t-0 sm:bg-transparent sm:px-0 sm:py-0">
        <Boton variante="contorno" to="/admin/prospectos-captacion">
          Cancelar
        </Boton>
        <Boton variante="solido" onClick={guardar} disabled={!puedeGuardar}>
          Guardar prospecto
        </Boton>
      </div>
    </div>
  )
}
