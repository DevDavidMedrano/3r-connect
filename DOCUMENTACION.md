# 3R Connect — Documentación del proyecto

Mockup/demo de una inmobiliaria boutique en Polanco, Ciudad de México. Todo el
código, comentarios y textos de interfaz están en español. Es un frontend de
demostración: no hay backend real, la "base de datos" son arreglos de
TypeScript en `src/data/`, y la sesión de usuario vive únicamente en memoria
(nunca `localStorage`/`sessionStorage` — recargar la página borra la sesión a
propósito).

---

## 1. Stack técnico

| Pieza | Detalle |
|---|---|
| Framework | React 18 + TypeScript (`strict`, sin `any`) |
| Build | Vite 8 |
| Estilos | Tailwind CSS v4 (tokens vía `@theme` en `src/index.css`, genera utilidades solas) |
| Ruteo | React Router v7 |
| Animación | framer-motion |
| Mapas | `@vis.gl/react-google-maps` + `@googlemaps/markerclusterer` |
| 3D | `three` (lazy-loaded, solo se descarga al abrir el visor) |
| Íconos | `lucide-react` |
| IA conversacional | API de OpenAI (`gpt-4o-mini`) llamada directo desde el navegador |
| Lint | `oxlint` |

Scripts (`package.json`): `npm run dev`, `npm run build` (`tsc -b && vite build`), `npm run lint`, `npm run preview`.

---

## 2. Variables de entorno

Declaradas (vacías) en `.env.example` (versionado); los valores reales van en
`.env.local` (en `.gitignore` vía el patrón `*.local`, nunca se sube a git):

```
VITE_GOOGLE_MAPS_API_KEY=
VITE_OPENAI_API_KEY=
```

- **`VITE_GOOGLE_MAPS_API_KEY`** — usada por `ResultsMap`, `Ubicacion` y `ZonasDestacadas` para pintar los mapas. Si falta, cada componente cae a un estado "El mapa no está disponible" en vez de romper la página.
- **`VITE_OPENAI_API_KEY`** — usada por `src/lib/agenteOpenAI.ts` para el agente de WhatsApp. **Advertencia de seguridad marcada en el propio código**: al ser una app 100% frontend, esta llave viaja expuesta en el bundle del navegador. Es aceptable solo para una demo local; antes de producción hay que mover esa llamada a un backend propio (el comentario en `agenteOpenAI.ts` documenta exactamente qué mover).

---

## 3. Estructura de carpetas

```
src/
├── assets/img/          Imágenes reales (hero + fotos de propiedades) + índices de export
├── components/
│   ├── brand/            Logo (TresRLogo)
│   ├── cuenta/            Sesión, menú de cuenta, auth simulada
│   ├── landing/           Todo lo de la página de inicio pública
│   │   └── art/           Ilustraciones SVG propias (PropertyArt, íconos sociales)
│   ├── motion/            Primitivas de animación reutilizables (framer-motion)
│   ├── propiedad/         Ficha de propiedad (/propiedad/:folio) + agente de WhatsApp
│   ├── resultados/        Página de resultados de búsqueda (/comprar, /rentar…)
│   ├── vendedor/          Tablero del modo vendedor
│   └── HeaderVendedor.tsx Header propio del tablero (fuera de landing/, a propósito)
├── data/                  "Base de datos" demo (propiedades, asesores, reseñas, zonas, colonias)
├── hooks/                 usePrefersReducedMotion
├── lib/                   Lógica de dominio sin JSX: financiamiento, agente IA, colores, etc.
├── pages/                 Un archivo por ruta (+ pages/vendedor/ para las subrutas del tablero)
├── types/                 Modelo de dominio (Propiedad, Asesor, Reseña, mensajes del chat)
├── App.tsx                Definición de rutas
├── index.css              Design tokens (Tailwind v4 @theme)
└── main.tsx               Punto de entrada
```

---

## 4. Sistema de diseño

`src/index.css` define **dos familias de tokens** que conviven en el proyecto (ver sección 10, "Piezas huérfanas", para el porqué):

