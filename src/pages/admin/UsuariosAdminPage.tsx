import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { ChevronLeft, ChevronRight, MoreVertical, Pencil, Plus, ShieldCheck, Users, UserCheck, X } from 'lucide-react'
import { Boton, Chip, EncabezadoPagina, Tarjeta, TarjetaFilaExpandible } from '../../components/cliente/Piezas'
import { useDatosAdmin } from '../../components/admin/useDatosAdmin'
import {
  etiquetaUltimoAcceso,
  PERMISO_GESTION_USUARIOS,
  PERMISOS_MODULO,
  ROL_PERMISOS_DEFECTO,
  type EstadoUsuarioAdmin,
  type RolUsuarioAdmin,
  type UsuarioAdmin,
} from '../../types/usuarioAdmin'

const TAMANO_PAGINA = 6

type FiltroTab = 'todos' | 'admin' | 'asesor'

const TABS: { valor: FiltroTab; etiqueta: string }[] = [
  { valor: 'todos', etiqueta: 'Todos' },
  { valor: 'admin', etiqueta: 'Administradores' },
  { valor: 'asesor', etiqueta: 'Asesores' },
]

// Azul no tiene token de marca — mismo criterio que en el resto del panel
// (Prospectos, Agenda): se resuelve con la paleta neutra de Tailwind.
const CLASE_ROL: Record<RolUsuarioAdmin, string> = {
  admin: 'bg-vino/10 text-vino',
  asesor: 'bg-blue-50 text-blue-700',
}

const ETIQUETA_ROL: Record<RolUsuarioAdmin, string> = {
  admin: 'Administrador',
  asesor: 'Asesor',
}

function EtiquetaRol({ rol }: { rol: RolUsuarioAdmin }) {
  return (
    <span className={`inline-flex shrink-0 items-center rounded-full px-3 py-1 text-xs font-semibold ${CLASE_ROL[rol]}`}>
      {ETIQUETA_ROL[rol]}
    </span>
  )
}

function iniciales(nombre: string): string {
  const partes = nombre.trim().split(/\s+/)
  return `${partes[0]?.[0] ?? ''}${partes[partes.length - 1]?.[0] ?? ''}`.toUpperCase()
}

function TarjetaKpi({ icono: Icono, clase, etiqueta, valor }: { icono: typeof Users; clase: string; etiqueta: string; valor: string }) {
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

// A pantalla completa en móvil (nada de tarjeta centrada con márgenes);
// desde tablet (sm:) vuelve a ser el modal centrado de siempre.
function Overlay({ children, onClose }: { children: ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/50 sm:flex sm:items-center sm:justify-center sm:px-4 sm:py-8" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="h-full w-full overflow-y-auto bg-blanco sm:h-auto sm:max-h-[85vh] sm:w-full sm:max-w-lg sm:rounded-2xl sm:shadow-2xl"
      >
        {children}
      </div>
    </div>
  )
}

function MenuFila({ usuario, onCambiarEstado }: { usuario: UsuarioAdmin; onCambiarEstado: () => void }) {
  const [abierto, setAbierto] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function alClicFuera(evento: MouseEvent) {
      if (ref.current && !ref.current.contains(evento.target as Node)) setAbierto(false)
    }
    document.addEventListener('mousedown', alClicFuera)
    return () => document.removeEventListener('mousedown', alClicFuera)
  }, [])

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        aria-label="Más acciones"
        onClick={() => setAbierto((v) => !v)}
        className="flex h-7 w-7 items-center justify-center rounded-full text-texto-suave transition-colors hover:bg-marfil hover:text-texto"
      >
        <MoreVertical size={15} strokeWidth={2} />
      </button>
      {abierto && (
        <div className="absolute right-0 top-full z-20 mt-1 w-44 rounded-xl border border-gris-borde bg-blanco py-1.5 shadow-lg">
          <button
            type="button"
            onClick={() => {
              onCambiarEstado()
              setAbierto(false)
            }}
            className="block w-full px-3.5 py-2 text-left text-sm font-medium text-texto transition-colors hover:bg-marfil"
          >
            {usuario.estado === 'activo' ? 'Desactivar' : 'Activar'}
          </button>
        </div>
      )}
    </div>
  )
}

