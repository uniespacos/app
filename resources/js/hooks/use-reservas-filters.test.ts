import { act, renderHook } from '@testing-library/react';
import { useReservasFilters } from './use-reservas-filters';

const mockGet = jest.fn();

jest.mock('@inertiajs/react', () => ({
    router: {
        get: (...args: unknown[]) => {
            mockGet(...args);
        },
    },
}));

jest.mock('@/lib/utils', () => ({
    useDebounce: jest.fn((val: string) => val),
}));

describe('useReservasFilters', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        (globalThis as unknown as { route: (name: string) => string }).route = jest.fn((name: string) => name);
    });

    afterEach(() => {
        delete (globalThis as unknown as { route?: unknown }).route;
    });

    it('should initialize states with initial props', () => {
        const { result } = renderHook(() =>
            useReservasFilters({
                routeName: 'reservas.index',
                initialFilters: { search: 'test', situacao: 'em_analise' },
                initialSemana: { referencia: '2026-06-02' },
            }),
        );

        expect(result.current.searchTerm).toBe('test');
        expect(result.current.selectedSituacao).toBe('em_analise');
        expect(result.current.selectedDate).toBeInstanceOf(Date);
        expect(mockGet).not.toHaveBeenCalled();
    });

    it('should call router.get when filters change', () => {
        const { result } = renderHook(() =>
            useReservasFilters({
                routeName: 'reservas.index',
                initialFilters: {},
                initialSemana: { referencia: '2026-06-02' },
            }),
        );

        act(() => {
            result.current.setSearchTerm('sala 101');
        });

        expect(mockGet).toHaveBeenCalledWith(
            'reservas.index',
            expect.objectContaining({
                search: 'sala 101',
            }),
            expect.objectContaining({
                preserveState: true,
                preserveScroll: true,
                replace: true,
            }),
        );
    });
});
