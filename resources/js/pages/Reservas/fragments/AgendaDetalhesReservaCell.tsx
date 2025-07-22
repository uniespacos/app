import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { SlotCalendario } from '@/types';

type AgendaDetalhesReservaCellProps = {
    slot: SlotCalendario;
    isSolicitado: boolean;
};
export default function AgendaDetalhesReservaCell({ slot, isSolicitado }: AgendaDetalhesReservaCellProps) {
    const isReservado = slot.status === 'reservado';
    return (
        <div
            key={slot.id}
            className={cn(
                'relative cursor-pointer border-l p-1 transition-all duration-200',
                isReservado ? 'border-blue-300 bg-blue-100 shadow-md hover:bg-blue-200  cursor-not-allowed' : 'hover:bg-muted/10',
                isSolicitado && 'border-green-300 bg-green-100 shadow-md hover:bg-green-200 ',
            )}
        >
            {(isReservado ? (
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
            ) : (
                isSolicitado && (
                    <div className="flex h-full w-full items-center justify-center">
                        <p className="text-xs text-green-900 font-bold">
                            Solicitado
                        </p>
                    </div>
                )
            ))
            }
        </div>
    );
}
