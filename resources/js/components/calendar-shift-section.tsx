import { cn, identificarTurno } from '@/lib/utils';
import { Agenda, AgendaDiasSemanaType, AgendaGestoresPorTurnoType, AgendaSlotsDoTurnoType, Horario, Reserva, SlotCalendario } from '@/types';
import CalendarSlotCell from './calendar-slot-cell';
import { useCallback, useMemo } from 'react';
import { addDays, format } from 'date-fns';

type CalendarShiftSectionProps = {
    titulo: string;
    agenda: Agenda;
    diasSemana: AgendaDiasSemanaType[];
    semanaInicio: Date;
    isSlotSelecionado?: (slot: SlotCalendario) => boolean;
    alternarSelecaoSlot?: (slot: SlotCalendario) => void;
    isEditMode?: boolean;
    reservaToEdit?: Reserva;
    slotsSolicitados?: SlotCalendario[];
};
export default function CalendarShiftSection({
    semanaInicio,
    titulo,
    agenda,
    diasSemana,
    isSlotSelecionado,
    alternarSelecaoSlot,
    isEditMode = false,
    reservaToEdit,
    slotsSolicitados,
}: CalendarShiftSectionProps) {
    const isSlotSelecionadoFn = isSlotSelecionado || (() => false);
    const alternarSelecaoSlotFn = alternarSelecaoSlot || (() => { });

    const { horariosReservadosMap } = useMemo(() => {
        const reservadosMap = new Map<string, { horario: Horario; autor: string; reserva_titulo: string }>();
        agenda.horarios?.forEach((horario) => {
            const reservaValida = horario.situacao === 'deferida' ? horario.reserva : undefined;
            if (reservaValida) {
                if ((isEditMode && reservaValida.id === reservaToEdit?.id)) return;
                const chave = `${horario.data}|${horario.horario_inicio}`;
                reservadosMap.set(chave, {
                    horario: horario,
                    autor: reservaValida.user?.name ?? 'Indefinido',
                    reserva_titulo: reservaValida.titulo,
                });
            }
        });
        return { horariosReservadosMap: reservadosMap };
    }, [agenda.horarios, isEditMode, reservaToEdit]);
    const mapaSlotsSolicitados = useMemo(() => {
        const map = new Map<string, SlotCalendario>();
        if (slotsSolicitados) {
            for (const slot of slotsSolicitados) {
                map.set(slot.id, slot);
            }
        }
        return map;
    }, [slotsSolicitados]);

    // Horários simulados para teste
    const horariosMockados = useCallback(() => ({
        manha: ['07:30 - 08:20', '08:20 - 09:10', '09:10 - 10:00', '10:10 - 11:00', '11:00 - 11:50', '11:50 - 12:40'],
        tarde: ['13:10 - 14:00', '14:00 - 14:50', '14:50 - 15:40', '15:50 - 16:40', '16:40 - 17:30', '17:30 - 18:20'],
        noite: ['18:20 - 19:10', '19:10 - 20:00', '20:00 - 20:50', '20:50 - 21:40', '21:40 - 22:30'],
    }), []);

    const gerarSlotsParaSemana = useCallback((semanaInicio: Date) => {
        const gestor: AgendaGestoresPorTurnoType = {
            nome: agenda.user?.name ?? 'Indefinido',
            email: agenda.user?.email ?? 'Indefinido',
            departamento: agenda.user?.setor?.nome ?? 'N/I',
            agenda_id: agenda.id,
        };
        const slotsGerados: SlotCalendario[] = [];

        // Obtém os slots definidos para o turno da agenda, usando os dados mockados
        // const horariosDoTurno = agenda.horarios_por_turno[agenda.turno]; // Linha original
        const horariosDoTurno = horariosMockados()[agenda.turno];


        if (!horariosDoTurno) {
            // Retorna um array vazio se não houver horários definidos para este turno
            return [];
        }

        for (let diaOffset = 0; diaOffset < 7; diaOffset++) {
            const diaAtual = addDays(semanaInicio, diaOffset);
            const diaFormatado = format(diaAtual, 'yyyy-MM-dd');

            for (const slotTime of horariosDoTurno) {
                const [horario_inicio_str, horario_fim_str] = slotTime.split(' - ').map(s => s.trim() + ':00'); // Garante o formato HH:mm:ss

                const chave = `${diaFormatado}|${horario_inicio_str}`;
                const horarioSolicitado = mapaSlotsSolicitados.get(chave);
                if (horarioSolicitado) {
                    slotsGerados.push(horarioSolicitado);
                    continue;
                }

                const horarioReservado = horariosReservadosMap.get(chave);
                if (horarioReservado) {
                    slotsGerados.push({
                        id: chave,
                        status: 'reservado',
                        data: diaAtual,
                        horario_inicio: horario_inicio_str,
                        horario_fim: horario_fim_str,
                        dadosReserva: {
                            horarioDB: horarioReservado.horario,
                            autor: horarioReservado.autor,
                            reserva_titulo: horarioReservado.reserva_titulo,
                        },
                    });
                    continue;
                }

                if (gestor) {
                    slotsGerados.push({
                        id: chave,
                        status: 'livre',
                        data: diaAtual,
                        horario_inicio: horario_inicio_str,
                        horario_fim: horario_fim_str,
                        agenda_id: gestor.agenda_id,
                    });
                }
            }
        }
        return slotsGerados;
    }, [agenda.id, agenda.turno, agenda.user?.email, agenda.user?.name, agenda.user?.setor?.nome, horariosMockados, horariosReservadosMap, mapaSlotsSolicitados]);
    const todosSlots = useMemo(() => {
        return gerarSlotsParaSemana(semanaInicio);
    }, [gerarSlotsParaSemana, semanaInicio]);
    const slotsDoTurno = useMemo(() => {
        const resultado: AgendaSlotsDoTurnoType = {};

        // Use os horários mockados aqui também
        // const horariosDoTurno = agenda.horarios_por_turno[titulo.toLowerCase()]; // Linha original
        const horariosDoTurno = horariosMockados()[titulo.toLowerCase() as 'manha' | 'tarde' | 'noite'];

        if (!horariosDoTurno) {
            return {};
        }

        for (const slotTime of horariosDoTurno) {
            const [horario_inicio] = slotTime.split(' - ').map(s => s.trim() + ':00');
            const slotsDaHora = todosSlots.filter((slot) => slot.horario_inicio === horario_inicio);
            if (slotsDaHora.length > 0) {
                resultado[slotTime] = slotsDaHora;
            }
        }

        return resultado;
    }, [horariosMockados, titulo, todosSlots]);


    return (
        <div key={agenda.id} >
            <div
                className={cn(
                    'grid grid-cols-[80px_repeat(7,1fr)] border-b',
                    titulo === 'MANHÃ' && 'bg-accent/10',
                    titulo === 'TARDE' && 'bg-secondary/10',
                    titulo === 'NOITE' && 'bg-muted/20',
                )}
            >
                <div className="p-2 text-center text-xs font-semibold  bg-gray-50 ">{titulo}</div>
                {diasSemana.map((dia) => (
                    <div key={`${titulo}-${dia.valor}`} className=" p-2 bg-gray-50 text-center text-xs font-medium"></div>
                ))}
            </div>
            {Object.entries(slotsDoTurno).map(([hora, slots]) => (
                <div
                    key={hora}
                    className={cn(
                        'grid grid-cols-[80px_repeat(7,1fr)] border-b',
                        titulo === 'MANHÃ' && 'bg-accent/5',
                        titulo === 'TARDE' && 'bg-secondary/5',
                        titulo === 'NOITE' && 'bg-muted/10',
                    )}
                >
                    <div className="text-muted-foreground border-r p-2 pr-3 text-right text-xs">
                        {hora}
                    </div>
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
