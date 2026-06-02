import { Paginator, Reserva } from '@/types';

export interface IReservasRepository {
    getReservas(params?: Record<string, unknown>): Promise<Paginator<Reserva>>;
    deleteReserva(id: number): Promise<void>;
}
