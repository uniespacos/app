/* eslint-disable @typescript-eslint/no-explicit-any */
import { Espaco, Reserva } from '@/types';
import { useForm } from '@inertiajs/react';
import { act, renderHook } from '@testing-library/react';
import { useCallback, useState } from 'react';
import { toast } from 'sonner';
import { useAgendaSelectionUseCase } from './use-agenda-selection-usecase';

jest.mock('@inertiajs/react', () => ({
    useForm: jest.fn(),
}));

jest.mock('sonner', () => ({
    toast: {
        error: jest.fn(),
        success: jest.fn(),
        info: jest.fn(),
    },
}));

describe('useAgendaSelectionUseCase', () => {
    let mockForm: any;
    let mockEspaco: Espaco;
    let mockReserva: Reserva;

    beforeEach(() => {
        jest.clearAllMocks();
        (globalThis as any).route = jest.fn((name) => name);

        mockEspaco = {
            id: 1,
            nome: 'Auditório',
            agendas: [],
        } as any;

        mockReserva = {
            id: 100,
            titulo: 'Reserva Antiga',
            descricao: 'Desc Antiga',
            data_inicial: new Date('2026-06-01'),
            data_final: new Date('2026-06-30'),
            recorrencia: 'unica',
            horarios: [
                {
                    data: '2026-06-03',
                    horario_inicio: '08:20:00',
                    horario_fim: '09:10:00',
                    situacao: 'deferida',
                    agenda: { id: 2 },
                },
            ],
            user: { name: 'Solicitante' },
        } as any;

        const mockPost = jest.fn();
        const mockPatch = jest.fn();
        const mockReset = jest.fn();

        mockForm = {
            post: mockPost,
            patch: mockPatch,
            reset: mockReset,
        };

        (useForm as jest.Mock).mockImplementation((initialData) => {
            const [data, setDataState] = useState(initialData);
            const setData = useCallback((keyOrFn: any, value?: any) => {
                setDataState((prev: any) => {
                    if (typeof keyOrFn === 'function') {
                        return keyOrFn(prev);
                    }
                    return { ...prev, [keyOrFn]: value };
                });
            }, []);

            return {
                data,
                setData,
                post: mockPost,
                patch: mockPatch,
                processing: false,
                reset: mockReset,
            };
        });
    });

    afterEach(() => {
        delete (globalThis as any).route;
    });

    it('should initialize form with reservation details in edit mode', () => {
        const { result } = renderHook(() =>
            useAgendaSelectionUseCase({
                espaco: mockEspaco,
                reserva: mockReserva,
                isEditMode: true,
                semanaVisivel: new Date('2026-06-01'),
            }),
        );

        expect(useForm).toHaveBeenCalledWith(
            expect.objectContaining({
                titulo: 'Reserva Antiga',
                descricao: 'Desc Antiga',
                recorrencia: 'unica',
            }),
        );

        expect(result.current.slotsSelecao).toHaveLength(1);
        expect(result.current.slotsSelecao[0].id).toBe('2026-06-03|08:20:00');
    });

    it('should show toast validation error on submit if no slots selected', () => {
        const { result } = renderHook(() =>
            useAgendaSelectionUseCase({
                espaco: mockEspaco,
                isEditMode: false,
                semanaVisivel: new Date('2026-06-01'),
            }),
        );

        const e = { preventDefault: jest.fn() } as any;
        act(() => {
            result.current.handleFormSubmit(e);
        });

        expect(e.preventDefault).toHaveBeenCalled();
        expect(toast.error).toHaveBeenCalledWith('Selecione pelo menos um horário para reservar.');
    });

    it('should submit post form when not in edit mode', () => {
        const { result } = renderHook(() =>
            useAgendaSelectionUseCase({
                espaco: mockEspaco,
                isEditMode: false,
                semanaVisivel: new Date('2026-06-01'),
            }),
        );

        const slot = {
            id: '2026-06-03|08:20:00',
            status: 'solicitado',
            data: new Date('2026-06-03'),
            horario_inicio: '08:20:00',
            horario_fim: '09:10:00',
            agenda_id: 2,
        } as any;

        act(() => {
            result.current.alternarSelecaoSlot(slot);
        });

        const e = { preventDefault: jest.fn() } as any;
        act(() => {
            result.current.handleFormSubmit(e);
        });

        expect(mockForm.post).toHaveBeenCalledWith('reservas.store', expect.any(Object));
    });
});
