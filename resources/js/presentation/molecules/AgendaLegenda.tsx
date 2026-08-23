import { ESTILO_SLOT } from '@/constants/situacao-reserva';
import { cn } from '@/lib/utils';

interface AgendaLegendaProps {
    isEditMode?: boolean;
}

const ITEM_LIVRE = { label: 'Disponível para reservar', swatch: 'border border-border bg-background' };
const ITEM_PASSADO = { label: 'Horário encerrado', swatch: 'bg-muted-foreground/40' };

/**
 * Compartilhada entre a grade desktop e a lista mobile — as duas usam a mesma
 * paleta (fundo por status via `ESTILO_SLOT[status].fundo`), então a legenda
 * vale para as duas. A lista mobile também escreve o rótulo por linha, mas a
 * legenda ainda ajuda: explica o "porquê" da cor sem precisar tocar em cada
 * linha. Em modo de agendamento normal um slot só pode ser livre, passado,
 * reservado ou selecionado; "em análise" e "indeferida" só existem enquanto
 * se edita uma reserva específica, então só aparecem nesse modo.
 */
export default function AgendaLegenda({ isEditMode = false }: AgendaLegendaProps) {
    const itens = [
        ITEM_LIVRE,
        ITEM_PASSADO,
        { label: 'Reservado por outra pessoa', swatch: ESTILO_SLOT.reservado.solido },
        { label: 'Selecionado por você', swatch: ESTILO_SLOT.selecionado.solido },
        ...(isEditMode
            ? [
                  { label: 'Solicitado, aguardando avaliação', swatch: ESTILO_SLOT.solicitado.solido },
                  { label: 'Indeferido pelo gestor', swatch: ESTILO_SLOT.indeferida.solido },
              ]
            : []),
    ];

    return (
        <div className="bg-muted/30 flex flex-wrap items-center gap-x-4 gap-y-1.5 border-b px-3 py-2 text-xs">
            {itens.map((item) => (
                <div key={item.label} className="flex items-center gap-1.5">
                    <span aria-hidden className={cn('h-2.5 w-2.5 shrink-0 rounded-full', item.swatch)} />
                    <span className="text-muted-foreground">{item.label}</span>
                </div>
            ))}
        </div>
    );
}
