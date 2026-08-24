import { useIsMobile } from '@/hooks/use-mobile';
import { PaginacaoLink } from '@/presentation/atoms/PaginacaoLink';

interface PaginacaoListasProps {
    links: {
        label: string;
        url?: string | null;
        active?: boolean;
    }[];
}

export default function PaginacaoListas({ links }: PaginacaoListasProps) {
    const isMobile = useIsMobile();

    if (links.length <= 1) {
        return null;
    }

    const anterior = links[0];
    const proximo = links[links.length - 1];
    const paginas = links.slice(1, -1);

    if (isMobile && paginas.length > 0) {
        const atual = paginas.find((pagina) => pagina.active);
        const numeradas = paginas.filter((pagina) => /^\d+$/.test(pagina.label));
        const totalPaginas = numeradas.at(-1)?.label;

        return (
            <div className="mt-6 flex items-center justify-between gap-2">
                <PaginacaoLink url={anterior.url} active={false} label={anterior.label} />
                {atual && totalPaginas && (
                    <span className="text-muted-foreground text-sm whitespace-nowrap">
                        Página {atual.label} de {totalPaginas}
                    </span>
                )}
                <PaginacaoLink url={proximo.url} active={false} label={proximo.label} />
            </div>
        );
    }

    return (
        <div className="mt-6 flex justify-center">
            <div className="flex flex-wrap justify-center gap-1">
                {links.map((link, index) => (
                    <PaginacaoLink key={index} url={link.url} active={link.active} label={link.label} />
                ))}
            </div>
        </div>
    );
}
