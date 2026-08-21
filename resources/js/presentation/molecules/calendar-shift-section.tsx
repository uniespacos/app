import { derivarSlotsDoTurno } from '@/application/espacos/helpers/derivar-slots-do-turno';
import CalendarSlotCell from '@/presentation/molecules/calendar-slot-cell';
import { Agenda, AgendaDiasSemanaType, SlotCalendario } from '@/types';
import { useMemo } from 'react';

type CalendarShiftSectionProps = {
    titulo: string;
    agenda: Agenda;
    diasSemana: AgendaDiasSemanaType[];
    isSlotSelecionado?: (slot: SlotCalendario) => boolean;
    alternarSelecaoSlot?: (slot: SlotCalendario) => void;

    // slotsSolicitados agora é usado para passar os horários da reserva em edição/visualização
    slotsSolicitados?: SlotCalendario[];
};

export default function CalendarShiftSection({
    titulo,
    agenda,
    diasSemana,
    isSlotSelecionado,
    alternarSelecaoSlot,
    slotsSolicitados,
}: CalendarShiftSectionProps) {
    // Funções de fallback para evitar erros
    const isSlotSelecionadoFn = isSlotSelecionado || (() => false);
    const alternarSelecaoSlotFn = alternarSelecaoSlot || (() => {});

    // A derivação dos slots vive em derivar-slots-do-turno para que a visão
    // mobile use exatamente os mesmos slots — ver o comentário de lá.
    const derivados = useMemo(
        () => derivarSlotsDoTurno(agenda, diasSemana, slotsSolicitados),
        [agenda, diasSemana, slotsSolicitados],
    );

    // Reagrupa por linha de horário, que é como a grade é desenhada.
    const linhasPorHorario = useMemo(() => {
        const linhas = new Map<string, SlotCalendario[]>();
        derivados.forEach(({ horaLabel, slot }) => {
            const linha = linhas.get(horaLabel) ?? [];
            linha.push(slot);
            linhas.set(horaLabel, linha);
        });
        return linhas;
    }, [derivados]);

    return (
        <div key={agenda.id}>
            {/* Cabeçalho do Turno */}
            <div className="grid grid-cols-[80px_repeat(7,1fr)] border-b bg-muted/50">
                <div className="p-2 text-center text-xs font-semibold">{titulo.charAt(0).toUpperCase() + titulo.slice(1)}</div>
                {diasSemana.map((dia) => (
                    <div key={`${titulo}-${dia.valor}`} className="p-2 text-center text-xs font-medium"></div>
                ))}
            </div>

            {/* Renderiza cada LINHA de horário (ex: 07:30 - 08:20) */}
            {[...linhasPorHorario.entries()].map(([horaLabel, slots]) => (
                <div key={horaLabel} className="grid grid-cols-[80px_repeat(7,1fr)] border-b">
                    <div className="text-muted-foreground border-r p-2 pr-3 text-right text-xs">{horaLabel}</div>

                    {/* Para cada linha, renderiza as 7 COLUNAS (Seg a Dom) */}
                    {slots.map((slot) => (
                        <CalendarSlotCell
                            key={slot.id}
                            slot={slot}
                            isSelecionado={isSlotSelecionadoFn(slot)}
                            onSelect={() => alternarSelecaoSlotFn(slot)}
                        />
                    ))}
                </div>
            ))}
        </div>
    );
}
