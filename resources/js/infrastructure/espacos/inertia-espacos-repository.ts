import { IEspacosRepository } from '../../application/espacos/ports/espacos-repository.interface';
import { IHttpGateway } from '../../application/ports/http-gateway.interface';

declare function route(name: string, params?: unknown): string;

export class InertiaEspacosRepository implements IEspacosRepository {
    constructor(private httpGateway: IHttpGateway) {}

    async favoritar(id: number): Promise<void> {
        await this.httpGateway.post(route('espacos.favoritar', id), {});
    }

    async desfavoritar(id: number): Promise<void> {
        await this.httpGateway.delete(route('espacos.desfavoritar', id));
    }
}
