import { Link } from '@inertiajs/react';

type PaginacaoListasProps = {
    links: {
        label: string;
        url?: string | null;
        active?: boolean;
    }[];
};

export default function PaginacaoListas({ links }: PaginacaoListasProps) {
    return (
        <div className="mt-6 flex justify-center">
            <div className="flex gap-1">
                {links.map((link, index) =>
                    link.url ? (
                        <Link
                            key={index}
                            href={link.url}
                            className={`rounded-md border px-4 py-2 text-sm ${link.active ? 'bg-primary text-primary-foreground' : 'bg-background hover:bg-accent'}`}
                            preserveState
                            preserveScroll
                            dangerouslySetInnerHTML={{ __html: link.label }}
                        />
                    ) : (
                        <span
                            key={index}
                            className="text-muted-foreground rounded-md border px-4 py-2 text-sm"
                            dangerouslySetInnerHTML={{ __html: link.label }}
                        />
                    ),
                )}
            </div>
        </div>
    );
}
