# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend enabling type-aware lint rules by installing `oxlint-tsgolint` and editing `.oxlintrc.json`:

```json
{
  "$schema": "./node_modules/oxlint/configuration_schema.json",
  "plugins": ["react", "typescript", "oxc"],
  "options": {
    "typeAware": true
  },
  "rules": {
    "react/rules-of-hooks": "error",
    "react/only-export-components": ["warn", { "allowConstantExport": true }]
  }
}
```

See the [Oxlint rules documentation](https://oxc.rs/docs/guide/usage/linter/rules) for the full list of rules and categories.

## Videos de propiedades

Los videos de recorridos van en `public/videos/`, nombrados por folio (`3R-110.mp4`). Esa carpeta está en `.gitignore` (solo se versiona `public/videos/.gitkeep` para que exista) porque los videos pesan varios MB y no deben pasar por el build de Vite ni por el repositorio.

En cada propiedad de `src/data/propiedadesDemo.ts`, el medio correspondiente apunta a `/videos/{folio}.mp4` como una URL simple — no se importa como asset. Al desplegar, los archivos `.mp4` se copian a mano a `public/videos/` en el servidor. Si un video falta o no carga, la ficha de la propiedad oculta el botón "Ver video" en vez de mostrar un reproductor roto.
