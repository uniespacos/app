# Preprocessors & Tailwind CSS

This project uses **Tailwind CSS v4** via the `@tailwindcss/vite` plugin.

## Configuration
Tailwind is configured directly in `vite.config.ts`:

```typescript
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
    plugins: [
        // ...
        tailwindcss(),
    ],
});
```

## Usage
Import Tailwind in `resources/css/app.css`:
```css
@import "tailwindcss";
```

No `postcss.config.js` or `tailwind.config.js` is typically required for standard v4 usage, as configuration is handled by the plugin and CSS imports.
