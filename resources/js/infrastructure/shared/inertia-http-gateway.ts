import { router } from '@inertiajs/react';
import { IHttpGateway } from '../../application/ports/http-gateway.interface';

type InertiaOptions = Record<string, unknown>;

export class InertiaHttpGateway implements IHttpGateway {
    async get<T = unknown>(url: string, params?: Record<string, unknown>, options?: unknown): Promise<T> {
        return new Promise<T>((resolve, reject) => {
            router.get(url, params as Record<string, string>, {
                ...(options as InertiaOptions),
                onSuccess: (page) => {
                    resolve(page.props as unknown as T);
                },
                onError: (errors) => {
                    reject(errors);
                }
            });
        });
    }

    async post<T = unknown>(url: string, data?: Record<string, unknown>, options?: unknown): Promise<T> {
        return new Promise<T>((resolve, reject) => {
            router.post(url, data as Record<string, string>, {
                ...(options as InertiaOptions),
                onSuccess: (page) => {
                    resolve(page.props as unknown as T);
                },
                onError: (errors) => {
                    reject(errors);
                }
            });
        });
    }

    async put<T = unknown>(url: string, data?: Record<string, unknown>, options?: unknown): Promise<T> {
        return new Promise<T>((resolve, reject) => {
            router.put(url, data as Record<string, string>, {
                ...(options as InertiaOptions),
                onSuccess: (page) => {
                    resolve(page.props as unknown as T);
                },
                onError: (errors) => {
                    reject(errors);
                }
            });
        });
    }

    async patch<T = unknown>(url: string, data?: Record<string, unknown>, options?: unknown): Promise<T> {
        return new Promise<T>((resolve, reject) => {
            router.patch(url, data as Record<string, string>, {
                ...(options as InertiaOptions),
                onSuccess: (page) => {
                    resolve(page.props as unknown as T);
                },
                onError: (errors) => {
                    reject(errors);
                }
            });
        });
    }

    async delete<T = unknown>(url: string, options?: unknown): Promise<T> {
        return new Promise<T>((resolve, reject) => {
            router.delete(url, {
                ...(options as InertiaOptions),
                onSuccess: (page) => {
                    resolve(page.props as unknown as T);
                },
                onError: (errors) => {
                    reject(errors);
                }
            });
        });
    }
}
