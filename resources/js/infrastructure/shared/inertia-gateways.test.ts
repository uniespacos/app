import { router } from '@inertiajs/react';
import { InertiaHttpGateway } from './inertia-http-gateway';
import { InertiaNavigationService } from './inertia-navigation.service';

jest.mock('@inertiajs/react', () => ({
    router: {
        get: jest.fn(),
        post: jest.fn(),
        put: jest.fn(),
        patch: jest.fn(),
        delete: jest.fn(),
        visit: jest.fn(),
        reload: jest.fn()
    }
}));

describe('InertiaHttpGateway', () => {
    let gateway: InertiaHttpGateway;

    beforeEach(() => {
        gateway = new InertiaHttpGateway();
        jest.clearAllMocks();
    });

    it('should call router.get with correct arguments', () => {
        gateway.get('/test', { foo: 'bar' });
        expect(router.get).toHaveBeenCalledWith('/test', { foo: 'bar' }, expect.any(Object));
    });

    it('should call router.post with correct arguments', () => {
        gateway.post('/test', { foo: 'bar' });
        expect(router.post).toHaveBeenCalledWith('/test', { foo: 'bar' }, expect.any(Object));
    });

    it('should call router.put with correct arguments', () => {
        gateway.put('/test', { foo: 'bar' });
        expect(router.put).toHaveBeenCalledWith('/test', { foo: 'bar' }, expect.any(Object));
    });

    it('should call router.patch with correct arguments', () => {
        gateway.patch('/test', { foo: 'bar' });
        expect(router.patch).toHaveBeenCalledWith('/test', { foo: 'bar' }, expect.any(Object));
    });

    it('should call router.delete with correct arguments', () => {
        gateway.delete('/test');
        expect(router.delete).toHaveBeenCalledWith('/test', expect.any(Object));
    });
});

describe('InertiaNavigationService', () => {
    let navigation: InertiaNavigationService;

    beforeEach(() => {
        navigation = new InertiaNavigationService();
        jest.clearAllMocks();
    });

    it('should call router.visit when visiting', () => {
        navigation.visit('/path', { replace: true });
        expect(router.visit).toHaveBeenCalledWith('/path', { replace: true });
    });

    it('should call router.reload when reloading', () => {
        navigation.reload();
        expect(router.reload).toHaveBeenCalled();
    });
});
