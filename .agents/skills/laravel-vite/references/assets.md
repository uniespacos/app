# Asset Handling

## Importing Assets
In Vite, assets should be imported directly in your JavaScript/TypeScript or CSS files.

### JavaScript / TypeScript
```typescript
import logo from '../images/logo.png';
// logo is the URL to the processed image
```

### CSS
```css
.logo {
    background-image: url('../images/logo.png');
}
```

## Public Directory
Static assets that do not need processing (like `robots.txt`, `favicon.ico`) should be placed in the `public/` directory. They are served at the root path `/`.

## Production Build
When running `npm run build`, assets are hashed and placed in `public/build/assets` for long-term caching.
