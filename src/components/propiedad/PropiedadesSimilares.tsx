import { useRef } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { construirRutaBusqueda, type TabBusqueda } from '../landing/searchConfig'
import { propiedadesPublicas } from '../../data/propiedadesDemo'
import { precioMinimo } from '../../types/propiedad'
import type { Listado, Propiedad } from '../../types/propiedad'
import { ResultCard } from '../resultados/ResultCard'

const MINIMO = 4
const MAXIMO = 12
const RANGO_PRECIO = 0.3 // ±30%

const TAB_POR_OPERACION: Record<Listado['operacion'], TabBusqueda> = {
  venta: 'comprar',
  renta: 'rentar',
  preventa: 'preventa',
}

function dentroDeRango(candidata: Propiedad, precioRef: number): boolean {
  const precioCandidata = precioMinimo(candidata).monto
  return Math.abs(precioCandidata - precioRef) / precioRef <= RANGO_PRECIO
}

// Cascada de similitud — cada nivel afloja un criterio hasta juntar al
// menos MINIMO propiedades, para que el bloque nunca quede vacío (el
// criterio estricto de nivel 1 por sí solo dejaba sin coincidencias a
// cualquier propiedad fuera de lo típico: un terreno, una oficina, la
// única propiedad de su colonia).
function similares(propiedad: Propiedad): Propiedad[] {
  const precioRef = precioMinimo(propiedad).monto
  const candidatas = propiedadesPublicas.filter((candidata) => candidata.folio !== propiedad.folio)
  const resultado: Propiedad[] = []
  const usados = new Set<string>()

  function agregar(lista: Propiedad[]) {
    for (const candidata of lista) {
      if (resultado.length >= MAXIMO) return
      if (usados.has(candidata.folio)) continue
      usados.add(candidata.folio)
      resultado.push(candidata)
    }
  }

  // Nivel 1: misma colonia, mismo tipo, precio ±30%.
  agregar(
    candidatas.filter(
      (candidata) =>
        candidata.ubicacion.colonia === propiedad.ubicacion.colonia &&
        candidata.tipo === propiedad.tipo &&
        dentroDeRango(candidata, precioRef),
    ),
  )

  // Nivel 2: misma alcaldía, mismo tipo.
  if (resultado.length < MINIMO) {
    agregar(
      candidatas.filter(
        (candidata) => candidata.ubicacion.alcaldia === propiedad.ubicacion.alcaldia && candidata.tipo === propiedad.tipo,
      ),
    )
  }

  // Nivel 3: mismo rango de precio, cualquier tipo.
  if (resultado.length < MINIMO) {
    agregar(candidatas.filter((candidata) => dentroDeRango(candidata, precioRef)))
  }

  // Último recurso: en un catálogo chico, los tres niveles de arriba
  // pueden agotarse por debajo de MINIMO (p. ej. solo hay 3 penthouses en
  // total). Se completa con lo que quede del catálogo público, lo más
  // cercano en precio primero, en vez de mostrar un carrusel a medias.
  if (resultado.length < MINIMO) {
    agregar(
      [...candidatas].sort(
        (a, b) => Math.abs(precioMinimo(a).monto - precioRef) - Math.abs(precioMinimo(b).monto - precioRef),
      ),
    )
  }

  return resultado
}

export function PropiedadesSimilares({ propiedad }: { propiedad: Propiedad }) {
  const propiedades = similares(propiedad)
  const scrollRef = useRef<HTMLDivElement>(null)

  if (propiedades.length === 0) return null

  function desplazar(direccion: 1 | -1) {
    const contenedor = scrollRef.current
    if (!contenedor) return
    const tarjeta = contenedor.firstElementChild as HTMLElement | null
    const paso = tarjeta ? tarjeta.getBoundingClientRect().width + 20 : contenedor.clientWidth
    contenedor.scrollBy({ left: paso * direccion, behavior: 'smooth' })
  }

  const rutaColonia = construirRutaBusqueda({
    tab: TAB_POR_OPERACION[propiedad.listados[0].operacion],
    zona: propiedad.ubicacion.colonia,
    precioMinimo: '',
    recamaras: '',
    tipo: '',
  })

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h2 className="font-serif text-xl font-bold text-texto">También te puede interesar</h2>

        <div className="flex items-center gap-4">
          <Link to={rutaColonia} className="text-sm font-medium text-vino-vivo transition-colors hover:text-vino">
            Ver todas en {propiedad.ubicacion.colonia}
          </Link>

          {propiedades.length > 1 && (
            <div className="hidden items-center gap-2 sm:flex">
              <button
                type="button"
                aria-label="Anterior"
                onClick={() => desplazar(-1)}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-gris-borde text-texto-suave transition-colors hover:border-vino-vivo hover:text-vino-vivo"
              >
                <ChevronLeft size={15} strokeWidth={1.75} />
              </button>
              <button
                type="button"
                aria-label="Siguiente"
                onClick={() => desplazar(1)}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-gris-borde text-texto-suave transition-colors hover:border-vino-vivo hover:text-vino-vivo"
              >
                <ChevronRight size={15} strokeWidth={1.75} />
              </button>
            </div>
          )}
        </div>
      </div>

      <div
        ref={scrollRef}
        className="mt-5 flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-smooth pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {propiedades.map((similar) => (
          <div
            key={similar.folio}
            className="w-full shrink-0 snap-start sm:w-[calc((100%-1.25rem)/2)] lg:w-[calc((100%-3.75rem)/4)]"
          >
            <ResultCard propiedad={similar} />
          </div>
        ))}
      </div>
    </div>
  )
}
