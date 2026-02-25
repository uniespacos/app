import '../css/app.css';
import Echo from 'laravel-echo';
import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import Pusher from 'pusher-js';
import { createRoot } from 'react-dom/client';
import { initializeTheme } from './hooks/use-appearance';

const appName = import.meta.env.VITE_APP_NAME || 'UniEspaços';

window.Pusher = Pusher; // Certifique-se de que o Pusher está disponível globalmente

window.Echo = new Echo({
    broadcaster: 'reverb',
    key: window.Uniespacos?.reverb?.app_key,
    wsHost: window.Uniespacos?.reverb?.host,
    wsPort: Number(window.Uniespacos?.reverb?.port ?? 443),
    wssPort: Number(window.Uniespacos?.reverb?.port ?? 443),
    forceTLS: (window.Uniespacos?.reverb?.scheme ?? 'https') === 'https',
    enabledTransports: ['ws', 'wss'],
    disableStats: true,
});
createInertiaApp({
    title: (title) => (title ? `${title} - ${appName}` : appName),
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
