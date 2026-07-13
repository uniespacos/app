import React from 'react';
import { useAgnosticForm } from '@/hooks/use-agnostic-form';
import { FormAvaliacaoPayload } from '../ports/reservas-repository.interface';
import { Reserva } from '@/types';
import { toast } from 'sonner';

declare function route(name: string, params?: unknown): string;

interface UseAvaliarReservaUseCaseProps {
    reserva: Reserva;
    onSuccess?: () => void;
}

export function useAvaliarReservaUseCase({
    reserva,
    onSuccess,
}: UseAvaliarReservaUseCaseProps) {
    const existingJustification = (reserva as unknown as { existing_justification?: string }).existing_justification || '';
    
    const form = useAgnosticForm<FormAvaliacaoPayload>({
        situacao: reserva.situacao,
        motivo: existingJustification,
        observacao: reserva.observacao || '',
        horarios_avaliados: [],
        evaluation_scope: 'recurring',
    });

    const submitEvaluation = (e: React.FormEvent) => {
        e.preventDefault();
        if (form.data.situacao === 'indeferida' && !form.data.motivo.trim()) {
            toast.error('Motivo é obrigatório para reservas indeferidas');
            return;
        }

        form.submit('patch', route('gestor.reservas.update', reserva.id), {
            onSuccess: () => {
                toast.success('Reserva avaliada com sucesso!');
                if (onSuccess) onSuccess();
            },
            onError: (errors: Record<string, string>) => {
                toast.error(Object.values(errors)[0] || 'Ocorreu um erro.');
            }
        });
    };

    return {
        form,
        submitEvaluation,
    };
}