**Familia "landing rebuild" (la que está en uso real hoy)**
`--color-vino`, `--color-vino-oscuro`, `--color-vino-vivo`, `--color-coral`, `--color-rosa-suave`, `--color-blanco`, `--color-gris-borde`, `--color-texto`, `--color-texto-suave`, más los semánticos `--color-exito` / `--color-alerta` (solo para indicadores de tendencia, no son de marca).

**Familia "marca original"** (heredada, todavía usada por `Visor3D.tsx`, `PropertyArt.tsx` y por un puñado de componentes huérfanos sin usar)
`--color-onix`, `--color-carbon`, `--color-oro`, `--color-oro-claro`, `--color-oro-oscuro`, `--color-plata`, `--color-marfil`, `--color-borde`.

Tipografías: `--font-serif` (Cormorant Garamond, para h1–h4) y `--font-sans` (Inter, cuerpo). `scroll-behavior: smooth` a nivel `html`, desactivado automáticamente si el sistema pide `prefers-reduced-motion: reduce`.

`src/lib/colores.ts` replica en hex plano los tokens de la familia "landing rebuild" para los lugares donde Tailwind no llega: SVGs generados como data-URI (pines de mapa) y materiales de Three.js.

Radios de borde propios: `--radius-3r-sm/md/lg` (usados solo por los componentes con la paleta original).

---

## 5. Mapa de rutas

| Ruta | Página | Qué es |
|---|---|---|
| `/` | `Landing.tsx` | Home pública |
| `/comprar`, `/rentar`, `/preventa`, `/comercial` | `ResultadosPage.tsx` (con prop `modo`) | Resultados de búsqueda, mismo componente para las 4 variantes |
| `/propiedad/:folio` | `PropiedadPage.tsx` | Ficha de una propiedad |
| `/acceso` | `AccesoPage.tsx` | Login/registro simulado |
| `/bienvenida` | `BienvenidaPage.tsx` | Onboarding de una sola pantalla (operación/zonas/presupuesto) |
| `/mi-cuenta` | `MiCuentaPage.tsx` | Perfil del cliente: guardados, preferencias, visitas agendadas |
| `/mi-cuenta/vendedor` | `VendedorPage.tsx` | Tablero del modo vendedor |
| `/mi-cuenta/vendedor/propiedades` | `PropiedadesVendedorPage.tsx` | Placeholder (estado vacío) |
| `/mi-cuenta/vendedor/solicitudes` | `SolicitudesVendedorPage.tsx` | Placeholder |
| `/mi-cuenta/vendedor/estadisticas` | `EstadisticasVendedorPage.tsx` | Placeholder |
| `/mi-cuenta/vendedor/publicar` | `PublicarVendedorPage.tsx` | Placeholder (todavía no hay formulario de alta) |
| `/mi-cuenta/vendedor/visitas` | `VisitasVendedorPage.tsx` | Placeholder |
| `/mi-cuenta/vendedor/documentos` | `DocumentosVendedorPage.tsx` | Placeholder |
| `/mi-cuenta/vendedor/asesor` | `AsesorVendedorPage.tsx` | Placeholder |
| `/mi-cuenta/vendedor/configuracion` | `ConfiguracionVendedorPage.tsx` | Placeholder |

Todas las rutas `/mi-cuenta/vendedor/*` están protegidas: sin sesión, redirigen a `/acceso?next=<ruta>` (guard centralizado en `LayoutVendedor`).

---

## 6. Módulos

### 6.1 Landing pública (`/`)

`pages/Landing.tsx` orquesta, en este orden: **Preloader** → **Header** → **Hero** → **PopularSearches** → **PositioningPhrase** → **ServicesCarousel** → **FeaturedGrid** → **ZonasDestacadas** → **ReviewsCarousel** → **BotonVolverArriba**.

