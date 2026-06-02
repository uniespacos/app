import { PaginacaoLink } from '@/presentation/atoms/PaginacaoLink';

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
            <div className="flex flex-wrap justify-center gap-1">
                {links.map((link, index) => (
                    <PaginacaoLink
                        key={index}
                        url={link.url}
                        active={link.active}
                        label={link.label}
                    />
                ))}
            </div>
        </div>
    );
}
