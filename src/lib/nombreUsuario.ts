interface DatosUsuarioMinimos {
  nombre: string
  correo: string
}

// authSimulado.ts arma nombres de demo tipo "Usuario de Google" para el
// login por OAuth — perfectamente válidos como `nombre`, pero horribles
// para saludar ("Hola Usuario"). Si el primer nombre es literalmente la
// palabra "usuario", se usa el correo como respaldo en su lugar.
function esNombreGenerico(primerNombre: string): boolean {
  return primerNombre.trim().toLowerCase() === 'usuario'
}

function nombreDesdeCorreo(correo: string): string {
  const local = correo.split('@')[0] ?? ''
  return local
    .split(/[._-]+/)
    .filter(Boolean)
    .map((parte) => parte.charAt(0).toUpperCase() + parte.slice(1))
    .join(' ')
}

// Nombre completo a mostrar: el real de la sesión, o si viene genérico
// ("Usuario de Google"), uno construido a partir del correo.
export function nombreVisible(usuario: DatosUsuarioMinimos): string {
  const primerNombre = usuario.nombre.trim().split(/\s+/)[0] ?? ''
  if (primerNombre && !esNombreGenerico(primerNombre)) return usuario.nombre.trim()
  return nombreDesdeCorreo(usuario.correo)
}

// Primer nombre para saludos cortos ("Buenos días, Enrique.").
export function primerNombreVisible(usuario: DatosUsuarioMinimos): string {
  return nombreVisible(usuario).split(/\s+/)[0] ?? ''
}

// Iniciales recalculadas sobre el nombre ya corregido — así el avatar
// nunca muestra "UG" cuando el saludo ya dejó de decir "Usuario".
export function inicialesVisibles(usuario: DatosUsuarioMinimos): string {
  const partes = nombreVisible(usuario).trim().split(/\s+/).filter(Boolean)
  if (partes.length === 0) return ''
  if (partes.length === 1) return partes[0].slice(0, 2).toUpperCase()
  return `${partes[0][0]}${partes[partes.length - 1][0]}`.toUpperCase()
}
