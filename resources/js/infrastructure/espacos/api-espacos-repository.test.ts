import { ApiEspacosRepository } from './api-espacos-repository';
import { IHttpGateway } from '../../application/ports/http-gateway.interface';

describe('ApiEspacosRepository', () => {
    let repository: ApiEspacosRepository;
    let mockGateway: jest.Mocked<IHttpGateway>;

    beforeEach(() => {
        mockGateway = {
            get: jest.fn(),
            post: jest.fn().mockResolvedValue({}),
            put: jest.fn(),
            patch: jest.fn(),
            delete: jest.fn().mockResolvedValue({})
        } as unknown as jest.Mocked<IHttpGateway>;

        repository = new ApiEspacosRepository(mockGateway);
    });

    it('should call post when favoriting', async () => {
        await repository.favoritar(123);
        expect(mockGateway.post).toHaveBeenCalledWith('/espacos/123/favoritar', {});
    });

    it('should call delete when desfavoriting', async () => {
        await repository.desfavoritar(123);
        expect(mockGateway.delete).toHaveBeenCalledWith('/espacos/123/desfavoritar');
    });
});
