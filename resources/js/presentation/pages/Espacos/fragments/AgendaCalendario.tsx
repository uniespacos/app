import CalendarShiftSection from '@/components/calendar-shift-section'; // Importa o componente que corrigimos
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Agenda, AgendaDiasSemanaType, SlotCalendario } from '@/types';

type AgendaCalendarioProps = {
    semanaInicio: Date;
    diasSemana: AgendaDiasSemanaType[];
    agendas: Agenda[];
    isSlotSelecionado: (slot: SlotCalendario) => boolean;
    alternarSelecaoSlot: (slot: SlotCalendario) => void;
    // Adiciona a prop para passar os slots da reserva atual
    slotsDaReserva?: SlotCalendario[];
};

export default function AgendaCalendario({
    diasSemana,
    agendas,
    isSlotSelecionado,
    alternarSelecaoSlot,
    slotsDaReserva, // Recebe a nova prop
}: AgendaCalendarioProps) {
    // Ordena as agendas por turno para uma exibição consistente
    const agendasOrdenadas = [...agendas].sort((a, b) => {
        const ordemTurnos = ['manha', 'tarde', 'noite'];
        return ordemTurnos.indexOf(a.turno) - ordemTurnos.indexOf(b.turno);
    });

    return (
        <Card className="p-0">
            <div className="w-full overflow-auto">
                <div className="min-w-[800px] rounded-xl">
                    {/* Cabeçalho com os dias da semana */}
                    <div className="bg-background sticky top-0 z-10 grid grid-cols-[80px_repeat(7,1fr)] border-b">
                        <div className="text-muted-foreground p-2 text-center text-sm font-medium"></div>
                        {diasSemana.map((dia) => (
                            <div
                                key={dia.valor}
                                className={cn('border-l bg-gray-50 p-2 text-center text-sm font-medium', dia.ehHoje && 'bg-primary/5')}
                            >
                                <div>{dia.abreviado.replace('.', '')}</div>
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
