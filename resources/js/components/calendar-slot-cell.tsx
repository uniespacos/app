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
    const Cell = ({ isShowReservation = false, slot }: { isShowReservation?: boolean; slot: SlotCalendario }): JSX.Element => {
        if (isShowReservation) {
            return (<>
                {slot.status === "deferida" && (
                    <div className="flex h-full w-full items-center justify-center">
                        <p className="text-xs text-green-900 font-bold">
                            Deferida
                        </p>
                    </div>
                )}
                {slot.status === "solicitado" && (
                    <div className="flex h-full w-full items-center justify-center">
                        <p className="text-xs text-yellow-900 font-bold">
                            Em analise
                        </p>
                    </div>
                )}
                {slot.status === "indeferida" && (
                    <div className="flex h-full w-full items-center justify-center">
                        <p className="text-xs text-red-900 font-bold">
                            Indeferida
                        </p>
                    </div>
                )}
            </>)
        }
        return slot.status === "reservado" ? (
            <TooltipProvider>
                <Tooltip >
                    <TooltipTrigger asChild>
                        <div className="flex h-full w-full items-center justify-center">
                            <p className="text-xs text-blue-900 font-bold">
                                Reservado: {slot.dadosReserva?.reserva_titulo.split(' ').slice(0, 2).join(' ')}
                            </p>
                        </div>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p className="font-bold">{slot.dadosReserva?.reserva_titulo}</p>
                        <p>Reservado por: {slot.dadosReserva?.autor}</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        ) : isSelecionado ? (
            <div className="flex h-full w-full items-center justify-center">
                <p className="text-xs text-green-900 font-bold">
                    Selecionado
                </p>
            </div>
        ) : <div />;
    }


    return (
        <div
            key={slot.id}
            className={cn(
                'relative cursor-pointer border-l p-1 transition-all duration-200',
                isSelecionado && 'border-green-300 bg-green-100 shadow-md hover:bg-green-200 ',
                slot.status === "reservado" ? 'border-blue-300 bg-blue-100 shadow-md hover:bg-blue-200  cursor-not-allowed' : 'hover:bg-muted/10',
                slot.status === "solicitado" && 'border-yellow-300 bg-yellow-100 shadow-md hover:bg-yellow-200 ',
                slot.status === "deferida" && 'border-green-300 bg-green-100 shadow-md hover:bg-green-200',
                slot.status === "indeferida" && 'border-red-300 bg-red-100 shadow-md hover:bg-red-200',

            )}
            onClick={onSelect}
        >
            <Cell isShowReservation={slot.isShowReservation} slot={slot} />
        </div>
    );
}
