import { cn, identificarTurno } from '@/lib/utils';
import { Agenda, AgendaDiasSemanaType, AgendaGestoresPorTurnoType, AgendaSlotsDoTurnoType, Horario, Reserva, SlotCalendario } from '@/types';
import CalendarSlotCell from './calendar-slot-cell';
import { useCallback, useEffect, useMemo, useState } from 'react';
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

    const [todosSlots, setTodosSlots] = useState<SlotCalendario[]>([]);
    const { horariosReservadosMap } = useMemo(() => {
        const reservadosMap = new Map<string, { horario: Horario; autor: string; reserva_titulo: string }>();
        agenda.horarios?.forEach((horario) => {
            const reservaValida = horario.reservas?.find((r) => ['deferida', 'parcialmente_deferida'].includes(r.situacao));
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
    }, [agenda, isEditMode, reservaToEdit?.id]);
    const gerarSlotsParaSemana = useCallback((semanaInicio: Date) => {
        const gestor: AgendaGestoresPorTurnoType = {
            nome: agenda.user?.name ?? 'Indefinido',
            email: agenda.user?.email ?? 'Indefinido',
            departamento: agenda.user?.setor?.nome ?? 'N/I',
            agenda_id: agenda.id,
        };
        const slotsGerados: SlotCalendario[] = [];
        for (let diaOffset = 0; diaOffset < 7; diaOffset++) {
            const diaAtual = addDays(semanaInicio, diaOffset);
            const diaFormatado = format(diaAtual, 'yyyy-MM-dd');
            for (let hora = 7; hora < 22; hora++) {
                const turno = identificarTurno(hora);
                if (turno != agenda.turno) continue; // Verifica se o turno do slot corresponde ao turno da agenda
                const inicio = `${String(hora).padStart(2, '0')}:00:00`;
                const chave = `${diaFormatado}|${inicio}`;
                const horarioReservado = horariosReservadosMap.get(chave);
                const horarioSolicitado = slotsSolicitados?.find(slot => slot.id === chave);
                if (horarioReservado && !horarioSolicitado) {
                    slotsGerados.push({
                        id: chave,
                        status: 'reservado',
                        data: diaAtual,
                        horario_inicio: inicio,
                        horario_fim: `${String(hora).padStart(2, '0')}:50:00`,
                        dadosReserva: {
                            horarioDB: horarioReservado.horario,
                            autor: horarioReservado.autor,
                            reserva_titulo: horarioReservado.reserva_titulo,
                        },
                    });
                } else if (horarioSolicitado) {
                    slotsGerados.push(horarioSolicitado);
                }
                else if (gestor) {
                    slotsGerados.push({
                        id: chave,
                        status: 'livre',
                        data: diaAtual,
                        horario_inicio: inicio,
                        horario_fim: `${String(hora).padStart(2, '0')}:50:00`,
                        agenda_id: gestor.agenda_id,
                    });
                }
            }
        }
        return slotsGerados;
    }, [agenda.id, agenda.turno, agenda.user?.email, agenda.user?.name, agenda.user?.setor?.nome, horariosReservadosMap, slotsSolicitados]);
    const slotsDoTurno = useMemo(() => {
        // Primeiro, agrupa todos os slots por hora (07:00, 08:00, etc.), como na lógica original.
        const slotsPorHora: Record<string, SlotCalendario[]> = {};
        for (let hora = 7; hora < 22; hora++) {
            if (titulo !== identificarTurno(hora)) continue; // Verifica se o turno do slot corresponde ao turno da agenda
            const horaFormatada = `${String(hora).padStart(2, '0')}:00`;
            slotsPorHora[horaFormatada] = todosSlots.filter((slot) => slot.horario_inicio.startsWith(horaFormatada));
        }
        // Depois, distribui essas horas nos seus respectivos turnos.
        const resultado: AgendaSlotsDoTurnoType = {};

        Object.entries(slotsPorHora).forEach(([hora, slotsDaHora]) => {
            if (slotsDaHora.length > 0) {
                // Só adiciona a linha se houver slots
                resultado[hora] = slotsDaHora;
            }
        });

        return resultado;
    }, [titulo, todosSlots]);

    useEffect(() => {
        setTodosSlots(gerarSlotsParaSemana(semanaInicio));
    }, [gerarSlotsParaSemana, semanaInicio]);
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
                        {hora} - {hora.split(':')[0]}:50
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
