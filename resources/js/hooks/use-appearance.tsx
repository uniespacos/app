export type Appearance = 'light' | 'dark' | 'system';

export function initializeTheme() {
    // Força tema light removendo classe dark
    document.documentElement.classList.remove('dark');
    document.cookie = 'appearance=light;path=/;max-age=31536000;SameSite=Lax';
}

export function useAppearance() {
    // Retorna sempre 'light' e função vazia
    return {
        appearance: 'light' as Appearance,
        updateAppearance: (_mode: Appearance) => {
            void _mode;
            // Não faz nada - mantém sempre light
        },
    };
}
