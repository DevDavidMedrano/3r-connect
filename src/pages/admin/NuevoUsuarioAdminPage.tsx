import { useState } from 'react'
import { ArrowLeft, Copy, Eye, EyeOff, RefreshCw } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Boton, Chip, EncabezadoPagina, Tarjeta } from '../../components/cliente/Piezas'
import { useDatosAdmin } from '../../components/admin/useDatosAdmin'
import {
  generarContrasenaSegura,
  PERMISOS_MODULO,
  ROL_PERMISOS_DEFECTO,
  type EstadoUsuarioAdmin,
  type RolUsuarioAdmin,
  type UsuarioAdmin,
} from '../../types/usuarioAdmin'

const CLASE_INPUT =
  'w-full rounded-3r-md border border-gris-borde px-3.5 py-2.5 text-sm text-texto outline-none focus:border-vino-vivo'

interface Borrador {
  nombre: string
  correo: string
  rol: RolUsuarioAdmin
  estado: EstadoUsuarioAdmin
  contrasena: string
  confirmarContrasena: string
  cupoMaximo: string
}

const BORRADOR_INICIAL: Borrador = {
  nombre: '',
  correo: '',
  rol: 'asesor',
  estado: 'activo',
  contrasena: '',
  confirmarContrasena: '',
  cupoMaximo: '20',
}

