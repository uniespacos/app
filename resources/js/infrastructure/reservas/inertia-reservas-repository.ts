import { Paginator, Reserva } from '@/types';
import { IReservasRepository, FormAvaliacaoPayload } from '../../application/reservas/ports/reservas-repository.interface';
import { IHttpGateway } from '../../application/ports/http-gateway.interface';

declare function route(name: string, params?: unknown): string;

export class InertiaReservasRepository implements IReservasRepository {
    constructor(private httpGateway: IHttpGateway) {}

    async getReservas(params?: Record<string, unknown>): Promise<Paginator<Reserva>> {
        return this.httpGateway.get<Paginator<Reserva>>(route('reservas.index'), params, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    }

    async getReservasGestor(params?: Record<string, unknown>): Promise<Paginator<Reserva>> {
        return this.httpGateway.get<Paginator<Reserva>>(route('gestor.reservas.index'), params, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    }

    async deleteReserva(id: number): Promise<void> {
        await this.httpGateway.delete(route('reservas.destroy', { reserva: id }));
    }

    async avaliarReserva(id: number, payload: FormAvaliacaoPayload): Promise<void> {
        await this.httpGateway.patch(route('gestor.reservas.update', id), payload as unknown as Record<string, unknown>);
    }
}