- **`Preloader.tsx`** — pantalla completa vino con el logo respirando/rotando, se muestra **una sola vez por sesión de pestaña** (bandera en memoria en `lib/preloaderEstado.ts`, un `let` a nivel de módulo — no storage). Máximo 1.8s, se salta entero si `prefers-reduced-motion`. El logo hace una transición `layoutId` de framer-motion hacia el logo del `Header` (misma pieza, no dos logos distintos apareciendo/desapareciendo).
- **`Header.tsx`** — header público: logo, nav (Comprar/Rentar/Preventa/Créditos/Asesores), buscador compacto que aparece al hacer scroll, favoritos, idioma, `CuentaMenu`. Se vuelve sólido con blur al hacer scroll.
- **`Hero.tsx`** — bloque vino con 6 fotos flotantes (`FotoFlotante`, reutilizan `GALERIA` por índice), titular, `SearchTabs` + `SearchBar` (de `SearchCard.tsx`) montados sobre el borde inferior del bloque.
- **`SearchContext.tsx` / `searchConfig.ts`** — estado del buscador compartido entre el buscador grande del Hero y la pastilla compacta del header; `construirRutaBusqueda()` es el único lugar que traduce ese estado a query params de `/comprar` etc.
- **`PopularSearches.tsx`**, **`PositioningPhrase.tsx`**, **`ServicesCarousel.tsx`** — carruseles/secciones de apoyo, con scroll animado con stagger (framer-motion).
- **`FeaturedGrid.tsx`** → **`PropertyCard.tsx`** — grid de propiedades destacadas; cursor personalizado "Ver" en escritorio (`motion/CursorVer.tsx`).
- **`ZonasDestacadas.tsx`** — sección con lista de zonas (buscador + orden + precio/m² + variación anual) a la izquierda y mapa de Google con polígonos orgánicos por zona a la derecha; hover en una fila resalta su polígono. Datos en `data/zonasDestacadasDemo.ts`, **marcados explícitamente como estimados**, a sustituir antes de publicar.
- **`ReviewsCarousel.tsx`** — reseñas ligadas a una propiedad real por folio (`data/resenasDemo.ts` + `types/resena.ts`).
- **`BotonVolverArriba.tsx`** — aparece tras cierto scroll.
- **`components/motion/`** — infraestructura de animación reutilizada en toda la landing: `Reveal` (fade+sube al entrar en viewport, una vez), `StaggerReveal` (`StaggerContainer`/`StaggerItem`, stagger de 80ms configurable, dispara en scroll o al montar), `ContadorAnimado` (cuenta de 0 al número real al entrar en viewport). Todo respeta `usePrefersReducedMotion`.

### 6.2 Resultados de búsqueda (`/comprar`, `/rentar`, `/preventa`, `/comercial`)

`ResultadosPage.tsx` + `components/resultados/`:
- **`resultadosLogica.ts`** — el cerebro sin JSX: `parsearFiltros`/`construirParametros` (URL ⇄ objeto `Filtros`, la URL es la única fuente de verdad, compartible), `filtrarPropiedades`, `ordenarPropiedades`, `construirTituloResultados`, `zonasConInventario`.
- **`FiltrosBar.tsx`** — zona, operación, precio, tipo, recámaras, botón de filtros activos, guardar búsqueda (visual, sin persistencia), toggle lista/mapa.
- **`ResultadosHeader.tsx`** — título dinámico + selector de orden.
- **`ResultCard.tsx`** — tarjeta de propiedad (reusada también en "Propiedades similares" de la ficha); guardar como favorito redirige a `/acceso` si no hay sesión.
- **`EmptyState.tsx`** — sin resultados, sugiere zonas con inventario real.
- **`ResultsMap.tsx`** + **`mapaEstilo.ts`** — mapa con clustering (`MarkerClusterer`), pines-píldora con precio abreviado, estilo claro y desaturado propio (sin POI de negocios, sin colores default de Google). `mapaEstilo.ts` también trae `iconoPinPequeno()` (puntos chicos para vistas generales) e `iconoCluster()`.

### 6.3 Ficha de propiedad (`/propiedad/:folio`)

