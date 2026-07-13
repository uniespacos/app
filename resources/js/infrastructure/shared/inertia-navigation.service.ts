import { router } from '@inertiajs/react';
import { INavigationService } from '../../application/ports/navigation.interface';

export class InertiaNavigationService implements INavigationService {
    visit(url: string, options?: unknown): void {
        router.visit(url, options as Record<string, unknown>);
    }

    reload(): void {
        router.reload();
    }
}
