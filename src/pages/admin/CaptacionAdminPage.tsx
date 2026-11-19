import { useState } from 'react'
import type { DragEvent, ReactNode } from 'react'
import { ClipboardCheck, UploadCloud, X } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { PropertyCard } from '../../components/landing/PropertyCard'
import { Boton, EncabezadoPagina, Fila, Tarjeta } from '../../components/cliente/Piezas'
import { useDatosAdmin } from '../../components/admin/useDatosAdmin'
import { asesoresDemo } from '../../data/asesoresDemo'
import { COLONIA_BASE } from '../../data/coloniasCoordenadas'
import {
  ETIQUETA_TIPO,
  listadoRenta,
  listadoVenta,
  type Coordenadas,
  type ListadoRenta,
  type ListadoVenta,
  type Medio,
  type Moneda,
  type Propiedad,
  type PropiedadConstruida,
  type TipoCredito,
  type TipoPropiedad,
  type UbicacionExacta,
} from '../../types/propiedad'

// ---------------------------------------------------------------------------
// Datos de apoyo del formulario — nada de esto vive en types/propiedad.ts:
// son datos propios de ESTE formulario (colonias cerradas, créditos, etc.),
// no del modelo de dominio.
// ---------------------------------------------------------------------------

const COLONIAS: { valor: string; etiqueta: string }[] = [
  { valor: 'polanco', etiqueta: 'Polanco' },
  { valor: 'lomas de chapultepec', etiqueta: 'Lomas de Chapultepec' },
  { valor: 'nuevo polanco', etiqueta: 'Nuevo Polanco' },
  { valor: 'anzures', etiqueta: 'Anzures' },
  { valor: 'condesa', etiqueta: 'Condesa' },
  { valor: 'roma norte', etiqueta: 'Roma Norte' },
  { valor: 'napoles', etiqueta: 'Nápoles' },
  { valor: 'tecamachalco', etiqueta: 'Tecamachalco' },
]

// COLONIA_BASE (coloniasCoordenadas.ts) solo trae lat/lng. Alcaldía, ciudad
// y código postal son propios de este formulario — mismos valores que ya
// usa propiedadesDemo.ts para las colonias que comparten.
const DATOS_COLONIA: Record<string, { alcaldia: string; ciudad: string; codigoPostal: string }> = {
  polanco: { alcaldia: 'Miguel Hidalgo', ciudad: 'Ciudad de México', codigoPostal: '11560' },
  'lomas de chapultepec': { alcaldia: 'Miguel Hidalgo', ciudad: 'Ciudad de México', codigoPostal: '11000' },
  'nuevo polanco': { alcaldia: 'Miguel Hidalgo', ciudad: 'Ciudad de México', codigoPostal: '11520' },
  anzures: { alcaldia: 'Miguel Hidalgo', ciudad: 'Ciudad de México', codigoPostal: '11590' },
  condesa: { alcaldia: 'Cuauhtémoc', ciudad: 'Ciudad de México', codigoPostal: '06140' },
  'roma norte': { alcaldia: 'Cuauhtémoc', ciudad: 'Ciudad de México', codigoPostal: '06700' },
  napoles: { alcaldia: 'Benito Juárez', ciudad: 'Ciudad de México', codigoPostal: '03810' },
  tecamachalco: { alcaldia: 'Naucalpan de Juárez', ciudad: 'Estado de México', codigoPostal: '53950' },
}

const TIPOS: TipoPropiedad[] = ['departamento', 'casa', 'penthouse', 'oficina', 'local-comercial', 'terreno']

const CREDITOS: TipoCredito[] = ['infonavit', 'fovissste', 'bancario', 'cofinavit']

const ETIQUETA_CREDITO: Record<TipoCredito, string> = {
  infonavit: 'Infonavit',
  fovissste: 'Fovissste',
  bancario: 'Bancario',
  cofinavit: 'Cofinavit',
}

const PASOS_FORM = [
  { numero: 1, etiqueta: 'Qué se capta' },
  { numero: 2, etiqueta: 'Operación' },
  { numero: 3, etiqueta: 'Dónde está' },
  { numero: 4, etiqueta: 'Fotos' },
  { numero: 5, etiqueta: 'Revisión' },
]

