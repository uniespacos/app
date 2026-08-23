import { router } from '@inertiajs/react';
import { useEffect } from 'react';
import { acquirePrivateChannel, releasePrivateChannel } from '@/lib/echo-channel-registry';

export function useReservationValidation(reservaId: number): void {
    useEffect(() => {
        if (typeof window === 'undefined' || !window.Echo) {
            return;
        }

        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const channel = acquirePrivateChannel(`reserva.${String(reservaId)}`);
        if (!channel) return;

        // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
        channel.listen('ReservationValidated', () => {
            router.reload();
        });

        return () => {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
            channel.stopListening('ReservationValidated');
            releasePrivateChannel(`reserva.${String(reservaId)}`);
        };
    }, [reservaId]);
}