export default function NuevoUsuarioAdminPage() {
  const navigate = useNavigate()
  const { agregarUsuarioAdmin } = useDatosAdmin()
  const [b, setB] = useState<Borrador>(BORRADOR_INICIAL)
  const [permisos, setPermisos] = useState<string[]>(ROL_PERMISOS_DEFECTO.asesor)
  const [mostrarContrasena, setMostrarContrasena] = useState(false)
  const [copiada, setCopiada] = useState(false)

  function actualizar(cambios: Partial<Borrador>) {
    setB((actual) => ({ ...actual, ...cambios }))
  }

  function cambiarRol(rol: RolUsuarioAdmin) {
    actualizar({ rol })
    setPermisos(ROL_PERMISOS_DEFECTO[rol])
  }

  function alternarPermiso(clave: string) {
    setPermisos((actual) => (actual.includes(clave) ? actual.filter((p) => p !== clave) : [...actual, clave]))
  }

  function generarContrasena() {
    const nueva = generarContrasenaSegura()
    actualizar({ contrasena: nueva, confirmarContrasena: nueva })
    setCopiada(false)
  }

  async function copiarContrasena() {
    if (!b.contrasena) return
    try {
      await navigator.clipboard.writeText(b.contrasena)
      setCopiada(true)
    } catch {
      // Sin permiso de portapapeles en este navegador — no es crítico,
      // la contraseña sigue visible en el campo.
    }
  }

  const puedeGuardar =
    b.nombre.trim() !== '' &&
    b.correo.trim() !== '' &&
    b.contrasena.length >= 8 &&
    b.contrasena === b.confirmarContrasena &&
    (b.rol !== 'asesor' || Number(b.cupoMaximo) > 0)

  function guardar() {
    if (!puedeGuardar) return

    const nuevo: UsuarioAdmin = {
      id: `usuario-${Date.now()}`,
      nombre: b.nombre.trim(),
      correo: b.correo.trim(),
      rol: b.rol,
      estado: b.estado,
      ultimoAcceso: new Date().toISOString(),
      permisos,
      contrasena: b.contrasena,
      ...(b.rol === 'asesor' ? { cupoMaximo: Number(b.cupoMaximo), cargaActual: 0 } : {}),
    }

    agregarUsuarioAdmin(nuevo)
    navigate('/admin/usuarios')
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <button
            type="button"
            onClick={() => navigate('/admin/usuarios')}
            aria-label="Volver"
            className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-texto-suave transition-colors hover:bg-marfil hover:text-texto"
          >
            <ArrowLeft size={17} strokeWidth={2} />
          </button>
          <EncabezadoPagina titulo="Nuevo usuario" descripcion="Crea una cuenta y asigna sus permisos de acceso." />
        </div>

        <div className="flex shrink-0 items-center gap-2.5">
          <Boton variante="contorno" to="/admin/usuarios">
            Cancelar
          </Boton>
          <Boton variante="solido" onClick={guardar} disabled={!puedeGuardar}>
            Crear usuario
          </Boton>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <div className="space-y-5">
          <Tarjeta className="space-y-4">
            <h2 className="text-base font-bold text-texto">Datos del usuario</h2>

            <label className="block">
              <span className="text-xs font-semibold uppercase tracking-wide text-texto-suave">Nombre completo</span>
              <input
                type="text"
                value={b.nombre}
                onChange={(e) => actualizar({ nombre: e.target.value })}
                className={`mt-1.5 ${CLASE_INPUT}`}
              />
            </label>

            <label className="block">
              <span className="text-xs font-semibold uppercase tracking-wide text-texto-suave">Correo</span>
              <input
                type="email"
                value={b.correo}
                onChange={(e) => actualizar({ correo: e.target.value })}
                placeholder="nombre@3rconnect.mx"
                className={`mt-1.5 ${CLASE_INPUT}`}
              />
            </label>

            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className="text-xs font-semibold uppercase tracking-wide text-texto-suave">Rol</span>
                <select value={b.rol} onChange={(e) => cambiarRol(e.target.value as RolUsuarioAdmin)} className={`mt-1.5 ${CLASE_INPUT}`}>
                  <option value="asesor">Asesor</option>
                  <option value="admin">Administrador</option>
                </select>
                <p className="mt-1 text-[11px] text-texto-suave">El rol Cliente se crea desde el portal público, no aquí.</p>
              </label>
              <label className="block">
                <span className="text-xs font-semibold uppercase tracking-wide text-texto-suave">Estado</span>
                <select
                  value={b.estado}
                  onChange={(e) => actualizar({ estado: e.target.value as EstadoUsuarioAdmin })}
                  className={`mt-1.5 ${CLASE_INPUT}`}
                >
                  <option value="activo">Activo</option>
                  <option value="inactivo">Inactivo</option>
                </select>
              </label>
            </div>

            {b.rol === 'asesor' && (
              <label className="block">
                <span className="text-xs font-semibold uppercase tracking-wide text-texto-suave">Cupo máximo</span>
                <input
                  type="number"
                  min="1"
                  value={b.cupoMaximo}
                  onChange={(e) => actualizar({ cupoMaximo: e.target.value })}
                  className={`mt-1.5 ${CLASE_INPUT}`}
                />
                <p className="mt-1 text-[11px] text-texto-suave">Propiedades y prospectos que puede tener asignados a la vez.</p>
              </label>
            )}
          </Tarjeta>

          <Tarjeta className="space-y-4">
            <h2 className="text-base font-bold text-texto">Credenciales de acceso</h2>

            <label className="block">
              <span className="text-xs font-semibold uppercase tracking-wide text-texto-suave">Contraseña</span>
              <div className="relative mt-1.5">
                <input
                  type={mostrarContrasena ? 'text' : 'password'}
                  value={b.contrasena}
                  onChange={(e) => actualizar({ contrasena: e.target.value })}
                  className={`${CLASE_INPUT} pr-10`}
                />
                <button
                  type="button"
                  onClick={() => setMostrarContrasena((v) => !v)}
                  aria-label={mostrarContrasena ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-texto-suave hover:text-texto"
                >
                  {mostrarContrasena ? <EyeOff size={16} strokeWidth={1.75} /> : <Eye size={16} strokeWidth={1.75} />}
                </button>
              </div>
            </label>

            <label className="block">
              <span className="text-xs font-semibold uppercase tracking-wide text-texto-suave">Confirmar contraseña</span>
              <input
                type={mostrarContrasena ? 'text' : 'password'}
                value={b.confirmarContrasena}
                onChange={(e) => actualizar({ confirmarContrasena: e.target.value })}
                className={`mt-1.5 ${CLASE_INPUT}`}
              />
              {b.confirmarContrasena && b.contrasena !== b.confirmarContrasena && (
                <p className="mt-1 text-[11px] font-medium text-alerta">Las contraseñas no coinciden.</p>
              )}
            </label>

            <div className="flex items-center gap-2.5">
              <Boton variante="contorno" className="text-xs" onClick={generarContrasena}>
                <RefreshCw size={13} strokeWidth={2} />
                Generar contraseña
              </Boton>
              {b.contrasena && (
                <Boton variante="contorno" className="text-xs" onClick={copiarContrasena}>
                  <Copy size={13} strokeWidth={2} />
                  {copiada ? 'Copiada' : 'Copiar'}
                </Boton>
              )}
            </div>

            <p className="text-xs text-texto-suave">El usuario usará este correo y contraseña para iniciar sesión.</p>
          </Tarjeta>
        </div>

        <Tarjeta className="h-fit">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-texto">Permisos por módulo</h2>
            <Chip variante="vino">{permisos.length} seleccionados</Chip>
          </div>
          <p className="mt-1 text-xs text-texto-suave">Se pre-marcan según el rol. Ajústalos como necesites.</p>

          <div className="mt-4 grid grid-cols-1 gap-x-4 gap-y-2.5 sm:grid-cols-2">
            {PERMISOS_MODULO.map((permiso) => (
              <label key={permiso.clave} className="flex items-start gap-2 text-sm text-texto">
                <input
                  type="checkbox"
                  checked={permisos.includes(permiso.clave)}
                  onChange={() => alternarPermiso(permiso.clave)}
                  className="mt-0.5 h-4 w-4 shrink-0 rounded border-gris-borde accent-vino-vivo"
                />
                {permiso.etiqueta}
              </label>
            ))}
          </div>
        </Tarjeta>
      </div>
    </div>
  )
}
