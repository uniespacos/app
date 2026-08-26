import { Reserva, SituacaoReserva } from '@/types';

export function calculateGestorStatus(reserva: Reserva): SituacaoReserva {
    if (reserva.situacao === 'parcialmente_deferida' || reserva.situacao === 'em_analise') {
        const horarios = reserva.horarios || [];
        if (horarios.length > 0) {
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
        }
    }
    return reserva.situacao;
}

export function sortReservasForGestor(reservas: Reserva[]): Reserva[] {
    const list = reservas.map((reserva) => ({
        ...reserva,
        situacao: calculateGestorStatus(reserva),
    }));

    return [...list].sort((a, b) => {
        if (a.situacao === 'em_analise' && b.situacao !== 'em_analise') return -1;
        if (b.situacao === 'em_analise' && a.situacao !== 'em_analise') return 1;
        return 0;
    });
}

export function sortReservasForUser(reservas: Reserva[]): Reserva[] {
    return [...reservas].sort((a, b) => {
        if (a.situacao === 'em_analise' && b.situacao !== 'em_analise') return -1;
        if (b.situacao === 'em_analise' && a.situacao !== 'parcialmente_deferida') return 1;
        return 0;
    });
}
