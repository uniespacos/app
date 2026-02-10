import { User } from '@/types';
import { router, usePage } from '@inertiajs/react';
import { Bell, MailCheck } from 'lucide-react'; // Ícones, instale lucide-react: npm install lucide-react
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Button } from './ui/button';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { ScrollArea } from './ui/scroll-area';
import { Separator } from './ui/separator';

interface NotificationData {
    titulo: string;
    descricao: string;
    url?: string;
}

interface UserNotification {
    id: string; // ID da notificação (uuid)
    type: string; // Tipo da notificação (ex: App\\Notifications\\ReservaAvaliadaNotification)
    data: NotificationData; // Conteúdo da notificação
    read_at: string | null; // Data/hora que foi lida
    created_at: string; // Data/hora que foi criada
}

export function NotificationDropdown() {
    const { props } = usePage<{
        auth: {
            user: User;
        };
        notifications: UserNotification[];
    }>();
    const user = props.auth.user;
    const [notifications, setNotifications] = useState<UserNotification[]>(props.notifications || []);
    const [unreadCount, setUnreadCount] = useState<number>(user.unread_notifications.length);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isOpen, setIsOpen] = useState<boolean>(false);

    // Função para marcar notificações como lidas
    const markAllAsRead = () => {
        // Use a prop do Inertia para verificar se há não lidas
        if (!user || user.unread_notifications.length === 0) return;

        setIsLoading(true);

        router.post(
            route('notifications.markAsRead'),
            {},
            {
                onSuccess: () => {
                    setNotifications((prev) => prev.map((n) => ({ ...n, read_at: n.read_at || new Date().toISOString() })));
                    setUnreadCount(0); // Zera o contador local após marcar como lido
                },

                onFinish: () => {
                    setIsLoading(false);
                },
            },
        );
    };
    useEffect(() => {
        if (user && window.Echo) {
            const channel = window.Echo.private(`App.Models.User.${user.id}`);
            channel.notification((notification: { titulo: string; descricao: string; url?: string; type: string; id?: string }) => {
                // Linha essencial para debug: veja exatamente o que está chegando!

                // 1. Mostra o toast com a propriedade correta (ex: título)
                toast.success(notification.titulo);

                // 2. Atualiza o estado das notificações, construindo o objeto corretamente
                setNotifications((prevNotifications) => [
                    {
                        // O payload do broadcast não vem com ID, então geramos um temporário ou usamos o que vier
                        id: notification.id || String(Date.now()),
                        type: notification.type, // O Laravel Echo adiciona o 'type' automaticamente
                        read_at: null,
                        created_at: new Date().toISOString(),
                        // Colocamos os dados recebidos dentro da propriedade 'data'
                        data: {
                            titulo: notification.titulo,
                            descricao: notification.descricao,
                            url: notification.url,
                        },
                    },
                    ...prevNotifications, // Adiciona as notificações antigas depois
                ]);

                // 3. Incrementa o contador de não lidas
                setUnreadCount((prevCount) => prevCount + 1);
            });

            // Função de limpeza para quando o componente for desmontado
            return () => {
                channel.stopListening('.Illuminate\\Notifications\\Events\\BroadcastNotificationCreated');
                // Usar window.Echo.leave() também é uma opção
            };
        }
    }, [user]);

    useEffect(() => {
        // Isso é crucial para quando o usuário navega para uma nova página Inertia
        // ou recarrega, o contador local é reinicializado com o valor mais recente do servidor.
        setUnreadCount(props.auth.user.unread_notifications.length);
    }, [props.auth.user.unread_notifications.length]);

    // Função auxiliar para formatar a data
    const formatNotificationTime = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) + ' - ' + date.toLocaleDateString('pt-BR');
    };

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 p-0">
                    <span className="sr-only">Visualizar Notificações</span>
                    <Bell className="h-5 w-5" />
                    {/* Exibe o contador apenas se for maior que zero */}
                    {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 z-10 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs text-white">
                            {unreadCount}
                        </span>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" align="end">
                <div className="flex items-center justify-between p-4">
                    <h4 className="text-lg font-semibold">Notificações</h4>
                    {unreadCount > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={markAllAsRead}
                            disabled={isLoading || unreadCount === 0}
                            className="text-muted-foreground hover:text-primary"
                        >
                            <MailCheck className="mr-1 h-4 w-4" /> Marcar todas como lidas
                        </Button>
                    )}
                </div>
                <Separator />
                <ScrollArea className="h-[300px]">
                    <div className="p-4">
                        {isLoading ? (
                            <p className="text-muted-foreground text-center text-sm">Carregando...</p>
                        ) : notifications.length === 0 ? (
                            <p className="text-muted-foreground text-center text-sm">Nenhuma notificação encontrada.</p>
                        ) : (
                            notifications.map((notification) => {
                                return (
                                    <div
                                        key={notification.id}
                                        className={`mb-3 rounded-md p-2 last:mb-0 ${notification.read_at ? 'bg-muted/50 text-muted-foreground' : 'bg-card'}`}
                                    >
                                        <p className="text-sm font-medium">{notification.data.titulo}</p>
                                        <p className="font-regular text-sm">{notification.data.descricao}</p>

                                        <p className="mt-1 text-xs text-gray-500">{formatNotificationTime(notification.created_at)}</p>
                                        {notification.data.url && (
                                            <a href={notification.data.url} className="mt-1 block text-xs text-blue-500 hover:underline">
                                                Ver detalhes
                                            </a>
                                        )}
                                    </div>
                                );
                            })
                        )}
                    </div>
                </ScrollArea>
                <Separator />
                <div className="p-4 text-center">
                    <a href={route('notifications.index')} className="text-primary text-sm hover:underline">
                        Ver todas as notificações
                    </a>
                </div>
            </PopoverContent>
        </Popover>
    );
}
