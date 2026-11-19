import { createContext, useContext, useState, type ReactNode } from 'react'
import type { TabBusqueda } from './searchConfig'

interface SearchState {
  tab: TabBusqueda
  setTab: (tab: TabBusqueda) => void
  zona: string
  setZona: (valor: string) => void
  precioMinimo: string
  setPrecioMinimo: (valor: string) => void
  recamaras: string
  setRecamaras: (valor: string) => void
  tipo: string
  setTipo: (valor: string) => void
}

const SearchContext = createContext<SearchState | null>(null)

// Estado del buscador compartido entre el buscador grande del hero y la
// pastilla compacta que aparece en el header al hacer scroll: ambos leen y
// escriben la misma búsqueda, nunca dos copias que se desincronizan.
export function SearchProvider({ children }: { children: ReactNode }) {
  const [tab, setTabState] = useState<TabBusqueda>('comprar')
  const [zona, setZona] = useState('')
  const [precioMinimo, setPrecioMinimo] = useState('')
  const [recamaras, setRecamaras] = useState('')
  // Vacío por default a propósito: si el usuario no toca el campo, la
  // búsqueda no debe llegar con un tipo de propiedad que nunca eligió.
  const [tipo, setTipo] = useState('')

  function setTab(nuevoTab: TabBusqueda) {
    setTabState(nuevoTab)
    setTipo('')
  }

  return (
    <SearchContext.Provider
      value={{
        tab,
        setTab,
        zona,
        setZona,
        precioMinimo,
        setPrecioMinimo,
        recamaras,
        setRecamaras,
        tipo,
        setTipo,
      }}
    >
      {children}
    </SearchContext.Provider>
  )
}

export function useSearch(): SearchState {
  const contexto = useContext(SearchContext)
  if (!contexto) {
    throw new Error('useSearch debe usarse dentro de <SearchProvider>')
  }
  return contexto
}
