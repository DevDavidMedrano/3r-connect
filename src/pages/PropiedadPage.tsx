import { useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { BarraSuperior } from '../components/propiedad/BarraSuperior'
import { Caracteristicas } from '../components/propiedad/Caracteristicas'
import { DatosAnuncio } from '../components/propiedad/DatosAnuncio'
import { DatosPrincipales } from '../components/propiedad/DatosPrincipales'
import { Descripcion } from '../components/propiedad/Descripcion'
import { Encabezado } from '../components/propiedad/Encabezado'
import { FinanciamientoCalculadora } from '../components/propiedad/FinanciamientoCalculadora'
import { Galeria } from '../components/propiedad/Galeria'
import { PropiedadesSimilares } from '../components/propiedad/PropiedadesSimilares'
import { TarjetaAsesor } from '../components/propiedad/TarjetaAsesor'
import { Ubicacion } from '../components/propiedad/Ubicacion'
import { asesorParaPropiedad } from '../data/asesoresDemo'
import { propiedadesDemo } from '../data/propiedadesDemo'

export default function PropiedadPage() {
  const { folio } = useParams<{ folio: string }>()
  const propiedad = propiedadesDemo.find((p) => p.folio === folio)

  // El router reutiliza esta misma instancia de página al navegar entre dos
  // fichas (solo cambia el param de la URL): sin este efecto, ir de una
  // ficha a otra deja el scroll a media página en vez de arrancar arriba.
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [folio])

  if (!propiedad) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-blanco px-6 text-center">
        <p className="text-lg font-bold text-texto">No encontramos esta propiedad</p>
        <p className="text-sm text-texto-suave">Es posible que el anuncio ya no esté disponible.</p>
        <Link
          to="/comprar"
          className="mt-2 rounded-full bg-vino-vivo px-5 py-2 text-sm font-semibold text-blanco transition-colors hover:bg-vino"
        >
          Ver propiedades disponibles
        </Link>
      </div>
    )
  }

  const asesor = asesorParaPropiedad(propiedad.folio)
  // Financiamiento solo tiene sentido si hay algo que comprar (venta o
  // preventa); una unidad solo en renta no tiene enganche que calcular.
  const listadoFinanciable = propiedad.listados.find((l) => l.operacion === 'venta' || l.operacion === 'preventa')

  return (
    // key={folio}: fuerza un remount completo al cambiar de ficha en la
    // misma ruta — sin esto, estado local de los hijos (índice de foto en
    // Galeria, forms, etc.) sobreviviría de la propiedad anterior.
    <div key={propiedad.folio} className="min-h-screen bg-blanco">
      <BarraSuperior folio={propiedad.folio} />
      <Galeria propiedad={propiedad} />

      <div className="mx-auto max-w-6xl px-6 py-8">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_320px]">
          <div className="space-y-8">
            <Encabezado propiedad={propiedad} />

            <div className="border-t border-gris-borde pt-6">
              <DatosPrincipales propiedad={propiedad} />
            </div>

            <div className="border-t border-gris-borde pt-6">
              <Descripcion texto={propiedad.descripcion} />
            </div>

            {listadoFinanciable && (
              <div className="border-t border-gris-borde pt-6">
                <FinanciamientoCalculadora precioInicial={listadoFinanciable.precio.monto} />
              </div>
            )}

            <div className="border-t border-gris-borde pt-6">
              <Caracteristicas tipo={propiedad.tipo} />
            </div>

            <div className="border-t border-gris-borde pt-6">
              <Ubicacion propiedad={propiedad} />
            </div>

            <div className="border-t border-gris-borde pt-6">
              <DatosAnuncio propiedad={propiedad} />
            </div>
          </div>

          <div className="lg:sticky lg:top-20 lg:self-start">
            <TarjetaAsesor asesor={asesor} propiedad={propiedad} />
          </div>
        </div>

        <div className="mt-10 border-t border-gris-borde pt-8">
          <PropiedadesSimilares propiedad={propiedad} />
        </div>
      </div>
    </div>
  )
}
