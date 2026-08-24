import { Paginator, Reserva } from '@/types';
import { IHttpGateway } from '../../application/ports/http-gateway.interface';
import { FormAvaliacaoPayload, IReservasRepository } from '../../application/reservas/ports/reservas-repository.interface';

declare function route(name: string, params?: unknown): string;

/**
 * Props que a listagem de reservas realmente consome, vindos de
 * ReservaService::getListingForUser e ::getGestorListing.
 *
 * Sem `only`, cada mudança de filtro recalculava também todos os props
 * compartilhados de HandleInertiaRequests::share — notificações, papéis,
 * permissões e contagem de não lidas, cinco queries por requisição, além de
 * serializar o Ziggy inteiro. O `only` não encolhe só o payload: em
 * Response::resolveProperties o filtro parcial roda ANTES de resolver as
 * closures, então os props não pedidos nunca chegam a ser calculados.
 *
 * Vale só para as LEITURAS de filtro. Ações (cancelar, avaliar) continuam sem
 * `only`, senão o `flash` de sucesso/erro não voltaria.
 */
const PROPS_DA_LISTAGEM = ['reservas', 'filters', 'reservaToShow', 'semana'];

export class InertiaReservasRepository implements IReservasRepository {
    constructor(private httpGateway: IHttpGateway) {}

    async getReservas(params?: Record<string, unknown>): Promise<Paginator<Reserva>> {
        return this.httpGateway.get<Paginator<Reserva>>(route('reservas.index'), params, {
            only: PROPS_DA_LISTAGEM,
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    }

    async getReservasGestor(params?: Record<string, unknown>): Promise<Paginator<Reserva>> {
        return this.httpGateway.get<Paginator<Reserva>>(route('gestor.reservas.index'), params, {
            only: PROPS_DA_LISTAGEM,
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
