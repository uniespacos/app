import { router } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';

interface UseDebouncedSearchOptions {
    routeName: string;
    initialSearch?: string;
    extraParams?: Record<string, unknown>;
    delay?: number;
}

export function useDebouncedSearch({ routeName, initialSearch = '', extraParams = {}, delay = 400 }: UseDebouncedSearchOptions) {
    const [searchTerm, setSearchTerm] = useState(initialSearch);
    const isInitialMount = useRef(true);

    useEffect(() => {
        if (isInitialMount.current) {
            isInitialMount.current = false;
            return;
        }

        const timeout = setTimeout(() => {
            router.get(
                route(routeName),
                {
                    ...extraParams,
                    search: searchTerm || undefined,
                },
                { preserveState: true, preserveScroll: true, replace: true },
            );
        }, delay);

        return () => {
            clearTimeout(timeout);
        };
    }, [searchTerm, routeName, delay, extraParams]);

    return {
        searchTerm,
        setSearchTerm,
    };
}
