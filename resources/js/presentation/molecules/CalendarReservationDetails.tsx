import { Card } from '@/components/ui/card';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import CalendarShiftSection from '@/presentation/molecules/CalendarShiftSection';
import CalendarDiaMobile from '@/presentation/molecules/CalendarDiaMobile';
import { Agenda, AgendaDiasSemanaType, SlotCalendario } from '@/types';

interface CalendarReservationDetailsProps {
    diasSemana: AgendaDiasSemanaType[];
    agendas: Agenda[];
    slotsSolicitados: SlotCalendario[];
    alternarSelecaoSlot?: (slot: SlotCalendario) => void;
}

const SEM_SELECAO = () => false;

export default function CalendarReservationDetails({ diasSemana, agendas, slotsSolicitados, alternarSelecaoSlot }: CalendarReservationDetailsProps) {
    const alternarSelecaoSlotFn = alternarSelecaoSlot || (() => {});
    const isMobile = useIsMobile();

    if (isMobile) {
        return (
            <Card className="p-0">
                <CalendarDiaMobile
                    diasSemana={diasSemana}
                    agendas={agendas}
                    isSlotSelecionado={SEM_SELECAO}
                    alternarSelecaoSlot={alternarSelecaoSlotFn}
                    slotsDaReserva={slotsSolicitados}
                    exigirGestor={false}
                />
            </Card>
        );
    }

    return (
        <Card className="p-0">
            <div className="w-full overflow-auto">
                <div className="min-w-[800px] rounded-xl">
                    <div className="bg-background sticky grid grid-cols-[80px_repeat(7,1fr)] border-b">
                        <div className="text-muted-foreground text-center text-sm font-medium"></div>
                        {diasSemana.map((dia) => (
                            <div
                                key={dia.valor}
                                className={cn('bg-muted/50 border-l p-2 text-center text-sm font-medium', dia.ehHoje && 'bg-primary/5')}
                            >
                                <div className="capitalize">{dia.abreviado}</div>
                                <div className="font-normal">{dia.diaMes.split('/')[0]}</div>
                            </div>
                        ))}
                    </div>
                    {agendas.map((agenda) => {
                        if (!agenda) {
                            return null;
                        }
                        return (
                            <CalendarShiftSection
                                key={agenda.id}
                                titulo={agenda.turno}
                                agenda={agenda}
                                diasSemana={diasSemana}
                                slotsSolicitados={slotsSolicitados}
                                alternarSelecaoSlot={alternarSelecaoSlotFn}
                            />
                        );
                    })}
                </div>
            </div>
        </Card>
    );
}