`PropiedadPage.tsx` compone, de arriba a abajo: `BarraSuperior` (volver, guardar, compartir — **no** el header público) → `Galeria` → `Encabezado` (precio(s) + título) → `DatosPrincipales` (grid de atributos, un dato por fila solo si aplica al tipo de inmueble) → `Descripcion` (expandible) → `FinanciamientoCalculadora` (si hay listado de venta/preventa) → `Caracteristicas` (Exterior/General/Amenidades, sintéticas por tipo) → `Ubicacion` (mapa con `Circle` — nunca el pin exacto, por privacidad) → `DatosAnuncio` (folio copiable) → `PropiedadesSimilares`. A la derecha, sticky: `TarjetaAsesor`.

- **`Galeria.tsx`** — mosaico 1+4 fotos, completa con `GALERIA` si faltan reales; visor de pantalla completa; botón "Ver en 3D" (solo si la propiedad tiene `m2Construccion`).
- **`Visor3DModal.tsx` → `Visor3D.tsx`** — three.js **lazy-loaded** (no entra al bundle inicial). `elegirPlantilla()` decide una de 5 plantillas de distribución según tipo/recámaras/m² (o se fuerza con el campo opcional `Propiedad.plantilla3d`); controles de órbita, día/noche, rotación automática. Usa `lib/colores.ts`, nunca hex suelto.
- **`TarjetaAsesor.tsx`** — tres acciones: **Enviar mensaje** (abre `LeadModal`, formulario clásico), **Enviar WhatsApp** (abre `WhatsAppModal`, el agente de IA — ver 6.6), **Llamar** (`tel:` directo).
- **`LeadModal.tsx` + `enviarLead.ts`** — formulario de contacto simulado (700ms de espera falsa). `enviarLead.ts` está marcado como punto de integración: es el único archivo a tocar cuando exista backend real para este formulario. El canal WhatsApp **ya no pasa por aquí** (tiene su propio flujo, ver 6.6).

### 6.4 Cuenta de cliente

- **`SesionContext.tsx`** (provider único en `App.tsx`, envuelve toda la app) — `usuario`, `onboardingCompletado`, `preferencias` (operación/zonas/presupuesto del onboarding), `propiedadesGuardadas`, **`visitas`** (citas agendadas, alimentadas por el agente de WhatsApp — ver 6.6). Todo en memoria (`useState`), nada de storage.
- **`authSimulado.ts`** — `simularOAuth(proveedor)` y `simularAccesoConCorreo(correo)`, 1s de espera falsa, arman un `Usuario` de demo. Marcado como punto de integración para OAuth real. Los nombres demo de OAuth son genéricos ("Usuario de Google"); `lib/nombreUsuario.ts` corrige esto en la UI (ver 6.7).
- **`AccesoPage.tsx`** — login/registro (Google/Facebook/Apple simulados + correo). Si es la primera vez, manda a `/bienvenida`; si no, directo al `next`.
- **`BienvenidaPage.tsx`** — onboarding de un paso: operación (comprar/rentar/invertir), zonas de interés, rango de presupuesto. "Omitir por ahora" también cuenta como onboarding completado.
- **`MiCuentaPage.tsx`** — resumen del cliente: propiedades guardadas, preferencias del onboarding, **visitas agendadas** (alimentadas por el chat de WhatsApp).
- **`CuentaMenu.tsx`** (dentro del `Header` público) — dropdown con: con sesión → Mis listas, Búsquedas guardadas, Mis visitas, Mi perfil, Modo vendedor, Cerrar sesión; sin sesión → Listas, Iniciar sesión, Crear cuenta, Publicar propiedad (manda directo a `/acceso?next=/mi-cuenta/vendedor` — **nunca a un formulario**, por decisión explícita de producto).

### 6.5 Modo vendedor (`/mi-cuenta/vendedor/*`)