// Folio de mentira solo para la vista previa del paso 5 — PropertyCard no
// lo muestra en pantalla. El folio real se genera hasta que se publica.
const FOLIO_VISTA_PREVIA = '3R-PREVIEW'

interface Foto {
  id: string
  url: string
}

interface Borrador {
  tipo: TipoPropiedad | null
  descripcion: string
  recamaras: string
  banos: string
  m2Construccion: string
  m2Terreno: string

  incluyeVenta: boolean
  incluyeRenta: boolean
  moneda: Moneda
  precioVenta: string
  escriturado: boolean
  creditosAceptados: TipoCredito[]
  precioRenta: string
  plazoMinimoMeses: string
  amueblado: boolean
  incluyeMantenimiento: boolean
  depositoMonto: string

  colonia: string
  direccion: string

  fotos: Foto[]
}

const BORRADOR_INICIAL: Borrador = {
  tipo: null,
  descripcion: '',
  recamaras: '',
  banos: '',
  m2Construccion: '',
  m2Terreno: '',
  incluyeVenta: false,
  incluyeRenta: false,
  moneda: 'MXN',
  precioVenta: '',
  escriturado: false,
  creditosAceptados: [],
  precioRenta: '',
  plazoMinimoMeses: '',
  amueblado: false,
  incluyeMantenimiento: false,
  depositoMonto: '',
  colonia: '',
  direccion: '',
  fotos: [],
}

// ---------------------------------------------------------------------------
// Validación por paso — puertas para el botón "Continuar". Sin esto, nada
// impide guardar un terreno con recámaras o una renta sin depósito.
// ---------------------------------------------------------------------------

function paso1Valido(b: Borrador): boolean {
  if (!b.tipo || !b.descripcion.trim()) return false
  const recamaras = Number(b.recamaras)
  const banos = Number(b.banos)
  const m2Construccion = Number(b.m2Construccion)
  const m2Terreno = Number(b.m2Terreno)

  if (b.tipo === 'departamento' || b.tipo === 'penthouse') return recamaras > 0 && banos > 0 && m2Construccion > 0
  if (b.tipo === 'casa') return recamaras > 0 && banos > 0 && m2Construccion > 0 && m2Terreno > 0
  if (b.tipo === 'oficina' || b.tipo === 'local-comercial') return banos > 0 && m2Construccion > 0
  return m2Terreno > 0 // terreno
}

function paso2Valido(b: Borrador): boolean {
  if (!b.incluyeVenta && !b.incluyeRenta) return false
  if (b.incluyeVenta && Number(b.precioVenta) <= 0) return false
  if (b.incluyeRenta && (Number(b.precioRenta) <= 0 || Number(b.plazoMinimoMeses) <= 0 || Number(b.depositoMonto) <= 0)) {
    return false
  }
  return true
}

function paso3Valido(b: Borrador): boolean {
  return b.colonia !== '' && b.direccion.trim() !== ''
}

function paso4Valido(b: Borrador): boolean {
  return b.fotos.length >= 1
}

function pasoValido(numero: number, b: Borrador): boolean {
  if (numero === 1) return paso1Valido(b)
  if (numero === 2) return paso2Valido(b)
  if (numero === 3) return paso3Valido(b)
  if (numero === 4) return paso4Valido(b)
  return true
}

// ---------------------------------------------------------------------------
// Del borrador (todo strings y booleans sueltos, cómodo para inputs
// controlados) a la Propiedad real y estricta de types/propiedad.ts. Solo
// se llama cuando el paso correspondiente ya validó, así que los valores
// numéricos siempre son > 0 aquí.
// ---------------------------------------------------------------------------

function construirAtributos(b: Borrador) {
  if (!b.tipo) throw new Error('construirAtributos: falta el tipo de propiedad')
  const recamaras = Number(b.recamaras)
  const banos = Number(b.banos)
  const m2Construccion = Number(b.m2Construccion)
  const m2Terreno = Number(b.m2Terreno)

  if (b.tipo === 'departamento' || b.tipo === 'penthouse') {
    return { tipo: b.tipo, recamaras, banos, m2Construccion } as const
  }
  if (b.tipo === 'casa') {
    return { tipo: 'casa' as const, recamaras, banos, m2Construccion, m2Terreno }
  }
  if (b.tipo === 'oficina' || b.tipo === 'local-comercial') {
    return { tipo: b.tipo, banos, m2Construccion } as const
  }
  return { tipo: 'terreno' as const, m2Terreno }
}

