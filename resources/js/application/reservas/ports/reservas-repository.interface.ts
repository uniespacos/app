import { Paginator, Reserva, SituacaoReserva } from '@/types';

export interface FormAvaliacaoPayload {
    situacao: SituacaoReserva;
    motivo: string;
    horarios_avaliados: { id: number; status: string }[];
    observacao: string;
    evaluation_scope: 'single' | 'recurring';
}

export interface IReservasRepository {
    getReservas(params?: Record<string, unknown>): Promise<Paginator<Reserva>>;
    getReservasGestor(params?: Record<string, unknown>): Promise<Paginator<Reserva>>;
    deleteReserva(id: number): Promise<void>;
    avaliarReserva(id: number, payload: FormAvaliacaoPayload): Promise<void>;
}
