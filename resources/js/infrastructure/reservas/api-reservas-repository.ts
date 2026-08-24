import { Paginator, Reserva } from '@/types';
import { IHttpGateway } from '../../application/ports/http-gateway.interface';
import { FormAvaliacaoPayload, IReservasRepository } from '../../application/reservas/ports/reservas-repository.interface';

export class ApiReservasRepository implements IReservasRepository {
    constructor(private httpGateway: IHttpGateway) {}

    async getReservas(params?: Record<string, unknown>): Promise<Paginator<Reserva>> {
        return this.httpGateway.get<Paginator<Reserva>>('/reservas', params);
    }

    async getReservasGestor(params?: Record<string, unknown>): Promise<Paginator<Reserva>> {
        return this.httpGateway.get<Paginator<Reserva>>('/gestor/reservas', params);
    }

    async deleteReserva(id: number): Promise<void> {
        await this.httpGateway.delete(`/reservas/${id}`);
    }

    async avaliarReserva(id: number, payload: FormAvaliacaoPayload): Promise<void> {
        await this.httpGateway.patch(`/gestor/reservas/${id}`, payload as unknown as Record<string, unknown>);
    }
}
