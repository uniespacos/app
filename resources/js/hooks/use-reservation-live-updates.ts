import { useEffect } from 'react';
import { acquirePublicChannel, releasePublicChannel } from '@/lib/echo-channel-registry';

interface ReservationEvent {
    action: string;
    reservaId: number;
}

export function useReservationLiveUpdates(): void {
    useEffect(() => {
        const ACOES_QUE_ATUALIZAM = new Set(['created', 'validated', 'evaluated']);

        const channel = acquirePublicChannel('reserva-channel');
        if (!channel) return;

        // O ponto inicial em '.reserva-event' é obrigatório: sem ele o
        // EventFormatter do laravel-echo prefixa o namespace padrão e passa a
        // escutar 'App\Events\reserva-event', enquanto ReservaEvent::broadcastAs()
        // publica apenas 'reserva-event'. Sem o ponto, o handler nunca dispara.
        channel.listen('.reserva-event', (event: ReservationEvent) => {
            if (ACOES_QUE_ATUALIZAM.has(event.action)) {
                document.dispatchEvent(
                    new CustomEvent('reserva:updated', {
                        detail: {
                            reservaId: event.reservaId,
                            action: event.action,
                        },
                    }),
                );
            }
        });

        return () => {
            channel.stopListening('.reserva-event');
            releasePublicChannel('reserva-channel');
        };
    }, []);
}
