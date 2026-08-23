import { useEffect } from 'react';
import { acquirePrivateChannel, releasePrivateChannel } from '@/lib/echo-channel-registry';

interface EspacoEvent {
    action: string;
    reservaId: number;
    espacoId: number;
    horariosCount: number;
}

export function useEspacoLiveUpdates(espacoId: number): void {
    useEffect(() => {
        if (!window.Echo) {
            return;
        }

        const channelName = `App.Models.Espaco.${String(espacoId)}`;
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const channel = acquirePrivateChannel(channelName);
        if (!channel) return;

        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
        channel.listen('.reserva-event', (event: EspacoEvent) => {
            document.dispatchEvent(
                new CustomEvent('reserva:updated', {
                    detail: {
                        action: event.action,
                        reservaId: event.reservaId,
                        espacoId: event.espacoId,
                        horariosCount: event.horariosCount,
                    },
                }),
            );
        });

        return () => {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
            channel.stopListening('.reserva-event');
            releasePrivateChannel(channelName);
        };
    }, [espacoId]);
}
