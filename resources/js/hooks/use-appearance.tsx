export type Appearance = 'light' | 'dark' | 'system';

export function initializeTheme() {
    // Força sempre o tema light
    document.documentElement.classList.remove('dark');
    document.documentElement.classList.add('light');

    // Limpa qualquer preferência anterior
    localStorage.removeItem('appearance');
    document.cookie = 'appearance=light;path=/;max-age=31536000;SameSite=Lax';
}

export function useAppearance() {
    // Retorna sempre 'light' e função vazia
    return {
        appearance: 'light' as Appearance,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        updateAppearance: (_: Appearance) => {
            // Não faz nada - mantém sempre light
            //console.log('Theme switching is disabled');
        },
    };
}
