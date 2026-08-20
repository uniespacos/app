import { renderHook, act } from '@testing-library/react';
import { useReservasGestorUseCase } from './use-reservas-gestor-usecase';
import { IReservasRepository } from '../ports/reservas-repository.interface';

jest.mock('@/lib/utils', () => ({
    useDebounce: jest.fn((val: string) => val)
}));

describe('useReservasGestorUseCase', () => {
    let mockRepo: jest.Mocked<IReservasRepository>;

    beforeEach(() => {
        mockRepo = {
            getReservasGestor: jest.fn().mockResolvedValue({}),
            getReservas: jest.fn(),
            deleteReserva: jest.fn(),
            avaliarReserva: jest.fn()
        } as unknown as jest.Mocked<IReservasRepository>;
        jest.clearAllMocks();
    });

    it('should initialize states with initial props', () => {
        const { result } = renderHook(() => useReservasGestorUseCase({
            repository: mockRepo,
            initialFilters: { search: 'test', situacao: 'em_analise' },
            initialSemana: { referencia: '2026-06-02' }
        }));

        expect(result.current.searchTerm).toBe('test');
        expect(result.current.selectedSituacao).toBe('em_analise');
        expect(result.current.selectedDate).toBeInstanceOf(Date);
        expect(mockRepo.getReservasGestor).not.toHaveBeenCalled();
    });

    it('should call repository.getReservasGestor when filters change', () => {
        const { result } = renderHook(() => useReservasGestorUseCase({
            repository: mockRepo,
            initialFilters: {},
            initialSemana: { referencia: '2026-06-02' }
        }));

        act(() => {
            result.current.setSearchTerm('sala 101');
        });

        expect(mockRepo.getReservasGestor).toHaveBeenCalledWith(expect.objectContaining({
            search: 'sala 101'
        }));
    });
});
