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
import { BarChart3, CalendarSearch, CheckCircle, Clock, Eye, Star, Users } from 'lucide-react';
import { lazy, Suspense, useMemo } from 'react';
import { SituacaoBadge } from '@/presentation/atoms/SituacaoBadge';
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
    reservasPendentes,
    statusDasReservas,
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

    const statCards: Array<{ label: string; valor: number; descricao: string; Icone: typeof Clock; href?: string }> = [
        {
            label: 'Pendentes',
            valor: statusDasReservas.pendentes,
            descricao: 'Aguardando sua análise',
            Icone: Clock,
            href: route('gestor.reservas.index', { situacao: 'em_analise' }),
        },
        {
            label: 'Avaliadas Hoje',
            valor: statusDasReservas.avaliadas_hoje,
            descricao: 'Reservas avaliadas hoje',
            Icone: CheckCircle,
        },
        {
            label: 'Espaços Gerenciados',
            valor: statusDasReservas.total_espacos,
            descricao: 'Sob sua responsabilidade',
            Icone: Users,
        },
    ];

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
                    <h1 className="text-2xl font-bold sm:text-3xl">Painel do Gestor</h1>
                    <p className="text-muted-foreground">Olá, {user.name} - Gerencie as reservas dos seus espaços</p>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    {statCards.map(({ label, valor, descricao, Icone, href }) => (
                        <Card
                            key={label}
                            role={href ? 'button' : undefined}
                            tabIndex={href ? 0 : undefined}
                            onClick={href ? () => router.get(href) : undefined}
                            onKeyDown={href ? (e) => e.key === 'Enter' && router.get(href) : undefined}
                            className={href ? 'hover:border-primary/40 cursor-pointer transition-colors hover:shadow-sm' : undefined}
                        >
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">{label}</CardTitle>
                                <Icone className="text-muted-foreground h-4 w-4" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{valor}</div>
                                <p className="text-muted-foreground text-xs">{descricao}</p>
                            </CardContent>
                        </Card>
                    ))}
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

                {/* Fila de aprovação: diferente do painel comum, aqui a lista
                    fica sempre visível — é o motivo do gestor abrir esta tela. */}
                <Card>
                    <CardHeader>
                        <CardTitle>Reservas Aguardando Análise</CardTitle>
                        <CardDescription>Avalie as solicitações de reserva dos seus espaços</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {reservasPendentes.length === 0 ? (
                            <p className="text-muted-foreground py-8 text-center text-sm">Nenhuma reserva pendente no momento.</p>
                        ) : (
                            <div className="space-y-4">
                                {reservasPendentes.slice(0, 5).map((reserva) => (
                                    <div
                                        key={reserva.id}
                                        className="flex flex-col gap-3 rounded-lg border p-4 sm:flex-row sm:items-start sm:justify-between"
                                    >
                                        <div className="min-w-0 space-y-1">
                                            <h4 className="truncate font-medium">{reserva.titulo}</h4>
                                            <p className="text-muted-foreground truncate text-sm">{reserva.descricao}</p>
                                            <p className="text-muted-foreground text-xs">
                                                Solicitante: {reserva.user?.name} ({reserva.user?.setor?.nome})
                                            </p>
                                        </div>
                                        <div className="flex items-center justify-between gap-3 sm:flex-col sm:items-end sm:justify-start">
                                            <SituacaoBadge situacao={reserva.situacao} />
                                            <Button
                                                size="sm"
                                                onClick={() => router.get(route('gestor.reservas.show', reserva.id))}
                                                className="sm:mt-5"
                                            >
                                                <CheckCircle className="mr-1 h-4 w-4" />
                                                Avaliar
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                                {reservasPendentes.length > 5 && (
                                    <div className="text-center">
                                        <Button variant="link" size="sm" onClick={() => router.get(route('gestor.reservas.index'))}>
                                            Ver todas as {reservasPendentes.length} pendentes
                                        </Button>
                                    </div>
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>

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
