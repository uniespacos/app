import { Agenda, Reserva, SituacaoReserva, SlotCalendario } from '@/types';
import { useMemo, useState, useEffect } from 'react';
import { addDays, isAfter, parse } from 'date-fns';

/**
 * Hook customizado para gerenciar a lógica de estado dos slots de uma reserva.
 * @param reserva - O objeto da reserva sendo avaliada.
 * @param agendas - A lista de agendas relacionadas à reserva.
 * @returns Um objeto contendo o estado dos slots e as funções para manipulá-los.
 */
export function useReservationSlots(reserva: Reserva, agendas: Agenda[]) {
    // Calcula os slots iniciais com base nos horários da reserva e possíveis conflitos.
    const initialSlots = useMemo<SlotCalendario[]>(() => {
        return reserva.horarios.map((horario) => {
            if (horario.situacao === "em_analise") {
                const hasConflict = agendas.some(a =>
                    a.horarios?.some(h => h.situacao === "deferida" && h.data === horario.data && h.horario_inicio === horario.horario_inicio)
                );
                if (hasConflict) {
                    return {
                        id: `${horario.data}|${horario.horario_inicio}`,
                        status: 'indeferida',
                        data: parse(horario.data, 'yyyy-MM-dd', new Date()),
                        horario_inicio: horario.horario_inicio,
                        horario_fim: horario.horario_fim,
                        agenda_id: horario.agenda?.id,
                        dadosReserva: { horarioDB: horario, autor: reserva.user!.name, reserva_titulo: reserva.titulo },
                        isShowReservation: true,
                        isLocked: true
                    } as SlotCalendario;
                }
            }
            return {
                id: `${horario.data}|${horario.horario_inicio}`,
                status: horario.situacao === 'em_analise' ? 'solicitado' :
                    (horario.situacao === 'deferida' || horario.situacao === 'indeferida') ?
                        horario.situacao : 'solicitado',
                data: parse(horario.data, 'yyyy-MM-dd', new Date()),
                horario_inicio: horario.horario_inicio,
                horario_fim: horario.horario_fim,
                agenda_id: horario.agenda?.id,
                dadosReserva: { horarioDB: horario, autor: reserva.user!.name, reserva_titulo: reserva.titulo },
                isShowReservation: true,
            } as SlotCalendario;
        });
    }, [reserva.horarios, reserva.user, reserva.titulo, agendas]);

    const initialSlotsEvaluate = useMemo<SlotCalendario[]>(() => {
        const dataInicialReserva = reserva.data_inicial;
        const fimPrimeiraSemana = addDays(dataInicialReserva, 6);

        // 2. Filtra os horários para incluir APENAS os que estão na primeira semana.
        const horariosDaPrimeiraSemana = reserva.horarios.filter(horario => {
            const dataHorario = parse(horario.data, 'yyyy-MM-dd', new Date());
            // A condição retorna 'true' se a data do horário NÃO for posterior ao fim da primeira semana.
            return !isAfter(dataHorario, fimPrimeiraSemana);
        });

        // 3. Mapeia os horários JÁ FILTRADOS, mantendo toda a sua lógica de conflitos e formatação.
        return horariosDaPrimeiraSemana.map((horario) => {
            if (horario.situacao === "em_analise") {
                const hasConflict = agendas.some(a =>
                    a.horarios?.some(h => h.situacao === "deferida" && h.data === horario.data && h.horario_inicio === horario.horario_inicio)
                );
                if (hasConflict) {
                    return {
                        id: `${horario.data}|${horario.horario_inicio}`,
                        status: 'indeferida',
                        data: parse(horario.data, 'yyyy-MM-dd', new Date()),
                        horario_inicio: horario.horario_inicio,
                        horario_fim: horario.horario_fim,
                        agenda_id: horario.agenda?.id,
                        dadosReserva: { horarioDB: horario, autor: reserva.user!.name, reserva_titulo: reserva.titulo },
                        isShowReservation: true,
                        isLocked: true
                    } as SlotCalendario;
                }
            }
            return {
                id: `${horario.data}|${horario.horario_inicio}`,
                status: horario.situacao === 'em_analise' ? 'solicitado' :
                    (horario.situacao === 'deferida' || horario.situacao === 'indeferida') ?
                        horario.situacao : 'solicitado',
                data: parse(horario.data, 'yyyy-MM-dd', new Date()),
                horario_inicio: horario.horario_inicio,
                horario_fim: horario.horario_fim,
                agenda_id: horario.agenda?.id,
                dadosReserva: { horarioDB: horario, autor: reserva.user!.name, reserva_titulo: reserva.titulo },
                isShowReservation: true,
            } as SlotCalendario;
        });
    }, [reserva.data_inicial, reserva.horarios, reserva.user, reserva.titulo, agendas]);

    const [slotsSelecao, setSlotsSelecao] = useState<SlotCalendario[]>(initialSlots);
    const [slotsSelecaoAvaliar, setSlotsSelecaoAvaliar] = useState<SlotCalendario[]>(initialSlotsEvaluate);
    // Efeito para resetar a seleção de slots se os slots iniciais mudarem.
    useEffect(() => {
        setSlotsSelecao(initialSlots);
    }, [initialSlots]);

    useEffect(() => {
        setSlotsSelecaoAvaliar(initialSlotsEvaluate);
    }, [initialSlotsEvaluate]);

    // Função para alternar o status de um slot individualmente (deferido -> indeferido -> solicitado).
    const avaliarSlot = (slot: SlotCalendario) => {
        setSlotsSelecaoAvaliar((prevSlots) => {
            const novosSlots = [...prevSlots];
            const index = novosSlots.findIndex((s) => s.id === slot.id);

            if (index !== -1) {
                const slotAtual = novosSlots[index];
                let proximoStatus: 'solicitado' | 'deferida' | 'indeferida';

                if (slotAtual.status === 'solicitado' || slotAtual.status === 'selecionado') {
                    proximoStatus = 'deferida';
                } else if (slotAtual.status === 'deferida') {
                    proximoStatus = 'indeferida';
                } else {
                    proximoStatus = 'solicitado';
                }
                novosSlots[index] = { ...slotAtual, status: proximoStatus };
            }
            return novosSlots;
        });
    };

    // Função para aplicar uma decisão global (deferir/indeferir todos) aos slots.
    const handleDecisaoGlobalChange = (novaDecisao: SituacaoReserva) => {
        setSlotsSelecao((prevSlots) => {
            return prevSlots.map((slot) => {
                if (slot.isLocked && slot.status === 'indeferida') {
                    return slot;
                }
                return {
                    ...slot,
                    status: novaDecisao === 'deferida' ? 'deferida' : 'indeferida',
                };
            });
        });
    };

    return {
        initialSlots,
        slotsSelecao,
        initialSlotsEvaluate,
        slotsSelecaoAvaliar,
        avaliarSlot,
        handleDecisaoGlobalChange,
    };
}
