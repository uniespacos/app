import axios, { AxiosInstance } from 'axios';
import { IHttpGateway } from '../../application/ports/http-gateway.interface';

export class AxiosHttpGateway implements IHttpGateway {
    private client: AxiosInstance;

    constructor() {
        this.client = axios.create({
            baseURL: '/api',
            headers: {
                'Content-Type': 'application/json',
                'X-Requested-With': 'XMLHttpRequest',
            },
            withCredentials: true,
        });
    }

    async get<T = unknown>(url: string, params?: Record<string, unknown>, options?: unknown): Promise<T> {
        const response = await this.client.get<T>(url, {
            params,
            ...(options as Record<string, unknown>),
        });
        return response.data;
    }

    async post<T = unknown>(url: string, data?: Record<string, unknown>, options?: unknown): Promise<T> {
        const response = await this.client.post<T>(url, data, options as Record<string, unknown>);
        return response.data;
    }

    async put<T = unknown>(url: string, data?: Record<string, unknown>, options?: unknown): Promise<T> {
        const response = await this.client.put<T>(url, data, options as Record<string, unknown>);
        return response.data;
    }

    async patch<T = unknown>(url: string, data?: Record<string, unknown>, options?: unknown): Promise<T> {
        const response = await this.client.patch<T>(url, data, options as Record<string, unknown>);
        return response.data;
    }

    async delete<T = unknown>(url: string, options?: unknown): Promise<T> {
        const response = await this.client.delete<T>(url, options as Record<string, unknown>);
        return response.data;
    }
}
