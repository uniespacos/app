---
name: laravel-vite
description: Complete Vite bundling for Laravel - assets, HMR, SSR, frameworks, optimization. Use when configuring frontend build pipeline.
versions:
  laravel: "12.x"
  vite: "6.x"
  php: "8.4"
user-invocable: true
---

# Laravel Vite Build Specialist

## Cross-References
- **Full-Stack Development:** If writing React components that Vite will compile, activate `uniespacos-fullstack-dev`.
- **Docker Setup:** If configuring HMR ports inside docker-compose, activate `uniespacos-devops-specialist`.

## Agent Workflow (MANDATORY)
Before ANY implementation, launch in parallel:
1. `glob` / `read_file` - Check existing vite.config.ts, package.json
2. `query-docs` via Context7 - Verify latest Vite/Inertia docs if dealing with complex build failures

## Overview
Vite is Laravel's default frontend build tool. It provides fast HMR in development and optimized builds for production.

## Vite configuration Patterns

```javascript
// CORRECT - UniEspaços Pattern (Vite + React + Inertia + Tailwind)
import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
    plugins: [
        laravel({
            input: 'resources/js/app.tsx',
            refresh: true,
        }),
        react(),
        tailwindcss(),
    ],
    server: {
        host: '0.0.0.0', // Crucial for Docker HMR
        hmr: {
            host: 'localhost'
        }
    }
});

// INCORRECT - Manual chunking or mixing legacy mix patterns
export default defineConfig({
    build: {
        rollupOptions: {
            // ❌ Avoid manual complex rollup configs unless absolutely necessary
        }
    }
});
```

## Critical Rules
1. **Always use laravel-vite-plugin** - Never raw Vite config
2. **VITE_ prefix for env vars** - Only exposed to frontend
3. **Use @vite directive** - Not manual script tags
4. **Configure HMR for Docker** - Set `server.host: '0.0.0.0'` and proper mapped ports.

## Best Practices
### DO
- Use `refresh: true` for Blade HMR
- Configure aliases for clean imports (`resolve.alias` mapped to `resources/js`)
- Use `VITE_` prefix for frontend env vars
- Test Docker config locally

### DON'T
- Expose sensitive data via VITE_ vars
- Use absolute paths for assets
- Ignore chunk size warnings in production builds