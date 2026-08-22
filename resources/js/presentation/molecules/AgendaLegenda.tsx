import { ESTILO_SLOT } from '@/constants/situacao-reserva';
import { cn } from '@/lib/utils';

interface AgendaLegendaProps {
    isEditMode?: boolean;
}

const ITEM_LIVRE = { label: 'Livre', swatch: 'border border-border bg-background' };
const ITEM_PASSADO = { label: 'Passado', swatch: 'bg-muted-foreground/40' };

/**
 * Só a grade de desktop depende só de cor para comunicar o estado do slot — a
 * lista mobile já escreve o rótulo ("Reservado", "Livre") em cada linha, então
 * a legenda só aparece ali. Em modo de agendamento normal um slot só pode ser
 * livre, passado, reservado ou selecionado; "em análise" e "indeferida" só
 * existem enquanto se edita uma reserva específica, então só aparecem nesse modo.
 */
export default function AgendaLegenda({ isEditMode = false }: AgendaLegendaProps) {
    const itens = [
        ITEM_LIVRE,
        ITEM_PASSADO,
        { label: ESTILO_SLOT.reservado.label, swatch: ESTILO_SLOT.reservado.solido },
        { label: ESTILO_SLOT.selecionado.label, swatch: ESTILO_SLOT.selecionado.solido },
        ...(isEditMode
            ? [
                  { label: ESTILO_SLOT.solicitado.label, swatch: ESTILO_SLOT.solicitado.solido },
                  { label: ESTILO_SLOT.indeferida.label, swatch: ESTILO_SLOT.indeferida.solido },
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
