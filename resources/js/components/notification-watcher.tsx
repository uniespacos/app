import { User } from '@/types';
import { usePage } from '@inertiajs/react';
import { useEffect } from 'react';

// Se você tiver uma interface para suas props de usuário, defina-a aqui

export default function NotificationWatcher() {
    const { props } = usePage<{
        auth?: {
            user?: User;
        };
        // ... outras props que vêm do Inertia
    }>(); // Tipagem para usePage
    const user = props.auth?.user;
    useEffect(() => {
        // Verifique se window.Echo está realmente disponível
        if (user && window.Echo) {
            // 1. Escutar notificações para o USUÁRIO COMUM
            window.Echo.private(`App.Models.User.${user.id}`).notification((notification: any) => {
                // Use 'any' ou tipagem mais específica para a notificação
                if (notification.type === 'App\\Notifications\\ReservaAvaliadaNotification') {
                    //console.log('Notificação de Reserva Avaliada:', notification.mensagem);
                    alert(`Sua reserva para "${notification.espaco_nome}" foi ${notification.status_avaliacao}.`);
                }
            });

            // 2. Escutar notificações para o GESTOR
            if (user.permission_type_id === 2) {
                window.Echo.private(`App.Models.User.${user.id}`).notification((notification: any) => {
                    if (notification.type === 'App\\Notifications\\NovaSolicitacaoReservaNotification') {
                        //console.log('Notificação de Nova Solicitação:', notification.mensagem);
                        alert(`Nova solicitação de reserva de "${notification.usuario_nome}" para "${notification.espaco_nome}".`);
                    }
                });
            }
        } else if (!window.Echo) {
            console.error('window.Echo não está definido. A inicialização pode ter falhado ou sido tardia.');
        }
    }, [user]);

    return <></>; // Nada para renderizar visivelmente por padrão
}
