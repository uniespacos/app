import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Agenda, AgendaDiasSemanaType, SlotCalendario } from "@/types";
import CalendarShiftSection from "@/components/calendar-shift-section";
import { ScrollArea } from "@/components/ui/scroll-area";

type CalendarReservationDetailsProps = {
    semanaInicio: Date;
    diasSemana: AgendaDiasSemanaType[];
    agendas: Agenda[];
    slotsSolicitados: SlotCalendario[]
    alternarSelecaoSlot?: (slot: SlotCalendario) => void;
};

export default function CalendarReservationDetails({ semanaInicio, diasSemana, agendas, slotsSolicitados, alternarSelecaoSlot }: CalendarReservationDetailsProps) {
    const alternarSelecaoSlotFn = (alternarSelecaoSlot || (() => { }));
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
                    {agendas.map((agenda) => {
                        if (!agenda) {
                            return null; // Skip empty agendas
                        }
                        return (<CalendarShiftSection
                            titulo={agenda.turno}
                            agenda={agenda}
                            diasSemana={diasSemana}
                            slotsSolicitados={slotsSolicitados}
                            semanaInicio={semanaInicio}
                            alternarSelecaoSlot={alternarSelecaoSlotFn}

                        />);
                    })}

                </div>
            </ScrollArea>
        </Card>
    );
}