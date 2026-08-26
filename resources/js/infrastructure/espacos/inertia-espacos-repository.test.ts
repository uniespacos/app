import { IHttpGateway } from '../../application/ports/http-gateway.interface';
import { InertiaEspacosRepository } from './inertia-espacos-repository';

describe('InertiaEspacosRepository', () => {
    let repository: InertiaEspacosRepository;
    let mockGateway: jest.Mocked<IHttpGateway>;

    beforeEach(() => {
        mockGateway = {
            get: jest.fn().mockResolvedValue({}),
            post: jest.fn().mockResolvedValue({}),
            put: jest.fn(),
            patch: jest.fn(),
            delete: jest.fn().mockResolvedValue({}),
        } as unknown as jest.Mocked<IHttpGateway>;

        (globalThis as unknown as { route: jest.Mock }).route = jest.fn((name) => name);

        repository = new InertiaEspacosRepository(mockGateway);
    });

    afterEach(() => {
        delete (globalThis as unknown as { route?: unknown }).route;
    });

    it('should call post when favoriting', async () => {
        await repository.favoritar(123);
        expect(mockGateway.post).toHaveBeenCalledWith('espacos.favoritar', {});
    });

    it('should call delete when desfavoriting', async () => {
        await repository.desfavoritar(123);
        expect(mockGateway.delete).toHaveBeenCalledWith('espacos.desfavoritar');
    });
});
