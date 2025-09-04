import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import laravel from 'laravel-vite-plugin';
import { resolve } from 'node:path';
import { defineConfig } from 'vite';

export default defineConfig({
    plugins: [
        laravel({
            input: ['resources/css/app.css', 'resources/js/app.tsx'],
            ssr: 'resources/js/ssr.tsx',
            refresh: true,
        }),
        react(),
        tailwindcss(),
    ],
    esbuild: {
        jsx: 'automatic',
    },
    resolve: {
        alias: {
            'ziggy-js': resolve(__dirname, 'vendor/tightenco/ziggy'),
        },
        dedupe: ['@inertiajs/react']
    },
    // Ambiente de desenvolvimento
    server: {
        host: '0.0.0.0', // Escuta em todas as interfaces de rede
        port: 5173,      // A porta padrão do Vite
        hmr: {
            host: 'localhost', // O navegador se conectará ao HMR via localhost
        }
    }
});
