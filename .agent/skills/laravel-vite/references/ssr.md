# Server-Side Rendering (SSR)

SSR is enabled for this project to support SEO and faster initial paint.

## Setup
1. **Entry Point**: `resources/js/ssr.tsx`.
2. **Build Script**: `npm run build:ssr`.
3. **Vite Config**:
   ```typescript
   laravel({
       // ...
       ssr: 'resources/js/ssr.tsx',
   })
   ```

## Running SSR
In production, the SSR server is typically run via Node command or a process manager (Supervisor):
```bash
php artisan inertia:start-ssr
```
