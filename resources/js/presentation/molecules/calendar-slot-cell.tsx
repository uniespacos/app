import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ESTILO_SLOT } from '@/constants/situacao-reserva';
import { cn } from '@/lib/utils';
import { SlotCalendario } from '@/types';
import { JSX } from 'react';

type CalendarSlotCellProps = {
    slot: SlotCalendario;
    isSelecionado: boolean;
    onSelect: () => void;
};

/**
 * Fundo e texto de cada estado vêm dos tokens semânticos. Antes eram pares
 * fixos do Tailwind — fundo na escala 100 com texto na escala 900 — que não
 * reagiam ao modo escuro: o fundo continuava pastel claro no tema escuro, com
 * texto quase preto por cima, ou o inverso, dependendo da célula.
 */
const FUNDO_STATUS: Record<SlotCalendario['status'], string> = {
    livre: '',
    reservado: 'border-info-accent/30 bg-info-subtle',
    selecionado: 'border-primary bg-primary/15',
    solicitado: 'border-warning-accent/30 bg-warning-subtle',
    deferida: 'border-success-accent/30 bg-success-subtle',
    indeferida: 'border-destructive-accent/30 bg-destructive-subtle',
};

const TEXTO_STATUS: Record<SlotCalendario['status'], string> = {
    livre: '',
    reservado: 'text-info-accent',
    selecionado: 'text-primary',
    solicitado: 'text-warning-accent',
    deferida: 'text-success-accent',
    indeferida: 'text-destructive-accent',
};

export default function CalendarSlotCell({ slot, isSelecionado, onSelect }: CalendarSlotCellProps) {
    const isClickable = slot.status !== 'reservado' && !slot.isLocked;

    // Função interna para renderizar o conteúdo do slot
    const renderSlotContent = (): JSX.Element | null => {
        if (slot.isPast && slot.status === 'livre') {
            return null;
        }

        if (isSelecionado) {
            return <p className="text-primary text-xs font-bold">{ESTILO_SLOT.selecionado.label}</p>;
        }

        if (slot.status === 'reservado') {
            return (
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <span className={cn('truncate text-xs font-bold', TEXTO_STATUS.reservado)}>
                                {slot.dadosReserva?.reserva_titulo.substring(0, 15)}
                                {slot.dadosReserva ? (slot.dadosReserva.reserva_titulo.length > 30 ? '...' : '') : null}
                            </span>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p className="font-bold">{slot.dadosReserva?.reserva_titulo}</p>
                            <p>Reservado por: {slot.dadosReserva?.autor}</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            );
        }

        if (slot.status === 'solicitado' || slot.status === 'deferida' || slot.status === 'indeferida') {
            return <p className={cn('text-xs font-bold', TEXTO_STATUS[slot.status])}>{ESTILO_SLOT[slot.status].label}</p>;
        }

        return null;
    };

    return (
        <div
            key={slot.id}
            onClick={isClickable ? onSelect : undefined}
            className={cn(
                'relative flex h-12 items-center justify-center border-l p-1 text-center transition-all duration-200',
                // Estilo para quando está selecionado
                isSelecionado && 'border-primary bg-primary/15 shadow-md hover:bg-primary/25',

                // Estilos baseados no status do slot (SÓ APLICAR SE NÃO ESTIVER SELECIONADO)
                !isSelecionado && [
                    FUNDO_STATUS[slot.status],
                    {
                        'cursor-not-allowed': slot.status === 'reservado' || slot.isLocked,
                        // Hover genérico apenas para slots livres e clicáveis
                        'hover:bg-muted cursor-pointer': slot.status === 'livre' && !slot.isLocked,
                        'bg-muted/60': slot.isPast && slot.status === 'livre',
                        'opacity-60 grayscale': slot.isPast && slot.status !== 'livre',
                    },
                ],
            )}
        >
            {renderSlotContent()}
        </div>
    );
}
