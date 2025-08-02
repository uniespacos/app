import { cn } from '@/lib/utils';
import { AgendaDiasSemanaType, Reserva, SlotCalendario } from '@/types';
import AgendaDetalhesReservaCell from './AgendaDetalhesReservaCell';

type AgendaDetalhesSectionProps = {
    titulo: string;
    slotsDoTurno: Record<string, SlotCalendario[]>;
    diasSemana: AgendaDiasSemanaType[];
    reservaSolicitada: Reserva,
};
export default function AgendaDetalhesSection({
    titulo,
    slotsDoTurno,
    diasSemana,
}: AgendaDetalhesSectionProps) {

    return (
        <>
            <div
                className={cn(
                    'grid grid-cols-[80px_repeat(7,1fr)] border-b',
                    titulo === 'MANHÃ' && 'bg-accent/10',
                    titulo === 'TARDE' && 'bg-secondary/10',
                    titulo === 'NOITE' && 'bg-muted/20',
                )}
            >
                <div className="p-2 text-center text-xs font-semibold  bg-gray-50 ">{titulo}</div>
                {diasSemana.map((dia) => (
                    <div key={`${titulo}-${dia.valor}`} className=" p-2 bg-gray-50 text-center text-xs font-medium"></div>
                ))}
            </div>
            {Object.entries(slotsDoTurno).map(([hora, slots]) => (
                <div
                    key={hora}
                    className={cn(
                        'grid grid-cols-[80px_repeat(7,1fr)] border-b',
                        titulo === 'MANHÃ' && 'bg-accent/5',
                        titulo === 'TARDE' && 'bg-secondary/5',
                        titulo === 'NOITE' && 'bg-muted/10',
                    )}
                >
                    <div className="text-muted-foreground border-r p-2 pr-3 text-right text-xs">
                        {hora} - {hora.split(':')[0]}:50
                    </div>
                    {slots.map((slot) => (
                        <AgendaDetalhesReservaCell
                            key={slot.id}
                            slot={slot}
                        />
                    ))}
                </div>
            ))}
        </>
    );
}
