import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { SlotCalendario } from '@/types';
import { isSameDay } from 'date-fns';

type AgendaSlotCalendarioCellProps = {
    slot: SlotCalendario;
    isSelecionado: boolean;
    hoje: Date;
    onSelect: () => void;
};
export default function AgendaSlotCalendarioCell({ slot, isSelecionado, hoje, onSelect }: AgendaSlotCalendarioCellProps) {
    const isReservado = slot.status === 'reservado';
    // Converter o horário de string para número de horas para comparação
    const horarioInicioHoras = parseInt(slot.horario_inicio.split(':')[0]);
    const CanReserve = horarioInicioHoras > new Date().getHours() || slot.data.getDate() > new Date().getDate() ;
    return (
        <div
            key={slot.id}
            className={cn(
                'relative cursor-pointer border-l p-1 transition-all',
                CanReserve ? 'bg-muted/10' : 'cursor-not-allowed',
                isReservado ? 'bg-destructive/15 ring-destructive/20 ring-2 ring-inset cursor-not-allowed' : 'hover:bg-muted/10',
                isSelecionado && 'bg-chart-2/20 hover:bg-chart-2/30 ring-chart-2 ring-2 ring-inset',
                isSameDay(slot.data, hoje) && !isSelecionado && 'bg-primary/5',
            )}
            onClick={() => {
                if (CanReserve && !isReservado) {
                    onSelect();
                }
            }}
        >
            {CanReserve ?
                (isReservado ? (
                    <TooltipProvider>
                        <Tooltip >
                            <TooltipTrigger asChild>
                                <div className="flex h-full w-full items-center justify-center">
                                    <Badge variant="destructive" className="text-xs">
                                        Reservado
                                    </Badge>
                                </div>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p className="font-bold">{slot.dadosReserva?.reserva_titulo}</p>
                                <p>Reservado por: {slot.dadosReserva?.autor}</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                ) : (
                    isSelecionado && (
                        <div className="flex h-full w-full items-center justify-center">
                            <Badge variant="secondary" className="text-xs">
                                Selecionado
                            </Badge>
                        </div>
                    )
                ))
                :   <div className={cn(
                    'flex h-full w-full items-center justify-center',
                    isReservado ? 'bg-red-30 cursor-not-allowed' : 'bg-gray-200'
                )}>
                            <Badge variant="secondary" className="text-xs">
                                Fora de período
                            </Badge>
                        </div> }
        </div>
    );
}
