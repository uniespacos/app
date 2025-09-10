import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { Agenda, AgendaDiasSemanaType, SlotCalendario } from '@/types';
import CalendarShiftSection from '@/components/calendar-shift-section';

type AgendaCalendarioProps = {
    semanaInicio: Date;
    diasSemana: AgendaDiasSemanaType[];
    agendas: Agenda[];
    isSlotSelecionado: (slot: SlotCalendario) => boolean;
    alternarSelecaoSlot: (slot: SlotCalendario) => void;
};

export default function AgendaCalendario({ semanaInicio, diasSemana, agendas, isSlotSelecionado, alternarSelecaoSlot }: AgendaCalendarioProps) {
    // Ordena as agendas com base no nome do turno, manha primeiro, tarde depois noite
    agendas.sort((a, b) => {
        const ordemTurnos = ['manha', 'tarde', 'noite'];
        return ordemTurnos.indexOf(a.turno) - ordemTurnos.indexOf(b.turno);
    });
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
                    {agendas.map((agenda) => {
                        if (agenda.user)
                            return (<CalendarShiftSection
                                key={agenda.turno}
                                titulo={agenda.turno}
                                diasSemana={diasSemana}
                                isSlotSelecionado={isSlotSelecionado}
                                alternarSelecaoSlot={alternarSelecaoSlot}
                                agenda={agenda}
                                semanaInicio={semanaInicio} />);
                        return null
                    })}
                </div>
            </ScrollArea>
        </Card>
    );
}
