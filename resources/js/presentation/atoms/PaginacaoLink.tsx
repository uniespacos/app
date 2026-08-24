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
                className={`rounded-md border px-4 py-2 text-sm ${active ? 'bg-primary text-primary-foreground' : 'bg-background hover:bg-accent'}`}
                preserveState
                preserveScroll
                dangerouslySetInnerHTML={{ __html: label }}
            />
        );
    }

    return <span className="text-muted-foreground rounded-md border px-4 py-2 text-sm" dangerouslySetInnerHTML={{ __html: label }} />;
}
