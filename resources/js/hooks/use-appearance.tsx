export type Appearance = 'light'; // Removidos 'dark' e 'system'

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
        appearance: 'light' as const,
        updateAppearance: () => {
            // Não faz nada - mantém sempre light
            //console.log('Theme switching is disabled');
        },
    };
}
