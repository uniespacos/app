import { useState } from 'react';
import { IEspacosRepository } from '../ports/espacos-repository.interface';
import { Espaco } from '@/types';
import { router } from '@inertiajs/react';

interface UseFavoritarEspacoUseCaseProps {
    repository: IEspacosRepository;
    espaco: Espaco;
}

export function useFavoritarEspacoUseCase({
    repository,
    espaco,
}: UseFavoritarEspacoUseCaseProps) {
    const [isFavorited, setIsFavorited] = useState<boolean>(espaco.is_favorited_by_user ?? false);
    const [processing, setProcessing] = useState(false);

    const toggleFavorito = async () => {
        setProcessing(true);
        try {
            if (isFavorited) {
                await repository.desfavoritar(espaco.id);
                setIsFavorited(false);
            } else {
                await repository.favoritar(espaco.id);
                setIsFavorited(true);
            }
            router.reload();
        } catch (error) {
            console.error('Error toggling space favorite status:', error);
        } finally {
            setProcessing(false);
        }
    };

    return {
        isFavorited,
        processing,
        toggleFavorito,
    };
}
