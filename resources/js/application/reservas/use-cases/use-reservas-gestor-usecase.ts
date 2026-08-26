import { useDebounce } from '@/lib/utils';
import { format } from 'date-fns';
import { useEffect, useRef, useState } from 'react';
import { IReservasRepository } from '../ports/reservas-repository.interface';

interface UseReservasGestorUseCaseProps {
    repository: IReservasRepository;
    initialFilters: { search?: string; situacao?: string; arquivo?: string };
    initialSemana: { referencia: string };
}

export function useReservasGestorUseCase({ repository, initialFilters, initialSemana }: UseReservasGestorUseCaseProps) {
    const [searchTerm, setSearchTerm] = useState(initialFilters.search || '');
    const [selectedSituacao, setSelectedSituacao] = useState(initialFilters.situacao || '');
    const [selectedArquivo, setSelectedArquivo] = useState(initialFilters.arquivo || 'ativas');
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date(initialSemana.referencia + 'T12:00:00'));
    const debouncedSearch = useDebounce(searchTerm, 500);
    const isInitialMount = useRef(true);

    useEffect(() => {
        if (isInitialMount.current) {
            isInitialMount.current = false;
            return;
        }

        const params: Record<string, unknown> = {
            search: debouncedSearch || undefined,
            situacao: selectedSituacao || undefined,
            // 'ativas' é o padrão do backend; omitir mantém a URL limpa.
            arquivo: selectedArquivo && selectedArquivo !== 'ativas' ? selectedArquivo : undefined,
            semana: selectedDate ? format(selectedDate, 'yyyy-MM-dd') : undefined,
        };

        repository.getReservasGestor(params);
    }, [debouncedSearch, selectedSituacao, selectedArquivo, selectedDate, repository]);

    return {
        searchTerm,
        setSearchTerm,
        selectedSituacao,
        setSelectedSituacao,
        selectedArquivo,
        setSelectedArquivo,
        selectedDate,
        setSelectedDate,
    };
}
