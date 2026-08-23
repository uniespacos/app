import { Card } from '@/components/ui/card';
import { TURNOS_ORDENADOS } from '@/constants/turnos';
import { useIsMobile } from '@/hooks/use-mobile';
import AgendaLegenda from '@/presentation/molecules/AgendaLegenda';
import CalendarShiftSection from '@/presentation/molecules/calendar-shift-section'; // Importa o componente que corrigimos
import CalendarDiaMobile from '@/presentation/molecules/CalendarDiaMobile';
import { Agenda, AgendaDiasSemanaType, SlotCalendario } from '@/types';
import { useMemo } from 'react';

interface AgendaCalendarioProps {
    semanaInicio: Date;
    diasSemana: AgendaDiasSemanaType[];
    agendas: Agenda[];
    isSlotSelecionado: (slot: SlotCalendario) => boolean;
    alternarSelecaoSlot: (slot: SlotCalendario) => void;
    // Adiciona a prop para passar os slots da reserva atual
    slotsDaReserva?: SlotCalendario[];
    isEditMode?: boolean;
}

export default function AgendaCalendario({
    diasSemana,
    agendas,
    isSlotSelecionado,
    alternarSelecaoSlot,
    slotsDaReserva, // Recebe a nova prop
    isEditMode,
}: AgendaCalendarioProps) {
    const isMobile = useIsMobile();

    // Agrupa agendas por turno e pega a primeira de cada um (que tem gestor)
    // Evita renderizar múltiplas seções para o mesmo turno
    const agendasPorTurno = useMemo(() => {
        const mapa = new Map<string, Agenda>();
        [...agendas]
            .sort((a, b) => TURNOS_ORDENADOS.indexOf(a.turno) - TURNOS_ORDENADOS.indexOf(b.turno))
            .forEach((agenda) => {
                if (!mapa.has(agenda.turno) && agenda.user) {
                    mapa.set(agenda.turno, agenda);
                }
            });
        return Array.from(mapa.values());
    }, [agendas]);

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
        <Card className="gap-0 p-0">
            <AgendaLegenda isEditMode={isEditMode} />
            <div className="w-full overflow-auto">
                <div className="min-w-[800px] rounded-xl">
                    {/* Renderiza uma seção para cada turno (Manhã, Tarde, Noite)
                        Cada seção tem seu próprio header com dias da semana (#106) */}
                    {agendasPorTurno.map((agenda) => (
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
                    ))}
                </div>
            </div>
        </Card>
    );
}
