# Entry Points

The application is configured with the following entry points in `vite.config.ts`:

## CSS
- **Path**: `resources/css/app.css`
- **Purpose**: Main stylesheet. Tailwind CSS is imported here.

## JavaScript / TypeScript
- **Path**: `resources/js/app.tsx`
- **Purpose**: Main client-side entry point. Initializes Inertia.js application.

## Server-Side Rendering (SSR)
- **Path**: `resources/js/ssr.tsx`
- **Purpose**: Entry point for the SSR Node.js server.
