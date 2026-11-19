import { useState } from 'react'
import type { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { Boton, EncabezadoPagina, Tarjeta } from '../../components/cliente/Piezas'
import { useDatosAdmin } from '../../components/admin/useDatosAdmin'
import { asesoresDemo } from '../../data/asesoresDemo'
import { OPCIONES_COLONIA } from '../../data/colonias'
import { ETIQUETA_TIPO, type Moneda, type TipoPropiedad } from '../../types/propiedad'
import {
  ETIQUETA_ETAPA_VENTA,
  ETIQUETA_ORIGEN_VENTA,
  type EtapaProspectoVenta,
  type OperacionBusqueda,
  type OrigenProspectoVenta,
  type ProspectoVenta,
} from '../../types/prospectoVenta'

const TIPOS: TipoPropiedad[] = ['departamento', 'casa', 'penthouse', 'oficina', 'local-comercial', 'terreno']

const ORIGENES: OrigenProspectoVenta[] = ['portal_3r', 'agente_ia', 'sitio_web', 'referido', 'llamada']

const ETAPAS: EtapaProspectoVenta[] = ['nuevo', 'calificado', 'mostrando', 'negociacion', 'cerrado']

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
  nombre: string
  correo: string
  telefono: string
  origen: OrigenProspectoVenta

  operacion: OperacionBusqueda
  presupuestoMin: string
  presupuestoMax: string
  moneda: Moneda
  zonas: string[]
  recamarasMin: string
  tipo: TipoPropiedad | ''
  creditoPreaprobado: boolean

  asesorId: string
  etapa: EtapaProspectoVenta
}

const BORRADOR_INICIAL: Borrador = {
  nombre: '',
  correo: '',
  telefono: '',
  origen: 'sitio_web',
  operacion: 'comprar',
  presupuestoMin: '',
  presupuestoMax: '',
  moneda: 'MXN',
  zonas: [],
  recamarasMin: '',
  tipo: '',
  creditoPreaprobado: false,
  asesorId: '',
  etapa: 'nuevo',
}

function formularioValido(b: Borrador): boolean {
  if (!b.nombre.trim() || !b.correo.trim() || !b.telefono.trim()) return false
  if (!b.presupuestoMin || !b.presupuestoMax) return false
  if (Number(b.presupuestoMin) <= 0 || Number(b.presupuestoMax) < Number(b.presupuestoMin)) return false
  return true
}

