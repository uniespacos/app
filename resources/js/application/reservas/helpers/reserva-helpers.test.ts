import { Horario, Reserva, SituacaoReserva } from '@/types';
import { calculateGestorStatus, sortReservasForGestor, sortReservasForUser } from './reserva-helpers';

describe('reserva-helpers', () => {
    const mockReserva = (id: number, situacao: SituacaoReserva, horarios: Partial<Horario>[] = []): Reserva => ({
        id,
        titulo: `Reserva ${id}`,
        descricao: 'Teste',
        situacao,
        data_inicial: new Date(),
        data_final: new Date(),
        recorrencia: 'unica',
        observacao: null,
        created_at: '',
        updated_at: '',
        horarios: horarios as Horario[],
    });

    describe('calculateGestorStatus', () => {
        it('should return original status if it is not em_analise or parcialmente_deferida', () => {
            const res = mockReserva(1, 'deferida');
            expect(calculateGestorStatus(res)).toBe('deferida');
        });

        it('should return original status if horarios is empty', () => {
            const res = mockReserva(1, 'em_analise', []);
            expect(calculateGestorStatus(res)).toBe('em_analise');
        });

        it('should return em_analise if any horario is em_analise', () => {
            const res = mockReserva(1, 'parcialmente_deferida', [{ situacao: 'deferida' }, { situacao: 'em_analise' }]);
            expect(calculateGestorStatus(res)).toBe('em_analise');
        });

        it('should return deferida if all horarios are deferida', () => {
            const res = mockReserva(1, 'parcialmente_deferida', [{ situacao: 'deferida' }, { situacao: 'deferida' }]);
            expect(calculateGestorStatus(res)).toBe('deferida');
        });

        it('should return indeferida if all horarios are indeferida', () => {
            const res = mockReserva(1, 'parcialmente_deferida', [{ situacao: 'indeferida' }, { situacao: 'indeferida' }]);
            expect(calculateGestorStatus(res)).toBe('indeferida');
        });
    });

    describe('sortReservasForGestor', () => {
        it('should sort em_analise first', () => {
            const r1 = mockReserva(1, 'deferida', [{ situacao: 'deferida' }]);
            const r2 = mockReserva(2, 'em_analise', [{ situacao: 'em_analise' }]);
            const r3 = mockReserva(3, 'indeferida', [{ situacao: 'indeferida' }]);

            const sorted = sortReservasForGestor([r1, r2, r3]);
            expect(sorted[0].id).toBe(2);
        });
    });

    describe('sortReservasForUser', () => {
        it('should sort em_analise first', () => {
            const r1 = mockReserva(1, 'deferida');
            const r2 = mockReserva(2, 'em_analise');
            const sorted = sortReservasForUser([r1, r2]);
            expect(sorted[0].id).toBe(2);
        });
    });
});
