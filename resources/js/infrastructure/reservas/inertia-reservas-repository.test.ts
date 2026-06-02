import { InertiaReservasRepository } from './inertia-reservas-repository';
import { IHttpGateway } from '../../application/ports/http-gateway.interface';

describe('InertiaReservasRepository', () => {
    let repository: InertiaReservasRepository;
    let mockGateway: jest.Mocked<IHttpGateway>;

    beforeEach(() => {
        mockGateway = {
            get: jest.fn().mockResolvedValue({}),
            post: jest.fn(),
            put: jest.fn(),
            patch: jest.fn(),
            delete: jest.fn()
        } as unknown as jest.Mocked<IHttpGateway>;

        (global as unknown as { route: jest.Mock }).route = jest.fn((name) => name);

        repository = new InertiaReservasRepository(mockGateway);
    });

    afterEach(() => {
        delete (global as unknown as { route?: unknown }).route;
    });

    it('should call httpGateway.get with correct arguments in getReservas', async () => {
        await repository.getReservas({ search: 'room' });
        expect(mockGateway.get).toHaveBeenCalledWith('reservas.index', { search: 'room' }, expect.any(Object));
    });

    it('should call httpGateway.delete with correct arguments in deleteReserva', async () => {
        await repository.deleteReserva(123);
        expect(mockGateway.delete).toHaveBeenCalledWith('reservas.destroy');
    });
});
