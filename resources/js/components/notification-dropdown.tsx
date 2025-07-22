import { User } from '@/types';
import { router, usePage } from '@inertiajs/react';
import { Bell, MailCheck } from 'lucide-react'; // Ícones, instale lucide-react: npm install lucide-react
import { useCallback, useEffect, useRef, useState } from 'react';
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
    }>();
    const user = props.auth.user;
    const [notifications, setNotifications] = useState<UserNotification[]>([]);
    const [unreadCount, setUnreadCount] = useState<number>(user.unread_notifications.length);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const fetchTimeoutRef = useRef<number | null>(null);

    // Função para buscar notificações do backend
    const fetchNotifications = useCallback(async () => {
        if (!user || isLoading) return;

        setIsLoading(true);
        try {
            const response = await fetch(route('notifications.index')); // Use a helper route() do Laravel
            if (response.ok) {
                const data: UserNotification[] = await response.json();
                setNotifications(data);
                setUnreadCount(data.filter((n) => !n.read_at).length); // Recalcula e atualiza o estado local
            }
        } catch (error) {
            console.error('Erro ao buscar notificações:', error);
        } finally {
            setIsLoading(false);
        }
    }, [user, isLoading]);

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
                    console.log('Notificações marcadas como lidas com sucesso via Inertia!');
                },
                onError: (errors) => {
                    console.error('Erro ao marcar notificações como lidas via Inertia:', errors);
                    alert('Erro ao marcar notificações como lidas. Verifique o console.');
                },
                onFinish: () => {
                    setIsLoading(false);
                },
            },
        );
    };
    useEffect(() => {
        if (user && window.Echo) {
            window.Echo.private(`App.Models.User.${user.id}`).notification((notification: any) => {
                setNotifications((prev) => [
                    {
                        id: notification.id || String(Date.now()),
                        type: notification.type,
                        data: notification,
                        read_at: null,
                        created_at: new Date().toISOString(),
                    },
                    ...prev,
                ]);
                setUnreadCount((prev) => prev + 1);
                toast.success(notification.data.mensagem);
            });
        }
        return () => {
            if (user && window.Echo) {
                window.Echo.leave(`App.Models.User.${user.id}`);
            }
        };
    }, [user]);

    useEffect(() => {
        // Isso é crucial para quando o usuário navega para uma nova página Inertia
        // ou recarrega, o contador local é reinicializado com o valor mais recente do servidor.
        setUnreadCount(props.auth.user.unread_notifications.length);
    }, [props.auth.user.unread_notifications.length]);

    // Efeito para buscar e marcar como lidas ao abrir o popover (inalterado)
    useEffect(() => {
        if (isOpen) {
            if (fetchTimeoutRef.current) {
                clearTimeout(fetchTimeoutRef.current);
            }
            fetchTimeoutRef.current = setTimeout(() => {
                fetchNotifications(); // Sempre busca as últimas notificações ao abrir
            }, 2000);
        } else {
            if (fetchTimeoutRef.current) {
                clearTimeout(fetchTimeoutRef.current);
            }
        }
    }, [fetchNotifications, isOpen, user]); // Depende de isOpen e user (para re-fetch se o user mudar)

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
                            notifications.map((notification) => (
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
                            ))
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
