import { useState, type ComponentType, type FormEvent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Logo3R } from '../components/brand/Logo3R'
import { IconApple, IconFacebook, IconGoogle } from '../components/landing/art/SocialIcons'
import { correoValido, simularAccesoConCorreo, simularOAuth, type ProveedorOAuth } from '../components/cuenta/authSimulado'
import { useSesion, type Usuario } from '../components/cuenta/SesionContext'

const PROVEEDORES: { id: ProveedorOAuth; etiqueta: string; icono: ComponentType<{ className?: string }> }[] = [
  { id: 'google', etiqueta: 'Continuar con Google', icono: IconGoogle },
  { id: 'facebook', etiqueta: 'Continuar con Facebook', icono: IconFacebook },
  { id: 'apple', etiqueta: 'Continuar con Apple', icono: IconApple },
]

type ModoAcceso = 'iniciar' | 'crear'

export default function AccesoPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { iniciarSesion, onboardingCompletado, alternarGuardado, estaGuardada } = useSesion()

  const [modo, setModo] = useState<ModoAcceso>(searchParams.get('modo') === 'crear' ? 'crear' : 'iniciar')

  const [correo, setCorreo] = useState('')
  const [cargando, setCargando] = useState<ProveedorOAuth | 'correo' | null>(null)
  const [cargandoDemo, setCargandoDemo] = useState<'admin' | 'asesor' | null>(null)

  const nextParam = searchParams.get('next')
  const guardarFolio = searchParams.get('guardarFolio')

  function despuesDeAcceder(usuario: Usuario) {
    iniciarSesion(usuario)
    if (guardarFolio && !estaGuardada(guardarFolio)) {
      alternarGuardado(guardarFolio)
    }

    const destinoPorDefecto = usuario.tipoCuenta === 'cliente' ? '/mi-cuenta' : '/admin'
    const destino = nextParam ?? destinoPorDefecto

    // El onboarding de /bienvenida pregunta presupuesto y zonas — cosas de
    // comprador. Quien entra como admin o asesor lo salta siempre, sin
    // importar el estado de onboardingCompletado.
    if (usuario.tipoCuenta === 'cliente' && !onboardingCompletado) {
      navigate(`/bienvenida?next=${encodeURIComponent(destino)}`)
    } else {
      navigate(destino)
    }
  }

  async function conProveedor(proveedor: ProveedorOAuth) {
    setCargando(proveedor)
    const usuario = await simularOAuth(proveedor, 'cliente')
    setCargando(null)
    despuesDeAcceder(usuario)
  }

  async function conCorreo(evento: FormEvent) {
    evento.preventDefault()
    if (!correoValido(correo)) return
    setCargando('correo')
    const usuario = await simularAccesoConCorreo(correo, 'cliente')
    setCargando(null)
    despuesDeAcceder(usuario)
  }

  // Acceso directo para probar el panel administrativo — no hay backend de
  // altas de equipo todavía, así que "entrar como admin/asesor" es la
  // única forma de llegar a esas dos cuentas en esta demo. El correo de
  // cada una es EXACTAMENTE el de los usuarios #1 y #2 en
  // data/usuariosAdminDemo.ts — LayoutAdmin cruza permisos por correo
  // contra esa lista, así que iniciar sesión aquí y editarte a ti mismo en
  // /admin/usuarios es una conexión real, no dos mocks coincidiendo.
  async function entrarComoDemo(tipo: 'admin' | 'asesor') {
    setCargandoDemo(tipo)
    const nombre = tipo === 'admin' ? 'Fernando Castro' : 'Mariana Solís'
    const correo = tipo === 'admin' ? 'fernando.castro@3rconnect.mx' : 'mariana.solis@3rconnect.mx'
    const usuario = await simularAccesoConCorreo(correo, tipo)
    setCargandoDemo(null)
    despuesDeAcceder({ ...usuario, nombre, iniciales: nombre.split(' ').slice(0, 2).map((p) => p[0]).join('').toUpperCase() })
  }

  return (
    <div className="flex min-h-screen flex-col bg-gris-borde/40">
      <main className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm rounded-2xl bg-blanco p-8 shadow-sm">
          <h1 className="text-center text-lg font-bold text-texto">
            {modo === 'crear' ? 'Crea tu cuenta' : 'Inicia sesión'}
          </h1>

          <div className="mt-5 flex rounded-full bg-marfil p-1">
            <button
              type="button"
              onClick={() => setModo('iniciar')}
              className={`flex-1 rounded-full py-2 text-sm font-semibold transition-colors ${
                modo === 'iniciar' ? 'bg-blanco text-texto shadow-sm' : 'text-texto-suave'
              }`}
            >
              Iniciar sesión
            </button>
            <button
              type="button"
              onClick={() => setModo('crear')}
              className={`flex-1 rounded-full py-2 text-sm font-semibold transition-colors ${
                modo === 'crear' ? 'bg-blanco text-texto shadow-sm' : 'text-texto-suave'
              }`}
            >
              Crear cuenta
            </button>
          </div>

          <div className="mt-6 space-y-2.5">
            {PROVEEDORES.map(({ id, etiqueta, icono: Icono }) => (
              <button
                key={id}
                type="button"
                disabled={cargando !== null || cargandoDemo !== null}
                onClick={() => conProveedor(id)}
                className="relative flex w-full items-center justify-center rounded-full border border-gris-borde bg-blanco px-4 py-3 text-sm font-medium text-texto transition-colors hover:border-texto-suave disabled:opacity-60"
              >
                <Icono className="absolute left-4 h-5 w-5" />
                {cargando === id ? 'Conectando…' : etiqueta}
              </button>
            ))}
          </div>

          <div className="my-5 flex items-center gap-3">
            <span className="h-px flex-1 bg-gris-borde" />
            <span className="text-xs text-texto-suave">o</span>
            <span className="h-px flex-1 bg-gris-borde" />
          </div>

          <form onSubmit={conCorreo} className="space-y-4">
            <div className="relative">
              <input
                id="correo"
                type="email"
                required
                value={correo}
                onChange={(evento) => setCorreo(evento.target.value)}
                placeholder=" "
                className="peer w-full rounded-lg border border-gris-borde px-3.5 pb-2 pt-5 text-sm text-texto outline-none focus:border-vino-vivo"
              />
              <label
                htmlFor="correo"
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-texto-suave transition-all peer-focus:top-3 peer-focus:text-[11px] peer-focus:text-vino-vivo peer-[:not(:placeholder-shown)]:top-3 peer-[:not(:placeholder-shown)]:text-[11px]"
              >
                Correo electrónico
              </label>
            </div>

            <button
              type="submit"
              disabled={cargando !== null || cargandoDemo !== null || !correoValido(correo)}
              className="w-full rounded-full bg-vino px-5 py-3 text-sm font-semibold text-blanco transition-colors hover:bg-vino-oscuro disabled:opacity-50"
            >
              {cargando === 'correo' ? 'Continuando…' : 'Continuar'}
            </button>
          </form>

          <p className="mt-4 text-center text-xs text-texto-suave">
            Al continuar, acepto los{' '}
            <a href="#" className="underline hover:text-texto">Términos del Servicio</a>{' '}
            y la{' '}
            <a href="#" className="underline hover:text-texto">Política de Privacidad</a>
          </p>

          <div className="my-5 flex items-center gap-3">
            <span className="h-px flex-1 bg-gris-borde" />
            <span className="text-xs text-texto-suave">acceso interno (demo)</span>
            <span className="h-px flex-1 bg-gris-borde" />
          </div>

          <div className="flex gap-2.5">
            <button
              type="button"
              disabled={cargando !== null || cargandoDemo !== null}
              onClick={() => entrarComoDemo('admin')}
              className="flex-1 rounded-full border border-gris-borde px-4 py-2.5 text-xs font-semibold text-texto transition-colors hover:border-vino-vivo hover:text-vino-vivo disabled:opacity-60"
            >
              {cargandoDemo === 'admin' ? 'Entrando…' : 'Entrar como admin'}
            </button>
            <button
              type="button"
              disabled={cargando !== null || cargandoDemo !== null}
              onClick={() => entrarComoDemo('asesor')}
              className="flex-1 rounded-full border border-gris-borde px-4 py-2.5 text-xs font-semibold text-texto transition-colors hover:border-vino-vivo hover:text-vino-vivo disabled:opacity-60"
            >
              {cargandoDemo === 'asesor' ? 'Entrando…' : 'Entrar como asesor'}
            </button>
          </div>
        </div>
      </main>

      <footer className="flex flex-col items-center gap-3 px-4 pb-8">
        <Link
          to="/"
          aria-label="Ir al inicio"
          className="inline-block cursor-pointer transition-opacity duration-200 hover:opacity-80"
        >
          <Logo3R size={90} sizeSm={110} />
        </Link>
        <div className="flex gap-4 text-xs text-texto-suave">
          <a href="#" className="hover:text-texto">Términos</a>
          <a href="#" className="hover:text-texto">Privacidad</a>
          <a href="#" className="hover:text-texto">Cookies</a>
        </div>
      </footer>
    </div>
  )
}
