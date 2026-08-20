import type { Espaco } from '@/types';

interface LocalReservaProps {
    espaco?: Espaco;
}

/**
 * Localização de uma reserva: o espaço e, abaixo, módulo e andar.
 *
 * Issue #105. Depende da cadeia `espaco.andar.modulo` vir carregada — quando o
 * eager loading do repositório não a traz, a linha secundária apenas some, sem
 * erro. Por isso a listagem tem teste sobre o payload, e não só sobre o markup.
 */
export function LocalReserva({ espaco }: LocalReservaProps) {
    if (!espaco) {
        return <span className="text-muted-foreground text-sm">—</span>;
    }

    const modulo = espaco.andar?.modulo?.nome;
    const andar = espaco.andar?.nome;
    // Mesma ordem usada na tabela administrativa de espaços (TabelaEspacos).
    const detalhe = [modulo, andar].filter(Boolean).join(' - ');

    return (
        <div>
            <p>{espaco.nome}</p>
            {detalhe && <p className="text-muted-foreground text-sm">{detalhe}</p>}
        </div>
    );
}
