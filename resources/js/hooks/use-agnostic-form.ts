import { useForm } from '@inertiajs/react';
import { IFormHandler } from '../application/ports/form-handler.interface';

export function useAgnosticForm<T extends Record<string, unknown>>(initialValues?: T): IFormHandler<T> {
    const form = useForm<T>(initialValues || ({} as T));

    const submit = (method: 'get' | 'post' | 'put' | 'patch' | 'delete', url: string, options?: unknown) => {
        form[method](url, options as Record<string, unknown>);
    };

    return {
        data: form.data,
        setData: form.setData as IFormHandler<T>['setData'],
        errors: form.errors as IFormHandler<T>['errors'],
        processing: form.processing,
        submit,
        reset: form.reset as IFormHandler<T>['reset'],
        setError: form.setError as IFormHandler<T>['setError'],
        clearErrors: form.clearErrors as IFormHandler<T>['clearErrors'],
    };
}
