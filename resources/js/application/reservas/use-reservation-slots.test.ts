/* eslint-disable @typescript-eslint/no-explicit-any */
import { renderHook, act } from '@testing-library/react';
import { useReservationSlots } from './use-reservation-slots';
import { Reserva } from '@/types';

describe('useReservationSlots', () => {
    const mockReserva = (horarios: any[]): Reserva => ({
        id: 1,
        titulo: 'Teste',
        descricao: 'Desc',
        situacao: 'em_analise',
        data_inicial: new Date(),
        data_final: new Date(),
        recorrencia: 'unica',
        observacao: '',
        created_at: '',
        updated_at: '',
        user: { name: 'User Teste' } as any,
        horarios,
    });

    it('should map reservation schedules to initial slots correctly', () => {
        const horarios = [
            {
                id: 10,
                data: '2026-06-03',
                horario_inicio: '08:20:00',
                horario_fim: '09:10:00',
                situacao: 'em_analise',
                is_conflicted: false,
                agenda: { id: 2 },
            },
            {
                id: 11,
                data: '2026-06-04',
                horario_inicio: '09:10:00',
                horario_fim: '10:00:00',
                situacao: 'deferida',
                is_conflicted: true, // This should lock the slot and set status to indeferida
                agenda: { id: 2 },
            },
        ];

        const { result } = renderHook(() => useReservationSlots(mockReserva(horarios)));

        expect(result.current.initialSlots).toHaveLength(2);

        // First slot check
        expect(result.current.initialSlots[0].id).toBe('2026-06-03|08:20:00');
        expect(result.current.initialSlots[0].status).toBe('solicitado');
        expect(result.current.initialSlots[0].isLocked).toBe(false);

        // Second slot check (conflicted)
        expect(result.current.initialSlots[1].id).toBe('2026-06-04|09:10:00');
        expect(result.current.initialSlots[1].status).toBe('indeferida');
        expect(result.current.initialSlots[1].isLocked).toBe(true);
    });

    it('should alternate status of non-locked slots on avaliarSlot', () => {
        const horarios = [
            {
                id: 10,
                data: '2026-06-03',
                horario_inicio: '08:20:00',
                horario_fim: '09:10:00',
                situacao: 'em_analise',
                is_conflicted: false,
                agenda: { id: 2 },
            },
            {
                id: 11,
                data: '2026-06-04',
                horario_inicio: '09:10:00',
                horario_fim: '10:00:00',
                situacao: 'em_analise',
                is_conflicted: true, // locked
                agenda: { id: 2 },
            },
        ];

        const { result } = renderHook(() => useReservationSlots(mockReserva(horarios)));

        const firstSlot = result.current.slotsSelecao[0];
        const lockedSlot = result.current.slotsSelecao[1];

        // solicitado -> deferida
        act(() => {
            result.current.avaliarSlot(firstSlot);
        });
        expect(result.current.slotsSelecao[0].status).toBe('deferida');

        // deferida -> indeferida
        act(() => {
            result.current.avaliarSlot(result.current.slotsSelecao[0]);
        });
        expect(result.current.slotsSelecao[0].status).toBe('indeferida');

        // indeferida -> solicitado
        act(() => {
            result.current.avaliarSlot(result.current.slotsSelecao[0]);
        });
        expect(result.current.slotsSelecao[0].status).toBe('solicitado');

        // locked slot should not change
        act(() => {
            result.current.avaliarSlot(lockedSlot);
        });
        expect(result.current.slotsSelecao[1].status).toBe('indeferida');
    });

    it('should change status of all non-locked slots on handleDecisaoGlobalChange', () => {
        const horarios = [
            {
                id: 10,
                data: '2026-06-03',
                horario_inicio: '08:20:00',
                horario_fim: '09:10:00',
                situacao: 'em_analise',
                is_conflicted: false,
                agenda: { id: 2 },
            },
            {
                id: 11,
                data: '2026-06-04',
                horario_inicio: '09:10:00',
                horario_fim: '10:00:00',
                situacao: 'em_analise',
                is_conflicted: true, // locked
                agenda: { id: 2 },
            },
        ];

        const { result } = renderHook(() => useReservationSlots(mockReserva(horarios)));

        act(() => {
            result.current.handleDecisaoGlobalChange('deferida');
        });

        expect(result.current.slotsSelecao[0].status).toBe('deferida');
        expect(result.current.slotsSelecao[1].status).toBe('indeferida'); // Remains locked
    });
});
