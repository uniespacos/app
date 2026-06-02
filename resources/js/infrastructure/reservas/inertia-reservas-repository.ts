import { Paginator, Reserva } from '@/types';
import { IReservasRepository } from '../../application/reservas/ports/reservas-repository.interface';
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

    async deleteReserva(id: number): Promise<void> {
        await this.httpGateway.delete(route('reservas.destroy', { reserva: id }));
    }
}
