import { IHttpGateway } from '../../application/ports/http-gateway.interface';
import { FormAvaliacaoPayload } from '../../application/reservas/ports/reservas-repository.interface';
import { ApiReservasRepository } from './api-reservas-repository';

describe('ApiReservasRepository', () => {
    let repository: ApiReservasRepository;
    let mockGateway: jest.Mocked<IHttpGateway>;

    beforeEach(() => {
        mockGateway = {
            get: jest.fn().mockResolvedValue({}),
            post: jest.fn(),
            put: jest.fn(),
            patch: jest.fn(),
            delete: jest.fn(),
        } as unknown as jest.Mocked<IHttpGateway>;

        repository = new ApiReservasRepository(mockGateway);
    });

    it('should call httpGateway.get with correct url in getReservas', async () => {
        await repository.getReservas({ search: 'room' });
        expect(mockGateway.get).toHaveBeenCalledWith('/reservas', { search: 'room' });
    });

    it('should call httpGateway.get with correct url in getReservasGestor', async () => {
        await repository.getReservasGestor({ search: 'room' });
        expect(mockGateway.get).toHaveBeenCalledWith('/gestor/reservas', { search: 'room' });
    });

    it('should call httpGateway.delete with correct url in deleteReserva', async () => {
        await repository.deleteReserva(123);
        expect(mockGateway.delete).toHaveBeenCalledWith('/reservas/123');
    });

    it('should call httpGateway.patch with correct url in avaliarReserva', async () => {
        const payload: FormAvaliacaoPayload = {
            situacao: 'deferida',
            motivo: 'motivo',
            observacao: 'obs',
            horarios_avaliados: [],
            evaluation_scope: 'single',
        };
        await repository.avaliarReserva(456, payload);
        expect(mockGateway.patch).toHaveBeenCalledWith('/gestor/reservas/456', payload);
    });
});
