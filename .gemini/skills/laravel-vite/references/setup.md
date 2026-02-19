# Setup Guide

## Installation
Run the following command to install dependencies:
```bash
npm install
```

## Development
Start the Vite development server:
```bash
npm run dev
```
This runs `vite` and binds to `0.0.0.0:5173` with HMR configured for `localhost`.

## Production Build
Build the assets for production:
```bash
npm run build
```
This output is located in `public/build`.

## SSR Build
Build the server-side rendering bundle:
```bash
npm run build:ssr
```

## Configuration
The project uses `vite.config.ts`. See [Templates/ViteConfig.js.md](templates/ViteConfig.js.md) for the full configuration.