- **`LayoutVendedor.tsx`** — guard de sesión + `HeaderVendedor` + contenedor `<main>`, compartido por el tablero y sus 8 subpáginas.
- **`HeaderVendedor.tsx`** — header **propio**, deliberadamente distinto del público: logo, nav central (Tablero · Solicitudes · Mis propiedades · Mis visitas · Documentos · Más ▾ con Estadísticas/Mi asesor/Configuración), buscador, campana, avatar con menú (Ver el portal · Mi perfil · Cerrar sesión). **No** trae Comprar/Rentar/Preventa/Créditos/Asesores — ese es el menú del portal público, no aplica aquí.
- **`VendedorPage.tsx`** (Tablero) — saludo por nombre/hora del día, `GuiaInicioRapido` (checklist descartable, sin persistencia), `Contadores` (bloques de propiedades/solicitudes/actividad, con conteo animado desde 0), `RejillaAccesos` (8 tarjetas, cada una enlaza a su subruta), `PanelLateral` (promo de recorridos 3D).
- Las 8 subpáginas (`pages/vendedor/*VendedorPage.tsx`) son deliberadamente **placeholders**: todavía no hay funcionalidad real detrás, pero cada una tiene un estado vacío bien resuelto (`components/vendedor/EstadoVacio.tsx`: ícono + título + una línea explicativa) — nunca pantalla en blanco.

### 6.6 Agente de IA por WhatsApp (`components/propiedad/WhatsAppModal.tsx`)

Al hacer clic en "Enviar WhatsApp" en la ficha de propiedad, **no** abre WhatsApp real: abre un modal que simula la app (colores propios de WhatsApp, a propósito no los tokens de 3R — está imitando la interfaz de un tercero). El prospecto ya trae un primer mensaje puesto con el folio; el agente responde tras ~1.5s con indicador de "escribiendo…".

**Capas del agente** (cada una en su propio archivo, para que mover a backend sea cambiar una función):

- **`lib/agenteContexto.ts`** — arma el mensaje de sistema: identidad del asistente, **catálogo completo** (`lib/catalogoAgente.ts`: folio, tipo, listados con precio y créditos aceptados, colonia, alcaldía, calle, recámaras/baños/m², estacionamientos, año, mantenimiento, amenidades, descripción, asesor asignado), **zonas de cobertura** con precio/m² (las 10 de "Zonas destacadas" + Tecamachalco, agregada solo para el agente), **asesores** (nombre, años en 3R, zonas que dominan, operaciones cerradas), y **datos de sesión del usuario** si está logueado (nombre, presupuesto/zonas/operación del onboarding, propiedades guardadas) — con la instrucción explícita de nunca volver a preguntar lo que ya sabe. Reglas de tono: informa antes de preguntar, una sola pregunta al final, máximo tres líneas por mensaje, nunca comparte contacto del dueño (todo pasa por el asesor asignado), admite lo que no sabe en vez de inventar.
- **`lib/agenteOpenAI.ts`** — la única función que llama a la API de OpenAI (`gpt-4o-mini`, `fetch` directo). Marcada con la advertencia de seguridad de la llave expuesta (ver sección 2).
- **`lib/agenteGuionRespaldo.ts`** — **respaldo sin red**: si la llamada a OpenAI falla (sin llave, sin conexión, error de la API), responde con un guion de palabras clave (precio, crédito, dueño, zona, renta/compra…) para que el chat nunca se quede mudo. Deliberadamente más simple que el agente real — no conoce todo el catálogo, solo evita el silencio.
- **`lib/calificacionLead.ts`** — heurística por regex sobre el texto libre del prospecto: detecta presupuesto, zona (contra la lista de zonas + Tecamachalco), recámaras, operación (compra/renta) y crédito preaprobado. Progresivo: cada campo se sobreescribe solo si el mensaje trae una señal nueva.
- **`lib/horariosDisponibles.ts`** — genera 4 horarios plausibles a partir de la fecha real ("Mañana 11:00 am", etc.), usados como pastillas dentro del chat.
- **`lib/configCRM.ts`** — constante `URL_CRM_INBOX` (`http://localhost:5175/inbox`, otro proyecto): **no se construye ningún CRM dentro de 3R Connect**, solo se enlaza hacia él.

