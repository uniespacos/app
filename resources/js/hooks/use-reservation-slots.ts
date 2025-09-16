import { Agenda, Reserva, SituacaoReserva, SlotCalendario, Horario } from '@/types';
import { useMemo, useState, useEffect } from 'react';
import { parse } from 'date-fns';

/**
 * Mapeia o status do Horario (backend) para o status do SlotCalendario (frontend).
 */
function mapearStatusBackendParaSlot(status: Horario['situacao']): SlotCalendario['status'] {
    switch (status) {
        case 'em_analise': return 'solicitado';
        case 'deferida': return 'deferida';
        case 'indeferida': return 'indeferida';
        default: return 'reservado'; // 'inativa' ou outros casos
    }
}

/**
 * Hook customizado para gerenciar a lógica de estado dos slots de uma reserva.
 * @param reserva - O objeto da reserva (com as etiquetas de conflito do backend).
 * @param agendas - A lista de agendas relacionadas à reserva.
 * @returns Um objeto contendo o estado dos slots e as funções para manipulá-los.
 */
export function useReservationSlots(reserva: Reserva, agendas: Agenda[]) {

    // Calcula os slots iniciais lendo as "etiquetas" de conflito do backend.
    const initialSlots = useMemo<SlotCalendario[]>(() => {
        return reserva.horarios.map((horario) => {

            // A lógica de conflito agora é uma simples leitura da prop.
            const isConflicted = horario.is_conflicted === true;

            return {
                id: `${horario.data}|${horario.horario_inicio}`,
                // Se o backend disse que há conflito, o status inicial já é 'indeferida'.
                status: isConflicted ? 'indeferida' : mapearStatusBackendParaSlot(horario.situacao),
                data: parse(horario.data, 'yyyy-MM-dd', new Date()),
                horario_inicio: horario.horario_inicio,
                horario_fim: horario.horario_fim,
                agenda_id: horario.agenda?.id,
                // Se houver conflito, o slot já nasce bloqueado para o gestor.
                isLocked: isConflicted,
                dadosReserva: {
                    horarioDB: horario,
                    autor: reserva.user!.name,
                    reserva_titulo: reserva.titulo,
                    // Armazena os detalhes do conflito para usar na justificativa.
                    conflito: horario.conflict_details,
                },
                isShowReservation: true,
            } as SlotCalendario;
        });
    }, [reserva]); // A dependência é a reserva. Se ela mudar (nova semana), os slots são recalculados.

    const [slotsSelecao, setSlotsSelecao] = useState<SlotCalendario[]>(initialSlots);

    // Efeito para resetar a seleção se a reserva (e os horários) mudar.
    useEffect(() => {
        setSlotsSelecao(initialSlots);
    }, [initialSlots]);

    /**
     * Alterna o status de um slot individualmente (deferido -> indeferido -> solicitado).
     * Ignora a ação se o slot estiver bloqueado.
     */
    const avaliarSlot = (slotClicado: SlotCalendario) => {
        if (slotClicado.isLocked) return; // Não faz nada se o slot estiver bloqueado

        setSlotsSelecao((slotsAtuais) => {
            // Usa .map() para criar um novo array, alterando apenas o item que corresponde ao ID
            return slotsAtuais.map((slot) => {
                // Se o ID não for o do slot clicado, retorna o slot sem modificação
                if (slot.id !== slotClicado.id) {
                    return slot;
                }
                // Se encontrou o slot, calcula o próximo status
                let proximoStatus: SlotCalendario['status'];
                switch (slot.status) {
                    case 'solicitado':
                    case 'selecionado':
                        proximoStatus = 'deferida';
                        break;
                    case 'deferida':
                        proximoStatus = 'indeferida';
                        break;
                    case 'indeferida':
                    default:
                        proximoStatus = 'solicitado';
                        break;
                }
                return { ...slot, status: proximoStatus };
            });
        });
    };

    /**
     * Aplica uma decisão global (deferir/indeferir todos) aos slots não bloqueados.
     */
    const handleDecisaoGlobalChange = (novaDecisao: 'deferida' | 'indeferida') => {
        setSlotsSelecao((slotsAtuais) => {
            return slotsAtuais.map((slot) => {
                // Mantém o status de slots bloqueados (conflitos) intacto
                if (slot.isLocked) {
                    return slot;
                }
                // Aplica a nova decisão a todos os outros
                return { ...slot, status: novaDecisao };
            });
        });
    };

    return {
        initialSlots,
        slotsSelecao,
        avaliarSlot,
        handleDecisaoGlobalChange,
    };
}