import { useDebounce } from '@/lib/utils';
import { router } from '@inertiajs/react';
import { format } from 'date-fns';
import { useEffect, useRef, useState } from 'react';

declare function route(name: string, params?: unknown): string;

const PROPS_DA_LISTAGEM = ['reservas', 'filters', 'reservaToShow', 'semana'];

export interface UseReservasFiltersProps {
    routeName: 'reservas.index' | 'gestor.reservas.index';
    initialFilters: { search?: string; situacao?: string; arquivo?: string; ordenar?: string };
    initialSemana: { referencia: string };
}

export function useReservasFilters({ routeName, initialFilters, initialSemana }: UseReservasFiltersProps) {
    const [searchTerm, setSearchTerm] = useState(initialFilters.search ?? '');
    const [selectedSituacao, setSelectedSituacao] = useState(initialFilters.situacao ?? '');
    const [selectedArquivo, setSelectedArquivo] = useState(initialFilters.arquivo ?? 'ativas');
    const [selectedOrdenar, setSelectedOrdenar] = useState(initialFilters.ordenar ?? 'data_solicitacao');
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date(initialSemana.referencia + 'T12:00:00'));
    const debouncedSearch = useDebounce(searchTerm, 500);
    const isInitialMount = useRef(true);

    useEffect(() => {
        if (isInitialMount.current) {
            isInitialMount.current = false;
            return;
        }

        const params: Record<string, string | undefined> = {
            search: debouncedSearch || undefined,
            situacao: selectedSituacao || undefined,
            arquivo: selectedArquivo && selectedArquivo !== 'ativas' ? selectedArquivo : undefined,
            ordenar: selectedOrdenar && selectedOrdenar !== 'data_solicitacao' ? selectedOrdenar : undefined,
            semana: selectedDate ? format(selectedDate, 'yyyy-MM-dd') : undefined,
        };

        router.get(route(routeName), params, {
            only: PROPS_DA_LISTAGEM,
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    }, [debouncedSearch, selectedSituacao, selectedArquivo, selectedOrdenar, selectedDate, routeName]);

    return {
        searchTerm,
        setSearchTerm,
        selectedSituacao,
        setSelectedSituacao,
        selectedArquivo,
        setSelectedArquivo,
        selectedOrdenar,
        setSelectedOrdenar,
        selectedDate,
        setSelectedDate,
    };
}