export default function NuevoProspectoVentaPage() {
  const navigate = useNavigate()
  const { agregarProspectoVenta } = useDatosAdmin()
  const [b, setB] = useState<Borrador>(BORRADOR_INICIAL)

  function actualizar(cambios: Partial<Borrador>) {
    setB((actual) => ({ ...actual, ...cambios }))
  }

  function alternarZona(zona: string) {
    actualizar({ zonas: b.zonas.includes(zona) ? b.zonas.filter((z) => z !== zona) : [...b.zonas, zona] })
  }

  function guardar() {
    if (!formularioValido(b)) return

    const hoy = new Date().toISOString().slice(0, 10)
    const prospecto: ProspectoVenta = {
      id: `prospecto-venta-${Date.now()}`,
      nombre: b.nombre.trim(),
      correo: b.correo.trim(),
      telefono: b.telefono.trim(),
      origen: b.origen,
      operacion: b.operacion,
      presupuestoMin: Number(b.presupuestoMin),
      presupuestoMax: Number(b.presupuestoMax),
      moneda: b.moneda,
      zonas: b.zonas,
      recamarasMin: b.recamarasMin ? Number(b.recamarasMin) : null,
      tipoPropiedad: b.tipo || null,
      creditoPreaprobado: b.creditoPreaprobado,
      etapa: b.etapa,
      asesorId: b.asesorId || null,
      fecha: hoy,
      ultimoContacto: hoy,
      fechaCierre: b.etapa === 'cerrado' ? hoy : null,
    }

    agregarProspectoVenta(prospecto)
    navigate('/admin/prospectos-venta')
  }

  const puedeGuardar = formularioValido(b)

  return (
    <div className="space-y-5 pb-20 sm:pb-0">
      <EncabezadoPagina titulo="Nuevo prospecto" descripcion="Da de alta a un comprador o inquilino interesado." />

      <Tarjeta className="space-y-5">
        <h2 className="text-base font-bold text-texto">Datos de contacto</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Campo etiqueta="Nombre">
            <input type="text" value={b.nombre} onChange={(evento) => actualizar({ nombre: evento.target.value })} className={CLASE_INPUT} />
          </Campo>
          <Campo etiqueta="Correo">
            <input
              type="email"
              value={b.correo}
              onChange={(evento) => actualizar({ correo: evento.target.value })}
              className={CLASE_INPUT}
            />
          </Campo>
          <Campo etiqueta="Teléfono">
            <input
              type="tel"
              value={b.telefono}
              onChange={(evento) => actualizar({ telefono: evento.target.value })}
              placeholder="+52 55 0000 0000"
              className={CLASE_INPUT}
            />
          </Campo>
          <Campo etiqueta="Origen">
            <select value={b.origen} onChange={(evento) => actualizar({ origen: evento.target.value as OrigenProspectoVenta })} className={CLASE_INPUT}>
              {ORIGENES.map((origen) => (
                <option key={origen} value={origen}>
                  {ETIQUETA_ORIGEN_VENTA[origen]}
                </option>
              ))}
            </select>
          </Campo>
        </div>
      </Tarjeta>

      <Tarjeta className="space-y-5">
        <h2 className="text-base font-bold text-texto">Qué busca</h2>

        <Campo etiqueta="Operación">
          <div className="flex gap-2">
            <button type="button" onClick={() => actualizar({ operacion: 'comprar' })} className={clasesPill(b.operacion === 'comprar')}>
              Comprar
            </button>
            <button type="button" onClick={() => actualizar({ operacion: 'rentar' })} className={clasesPill(b.operacion === 'rentar')}>
              Rentar
            </button>
          </div>
        </Campo>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Campo etiqueta="Presupuesto mínimo">
            <input
              type="number"
              min="1"
              value={b.presupuestoMin}
              onChange={(evento) => actualizar({ presupuestoMin: evento.target.value })}
              className={CLASE_INPUT}
            />
          </Campo>
          <Campo etiqueta="Presupuesto máximo">
            <input
              type="number"
              min="1"
              value={b.presupuestoMax}
              onChange={(evento) => actualizar({ presupuestoMax: evento.target.value })}
              className={CLASE_INPUT}
            />
          </Campo>
          <Campo etiqueta="Moneda">
            <div className="flex gap-2">
              {(['MXN', 'USD'] as const).map((moneda) => (
                <button key={moneda} type="button" onClick={() => actualizar({ moneda })} className={clasesPill(b.moneda === moneda)}>
                  {moneda}
                </button>
              ))}
            </div>
          </Campo>
          <Campo etiqueta="Recámaras mínimas">
            <input
              type="number"
              min="0"
              value={b.recamarasMin}
              onChange={(evento) => actualizar({ recamarasMin: evento.target.value })}
              className={CLASE_INPUT}
            />
          </Campo>
        </div>

        <Campo etiqueta="Zonas de interés" nota="Puedes marcar varias.">
          <div className="flex flex-wrap gap-2">
            {OPCIONES_COLONIA.map((colonia) => (
              <button
                key={colonia.valor}
                type="button"
                onClick={() => alternarZona(colonia.valor)}
                className={clasesPill(b.zonas.includes(colonia.valor))}
              >
                {colonia.etiqueta}
              </button>
            ))}
          </div>
        </Campo>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Campo etiqueta="Tipo de propiedad">
            <select value={b.tipo} onChange={(evento) => actualizar({ tipo: evento.target.value as TipoPropiedad | '' })} className={CLASE_INPUT}>
              <option value="">Cualquiera</option>
              {TIPOS.map((tipo) => (
                <option key={tipo} value={tipo}>
                  {ETIQUETA_TIPO[tipo]}
                </option>
              ))}
            </select>
          </Campo>

          <Campo etiqueta="Crédito">
            <button
              type="button"
              onClick={() => actualizar({ creditoPreaprobado: !b.creditoPreaprobado })}
              className={clasesPill(b.creditoPreaprobado)}
            >
              {b.creditoPreaprobado ? 'Con crédito preaprobado' : 'Sin crédito preaprobado'}
            </button>
          </Campo>
        </div>
      </Tarjeta>

      <Tarjeta className="space-y-5">
        <h2 className="text-base font-bold text-texto">Asignación</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Campo etiqueta="Asesor">
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
            <select value={b.etapa} onChange={(evento) => actualizar({ etapa: evento.target.value as EtapaProspectoVenta })} className={CLASE_INPUT}>
              {ETAPAS.map((etapa) => (
                <option key={etapa} value={etapa}>
                  {ETIQUETA_ETAPA_VENTA[etapa]}
                </option>
              ))}
            </select>
          </Campo>
        </div>
      </Tarjeta>

      <div className="fixed inset-x-0 bottom-0 z-30 flex items-center justify-end gap-3 border-t border-gris-borde bg-blanco px-4 py-3 sm:static sm:z-auto sm:border-t-0 sm:bg-transparent sm:px-0 sm:py-0">
        <Boton variante="contorno" to="/admin/prospectos-venta">
          Cancelar
        </Boton>
        <Boton variante="solido" onClick={guardar} disabled={!puedeGuardar}>
          Guardar prospecto
        </Boton>
      </div>
    </div>
  )
}
