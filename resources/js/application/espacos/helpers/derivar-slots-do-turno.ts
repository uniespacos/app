import { HORARIOS_PADRAO } from '@/constants/turnos';
import { Agenda, AgendaDiasSemanaType, Horario, SlotCalendario } from '@/types';
import { format } from 'date-fns';

/**
 * Deriva os slots de um turno para a semana visível.
 *
 * Esta lógica vivia dentro de `calendar-shift-section.tsx`, misturada com a
 * renderização da grade de 7 colunas. Foi extraída porque a visão mobile
 * precisa exatamente dos mesmos slots com um layout diferente — e duplicar a
 * derivação faria as duas visões divergirem.
 *
 * Divergir aqui não é cosmético: um slot que apareça `livre` no celular e
 * `reservado` no desktop leva a reserva em cima de reserva. Uma definição só é
 * o que impede isso.
 *
 * `agora` é injetável para que `isPast` seja testável sem mockar o relógio.
 */
export type SlotDerivado = {
    dia: AgendaDiasSemanaType;
    horaLabel: string;
    slot: SlotCalendario;
};

type HorarioReservado = {
    horario: Horario;
    autor: string;
    reserva_titulo: string;
};

/**
 * Horários já deferidos que pertencem a OUTRAS reservas.
 *
 * A reserva que está sendo editada/visualizada é excluída de propósito: os
 * horários dela não podem aparecer como "reservado por terceiro" para o próprio
 * dono enquanto ele edita.
 */
function mapearHorariosReservados(agenda: Agenda, slotsSolicitados?: SlotCalendario[]): Map<string, HorarioReservado> {
    const map = new Map<string, HorarioReservado>();
    const reservaDaProp = slotsSolicitados?.[0]?.dadosReserva?.horarioDB?.reserva?.id;

    agenda.horarios?.forEach((horario) => {
        if (horario.situacao === 'deferida' && horario.reserva && horario.reserva.id !== reservaDaProp) {
            map.set(`${horario.data}|${horario.horario_inicio}`, {
                horario,
                autor: horario.reserva.user?.name ?? 'Indefinido',
                reserva_titulo: horario.reserva.titulo,
            });
        }
    });

    return map;
}

export function derivarSlotsDoTurno(
    agenda: Agenda,
    diasSemana: AgendaDiasSemanaType[],
    slotsSolicitados?: SlotCalendario[],
    agora: Date = new Date(),
): SlotDerivado[] {
    const horariosReservadosMap = mapearHorariosReservados(agenda, slotsSolicitados);

    const slotsSolicitadosMap = new Map<string, SlotCalendario>();
    slotsSolicitados?.forEach((slot) => slotsSolicitadosMap.set(slot.id, slot));

    const horariosDoTurno = HORARIOS_PADRAO[agenda.turno as keyof typeof HORARIOS_PADRAO] ?? [];

    const derivados: SlotDerivado[] = [];

    horariosDoTurno.forEach((horaLabel) => {
        const [horario_inicio_str, horario_fim_str] = horaLabel.split(' - ').map((s) => s.trim() + ':00');

        diasSemana.forEach((dia) => {
            const diaFormatado = format(dia.data, 'yyyy-MM-dd');
            const chave = `${diaFormatado}|${horario_inicio_str}`;
            const isPast = new Date(`${diaFormatado}T${horario_inicio_str}`) < agora;

            const horarioSolicitado = slotsSolicitadosMap.get(chave);
            const horarioReservado = horariosReservadosMap.get(chave);

            let slot: SlotCalendario;

            // A ordem importa: um horário da própria reserva vence o de
            // terceiro, senão o dono veria o próprio slot como bloqueado.
            if (horarioSolicitado) {
                slot = { ...horarioSolicitado, isPast };
            } else if (horarioReservado) {
                slot = {
                    id: chave,
                    status: 'reservado',
                    data: dia.data,
                    horario_inicio: horario_inicio_str,
                    horario_fim: horario_fim_str,
                    isPast,
                    dadosReserva: {
                        horarioDB: horarioReservado.horario,
                        autor: horarioReservado.autor,
                        reserva_titulo: horarioReservado.reserva_titulo,
                    },
                };
            } else {
                slot = {
                    id: chave,
                    status: 'livre',
                    data: dia.data,
                    horario_inicio: horario_inicio_str,
                    horario_fim: horario_fim_str,
                    agenda_id: agenda.id,
                    isPast,
                };
            }

            derivados.push({ dia, horaLabel, slot });
        });
    });

    return derivados;
}
