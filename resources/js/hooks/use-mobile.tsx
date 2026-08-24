import { useSyncExternalStore } from 'react';

const MOBILE_BREAKPOINT = 768;
const QUERY = `(max-width: ${MOBILE_BREAKPOINT - 1}px)`;

function subscribe(onChange: () => void) {
    const mql = window.matchMedia(QUERY);
    mql.addEventListener('change', onChange);

    return () => {
        mql.removeEventListener('change', onChange);
    };
}

function getSnapshot() {
    return window.matchMedia(QUERY).matches;
}

/**
 * A versão anterior guardava o valor num `useState<boolean>()` preenchido dentro
 * de um `useEffect`, então o primeiro render sempre devolvia `false` — mesmo no
 * celular. Quem decidisse layout por este hook renderizava a versão desktop e só
 * depois corrigia, causando flash.
 *
 * `useSyncExternalStore` lê o estado real já no primeiro render. O
 * `getServerSnapshot` fixo em `false` mantém o hook correto sob SSR: o servidor
 * não tem `window`, e assumir desktop lá é a escolha segura.
 */
export function useIsMobile() {
    return useSyncExternalStore(subscribe, getSnapshot, () => false);
}
