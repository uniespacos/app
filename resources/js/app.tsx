import '../css/app.css';

import { createInertiaApp } from '@inertiajs/react';
import Echo from 'laravel-echo';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import Pusher from 'pusher-js';
import { createRoot } from 'react-dom/client';
import { initializeTheme } from './hooks/use-appearance';

window.Pusher = Pusher; // Certifique-se de que o Pusher está disponível globalmente

window.Echo = new Echo({
    broadcaster: 'reverb',
    key: window.Uniespacos.reverb.app_key,
    wsHost: window.Uniespacos.reverb.host,
    wsPort: Number(window.Uniespacos.reverb.port),
    wssPort: Number(window.Uniespacos.reverb.port),
    forceTLS: (window.Uniespacos.reverb.scheme ?? 'https') === 'https',
    enabledTransports: ['ws', 'wss'],
});

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';
createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: (name) => resolvePageComponent(`./pages/${name}.tsx`, import.meta.glob('./pages/**/*.tsx')),
    setup({ el, App, props }) {
        const root = createRoot(el);

        root.render(<App {...props} />);
    },
    progress: {
        color: '#4B5563',
    },
});

// This will set light / dark mode on load...
initializeTheme();
