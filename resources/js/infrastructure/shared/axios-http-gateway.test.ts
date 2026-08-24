import axios from 'axios';
import { AxiosHttpGateway } from './axios-http-gateway';

jest.mock('axios', () => {
    const mockAxiosInstance = {
        get: jest.fn().mockResolvedValue({ data: 'get_data' }),
        post: jest.fn().mockResolvedValue({ data: 'post_data' }),
        put: jest.fn().mockResolvedValue({ data: 'put_data' }),
        patch: jest.fn().mockResolvedValue({ data: 'patch_data' }),
        delete: jest.fn().mockResolvedValue({ data: 'delete_data' }),
    };
    return {
        create: jest.fn(() => mockAxiosInstance),
    };
});

describe('AxiosHttpGateway', () => {
    let gateway: AxiosHttpGateway;
    let mockInstance: {
        get: jest.Mock;
        post: jest.Mock;
        put: jest.Mock;
        patch: jest.Mock;
        delete: jest.Mock;
    };

    beforeEach(() => {
        gateway = new AxiosHttpGateway();
        mockInstance = (axios.create as jest.Mock).mock.results[0].value;
        jest.clearAllMocks();
    });

    it('should call client.get with correct parameters', async () => {
        const res = await gateway.get('/test', { foo: 'bar' });
        expect(mockInstance.get).toHaveBeenCalledWith('/test', { params: { foo: 'bar' } });
        expect(res).toBe('get_data');
    });

    it('should call client.post with correct parameters', async () => {
        const res = await gateway.post('/test', { foo: 'bar' });
        expect(mockInstance.post).toHaveBeenCalledWith('/test', { foo: 'bar' }, undefined);
        expect(res).toBe('post_data');
    });
});
