import { renderHook, act } from '@testing-library/react';
import { useFavoritarEspacoUseCase } from './use-favoritar-espaco-usecase';
import { IEspacosRepository } from '../ports/espacos-repository.interface';
import { Espaco } from '@/types';
import { router } from '@inertiajs/react';

jest.mock('@inertiajs/react', () => ({
    router: {
        reload: jest.fn()
    }
}));

describe('useFavoritarEspacoUseCase', () => {
    let mockRepo: jest.Mocked<IEspacosRepository>;
    let mockEspaco: Espaco;

    beforeEach(() => {
        mockRepo = {
            favoritar: jest.fn().mockResolvedValue(undefined),
            desfavoritar: jest.fn().mockResolvedValue(undefined)
        };
        mockEspaco = {
            id: 123,
            nome: 'Espaco Teste',
            capacidade_pessoas: 10,
            descricao: 'descricao',
            imagens: [],
            main_image_index: null,
            is_favorited_by_user: false
        };
        jest.clearAllMocks();
    });

    it('should initialize isFavorited correctly', () => {
        const { result } = renderHook(() => useFavoritarEspacoUseCase({ repository: mockRepo, espaco: mockEspaco }));
        expect(result.current.isFavorited).toBe(false);
    });

    it('should call repository.favoritar when not favorited', async () => {
        const { result } = renderHook(() => useFavoritarEspacoUseCase({ repository: mockRepo, espaco: mockEspaco }));
        await act(async () => {
            await result.current.toggleFavorito();
        });
        expect(mockRepo.favoritar).toHaveBeenCalledWith(123);
        expect(result.current.isFavorited).toBe(true);
        expect(router.reload).toHaveBeenCalled();
    });

    it('should call repository.desfavoritar when already favorited', async () => {
        mockEspaco.is_favorited_by_user = true;
        const { result } = renderHook(() => useFavoritarEspacoUseCase({ repository: mockRepo, espaco: mockEspaco }));
        await act(async () => {
            await result.current.toggleFavorito();
        });
        expect(mockRepo.desfavoritar).toHaveBeenCalledWith(123);
        expect(result.current.isFavorited).toBe(false);
        expect(router.reload).toHaveBeenCalled();
    });
});
