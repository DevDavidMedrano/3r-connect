import type { Propiedad, TipoPropiedad } from '../types/propiedad'

// Heurística por nombre de archivo, no una regla estricta: solo para
// atrapar en desarrollo el típico copy-paste de foto equivocada (un
// terreno con foto de casa, una oficina con foto residencial) antes de que
// llegue a producción. Si el nombre no trae ninguna de estas palabras,
// no se avisa nada — mejor un falso negativo que un falso positivo.
const PALABRA_A_TIPO: [string, TipoPropiedad][] = [
  ['penthouse', 'penthouse'],
  ['ph-', 'penthouse'],
  ['casa', 'casa'],
  ['depto', 'departamento'],
  ['departamento', 'departamento'],
  ['oficina', 'oficina'],
  ['local', 'local-comercial'],
  ['terreno', 'terreno'],
]

function tipoSugeridoPorArchivo(url: string): TipoPropiedad | null {
  const nombre = url.toLowerCase()
  const coincidencia = PALABRA_A_TIPO.find(([palabra]) => nombre.includes(palabra))
  return coincidencia ? coincidencia[1] : null
}

// Solo se llama desde propiedadesDemo.ts, y solo en desarrollo (import.meta.env.DEV).
export function validarFotosPropiedades(propiedades: Propiedad[]): void {
  for (const propiedad of propiedades) {
    for (const medio of propiedad.medios) {
      if (medio.url.startsWith('/media/')) continue // placeholder de recorrido 360, no es un archivo real
      const tipoSugerido = tipoSugeridoPorArchivo(medio.url)
      if (tipoSugerido && tipoSugerido !== propiedad.tipo) {
        console.warn(
          `[fotos] ${propiedad.folio} (${propiedad.tipo}): la foto "${medio.url}" parece ser de tipo "${tipoSugerido}" — revisar asignación.`,
        )
      }
    }
  }
}