**Flujo dentro del chat**:
1. Primer mensaje del prospecto (ya puesto) → primera respuesta del agente.
2. Al segundo intercambio, se presenta al asesor asignado con una tarjeta de sistema (avatar, años en 3R, operaciones cerradas).
3. Cuando el agente ya tiene presupuesto y zona (extraídos por `calificacionLead.ts`, o ya conocidos por sesión desde el primer mensaje), aparece una tarjeta "Prospecto calificado y enviado a {asesor}" con presupuesto/zona/operación/estado de la visita.
4. Tras 4-5 intercambios (o si el modelo detecta interés y agrega una señal interna que el código intercepta y oculta), el agente ofrece agendar visita con pastillas de horario; al elegir una, se confirma con texto + tarjeta "Visita agendada", y la cita se registra en `SesionContext.agendarVisita()` (aparece después en `/mi-cuenta`, sección "Visitas agendadas").
5. Debajo del modal (fuera del "teléfono"), **`PanelLeadCRM.tsx`** aparece en cuanto el lead está calificado: etapa del embudo, asesor asignado (con avatar), qué busca (presupuesto/zona/recámaras/origen), propiedades que el agente mencionó durante la charla (detectadas por folio en sus respuestas), notas (resumen generado por la misma heurística de calificación — funciona igual en modo respaldo que con IA real), y un botón "Abrir en el CRM" que enlaza a `URL_CRM_INBOX`.

### 6.7 Utilidades transversales

- **`lib/nombreUsuario.ts`** — `nombreVisible`/`primerNombreVisible`/`inicialesVisibles`: si el `nombre` de sesión es genérico (literalmente "Usuario…", como lo arma el login OAuth simulado), cae a un nombre construido a partir del correo, capitalizado. Nunca muestra la palabra "Usuario" en pantalla.
- **`lib/financiamiento.ts`** — `calcularPagoMensual()` (amortización francesa estándar, tasa fija de referencia) + `PLAZOS_ANIOS`, compartida por la calculadora de la ficha de propiedad y por `MortgageCalculator.tsx` (huérfana, ver sección 10).
- **`hooks/usePrefersReducedMotion.ts`** — hook reactivo sobre `matchMedia`, usado en toda animación del proyecto.

---

## 7. Modelo de datos (`src/types/`)

- **`propiedad.ts`** — el corazón del dominio.
  - `Precio` (`monto` + `moneda: 'MXN'|'USD'`, nunca un number suelto).
  - `Coordenadas`, `UbicacionExacta` (venta/renta, con `direccion`) vs `UbicacionAproximada` (preventa, con `referencia` — nunca dirección exacta).
  - `Medio`/`TipoMedio` (fotografía, render, recorrido 360).
  - `AtributosPropiedad` — unión discriminada por `tipo`: departamento/penthouse (recámaras+baños+m² construcción), casa (+ m² terreno), oficina/local (baños+m² construcción), terreno (solo m² terreno). Nunca "0 recámaras": el campo simplemente no existe si no aplica.
  - `Listado` — unión discriminada por `operacion`: `ListadoVenta` (créditos aceptados, escriturado), `ListadoRenta` (plazo, amueblado, depósito), `ListadoPreventa` (desarrollador, avance de obra, unidades). **`listados` es un arreglo, no un campo único** — una unidad puede estar en venta y renta a la vez.
  - `Propiedad = PropiedadConstruida | PropiedadPreventa` — preventa no tiene dirección exacta ni fotografía garantizada.
  - Helpers puros: `formatearPrecio`, `construirTitulo`, `resumenAtributos`, `precioMinimo`, `etiquetaOperacion`, `publicadoHace`, `esPreventa` (type guard).
  - `Plantilla3D` — tipo opcional en `Propiedad` para forzar manualmente la plantilla del visor 3D.
- **`asesor.ts`** — `Asesor` (nombre, iniciales, color de avatar, año de ingreso, teléfono, **zonas que domina**, **operaciones cerradas**).
- **`resena.ts`** — `Resena` (ligada a una `Propiedad` por `folio`), `ResumenResenas`.
- **`chatAgente.ts`** — `MensajeChat` (unión discriminada por `de`/`tipo`: texto de usuario/agente, selector de cita, tarjeta de sistema de cita/asesor/calificado), `VisitaAgendada`.

---

## 8. Datos demo (`src/data/`)

Todo explícitamente marcado como **DEMO** en comentarios — no viene de ningún backend real.

