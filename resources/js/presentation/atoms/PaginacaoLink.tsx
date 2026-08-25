import { Link } from '@inertiajs/react';

interface PaginacaoLinkProps {
    url?: string | null;
    active?: boolean;
    label: string;
}

export function PaginacaoLink({ url, active, label }: PaginacaoLinkProps) {
    if (url) {
        return (
            <Link
                href={url}
                className={`focus-visible:ring-ring inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-md border px-4 py-2 text-sm font-medium transition-colors focus-visible:ring-1 focus-visible:outline-none ${
                    active ? 'bg-primary text-primary-foreground font-semibold' : 'bg-background hover:bg-accent text-foreground'
                }`}
                preserveState
                preserveScroll
                dangerouslySetInnerHTML={{ __html: label }}
            />
        );
    }

    return (
        <span
            className="text-muted-foreground inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-md border px-4 py-2 text-sm opacity-50 select-none"
            dangerouslySetInnerHTML={{ __html: label }}
        />
    );
}