function SelectorPermisos({
  seleccionados,
  onAlternar,
  bloqueados,
}: {
  seleccionados: string[]
  onAlternar: (clave: string) => void
  bloqueados?: string[]
}) {
  return (
    <div>
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wide text-texto-suave">Permisos por módulo</p>
        <Chip variante="vino">{seleccionados.length} seleccionados</Chip>
      </div>
      <p className="mt-1 text-xs text-texto-suave">Se pre-marcan según el rol. Ajústalos como necesites.</p>

      <div className="mt-3 grid grid-cols-1 gap-x-4 gap-y-2 sm:grid-cols-2">
        {PERMISOS_MODULO.map((permiso) => {
          const bloqueado = bloqueados?.includes(permiso.clave)
          return (
            <label key={permiso.clave} className={`flex items-start gap-2 text-sm ${bloqueado ? 'text-texto-suave' : 'text-texto'}`}>
              <input
                type="checkbox"
                checked={seleccionados.includes(permiso.clave)}
                disabled={bloqueado}
                onChange={() => onAlternar(permiso.clave)}
                className="mt-0.5 h-4 w-4 shrink-0 rounded border-gris-borde accent-vino-vivo disabled:cursor-not-allowed"
              />
              {permiso.etiqueta}
            </label>
          )
        })}
      </div>
    </div>
  )
}

function ModalEditarUsuario({
  usuario,
  esUnoMismo,
  onCerrar,
  onGuardar,
}: {
  usuario: UsuarioAdmin
  esUnoMismo: boolean
  onCerrar: () => void
  onGuardar: (cambios: Partial<UsuarioAdmin>) => void
}) {
  const [rol, setRol] = useState(usuario.rol)
  const [estado, setEstado] = useState(usuario.estado)
  const [permisos, setPermisos] = useState(usuario.permisos)

  function alternarPermiso(clave: string) {
    if (esUnoMismo && clave === PERMISO_GESTION_USUARIOS) return
    setPermisos((actual) => (actual.includes(clave) ? actual.filter((p) => p !== clave) : [...actual, clave]))
  }

  return (
    <Overlay onClose={onCerrar}>
      <div className="max-h-[85vh] overflow-y-auto p-5">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-texto">{usuario.nombre}</h2>
          <button type="button" onClick={onCerrar} aria-label="Cerrar" className="text-texto-suave hover:text-texto">
            <X size={18} strokeWidth={2} />
          </button>
        </div>
        <p className="text-xs text-texto-suave">{usuario.correo}</p>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-wide text-texto-suave">Rol</span>
            <select
              value={rol}
              onChange={(e) => setRol(e.target.value as RolUsuarioAdmin)}
              className="mt-1.5 w-full rounded-3r-md border border-gris-borde px-3 py-2.5 text-sm text-texto outline-none focus:border-vino-vivo"
            >
              <option value="asesor">Asesor</option>
              <option value="admin">Administrador</option>
            </select>
          </label>
          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-wide text-texto-suave">Estado</span>
            <select
              value={estado}
              onChange={(e) => setEstado(e.target.value as EstadoUsuarioAdmin)}
              className="mt-1.5 w-full rounded-3r-md border border-gris-borde px-3 py-2.5 text-sm text-texto outline-none focus:border-vino-vivo"
            >
              <option value="activo">Activo</option>
              <option value="inactivo">Inactivo</option>
            </select>
          </label>
        </div>

        {esUnoMismo && (
          <p className="mt-3 rounded-3r-md bg-alerta/10 px-3.5 py-2.5 text-xs font-medium text-alerta">
            No puedes quitarte a ti mismo el permiso "Gestionar Usuarios y Roles".
          </p>
        )}

        <div className="mt-4">
          <SelectorPermisos
            seleccionados={permisos}
            onAlternar={alternarPermiso}
            bloqueados={esUnoMismo ? [PERMISO_GESTION_USUARIOS] : undefined}
          />
        </div>

        <div className="mt-5 flex justify-end gap-2.5">
          <Boton variante="contorno" onClick={onCerrar}>
            Cancelar
          </Boton>
          <Boton variante="solido" onClick={() => onGuardar({ rol, estado, permisos })}>
            Guardar cambios
          </Boton>
        </div>
      </div>
    </Overlay>
  )
}

