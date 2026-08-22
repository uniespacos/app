import { useEffect } from 'react';

interface ReservationEvent {
    action: string;
    reservaId: number;
}

export function useReservationLiveUpdates(): void {
    useEffect(() => {
        if (!window.Echo) {
            return;
        }

        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
        const channel = window.Echo.channel('reserva-channel');

        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
        channel.listen('reserva-event', (event: ReservationEvent) => {
            if (event.action === 'created' || event.action === 'validated') {
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
            channel.stopListening('reserva-event');
        };
    }, []);
}