- **`propiedadesDemo.ts`** — ~20 propiedades (`propiedadesDemo`) con fotos reales rotadas desde `assets/img`; `propiedadesConFotoReal` filtra las que sí traen foto propia (usada en la landing).
- **`asesoresDemo.ts`** — 3 asesores (mismos nombres que `landing/Advisors.tsx`, huérfana) + `asesorParaPropiedad(folio)`, asignación determinística (no aleatoria) por suma de código de caracteres del folio.
- **`resenasDemo.ts`** — reseñas ligadas a propiedades reales por folio.
- **`coloniasCoordenadas.ts`** — `COLONIA_BASE`, coordenadas centro por colonia (Polanco, Lomas, Nuevo Polanco, Anzures, Condesa, Roma Norte, Nápoles, Tecamachalco); cada propiedad le resta/suma milésimas de grado para no encimar pines.
- **`zonasDestacadasDemo.ts`** — las 10 zonas de "Zonas destacadas" (precio/m² + variación anual, **estimados**, a sustituir antes de publicar) + polígonos orgánicos generados por función (no rectángulos, no se encimarán entre sí).

---

## 9. Integraciones pendientes (documentadas en el propio código)

Estos son los puntos donde el proyecto está deliberadamente simulado, cada uno con un comentario "PUNTO DE INTEGRACIÓN" explicando qué cambiar:

| Qué | Dónde | Qué falta |
|---|---|---|
| OAuth real | `authSimulado.ts` | Redirect/popup al proveedor real, intercambio de token |
| Envío de lead (formulario) | `enviarLead.ts` | Backend/webhook real |
| Agente de IA | `agenteOpenAI.ts` | Mover el `fetch` a un backend propio antes de producción (la llave está expuesta) |
| Mapas | requiere `VITE_GOOGLE_MAPS_API_KEY` con facturación habilitada en Google Cloud | Sin eso, muestra "For development purposes only" / falla de estilo — no es un bug de código |
| CRM | `configCRM.ts` | Vive en otro proyecto; aquí solo hay un link de salida |
| Publicar propiedad | `pages/vendedor/PublicarVendedorPage.tsx` | Formulario de alta todavía no existe |

---

## 10. Piezas huérfanas (código presente, no enlazado a ninguna ruta)

Estos componentes usan la paleta de marca **original** (onix/oro/marfil) y **no
están importados por ninguna página** — quedaron de una iteración anterior de
la landing, antes del rebuild descrito en la sección 6.1:

- `components/landing/Footer.tsx`
- `components/landing/Advisors.tsx`
- `components/landing/VirtualToursSection.tsx`
- `components/landing/MortgageCalculatorSection.tsx` + `MortgageCalculator.tsx`

No se borraron por si sirven de referencia, pero **no forman parte del sitio que corre hoy**. La landing actual no tiene footer.

---

## 11. Convenciones del proyecto

- Todo el código, comentarios y copy de UI en **español mexicano**.
- **Nunca** `localStorage`/`sessionStorage` — toda persistencia "de sesión" es en memoria (React state/Context) y se pierde al recargar, a propósito.
- **Nunca** `any` — TypeScript estricto en todo el proyecto.
- Nombres de archivos/componentes/funciones en español (`Ubicacion`, `enviarLead`, `construirTitulo`).
- Ningún hex suelto fuera de `lib/colores.ts` (para SVG data-URI y materiales de Three.js) — todo lo demás usa clases Tailwind sobre los tokens de `index.css`. Excepción deliberada: los colores propios de WhatsApp en `WhatsAppModal.tsx`, porque ahí se está imitando la interfaz de un tercero, no la marca de 3R.
- Animaciones siempre sutiles, sin parallax, respetando `prefers-reduced-motion` en todos lados; scroll suave nativo (`scroll-behavior: smooth`), sin librerías de scroll.
- Datos demo siempre marcados como tales en comentario, con nota de qué sustituir antes de publicar.

---

## 12. Cómo correr el proyecto

```bash
npm install
# copiar .env.example a .env.local y llenar las llaves reales ahí (nunca en .env.example)
npm run dev
```

`npm run build` corre `tsc -b` antes de `vite build` — un error de tipos rompe el build.
