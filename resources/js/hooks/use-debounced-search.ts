import { router } from '@inertiajs/react';
import type { RequestPayload } from '@inertiajs/core';
import { useEffect, useRef, useState } from 'react';

interface UseDebouncedSearchOptions {
    routeName: string;
    initialSearch?: string;
    extraParams?: Record<string, string | number | boolean | undefined>;
    delay?: number;
}

export function useDebouncedSearch({ routeName, initialSearch = '', extraParams = {}, delay = 400 }: UseDebouncedSearchOptions) {
    const [searchTerm, setSearchTerm] = useState(initialSearch);
    const isInitialMount = useRef(true);
    const extraParamsRef = useRef(extraParams);
    extraParamsRef.current = extraParams;
    const routeNameRef = useRef(routeName);
    routeNameRef.current = routeName;

    const prevInitialSearchRef = useRef(initialSearch);
    useEffect(() => {
        if (prevInitialSearchRef.current !== initialSearch) {
            prevInitialSearchRef.current = initialSearch;
            setSearchTerm(initialSearch);
        }
    }, [initialSearch]);

    useEffect(() => {
        if (isInitialMount.current) {
            isInitialMount.current = false;
            return;
        }

        const timeout = setTimeout(() => {
            const cleanParams: Record<string, string | number | boolean> = {};
            for (const [key, value] of Object.entries(extraParamsRef.current)) {
                if (value !== undefined && value !== '' && value !== 'all') {
                    cleanParams[key] = value;
                }
            }
            if (searchTerm) {
                cleanParams.search = searchTerm;
            }

            router.get(
                route(routeNameRef.current),
                cleanParams as RequestPayload,
                { preserveState: true, preserveScroll: true, replace: true },
            );
        }, delay);

        return () => {
            clearTimeout(timeout);
        };
    }, [searchTerm, delay]);

    return {
        searchTerm,
        setSearchTerm,
    };
}
