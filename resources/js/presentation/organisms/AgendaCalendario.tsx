import CalendarShiftSection from '@/presentation/molecules/calendar-shift-section'; // Importa o componente que corrigimos
import { Card } from '@/components/ui/card';
import { TURNOS_ORDENADOS } from '@/constants/turnos';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import AgendaLegenda from '@/presentation/molecules/AgendaLegenda';
import CalendarDiaMobile from '@/presentation/molecules/CalendarDiaMobile';
import { Agenda, AgendaDiasSemanaType, SlotCalendario } from '@/types';

type AgendaCalendarioProps = {
    semanaInicio: Date;
    diasSemana: AgendaDiasSemanaType[];
    agendas: Agenda[];
    isSlotSelecionado: (slot: SlotCalendario) => boolean;
    alternarSelecaoSlot: (slot: SlotCalendario) => void;
    // Adiciona a prop para passar os slots da reserva atual
    slotsDaReserva?: SlotCalendario[];
    isEditMode?: boolean;
};

export default function AgendaCalendario({
    diasSemana,
    agendas,
    isSlotSelecionado,
    alternarSelecaoSlot,
    slotsDaReserva, // Recebe a nova prop
    isEditMode,
}: AgendaCalendarioProps) {
    const isMobile = useIsMobile();

    // Ordena as agendas por turno para uma exibição consistente
    const agendasOrdenadas = [...agendas].sort(
        (a, b) => TURNOS_ORDENADOS.indexOf(a.turno) - TURNOS_ORDENADOS.indexOf(b.turno),
    );

    // Só uma das visões é montada, em vez de renderizar as duas e esconder uma
    // com CSS: são ~120 células por semana, e construí-las para depois ocultar
    // desperdiçaria trabalho justamente no aparelho que queremos aliviar.
    if (isMobile) {
        return (
            <Card className="p-0">
                <CalendarDiaMobile
                    diasSemana={diasSemana}
                    agendas={agendas}
                    isSlotSelecionado={isSlotSelecionado}
                    alternarSelecaoSlot={alternarSelecaoSlot}
                    slotsDaReserva={slotsDaReserva}
                />
            </Card>
        );
    }

    return (
        <Card className="p-0">
            <AgendaLegenda isEditMode={isEditMode} />
            <div className="w-full overflow-auto">
                <div className="min-w-[800px] rounded-xl">
                    {/* Cabeçalho com os dias da semana */}
                    <div className="bg-background sticky top-0 z-10 grid grid-cols-[80px_repeat(7,1fr)] border-b">
                        <div className="text-muted-foreground p-2 text-center text-sm font-medium"></div>
                        {diasSemana.map((dia) => (
                            <div
                                key={dia.valor}
                                className={cn('border-l bg-muted/50 p-2 text-center text-sm font-medium', dia.ehHoje && 'bg-primary/5')}
                            >
                                <div className="capitalize">{dia.abreviado}</div>
                                <div className="font-normal">{dia.diaMes.split('/')[0]}</div>
                            </div>
                        ))}
                    </div>
                    {/* Renderiza uma seção para cada agenda (turno) */}
                    {agendasOrdenadas.map((agenda) => {
                        if (agenda.user)
                            // Renderiza apenas se houver um gestor para o turno
                            return (
                                <CalendarShiftSection
                                    key={agenda.id}
                                    titulo={agenda.turno}
                                    diasSemana={diasSemana}
                                    isSlotSelecionado={isSlotSelecionado}
                                    alternarSelecaoSlot={alternarSelecaoSlot}
                                    agenda={agenda}
                                    // Passa os slots da reserva para a seção correta
                                    slotsSolicitados={slotsDaReserva}
                                />
                            );
                        return null;
                    })}
                </div>
            </div>
        </Card>
    );
}
