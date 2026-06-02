export interface IHttpGateway {
    get<T = unknown>(url: string, params?: Record<string, unknown>, options?: unknown): Promise<T>;
    post<T = unknown>(url: string, data?: Record<string, unknown>, options?: unknown): Promise<T>;
    put<T = unknown>(url: string, data?: Record<string, unknown>, options?: unknown): Promise<T>;
    patch<T = unknown>(url: string, data?: Record<string, unknown>, options?: unknown): Promise<T>;
    delete<T = unknown>(url: string, options?: unknown): Promise<T>;
}
