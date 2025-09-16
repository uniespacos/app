import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { SlotCalendario } from '@/types';
import { JSX } from 'react';

type CalendarSlotCellProps = {
    slot: SlotCalendario;
    isSelecionado: boolean;
    onSelect: () => void;
};

export default function CalendarSlotCell({ slot, isSelecionado, onSelect }: CalendarSlotCellProps) {
    const isClickable = slot.status !== 'reservado' && !slot.isLocked;

    // Função interna para renderizar o conteúdo do slot
    const renderSlotContent = (): JSX.Element | null => {
        if (isSelecionado) {
            return (
                <p className="text-xs text-green-900 font-bold">
                    Selecionado
                </p>
            );
        }

        if (slot.status === "reservado") {
            return (
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <span className="text-xs text-blue-900 font-bold truncate">
                                {slot.dadosReserva?.reserva_titulo.substring(0, 15)}
                                {slot.dadosReserva ? slot.dadosReserva.reserva_titulo.length > 30 ? '...' : '' : null}
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

        // Adicione aqui outras lógicas de status se necessário (solicitado, deferida, etc.)
        // Por exemplo:
        if (slot.status === "solicitado") {
            return <p className="text-xs text-yellow-900 font-bold">Em análise</p>;
        }
        if (slot.status === "deferida") {
            return <p className="text-xs text-green-900 font-bold">Deferida</p>;
        }
        if (slot.status === "indeferida") {
            return <p className="text-xs text-red-900 font-bold">Indeferida</p>;
        }
        return null;
    };

    return (
        <div
            key={slot.id}
            onClick={isClickable ? onSelect : undefined}
            className={cn(
                'relative border-l p-1 h-12 flex items-center justify-center text-center transition-all duration-200',
                // Estilo para quando está selecionado
                isSelecionado && 'border-green-500 bg-green-100 shadow-md hover:bg-green-200',

                // Estilos baseados no status do slot (SÓ APLICAR SE NÃO ESTIVER SELECIONADO)
                !isSelecionado && {
                    'border-blue-300 bg-blue-100/70 cursor-not-allowed': slot.status === "reservado",
                    'border-yellow-300 bg-yellow-100/70': slot.status === "solicitado",
                    'border-green-300 bg-green-100/70': slot.status === "deferida",
                    'border-red-300 bg-red-100/70': slot.status === "indeferida",
                    'cursor-not-allowed': slot.isLocked,
                    // Hover genérico apenas para slots livres e clicáveis
                    'hover:bg-gray-100 cursor-pointer': slot.status === 'livre' && !slot.isLocked,
                }
            )}
        >
            {renderSlotContent()}
        </div>
    );
}