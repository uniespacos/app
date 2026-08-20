import { useForm } from '@inertiajs/react';
import { IFormHandler } from '../application/ports/form-handler.interface';

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- generic constraint must accept payload types without an index signature
export function useAgnosticForm<T extends Record<string, any>>(initialValues?: T): IFormHandler<T> {
    const form = useForm(initialValues as unknown as Record<string, string>);

    const submit = (method: 'get' | 'post' | 'put' | 'patch' | 'delete', url: string, options?: unknown) => {
        form[method](url, options as Record<string, unknown>);
    };

    return {
        data: form.data as unknown as T,
        setData: form.setData as unknown as IFormHandler<T>['setData'],
        errors: form.errors as unknown as IFormHandler<T>['errors'],
        processing: form.processing,
        submit,
        reset: form.reset as unknown as IFormHandler<T>['reset'],
        setError: form.setError as unknown as IFormHandler<T>['setError'],
        clearErrors: form.clearErrors as unknown as IFormHandler<T>['clearErrors'],
    };
}
