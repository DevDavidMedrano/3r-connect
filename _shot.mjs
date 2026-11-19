import { chromium } from 'playwright'

const OUT_DIR = 'C:\\Users\\zalaz\\AppData\\Local\\Temp\\claude\\C--DISE-O3R\\8bb40eae-5c42-4e5a-ab0d-ad9f95f569a7\\scratchpad'
const BASE = 'http://localhost:5179'

const errors = []
const browser = await chromium.launch({ args: ['--no-sandbox'] })
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
page.on('console', (msg) => { if (msg.type() === 'error') errors.push(msg.text()) })
page.on('pageerror', (err) => errors.push(String(err)))

await page.goto(`${BASE}/acceso?next=%2Fmi-cuenta%2Fvendedor`, { waitUntil: 'networkidle' })
await page.getByText('Continuar con Google').click()
await page.waitForURL('**/bienvenida**', { timeout: 10000 })
await page.getByRole('button', { name: 'Omitir por ahora' }).click()
await page.waitForURL('**/mi-cuenta/vendedor', { timeout: 10000 })
await page.waitForTimeout(400)
await page.screenshot({ path: `${OUT_DIR}\\vd-01-tablero.png`, fullPage: true })

// abrir "Más"
await page.getByRole('button', { name: /Más/ }).click()
await page.waitForTimeout(200)
await page.screenshot({ path: `${OUT_DIR}\\vd-02-mas.png` })
await page.keyboard.press('Escape')

// abrir menú de cuenta
await page.getByLabel('Mi cuenta').click()
await page.waitForTimeout(200)
await page.screenshot({ path: `${OUT_DIR}\\vd-03-cuenta.png` })
await page.keyboard.press('Escape')

const rutas = [
  ['Mis propiedades', '/mi-cuenta/vendedor/propiedades'],
  ['Solicitudes', '/mi-cuenta/vendedor/solicitudes'],
  ['Estadísticas', '/mi-cuenta/vendedor/estadisticas'],
  ['Publicar propiedad', '/mi-cuenta/vendedor/publicar'],
  ['Mis visitas', '/mi-cuenta/vendedor/visitas'],
  ['Documentos', '/mi-cuenta/vendedor/documentos'],
  ['Mi asesor', '/mi-cuenta/vendedor/asesor'],
  ['Configuración', '/mi-cuenta/vendedor/configuracion'],
]

for (const [nombre, ruta] of rutas) {
  await page.goto(`${BASE}${ruta}`, { waitUntil: 'networkidle' })
  await page.waitForTimeout(200)
  const slug = ruta.split('/').pop()
  await page.screenshot({ path: `${OUT_DIR}\\vd-sub-${slug}.png` })
  const h1 = await page.locator('h1').first().textContent()
  console.log(`${nombre} -> ${ruta} -> h1: "${h1}"`)
}

console.log('CONSOLE_ERRORS:', JSON.stringify(errors, null, 2))
await browser.close()
