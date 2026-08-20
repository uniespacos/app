// eslint-disable-next-line @typescript-eslint/no-explicit-any -- generic constraint must accept payload types without an index signature
export interface IFormHandler<T extends Record<string, any>> {
    data: T;
    setData: {
        <K extends keyof T>(key: K, value: T[K]): void;
        (values: Partial<T>): void;
        (updater: (prev: T) => T): void;
    };
    errors: Partial<Record<keyof T, string>>;
    processing: boolean;
    submit: (method: 'get' | 'post' | 'put' | 'patch' | 'delete', url: string, options?: unknown) => void;
    reset: (...fields: (keyof T)[]) => void;
    setError: {
        (field: keyof T, value: string): void;
        (errors: Record<keyof T, string>): void;
    };
    clearErrors: (...fields: (keyof T)[]) => void;
}
