import { Reserva, SituacaoReserva } from '@/types';

export function calculateGestorStatus(reserva: Reserva): SituacaoReserva {
    const horarios = reserva.horarios || [];

    if (horarios.length === 0) {
        return reserva.situacao;
    }

    const situacoes = horarios.map((h) => h.situacao);

    if (situacoes.includes('em_analise')) {
        return 'em_analise';
    }

    if (situacoes.every((s) => s === 'deferida')) {
        return 'deferida';
    }

    if (situacoes.every((s) => s === 'indeferida')) {
        return 'indeferida';
    }

    return 'parcialmente_deferida';
}

/**
 * Recalcula a situação exibida ao gestor a partir dos horários da própria
 * reserva (parcial/em_analise por turno), sem reordenar a lista — a ordem já
 * vem do backend, de acordo com o critério de ordenação escolhido
 * (data de solicitação ou situação). Reordenar aqui de novo contradiria a
 * escolha do usuário.
 */
export function comSituacaoEfetivaDoGestor(reservas: Reserva[]): Reserva[] {
    return reservas.map((reserva) => ({
        ...reserva,
        situacao: calculateGestorStatus(reserva),
    }));
}
