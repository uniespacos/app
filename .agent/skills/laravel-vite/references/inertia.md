# Inertia.js Setup

This project uses **Inertia.js** with **React**.

## Client Setup (`app.tsx`)
- Uses `createInertiaApp` to bootstrap the React app.
- Resolves pages using `resolvePageComponent` from `laravel-vite-plugin/inertia-helpers`.
- Glob pattern: `./pages/**/*.tsx`.

## Ziggy Integration
Ziggy is used for named routes in the frontend.
- **Alias**: `ziggy-js` -> `vendor/tightenco/ziggy` configured in `vite.config.ts`.
- **SSR**: Ziggy route function is injected into the global scope in `ssr.tsx`.
