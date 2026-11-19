import { AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { BotonVolverArriba } from '../components/landing/BotonVolverArriba'
import { FeaturedGrid } from '../components/landing/FeaturedGrid'
import { Footer } from '../components/landing/Footer'
import { Header } from '../components/landing/Header'
import { Hero } from '../components/landing/Hero'
import { PopularSearches } from '../components/landing/PopularSearches'
import { Preloader } from '../components/landing/Preloader'
import { PositioningPhrase } from '../components/landing/PositioningPhrase'
import { priorizarConVideo } from '../components/resultados/resultadosLogica'
import { ReviewsCarousel } from '../components/landing/ReviewsCarousel'
import { SearchProvider } from '../components/landing/SearchContext'
import { ServicesCarousel } from '../components/landing/ServicesCarousel'
import { StatsSection } from '../components/landing/StatsSection'
import { ZonasDestacadas } from '../components/landing/ZonasDestacadas'
import { propiedadesConFotoReal } from '../data/propiedadesDemo'
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion'
import { marcarPreloaderComoMostrado, preloaderYaSeMostro } from '../lib/preloaderEstado'

const LOGO_LAYOUT_ID = 'logo-3r-preloader'

// Video primero, en el mismo orden fijo que la página de resultados —
// constante en cada render, así que se calcula una sola vez fuera del
// componente.
const propiedadesDestacadas = priorizarConVideo(propiedadesConFotoReal)

function Landing() {
  const prefiereReducido = usePrefersReducedMotion()
  const [mostrarPreloader, setMostrarPreloader] = useState(
    () => !preloaderYaSeMostro() && !prefiereReducido,
  )

  function alTerminarPreloader() {
    marcarPreloaderComoMostrado()
    setMostrarPreloader(false)
  }

  return (
    <SearchProvider>
      <AnimatePresence>
        {mostrarPreloader && (
          <Preloader logoLayoutId={LOGO_LAYOUT_ID} onTerminar={alTerminarPreloader} />
        )}
      </AnimatePresence>

      <div className="min-h-screen bg-blanco">
        <Header logoLayoutId={mostrarPreloader ? undefined : LOGO_LAYOUT_ID} />
        <main>
          <Hero />
          <PopularSearches />
          <PositioningPhrase />
          <ServicesCarousel />
          <FeaturedGrid propiedades={propiedadesDestacadas} />
          <ZonasDestacadas />
          <ReviewsCarousel />
          <StatsSection />
        </main>
        <Footer />
        <BotonVolverArriba />
      </div>
    </SearchProvider>
  )
}

export default Landing
