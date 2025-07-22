import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { AgendaDiasSemanaType, AgendaSlotsPorTurnoType } from "@/types";
import { ScrollArea } from "@radix-ui/react-scroll-area";
import AgendaDetalhesSection from "./AgendaDetalhesSection";

type AgendaDetalhesReservaProps = {
    diasSemana: AgendaDiasSemanaType[];
    slotsPorTurno: AgendaSlotsPorTurnoType;
};

export default function AgendaDetalhesReserva({ diasSemana, slotsPorTurno }: AgendaDetalhesReservaProps) {
    return (
        <Card className="p-0">
            <ScrollArea className="">
                <div className="overflow-auto min-w-[800px] rounded-xl">
                    <div className="bg-background sticky grid grid-cols-[80px_repeat(7,1fr)] border-b">
                        <div className="text-muted-foreground p-2 text-center text-sm font-medium"></div>
                        {diasSemana.map((dia) => (
                            <div key={dia.valor} className={cn('border-l p-2 text-center text-sm font-medium', dia.ehHoje && 'bg-primary/5')}>
                                <div>{dia.abreviado}</div>
                            </div>
                        ))}
                    </div>
                    {Object.entries(slotsPorTurno).map(([agenda, slotsCalendario]) => {
                        return (<AgendaDetalhesSection
                            titulo={agenda}
                            slotsDoTurno={slotsCalendario}
                            diasSemana={[]}
                        />);
                    })}

                </div>
            </ScrollArea>
        </Card>
    );
}