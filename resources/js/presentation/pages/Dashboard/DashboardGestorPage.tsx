import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { PERMISSION_SECAO_RELATORIOS } from '@/constants/permissions';
import { hasPermission } from '@/lib/auth';
import AppLayout from '@/presentation/templates/app-layout';
import { Agenda, Espaco, Reserva, User, type BreadcrumbItem } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import { format, subDays } from 'date-fns';
import { BarChart3, CalendarSearch, Eye, Star } from 'lucide-react';
import { lazy, Suspense, useMemo } from 'react';
import { useDadosRelatorio } from '@/hooks/use-dados-relatorio';

const GraficoReservasPeriodo = lazy(() => import('@/presentation/molecules/GraficoReservasPeriodo'));

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Painel Inicial',
        href: '/dashboard',
    },
];

export default function Dashboard({
    user,
}: {
    user: User;
    espacos: Espaco[];
    reservasPendentes: Reserva[];
    statusDasReservas: {
        pendentes: number;
        avaliadas_hoje: number;
        total_espacos: number;
    };
    agendas: Agenda[];
    espacosFavoritos: Espaco[];
    reservas: Reserva[];
}) {
    // Últimos 30 dias, fixo — esta é a prévia do painel, não o relatório
    // completo. Quem quiser outro período ou exportar vai para /gestor/relatorios.
    const filtrosPeriodo = useMemo(
        () => ({
            data_inicio: format(subDays(new Date(), 30), 'yyyy-MM-dd'),
            data_fim: format(new Date(), 'yyyy-MM-dd'),
        }),
        [],
    );
    // `user` (prop da página) vem direto do Eloquent, sem `.permissions` —
    // quem carrega esse array é o `auth.user` compartilhado (mesma fonte que
    // o AppSidebar usa para decidir se mostra o item "Relatórios" no menu).
    const authUser = usePage<{ auth: { user: User } }>().props.auth.user;
    const podeVerRelatorios = hasPermission(authUser, PERMISSION_SECAO_RELATORIOS);
    const { dados, status } = useDadosRelatorio(
        route('gestor.relatorios.dados'),
        podeVerRelatorios ? 'reservas_periodo' : undefined,
        filtrosPeriodo,
    );

    const atalhos = [
        { label: 'Gerir Reservas', descricao: 'Avalie as solicitações pendentes', Icone: Eye, href: route('gestor.reservas.index') },
        { label: 'Consultar Espaços', descricao: 'Veja a disponibilidade e reserve', Icone: CalendarSearch, href: route('espacos.index') },
        { label: 'Espaços Favoritos', descricao: 'Acesso rápido aos que você marcou', Icone: Star, href: route('espacos.favoritos') },
    ] as const;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Painel do Gestor</h1>
                    <p className="text-muted-foreground">Olá, {user.name} - Gerencie as reservas dos seus espaços</p>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    {atalhos.map(({ label, descricao, Icone, href }) => (
                        <Card
                            key={label}
                            role="button"
                            tabIndex={0}
                            onClick={() => router.get(href)}
                            onKeyDown={(e) => e.key === 'Enter' && router.get(href)}
                            className="hover:border-primary/40 cursor-pointer transition-colors hover:shadow-sm"
                        >
                            <CardContent className="flex items-center gap-3 p-4">
                                <div className="bg-primary/10 text-primary rounded-full p-2">
                                    <Icone className="h-5 w-5" />
                                </div>
                                <div className="min-w-0">
                                    <p className="truncate font-medium">{label}</p>
                                    <p className="text-muted-foreground truncate text-xs">{descricao}</p>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {podeVerRelatorios && (
                    <Card>
                        <CardHeader className="flex flex-row items-start justify-between gap-2 space-y-0">
                            <div>
                                <CardTitle>Visão Geral das Reservas</CardTitle>
                                <CardDescription>Últimos 30 dias</CardDescription>
                            </div>
                            <Button variant="outline" size="sm" onClick={() => router.get(route('gestor.relatorios.index'))}>
                                <BarChart3 className="mr-2 h-4 w-4" />
                                Relatório completo
                            </Button>
                        </CardHeader>
                        <CardContent>
                            {status === 'loading' && <Skeleton className="h-[260px] w-full" />}
                            {status === 'error' && (
                                <Alert variant="destructive">
                                    <AlertDescription>Não foi possível carregar os dados do período.</AlertDescription>
                                </Alert>
                            )}
                            {status === 'empty' && (
                                <p className="text-muted-foreground py-8 text-center text-sm">Nenhuma reserva nos últimos 30 dias.</p>
                            )}
                            {status === 'success' && dados && (
                                <Suspense fallback={<Skeleton className="h-[260px] w-full" />}>
                                    <GraficoReservasPeriodo dados={dados} />
                                </Suspense>
                            )}
                        </CardContent>
                    </Card>
                )}
            </div>
        </AppLayout>
    );
}
