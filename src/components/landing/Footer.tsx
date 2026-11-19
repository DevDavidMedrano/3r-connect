import { Mail, MapPin, Phone } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Logo3R } from '../brand/Logo3R'
import { IconFacebook, IconInstagram, IconLinkedIn } from './art/SocialIcons'

const COLUMNAS = [
  {
    titulo: 'Explorar',
    enlaces: ['Comprar', 'Rentar', 'Preventa', 'Desarrollos'],
  },
  {
    titulo: 'Compañía',
    enlaces: ['Nosotros', 'Asesores', 'Trabaja con nosotros'],
  },
  {
    titulo: 'Legal',
    enlaces: ['Términos y condiciones', 'Aviso de privacidad', 'Cookies'],
  },
] as const

const REDES = [
  { icono: IconFacebook, etiqueta: 'Facebook' },
  { icono: IconInstagram, etiqueta: 'Instagram' },
  { icono: IconLinkedIn, etiqueta: 'LinkedIn' },
] as const

export function Footer() {
  return (
    <footer className="bg-onix px-6 py-16 text-marfil">
      <div className="mx-auto max-w-6xl">
        <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-5">
          <div className="sm:col-span-2 lg:col-span-1">
            <Link
              to="/"
              aria-label="Ir al inicio"
              className="inline-block cursor-pointer transition-opacity duration-200 hover:opacity-80"
            >
              <Logo3R size={130} />
            </Link>
            <p className="mt-4 max-w-xs text-sm text-marfil/60">
              Inmobiliaria boutique en la Ciudad de México: propiedades pocas,
              bien elegidas y acompañadas de cerca.
            </p>
            <div className="mt-5 flex gap-3">
              {REDES.map(({ icono: Icono, etiqueta }) => (
                <a
                  key={etiqueta}
                  href="#"
                  aria-label={etiqueta}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-marfil/25 text-marfil/70 transition-colors hover:border-oro hover:text-oro-claro"
                >
                  <Icono className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {COLUMNAS.map((columna) => (
            <div key={columna.titulo}>
              <h3 className="font-serif text-sm font-semibold uppercase tracking-wide text-oro-claro">
                {columna.titulo}
              </h3>
              <ul className="mt-4 space-y-2 text-sm text-marfil/65">
                {columna.enlaces.map((enlace) => (
                  <li key={enlace}>
                    <a href="#" className="transition-colors hover:text-marfil">
                      {enlace}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div>
            <h3 className="font-serif text-sm font-semibold uppercase tracking-wide text-oro-claro">
              Contáctanos
            </h3>
            <ul className="mt-4 space-y-3 text-sm text-marfil/65">
              <li className="flex items-start gap-2">
                <Phone size={15} strokeWidth={1.75} className="mt-0.5 shrink-0 text-oro" />
                +52 55 0000 0000
              </li>
              <li className="flex items-start gap-2">
                <Mail size={15} strokeWidth={1.75} className="mt-0.5 shrink-0 text-oro" />
                contacto@3rconnect.mx
              </li>
              <li className="flex items-start gap-2">
                <MapPin size={15} strokeWidth={1.75} className="mt-0.5 shrink-0 text-oro" />
                Av. Presidente Masaryk 111, Polanco, CDMX
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-14 border-t border-marfil/10 pt-6 text-xs text-marfil/40">
          © {new Date().getFullYear()} 3R Connect. Todos los derechos reservados.
        </div>
      </div>
    </footer>
  )
}
