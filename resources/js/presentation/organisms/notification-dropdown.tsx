import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { acquirePrivateChannel, releasePrivateChannel } from '@/lib/echo-channel-registry';
import { User } from '@/types';
import { router, usePage } from '@inertiajs/react';
import { Bell } from 'lucide-react'; // Ícones, instale lucide-react: npm install lucide-react
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

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
    const [notifications, setNotifications] = useState<UserNotification[]>(props.notifications ?? []);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isOpen, setIsOpen] = useState<boolean>(false);

    // unreadCount é derivado do array de notificações (única fonte de verdade),
    // que também recebe itens em tempo real via WebSocket.
    const unreadCount = useMemo(() => notifications.filter((n) => n.read_at === null).length, [notifications]);
    const markAllAsRead = () => {
        if (unreadCount === 0) return;

        setIsLoading(true);

        router.post(
            route('notifications.markAsRead'),
            {},
            {
                onSuccess: () => {
                    setNotifications((prev) => prev.map((n) => ({ ...n, read_at: n.read_at ?? new Date().toISOString() })));
                },

                onFinish: () => {
                    setIsLoading(false);
                },
            },
        );
    };
    useEffect(() => {
        if (user) {
            const channel = acquirePrivateChannel(`App.Models.User.${String(user.id)}`);
            if (!channel) return;

            channel.notification((notification: { titulo: string; descricao: string; url?: string; type: string; id?: string }) => {
                // 1. Mostra o toast com a propriedade correta (ex: título)
                toast.success(notification.titulo);

                // 2. Atualiza o estado das notificações, construindo o objeto corretamente
                setNotifications((prevNotifications) => [
                    {
                        // O payload do broadcast não vem com ID, então geramos um temporário ou usamos o que vier
                        id: notification.id ?? String(Date.now()),
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
            });
            return () => {
                channel.stopListening('.Illuminate\\Notifications\\Events\\BroadcastNotificationCreated');
                releasePrivateChannel(`App.Models.User.${String(user.id)}`);
            };
        }
    }, [user]);
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
                        <span className="bg-destructive absolute -top-1 -right-1 z-10 flex h-4 w-4 items-center justify-center rounded-full text-xs text-white">
                            {unreadCount}
                        </span>
                    )}
                </Button>
            </PopoverTrigger>
            {/* w-[calc(100vw-2rem)] evita o popover encostar/vazar nas bordas
                da tela no celular; sm:w-80 volta ao tamanho fixo no desktop. */}
            <PopoverContent className="w-[calc(100vw-2rem)] p-0 sm:w-80" align="end">
                <div className="flex items-center justify-between p-3">
                    <h4 className="text-sm font-semibold">Notificações{unreadCount > 0 && ` (${String(unreadCount)})`}</h4>
                    {unreadCount > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={markAllAsRead}
                            disabled={isLoading}
                            className="text-muted-foreground hover:text-primary h-auto p-0 text-xs"
                        >
                            Marcar todas como lidas
                        </Button>
                    )}
                </div>
                <Separator />
                <ScrollArea className="h-[300px]">
                    <div className="space-y-2 p-3">
                        {isLoading ? (
                            <p className="text-muted-foreground text-center text-sm">Carregando...</p>
                        ) : notifications.length === 0 ? (
                            <div className="text-muted-foreground flex flex-col items-center gap-2 py-8 text-center text-sm">
                                <Bell className="h-8 w-8 opacity-40" />
                                Nenhuma notificação por aqui.
                            </div>
                        ) : (
                            notifications.map((notification) => {
                                const lida = !!notification.read_at;
                                return (
                                    <div
                                        key={notification.id}
                                        // Barra de cor à esquerda marca o não lido, mesmo
                                        // padrão usado nos slots do calendário mobile — não
                                        // depende só do tom de fundo, que era sutil demais
                                        // (bg-card vs bg-muted/50) para notar de relance.
                                        className={`rounded-md border-l-2 p-2 ${lida ? 'border-transparent' : 'border-primary bg-primary/5'}`}
                                    >
                                        <p className={`text-sm ${lida ? 'text-muted-foreground font-normal' : 'font-medium'}`}>
                                            {notification.data.titulo}
                                        </p>
                                        <p className="text-muted-foreground text-sm">{notification.data.descricao}</p>
                                        <p className="text-muted-foreground mt-1 text-xs">{formatNotificationTime(notification.created_at)}</p>
                                        {notification.data.url && (
                                            <a href={notification.data.url} className="text-info-accent mt-1 block text-xs hover:underline">
                                                Ver detalhes
                                            </a>
                                        )}
                                    </div>
                                );
                            })
                        )}
                    </div>
                </ScrollArea>
            </PopoverContent>
        </Popover>
    );
}
