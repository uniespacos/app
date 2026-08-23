import { useEffect } from 'react';
import { acquirePublicChannel, releasePublicChannel } from '@/lib/echo-channel-registry';

interface ReservationEvent {
    action: string;
    reservaId: number;
}

export function useReservationLiveUpdates(): void {
    useEffect(() => {
        if (!window.Echo) {
            return;
        }

        const ACOES_QUE_ATUALIZAM = new Set(['created', 'validated', 'evaluated']);

        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const channel = acquirePublicChannel('reserva-channel');
        if (!channel) return;

        // O ponto inicial em '.reserva-event' é obrigatório: sem ele o
        // EventFormatter do laravel-echo prefixa o namespace padrão e passa a
        // escutar 'App\Events\reserva-event', enquanto ReservaEvent::broadcastAs()
        // publica apenas 'reserva-event'. Sem o ponto, o handler nunca dispara.
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
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
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
            channel.stopListening('.reserva-event');
            releasePublicChannel('reserva-channel');
        };
    }, []);
}
