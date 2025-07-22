import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { AgendaDiasSemanaType, AgendaSlotsPorTurnoType, SlotCalendario } from '@/types';
import AgendaTurnoSection from './AgendaTurnoSection';

type AgendaCalendarioProps = {
    diasSemana: AgendaDiasSemanaType[];
    slotsPorTurno: AgendaSlotsPorTurnoType;
    isSlotSelecionado: (slot: SlotCalendario) => boolean;
    alternarSelecaoSlot: (slot: SlotCalendario) => void;
};

export default function AgendaCalendario({ diasSemana, slotsPorTurno, isSlotSelecionado, alternarSelecaoSlot }: AgendaCalendarioProps) {
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
                    <AgendaTurnoSection
                        titulo="MANHÃ"
                        slotsDoTurno={slotsPorTurno.manha}
                        diasSemana={diasSemana}
                        isSlotSelecionado={isSlotSelecionado}
                        alternarSelecaoSlot={alternarSelecaoSlot}
                    />
                    <AgendaTurnoSection
                        titulo="TARDE"
                        slotsDoTurno={slotsPorTurno.tarde}
                        diasSemana={diasSemana}
                        isSlotSelecionado={isSlotSelecionado}
                        alternarSelecaoSlot={alternarSelecaoSlot}
                    />
                    <AgendaTurnoSection
                        titulo="NOITE"
                        slotsDoTurno={slotsPorTurno.noite}
                        diasSemana={diasSemana}
                        isSlotSelecionado={isSlotSelecionado}
                        alternarSelecaoSlot={alternarSelecaoSlot}
                    />
                </div>
            </ScrollArea>
        </Card>
    );
}