function construirListados(b: Borrador): PropiedadConstruida['listados'] {
  const listados: (ListadoVenta | ListadoRenta)[] = []
  if (b.incluyeVenta) {
    listados.push(
      listadoVenta({
        precio: { monto: Number(b.precioVenta), moneda: b.moneda },
        escriturado: b.escriturado,
        creditosAceptados: b.creditosAceptados,
      }),
    )
  }
  if (b.incluyeRenta) {
    listados.push(
      listadoRenta({
        precio: { monto: Number(b.precioRenta), moneda: b.moneda },
        plazoMinimoMeses: Number(b.plazoMinimoMeses),
        amueblado: b.amueblado,
        incluyeMantenimiento: b.incluyeMantenimiento,
        deposito: { monto: Number(b.depositoMonto), moneda: b.moneda },
      }),
    )
  }
  if (listados.length === 0) throw new Error('construirListados: falta marcar venta o renta')
  return listados as PropiedadConstruida['listados']
}

function construirUbicacion(b: Borrador): UbicacionExacta {
  const datos = DATOS_COLONIA[b.colonia]
  const opcion = COLONIAS.find((c) => c.valor === b.colonia)
  return {
    colonia: opcion ? opcion.etiqueta : b.colonia,
    alcaldia: datos.alcaldia,
    ciudad: datos.ciudad,
    codigoPostal: datos.codigoPostal,
    direccion: b.direccion.trim(),
  }
}

function construirCoordenadas(b: Borrador): Coordenadas {
  return COLONIA_BASE[b.colonia]
}

function construirPropiedad(b: Borrador, folio: string): Propiedad {
  const ubicacion = construirUbicacion(b)
  const medios: Medio[] = b.fotos.map((foto, indice) => ({
    tipo: 'fotografia',
    url: foto.url,
    alt: `Foto ${indice + 1} de la propiedad en ${ubicacion.colonia}`,
  }))

  return {
    folio,
    estado: 'disponible',
    descripcion: b.descripcion.trim(),
    coordenadas: construirCoordenadas(b),
    detalles: { fechaPublicacion: new Date().toISOString().slice(0, 10) },
    ubicacion,
    medios,
    listados: construirListados(b),
    ...construirAtributos(b),
  }
}

// Formato "3R-###" — nunca lo captura el usuario, se genera hasta que se
// publica. Aleatorio a propósito: es un identificador nuevo, no algo que
// deba repetirse entre envíos como sí pasa con asesorParaPropiedad().
function generarFolio(): string {
  return `3R-${Math.floor(100 + Math.random() * 900)}`
}

// ---------------------------------------------------------------------------
// Piezas de formulario locales — reutilizadas entre los 5 pasos.
// ---------------------------------------------------------------------------

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

