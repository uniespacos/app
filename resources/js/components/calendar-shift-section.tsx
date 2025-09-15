import { Agenda, AgendaDiasSemanaType, Horario, SlotCalendario } from '@/types';
import CalendarSlotCell from './calendar-slot-cell';
import { useCallback, useMemo } from 'react';
import { format } from 'date-fns';

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
    const alternarSelecaoSlotFn = alternarSelecaoSlot || (() => { });

    // Otimização: Cria um mapa dos horários já reservados por OUTRAS pessoas para busca rápida
    const horariosReservadosMap = useMemo(() => {
        const map = new Map<string, { horario: Horario; autor: string; reserva_titulo: string }>();
        agenda.horarios?.forEach((horario) => {
            // Um horário é "reservado" se estiver deferido e não pertencer à reserva que estamos editando/visualizando
            const reservaDaProp = slotsSolicitados?.[0]?.dadosReserva?.horarioDB?.reserva?.id;
            if (horario.situacao === 'deferida' && horario.reserva && horario.reserva.id !== reservaDaProp) {
                const chave = `${horario.data}|${horario.horario_inicio}`;
                map.set(chave, {
                    horario: horario,
                    autor: horario.reserva.user?.name ?? 'Indefinido',
                    reserva_titulo: horario.reserva.titulo,
                });
            }
        });
        return map;
    }, [agenda.horarios, slotsSolicitados]);

    // Otimização: Cria um mapa dos horários que pertencem à reserva atual (seja no modo de edição ou visualização)
    const slotsSolicitadosMap = useMemo(() => {
        const map = new Map<string, SlotCalendario>();
        slotsSolicitados?.forEach(slot => {
            map.set(slot.id, slot);
        });
        return map;
    }, [slotsSolicitados]);

    // Define os horários padrão para cada turno
    const horariosPadrao = useCallback(() => ({
        manha: ['07:30 - 08:20', '08:20 - 09:10', '09:10 - 10:00', '10:10 - 11:00', '11:00 - 11:50', '11:50 - 12:40'],
        tarde: ['13:10 - 14:00', '14:00 - 14:50', '14:50 - 15:40', '15:50 - 16:40', '16:40 - 17:30', '17:30 - 18:20'],
        noite: ['18:20 - 19:10', '19:10 - 20:00', '20:00 - 20:50', '20:50 - 21:40', '21:40 - 22:30'],
    }), []);

    const horariosDoTurno = horariosPadrao()[agenda.turno];

    return (
        <div key={agenda.id}>
            {/* Cabeçalho do Turno */}
            <div className="grid grid-cols-[80px_repeat(7,1fr)] border-b bg-gray-50">
                <div className="p-2 text-center text-xs font-semibold">{titulo.charAt(0).toUpperCase() + titulo.slice(1)}</div>
                {diasSemana.map((dia) => (
                    <div key={`${titulo}-${dia.valor}`} className="p-2 text-center text-xs font-medium"></div>
                ))}
            </div>

            {/* Renderiza cada LINHA de horário (ex: 07:30 - 08:20) */}
            {horariosDoTurno.map((horaString) => {
                const [inicio] = horaString.split(' - ');
                return (
                    <div key={horaString} className="grid grid-cols-[80px_repeat(7,1fr)] border-b">
                        <div className="border-r p-2 pr-3 text-right text-xs text-muted-foreground">{inicio}</div>

                        {/* Para cada linha, renderiza as 7 COLUNAS (Seg a Dom) */}
                        {diasSemana.map((dia) => {
                            const [horario_inicio_str, horario_fim_str] = horaString.split(' - ').map(s => s.trim() + ':00');
                            const diaFormatado = format(dia.data, 'yyyy-MM-dd');
                            const chave = `${diaFormatado}|${horario_inicio_str}`;

                            // Lógica para decidir o que renderizar na célula
                            let slot: SlotCalendario;
                            const horarioSolicitado = slotsSolicitadosMap.get(chave);
                            const horarioReservado = horariosReservadosMap.get(chave);

                            if (horarioSolicitado) {
                                slot = horarioSolicitado;
                            } else if (horarioReservado) {
                                slot = {
                                    id: chave, status: 'reservado', data: dia.data, horario_inicio: horario_inicio_str, horario_fim: horario_fim_str,
                                    dadosReserva: { horarioDB: horarioReservado.horario, autor: horarioReservado.autor, reserva_titulo: horarioReservado.reserva_titulo }
                                };
                            } else {
                                slot = {
                                    id: chave, status: 'livre', data: dia.data, horario_inicio: horario_inicio_str, horario_fim: horario_fim_str,
                                    agenda_id: agenda.id
                                };
                            }

                            return (
                                <CalendarSlotCell
                                    key={slot.id}
                                    slot={slot}
                                    isSelecionado={isSlotSelecionadoFn(slot)}
                                    onSelect={() => alternarSelecaoSlotFn(slot)}
                                />
                            );
                        })}
                    </div>
                );
            })}
        </div>
    );
}