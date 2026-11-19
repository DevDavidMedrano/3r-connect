// Variable de módulo, no localStorage/sessionStorage: sobrevive mientras
// dure la sesión de JavaScript (navegar dentro del SPA y volver al inicio
// no la repite), pero se reinicia con una recarga real del navegador —
// eso es exactamente lo que se pidió: nada de persistencia en disco.
let yaSeMostro = false

export function preloaderYaSeMostro(): boolean {
  return yaSeMostro
}

export function marcarPreloaderComoMostrado(): void {
  yaSeMostro = true
}