function BarraAvance({ paso }: { paso: number }) {
  return (
    <div>
      <div className="flex items-center justify-between gap-1 text-[11px] font-semibold uppercase tracking-wide sm:text-xs">
        {PASOS_FORM.map((item) => (
          <span key={item.numero} className={item.numero <= paso ? 'text-vino-vivo' : 'text-texto-suave'}>
            {item.numero}. {item.etiqueta}
          </span>
        ))}
      </div>
      <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-gris-borde">
        <div
          className="h-full rounded-full bg-vino-vivo transition-all"
          style={{ width: `${(paso / PASOS_FORM.length) * 100}%` }}
        />
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Los 5 pasos
// ---------------------------------------------------------------------------

function PasoQueCapta({ b, actualizar }: { b: Borrador; actualizar: (cambios: Partial<Borrador>) => void }) {
  const muestraRecamaras = b.tipo === 'departamento' || b.tipo === 'penthouse' || b.tipo === 'casa'
  const muestraBanos = b.tipo !== null && b.tipo !== 'terreno'
  const muestraM2Construccion = b.tipo !== null && b.tipo !== 'terreno'
  const muestraM2Terreno = b.tipo === 'casa' || b.tipo === 'terreno'

  return (
    <div className="space-y-5">
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

      {b.tipo && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {muestraRecamaras && (
            <Campo etiqueta="Recámaras">
              <input
                type="number"
                min="1"
                step="1"
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
                step="any"
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
                step="any"
                value={b.m2Terreno}
                onChange={(evento) => actualizar({ m2Terreno: evento.target.value })}
                className={CLASE_INPUT}
              />
            </Campo>
          )}
        </div>
      )}

      <Campo etiqueta="Descripción">
        <textarea
          rows={3}
          value={b.descripcion}
          onChange={(evento) => actualizar({ descripcion: evento.target.value })}
          placeholder="Qué hace especial a esta propiedad."
          className={CLASE_INPUT}
        />
      </Campo>
    </div>
  )
}

function PasoOperacion({ b, actualizar }: { b: Borrador; actualizar: (cambios: Partial<Borrador>) => void }) {
  function alternarCredito(credito: TipoCredito) {
    actualizar({
      creditosAceptados: b.creditosAceptados.includes(credito)
        ? b.creditosAceptados.filter((c) => c !== credito)
        : [...b.creditosAceptados, credito],
    })
  }

  return (
    <div className="space-y-5">
      <Campo etiqueta="¿Cómo se ofrece?" nota="Puedes marcar las dos: una unidad puede estar en venta y en renta a la vez.">
        <div className="flex gap-2">
          <button type="button" onClick={() => actualizar({ incluyeVenta: !b.incluyeVenta })} className={clasesPill(b.incluyeVenta)}>
            Venta
          </button>
          <button type="button" onClick={() => actualizar({ incluyeRenta: !b.incluyeRenta })} className={clasesPill(b.incluyeRenta)}>
            Renta
          </button>
        </div>
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

      {b.incluyeVenta && (
        <div className="space-y-4 rounded-3r-md border border-gris-borde p-4">
          <p className="text-sm font-bold text-texto">Datos de venta</p>
          <Campo etiqueta={`Precio de venta (${b.moneda})`}>
            <input
              type="number"
              min="1"
              value={b.precioVenta}
              onChange={(evento) => actualizar({ precioVenta: evento.target.value })}
              className={CLASE_INPUT}
            />
          </Campo>
          <button type="button" onClick={() => actualizar({ escriturado: !b.escriturado })} className={clasesPill(b.escriturado)}>
            {b.escriturado ? 'Escriturada' : 'No escriturada'}
          </button>
          <Campo etiqueta="Créditos aceptados">
            <div className="flex flex-wrap gap-2">
              {CREDITOS.map((credito) => (
                <button
                  key={credito}
                  type="button"
                  onClick={() => alternarCredito(credito)}
                  className={clasesPill(b.creditosAceptados.includes(credito))}
                >
                  {ETIQUETA_CREDITO[credito]}
                </button>
              ))}
            </div>
          </Campo>
        </div>
      )}

      {b.incluyeRenta && (
        <div className="space-y-4 rounded-3r-md border border-gris-borde p-4">
          <p className="text-sm font-bold text-texto">Datos de renta</p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Campo etiqueta={`Renta mensual (${b.moneda})`}>
              <input
                type="number"
                min="1"
                value={b.precioRenta}
                onChange={(evento) => actualizar({ precioRenta: evento.target.value })}
                className={CLASE_INPUT}
              />
            </Campo>
            <Campo etiqueta="Plazo mínimo (meses)">
              <input
                type="number"
                min="1"
                value={b.plazoMinimoMeses}
                onChange={(evento) => actualizar({ plazoMinimoMeses: evento.target.value })}
                className={CLASE_INPUT}
              />
            </Campo>
            <Campo etiqueta={`Depósito (${b.moneda})`}>
              <input
                type="number"
                min="1"
                value={b.depositoMonto}
                onChange={(evento) => actualizar({ depositoMonto: evento.target.value })}
                className={CLASE_INPUT}
              />
            </Campo>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => actualizar({ amueblado: !b.amueblado })} className={clasesPill(b.amueblado)}>
              {b.amueblado ? 'Amueblado' : 'Sin amueblar'}
            </button>
            <button
              type="button"
              onClick={() => actualizar({ incluyeMantenimiento: !b.incluyeMantenimiento })}
              className={clasesPill(b.incluyeMantenimiento)}
            >
              {b.incluyeMantenimiento ? 'Incluye mantenimiento' : 'Sin mantenimiento'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function PasoDonde({ b, actualizar }: { b: Borrador; actualizar: (cambios: Partial<Borrador>) => void }) {
  return (
    <div className="space-y-5">
      <Campo etiqueta="Colonia">
        <select
          value={b.colonia}
          onChange={(evento) => actualizar({ colonia: evento.target.value })}
          className={CLASE_INPUT}
        >
          <option value="">Selecciona una colonia</option>
          {COLONIAS.map((colonia) => (
            <option key={colonia.valor} value={colonia.valor}>
              {colonia.etiqueta}
            </option>
          ))}
        </select>
      </Campo>

      <Campo etiqueta="Dirección exacta">
        <input
          type="text"
          value={b.direccion}
          onChange={(evento) => actualizar({ direccion: evento.target.value })}
          placeholder="Calle y número"
          className={CLASE_INPUT}
        />
      </Campo>

      <p className="rounded-3r-md bg-marfil px-4 py-3 text-xs leading-relaxed text-texto-suave">
        La dirección exacta no se publica. En el portal se muestra solo la zona aproximada.
      </p>
    </div>
  )
}

function PasoFotos({ b, actualizar }: { b: Borrador; actualizar: (cambios: Partial<Borrador>) => void }) {
  const [arrastrando, setArrastrando] = useState(false)

  function agregarArchivos(lista: FileList) {
    const nuevas: Foto[] = Array.from(lista)
      .filter((archivo) => archivo.type.startsWith('image/'))
      .map((archivo) => ({ id: crypto.randomUUID(), url: URL.createObjectURL(archivo) }))
    if (nuevas.length > 0) actualizar({ fotos: [...b.fotos, ...nuevas] })
  }

  function quitarFoto(id: string) {
    const foto = b.fotos.find((f) => f.id === id)
    if (foto) URL.revokeObjectURL(foto.url)
    actualizar({ fotos: b.fotos.filter((f) => f.id !== id) })
  }

  function alSoltar(evento: DragEvent<HTMLLabelElement>) {
    evento.preventDefault()
    setArrastrando(false)
    if (evento.dataTransfer.files.length > 0) agregarArchivos(evento.dataTransfer.files)
  }

  return (
    <div>
      <label
        onDragOver={(evento) => {
          evento.preventDefault()
          setArrastrando(true)
        }}
        onDragLeave={() => setArrastrando(false)}
        onDrop={alSoltar}
        className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-3r-md border-2 border-dashed px-6 py-10 text-center transition-colors ${
          arrastrando ? 'border-vino-vivo bg-vino-vivo/5' : 'border-gris-borde hover:border-vino-vivo'
        }`}
      >
        <UploadCloud size={28} strokeWidth={1.5} className="text-texto-suave" />
        <p className="text-sm font-semibold text-texto">Arrastra las fotos aquí</p>
        <p className="text-xs text-texto-suave">o haz clic para elegir archivos</p>
        <input
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(evento) => evento.target.files && agregarArchivos(evento.target.files)}
        />
      </label>

      <p className="mt-3 text-xs text-texto-suave">
        Mínimo 5 fotos recomendadas. Las propiedades con 5 o más fotos reciben{' '}
        <span className="font-semibold text-texto">5 veces más contactos</span>.
      </p>

      {b.fotos.length > 0 && (
        <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-4">
          {b.fotos.map((foto, indice) => (
            <div key={foto.id} className="group relative aspect-square overflow-hidden rounded-3r-md bg-marfil">
              <img src={foto.url} alt={`Foto ${indice + 1}`} className="h-full w-full object-cover" />
              <button
                type="button"
                onClick={() => quitarFoto(foto.id)}
                aria-label="Quitar foto"
                className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-onix/70 text-blanco opacity-0 transition-opacity group-hover:opacity-100"
              >
                <X size={13} strokeWidth={2.5} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function PasoRevision({ b }: { b: Borrador }) {
  const propiedadVistaPrevia = construirPropiedad(b, FOLIO_VISTA_PREVIA)

  return (
    <div className="flex flex-col items-center gap-4">
      <p className="self-start text-sm text-texto-suave">Así se va a ver la propiedad publicada:</p>
      <div className="w-full max-w-sm">
        <PropertyCard propiedad={propiedadVistaPrevia} />
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------

export default function CaptacionAdminPage() {
  const navigate = useNavigate()
  const { prospectosCaptacion } = useDatosAdmin()
  const [paso, setPaso] = useState(1)
  const [borrador, setBorrador] = useState<Borrador>(BORRADOR_INICIAL)

  // Prospectos que ya pasaron por Prospectos de Captación ("Pasar a
  // Captación") — mismo registro, sin duplicarlo en un mock aparte.
  const recibidas = prospectosCaptacion.filter((prospecto) => prospecto.pasoCaptacion === 'recibida')

  function actualizar(cambios: Partial<Borrador>) {
    setBorrador((actual) => ({ ...actual, ...cambios }))
  }

  function continuar() {
    if (!pasoValido(paso, borrador)) return
    setPaso((p) => Math.min(PASOS_FORM.length, p + 1))
  }

  function atras() {
    setPaso((p) => Math.max(1, p - 1))
  }

  function publicar() {
    if (!pasoValido(4, borrador)) return
    const folio = generarFolio()
    const propiedadFinal = construirPropiedad(borrador, folio)
    // Sin backend: no se guarda en ningún lado. Queda "capturada" solo en el
    // mensaje de confirmación — el resto de la demo tampoco persiste nada.
    navigate('/admin/inventario', {
      state: { mensaje: 'Se registró la propiedad. Ya puede darle seguimiento el equipo.', propiedad: propiedadFinal },
    })
  }

  const esUltimoPaso = paso === PASOS_FORM.length
  const puedeContinuar = pasoValido(paso, borrador)

  return (
    <div className="space-y-6 pb-20 sm:pb-0">
      <EncabezadoPagina titulo="Captación de Propiedades" descripcion="Da de alta una nueva propiedad en 3R Connect." />

      {recibidas.length > 0 && (
        <Tarjeta>
          <h2 className="text-base font-bold text-texto">Recibidas de Prospectos de Captación</h2>
          <p className="mt-0.5 text-sm text-texto-suave">Exclusivas firmadas, listas para pasar a inventario. Paso: Recibida.</p>
          <div className="mt-3">
            {recibidas.map((prospecto) => {
              const asesor = asesoresDemo.find((a) => a.id === prospecto.asesorId)
              return (
                <Fila
                  key={prospecto.id}
                  icono={ClipboardCheck}
                  titulo={`${ETIQUETA_TIPO[prospecto.tipoPropiedad]} en ${prospecto.colonia}`}
                  descripcion={`${prospecto.propietarioNombre} · ${asesor ? asesor.nombre : 'Sin asesor'}`}
                />
              )
            })}
          </div>
        </Tarjeta>
      )}

      <Tarjeta>
        <BarraAvance paso={paso} />

        <div className="mt-6">
          <h2 className="text-base font-bold text-texto">
            Paso {paso} · {PASOS_FORM[paso - 1].etiqueta}
          </h2>

          <div className="mt-4">
            {paso === 1 && <PasoQueCapta b={borrador} actualizar={actualizar} />}
            {paso === 2 && <PasoOperacion b={borrador} actualizar={actualizar} />}
            {paso === 3 && <PasoDonde b={borrador} actualizar={actualizar} />}
            {paso === 4 && <PasoFotos b={borrador} actualizar={actualizar} />}
            {paso === 5 && <PasoRevision b={borrador} />}
          </div>
        </div>

        <div className="fixed inset-x-0 bottom-0 z-30 flex items-center justify-between gap-3 border-t border-gris-borde bg-blanco px-4 py-3 sm:static sm:z-auto sm:mt-6 sm:border-t sm:bg-transparent sm:px-0 sm:py-0 sm:pt-5">
          <Boton variante="contorno" onClick={atras} disabled={paso === 1} className={paso === 1 ? 'invisible' : ''}>
            Atrás
          </Boton>

          <div className="flex items-center gap-3">
            {!esUltimoPaso && !puedeContinuar && (
              <p className="hidden text-xs text-texto-suave sm:block">Completa los campos requeridos para continuar.</p>
            )}
            {esUltimoPaso ? (
              <Boton variante="solido" onClick={publicar}>
                Publicar propiedad
              </Boton>
            ) : (
              <Boton variante="solido" onClick={continuar} disabled={!puedeContinuar}>
                Continuar
              </Boton>
            )}
          </div>
        </div>
      </Tarjeta>
    </div>
  )
}