export default function UsuariosAdminPage() {
  const { usuario, usuariosAdmin, actualizarUsuarioAdmin } = useDatosAdmin()
  const [tab, setTab] = useState<FiltroTab>('todos')
  const [pagina, setPagina] = useState(1)
  const [editando, setEditando] = useState<UsuarioAdmin | null>(null)

  const filtrados = tab === 'todos' ? usuariosAdmin : usuariosAdmin.filter((u) => u.rol === tab)
  const totalPaginas = Math.max(1, Math.ceil(filtrados.length / TAMANO_PAGINA))
  const paginaSegura = Math.min(pagina, totalPaginas)
  const inicio = (paginaSegura - 1) * TAMANO_PAGINA
  const pagina_ = filtrados.slice(inicio, inicio + TAMANO_PAGINA)

  const totalUsuarios = usuariosAdmin.length
  const asesoresActivos = usuariosAdmin.filter((u) => u.rol === 'asesor' && u.estado === 'activo').length
  const administradores = usuariosAdmin.filter((u) => u.rol === 'admin').length

  function cambiarTab(nuevo: FiltroTab) {
    setTab(nuevo)
    setPagina(1)
  }

  return (
    <div className="space-y-5">
      <EncabezadoPagina titulo="Administración de Usuarios y Roles" descripcion="Cuentas del equipo y qué puede ver o hacer cada una." />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <TarjetaKpi icono={Users} clase="bg-vino-vivo/10 text-vino-vivo" etiqueta="Total usuarios" valor={String(totalUsuarios)} />
        <TarjetaKpi icono={UserCheck} clase="bg-exito/10 text-exito" etiqueta="Asesores activos" valor={String(asesoresActivos)} />
        <TarjetaKpi icono={ShieldCheck} clase="bg-vino/10 text-vino" etiqueta="Administradores" valor={String(administradores)} />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-1 rounded-full border border-gris-borde bg-blanco p-1">
          {TABS.map((opcion) => (
            <button
              key={opcion.valor}
              type="button"
              onClick={() => cambiarTab(opcion.valor)}
              className={`rounded-full px-3.5 py-1.5 text-sm font-semibold transition-colors ${
                tab === opcion.valor ? 'bg-vino-vivo text-blanco' : 'text-texto-suave hover:text-texto'
              }`}
            >
              {opcion.etiqueta}
            </button>
          ))}
        </div>

        <Boton to="/admin/usuarios/nuevo" variante="solido" className="shrink-0">
          <Plus size={16} strokeWidth={2.5} />
          Nuevo usuario
        </Boton>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1.6fr_1fr]">
        <Tarjeta>
          <h2 className="text-base font-bold text-texto">Usuarios</h2>

          {/* Móvil: tarjeta con nombre/rol siempre visibles, el resto
              (estado, último acceso, carga, acciones) al tocar. */}
          <div className="mt-3 space-y-2.5 sm:hidden">
            {pagina_.map((u) => {
              const esUnoMismo = usuario?.correo === u.correo
              return (
                <TarjetaFilaExpandible
                  key={u.id}
                  resumen={
                    <div className="flex items-center gap-2.5">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-vino-vivo text-xs font-bold text-blanco">
                        {iniciales(u.nombre)}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-texto">
                          {u.nombre}
                          {esUnoMismo && <span className="ml-1.5 text-[10px] font-semibold uppercase tracking-wide text-vino-vivo">Tú</span>}
                        </p>
                        <p className="truncate text-xs text-texto-suave">{u.correo}</p>
                      </div>
                      <EtiquetaRol rol={u.rol} />
                    </div>
                  }
                  detalle={
                    <>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-texto-suave">Estado</span>
                        <Chip variante={u.estado === 'activo' ? 'exito' : 'espera'}>{u.estado === 'activo' ? 'Activo' : 'Inactivo'}</Chip>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-texto-suave">Último acceso</span>
                        <span className="text-texto">{etiquetaUltimoAcceso(u.ultimoAcceso)}</span>
                      </div>
                      {u.rol === 'asesor' && u.cupoMaximo !== undefined && u.cargaActual !== undefined && (
                        <div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-texto-suave">Carga</span>
                            <span className="text-texto">
                              {u.cargaActual}/{u.cupoMaximo}
                            </span>
                          </div>
                          <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-gris-borde">
                            <div
                              className="h-full rounded-full bg-vino-vivo"
                              style={{ width: `${Math.min(100, (u.cargaActual / u.cupoMaximo) * 100)}%` }}
                            />
                          </div>
                        </div>
                      )}
                      <div className="flex items-center gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => setEditando(u)}
                          className="flex h-11 flex-1 items-center justify-center gap-1.5 rounded-3r-md border border-gris-borde text-sm font-semibold text-texto"
                        >
                          <Pencil size={15} strokeWidth={2} />
                          Editar
                        </button>
                        <button
                          type="button"
                          onClick={() => actualizarUsuarioAdmin(u.id, { estado: u.estado === 'activo' ? 'inactivo' : 'activo' })}
                          className="flex h-11 flex-1 items-center justify-center rounded-3r-md border border-gris-borde text-sm font-semibold text-texto"
                        >
                          {u.estado === 'activo' ? 'Desactivar' : 'Activar'}
                        </button>
                      </div>
                    </>
                  }
                />
              )
            })}
          </div>

          <div className="mt-3 hidden divide-y divide-gris-borde sm:block">
            {pagina_.map((u) => {
              const esUnoMismo = usuario?.correo === u.correo
              return (
                <div key={u.id} className="flex flex-wrap items-center gap-3 py-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-vino-vivo text-xs font-bold text-blanco">
                    {iniciales(u.nombre)}
                  </span>

                  <div className="min-w-[140px] flex-1">
                    <p className="truncate text-sm font-semibold text-texto">
                      {u.nombre}
                      {esUnoMismo && <span className="ml-1.5 text-[10px] font-semibold uppercase tracking-wide text-vino-vivo">Tú</span>}
                    </p>
                    <p className="truncate text-xs text-texto-suave">{u.correo}</p>
                  </div>

                  <EtiquetaRol rol={u.rol} />

                  <Chip variante={u.estado === 'activo' ? 'exito' : 'espera'}>{u.estado === 'activo' ? 'Activo' : 'Inactivo'}</Chip>

                  <p className="w-24 shrink-0 text-xs text-texto-suave">{etiquetaUltimoAcceso(u.ultimoAcceso)}</p>

                  {u.rol === 'asesor' && u.cupoMaximo !== undefined && u.cargaActual !== undefined && (
                    <div className="w-28 shrink-0">
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-gris-borde">
                        <div
                          className="h-full rounded-full bg-vino-vivo"
                          style={{ width: `${Math.min(100, (u.cargaActual / u.cupoMaximo) * 100)}%` }}
                        />
                      </div>
                      <p className="mt-1 text-[10.5px] text-texto-suave">
                        {u.cargaActual}/{u.cupoMaximo}
                      </p>
                    </div>
                  )}

                  <div className="ml-auto flex shrink-0 items-center gap-1">
                    <button
                      type="button"
                      aria-label="Editar"
                      onClick={() => setEditando(u)}
                      className="flex h-7 w-7 items-center justify-center rounded-full text-texto-suave transition-colors hover:bg-marfil hover:text-texto"
                    >
                      <Pencil size={15} strokeWidth={2} />
                    </button>
                    <MenuFila
                      usuario={u}
                      onCambiarEstado={() => actualizarUsuarioAdmin(u.id, { estado: u.estado === 'activo' ? 'inactivo' : 'activo' })}
                    />
                  </div>
                </div>
              )
            })}
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-gris-borde pt-3.5">
            <p className="text-xs text-texto-suave">
              Mostrando {filtrados.length === 0 ? 0 : inicio + 1}–{Math.min(inicio + TAMANO_PAGINA, filtrados.length)} de {filtrados.length}{' '}
              usuarios
            </p>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setPagina((p) => Math.max(1, p - 1))}
                disabled={paginaSegura === 1}
                className="flex items-center gap-1 rounded-full border border-gris-borde px-2.5 py-1 text-xs font-medium text-texto transition-colors hover:border-vino-vivo disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronLeft size={13} strokeWidth={2} />
                Anterior
              </button>
              {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setPagina(n)}
                  className={`h-7 w-7 rounded-full text-xs font-semibold transition-colors ${
                    n === paginaSegura ? 'bg-vino-vivo text-blanco' : 'text-texto-suave hover:bg-marfil'
                  }`}
                >
                  {n}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setPagina((p) => Math.min(totalPaginas, p + 1))}
                disabled={paginaSegura === totalPaginas}
                className="flex items-center gap-1 rounded-full border border-gris-borde px-2.5 py-1 text-xs font-medium text-texto transition-colors hover:border-vino-vivo disabled:cursor-not-allowed disabled:opacity-40"
              >
                Siguiente
                <ChevronRight size={13} strokeWidth={2} />
              </button>
            </div>
          </div>
        </Tarjeta>

        <Tarjeta className="space-y-5">
          <h2 className="text-base font-bold text-texto">Roles y permisos</h2>

          {(['admin', 'asesor'] as const).map((rol) => (
            <div key={rol}>
              <div className="flex items-center gap-2">
                <EtiquetaRol rol={rol} />
                <span className="text-xs text-texto-suave">({ROL_PERMISOS_DEFECTO[rol].length})</span>
              </div>
              <div className="mt-2.5 flex flex-wrap gap-1.5">
                {ROL_PERMISOS_DEFECTO[rol].map((clave) => {
                  const permiso = PERMISOS_MODULO.find((p) => p.clave === clave)
                  return (
                    <span key={clave} className="rounded-full bg-marfil px-2.5 py-1 text-[11px] text-texto-suave">
                      {permiso?.etiqueta}
                    </span>
                  )
                })}
              </div>
            </div>
          ))}
        </Tarjeta>
      </div>

      {editando && (
        <ModalEditarUsuario
          usuario={editando}
          esUnoMismo={usuario?.correo === editando.correo}
          onCerrar={() => setEditando(null)}
          onGuardar={(cambios) => {
            actualizarUsuarioAdmin(editando.id, cambios)
            setEditando(null)
          }}
        />
      )}
    </div>
  )
}
