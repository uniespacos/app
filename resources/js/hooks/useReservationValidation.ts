import { useEffect } from 'react';
import { router } from '@inertiajs/react';

export function useReservationValidation(reservaId: number): void {
    useEffect(() => {
        if (typeof window === 'undefined' || !window.Echo) {
            return;
        }

        const echo = window.Echo as { private: (channel: string) => { on: (event: string, callback: () => void) => void; leave: () => void } };
        const channel = echo.private(`reserva.${String(reservaId)}`);

        channel.on('ReservationValidated', () => {
            router.reload();
        });

        return () => {
            if (channel?.leave && typeof channel.leave === 'function') {
                channel.leave();
            }
        };
    }, [reservaId]);
}
