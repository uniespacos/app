import { useForm } from '@inertiajs/react';
import { renderHook } from '@testing-library/react';
import { useAgnosticForm } from './use-agnostic-form';

jest.mock('@inertiajs/react', () => ({
    useForm: jest.fn(),
}));

interface MockFormShape {
    data: Record<string, unknown>;
    setData: jest.Mock;
    errors: Record<string, string>;
    processing: boolean;
    get: jest.Mock;
    post: jest.Mock;
    put: jest.Mock;
    patch: jest.Mock;
    delete: jest.Mock;
    reset: jest.Mock;
    setError: jest.Mock;
    clearErrors: jest.Mock;
}

describe('useAgnosticForm', () => {
    let mockForm: MockFormShape;

    beforeEach(() => {
        mockForm = {
            data: { email: '', password: '' },
            setData: jest.fn(),
            errors: {},
            processing: false,
            get: jest.fn(),
            post: jest.fn(),
            put: jest.fn(),
            patch: jest.fn(),
            delete: jest.fn(),
            reset: jest.fn(),
            setError: jest.fn(),
            clearErrors: jest.fn(),
        };
        (useForm as jest.Mock).mockReturnValue(mockForm);
    });

    it('should initialize with initial values', () => {
        const initial = { email: 'test@example.com' };
        renderHook(() => useAgnosticForm(initial));
        expect(useForm).toHaveBeenCalledWith(initial);
    });

    it('should delegate data and processing status', () => {
        const { result } = renderHook(() => useAgnosticForm({ email: '' }));
        expect(result.current.data).toEqual(mockForm.data);
        expect(result.current.processing).toEqual(mockForm.processing);
    });

    it('should delegate setData, reset, setError, clearErrors', () => {
        const { result } = renderHook(() => useAgnosticForm({ email: '' }));
        result.current.setData('email', 'new@email.com');
        expect(mockForm.setData).toHaveBeenCalledWith('email', 'new@email.com');

        result.current.reset('email');
        expect(mockForm.reset).toHaveBeenCalledWith('email');

        result.current.setError('email', 'error');
        expect(mockForm.setError).toHaveBeenCalledWith('email', 'error');

        result.current.clearErrors('email');
        expect(mockForm.clearErrors).toHaveBeenCalledWith('email');
    });

    it('should delegate submit calling respective method on form', () => {
        const { result } = renderHook(() => useAgnosticForm({ email: '' }));
        result.current.submit('post', '/submit-url', { preserveScroll: true });
        expect(mockForm.post).toHaveBeenCalledWith('/submit-url', { preserveScroll: true });
    });
});
