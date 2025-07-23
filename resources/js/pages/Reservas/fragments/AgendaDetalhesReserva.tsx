import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { AgendaDiasSemanaType, AgendaSlotsPorTurnoType, Reserva } from "@/types";
import { ScrollArea } from "@radix-ui/react-scroll-area";
import AgendaDetalhesSection from "./AgendaDetalhesSection";

type AgendaDetalhesReservaProps = {
    diasSemana: AgendaDiasSemanaType[];
    slotsPorTurno: AgendaSlotsPorTurnoType;
    reservaSolicitada: Reserva
};

export default function AgendaDetalhesReserva({ diasSemana, slotsPorTurno, reservaSolicitada }: AgendaDetalhesReservaProps) {
    return (
        <Card className="p-0">
            <ScrollArea className="">
                <div className="overflow-auto min-w-[800px] rounded-xl">
                    <div className="bg-background sticky grid grid-cols-[80px_repeat(7,1fr)] border-b">
                        <div className="text-muted-foreground  text-center text-sm font-medium"></div>
                        {diasSemana.map((dia) => (
                            <div key={dia.valor} className={cn('border-l p-2 bg-gray-50 text-center text-sm font-medium', dia.ehHoje && 'bg-primary/5')}>
                                <div>{dia.abreviado}</div>
                            </div>
                        ))}
                    </div>
                    {Object.entries(slotsPorTurno).map(([agenda, slotsCalendario]) => {
                        if (!slotsCalendario || Object.keys(slotsCalendario).length === 0) {
                            return null; // Skip empty agendas
                        }
                        return (<AgendaDetalhesSection
                            titulo={agenda}
                            slotsDoTurno={slotsCalendario}
                            diasSemana={[]}
                            reservaSolicitada={reservaSolicitada} />);
                    })}

                </div>
            </ScrollArea>
        </Card>
    );
}