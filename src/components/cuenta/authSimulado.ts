import type { TipoCuenta, Usuario } from './SesionContext'

export type ProveedorOAuth = 'google' | 'facebook' | 'apple'

const NOMBRE_POR_PROVEEDOR: Record<ProveedorOAuth, string> = {
  google: 'Usuario de Google',
  facebook: 'Usuario de Facebook',
  apple: 'Usuario de Apple',
}

function iniciales(nombre: string): string {
  const partes = nombre.trim().split(/\s+/)
  return `${partes[0][0]}${partes[partes.length - 1][0]}`.toUpperCase()
}

// PUNTO DE INTEGRACIÓN — aquí entra el OAuth real: redirect/popup al
// proveedor, intercambio de código por token, y armar el Usuario a partir
// del perfil que regrese Google/Facebook/Apple. Hoy es una simulación:
// espera 1s y arma un usuario de demo en memoria, sin backend ni
// persistencia real.
export async function simularOAuth(proveedor: ProveedorOAuth, tipoCuenta: TipoCuenta): Promise<Usuario> {
  await new Promise((resolve) => setTimeout(resolve, 1000))
  const nombre = NOMBRE_POR_PROVEEDOR[proveedor]
  return {
    id: `demo-${proveedor}-${Date.now()}`,
    nombre,
    correo: `demo.${proveedor}@3rconnect.mx`,
    iniciales: iniciales(nombre),
    tipoCuenta,
  }
}

export function correoValido(correo: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo.trim())
}

// Mismo punto de integración que simularOAuth, pero para el flujo de
// correo: aquí entraría el envío de magic link / código de verificación
// real. Hoy no valida contra ningún backend — cualquier correo con
// formato válido entra.
export async function simularAccesoConCorreo(correo: string, tipoCuenta: TipoCuenta): Promise<Usuario> {
  await new Promise((resolve) => setTimeout(resolve, 1000))
  const nombre = correo.split('@')[0]
  return {
    id: `demo-correo-${Date.now()}`,
    nombre,
    correo,
    iniciales: nombre.slice(0, 2).toUpperCase(),
    tipoCuenta,
  }
}
