import { IEspacosRepository } from '../../application/espacos/ports/espacos-repository.interface';
import { IHttpGateway } from '../../application/ports/http-gateway.interface';

export class ApiEspacosRepository implements IEspacosRepository {
    constructor(private httpGateway: IHttpGateway) {}

    async favoritar(id: number): Promise<void> {
        await this.httpGateway.post(`/espacos/${id}/favoritar`, {});
    }

    async desfavoritar(id: number): Promise<void> {
        await this.httpGateway.delete(`/espacos/${id}/desfavoritar`);
    }
}
