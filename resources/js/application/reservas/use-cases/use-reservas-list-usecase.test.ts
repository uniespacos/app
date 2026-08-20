import { renderHook, act } from '@testing-library/react';
import { useReservasListUseCase } from './use-reservas-list-usecase';
import { IReservasRepository } from '../ports/reservas-repository.interface';

jest.mock('@/lib/utils', () => ({
    useDebounce: jest.fn((val: string) => val)
}));

describe('useReservasListUseCase', () => {
    let mockRepo: jest.Mocked<IReservasRepository>;

    beforeEach(() => {
        mockRepo = {
            getReservas: jest.fn().mockResolvedValue({}),
            deleteReserva: jest.fn()
        } as unknown as jest.Mocked<IReservasRepository>;
        jest.clearAllMocks();
    });

    it('should initialize states with initial props', () => {
        const { result } = renderHook(() => useReservasListUseCase({
            repository: mockRepo,
            initialFilters: { search: 'test', situacao: 'em_analise' },
            initialSemana: { referencia: '2026-06-02' }
        }));

        expect(result.current.searchTerm).toBe('test');
        expect(result.current.selectedSituacao).toBe('em_analise');
        expect(result.current.selectedDate).toBeInstanceOf(Date);
        expect(mockRepo.getReservas).not.toHaveBeenCalled();
    });

    it('should call repository.getReservas when filters change', () => {
        const { result } = renderHook(() => useReservasListUseCase({
            repository: mockRepo,
            initialFilters: {},
            initialSemana: { referencia: '2026-06-02' }
        }));

        act(() => {
            result.current.setSearchTerm('sala 101');
        });

        expect(mockRepo.getReservas).toHaveBeenCalledWith(expect.objectContaining({
            search: 'sala 101'
        }));
    });
});
