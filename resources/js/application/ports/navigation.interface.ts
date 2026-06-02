export interface INavigationService {
    visit(url: string, options?: unknown): void;
    reload(): void;
}
