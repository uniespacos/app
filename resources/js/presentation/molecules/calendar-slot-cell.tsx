import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ESTILO_SLOT } from '@/constants/situacao-reserva';
import { cn } from '@/lib/utils';
import { SlotCalendario } from '@/types';
import { JSX } from 'react';

interface CalendarSlotCellProps {
    slot: SlotCalendario;
    isSelecionado: boolean;
    onSelect: () => void;
}

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
            return <p className="text-muted-foreground/70 text-[10px]">Passado</p>;
        }

        if (isSelecionado) {
            return <p className="text-success-accent text-xs font-bold">{ESTILO_SLOT.selecionado.label}</p>;
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
                // Estilo para quando está selecionado: verde, é o horário que o
                // usuário está escolhendo para reservar agora — não a cor de marca.
                isSelecionado && 'border-success-accent bg-success-subtle shadow-md hover:bg-success-subtle/70',

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
            {/* Barra sólida à esquerda: o preenchimento pálido da célula some
                contra o fundo da página, mas o tom sólido do mesmo token é
                sempre visível — é a mesma barra que a lista mobile já usa. */}
            <span
                aria-hidden
                className={cn(
                    'absolute inset-y-0 left-0 w-1',
                    isSelecionado && ESTILO_SLOT.selecionado.solido,
                    !isSelecionado && slot.status !== 'livre' && ESTILO_SLOT[slot.status].solido,
                    !isSelecionado && slot.status === 'livre' && slot.isPast && 'bg-muted-foreground/40',
                )}
            />
            {renderSlotContent()}
        </div>
    );
}
