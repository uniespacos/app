import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { PERMISSION_SECAO_RELATORIOS } from '@/constants/permissions';
import { useDadosRelatorio } from '@/hooks/use-dados-relatorio';
import { hasPermission } from '@/lib/auth';
import { SituacaoBadge } from '@/presentation/atoms/SituacaoBadge';
import AppLayout from '@/presentation/templates/AppLayout';
import { Agenda, Espaco, Reserva, User, type BreadcrumbItem } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import { format, subDays } from 'date-fns';
import { ArrowRight, BarChart3, Building2, CalendarSearch, CheckCircle2, Clock, Eye, ShieldCheck, Star } from 'lucide-react';
import { lazy, Suspense, useMemo } from 'react';

const GraficoReservasPeriodo = lazy(() => import('@/presentation/organisms/GraficoReservasPeriodo'));

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Painel Inicial',
        href: '/dashboard',
    },
];

interface DashboardGestorProps {
    user?: User;
    espacos?: Espaco[];
    reservasPendentes?: Reserva[];
    statusDasReservas?: {
        pendentes: number;
        avaliadas_hoje: number;
        total_espacos: number;
    };
    agendas?: Agenda[];
    espacosFavoritos?: Espaco[];
    reservas?: Reserva[];
}

export default function DashboardGestorPage(props: DashboardGestorProps) {
    const pageProps = usePage<{
        auth: { user: User };
        user?: User;
        espacos?: Espaco[];
        reservasPendentes?: Reserva[];
        statusDasReservas?: {
            pendentes: number;
            avaliadas_hoje: number;
            total_espacos: number;
        };
        agendas?: Agenda[];
        espacosFavoritos?: Espaco[];
        reservas?: Reserva[];
    }>().props;

    const user = props.user ?? pageProps.user ?? pageProps.auth.user;
    const authUser = pageProps.auth.user;
    const reservasPendentes = props.reservasPendentes ?? pageProps.reservasPendentes ?? [];
    const statusDasReservas = props.statusDasReservas ??
        pageProps.statusDasReservas ?? {
            pendentes: 0,
            avaliadas_hoje: 0,
            total_espacos: 0,
        };

    const podeVerRelatorios = hasPermission(authUser, PERMISSION_SECAO_RELATORIOS);

    const filtrosPeriodo = useMemo(
        () => ({
            data_inicio: format(subDays(new Date(), 30), 'yyyy-MM-dd'),
            data_fim: format(new Date(), 'yyyy-MM-dd'),
        }),
        [],
    );

    const { dados, status } = useDadosRelatorio(route('gestor.relatorios.dados'), podeVerRelatorios ? 'reservas_periodo' : undefined, filtrosPeriodo);

    const atalhos: {
        label: string;
        descricao: string;
        Icone: typeof Eye;
        href: string;
        badge?: string;
        highlight?: boolean;
    }[] = [
        {
            label: 'Gerir Reservas',
            descricao: 'Avalie as solicitações e horários pendentes',
            Icone: Eye,
            href: route('gestor.reservas.index'),
            badge: statusDasReservas.pendentes > 0 ? `${String(statusDasReservas.pendentes)} pendentes` : undefined,
            highlight: statusDasReservas.pendentes > 0,
        },
        {
            label: 'Consultar Espaços',
            descricao: 'Veja a disponibilidade e faça reservas',
            Icone: CalendarSearch,
            href: route('espacos.index'),
        },
        {
            label: 'Espaços Favoritos',
            descricao: 'Acesso rápido aos espaços marcados',
            Icone: Star,
            href: route('espacos.favoritos'),
        },
    ];

    const kpiCards = [
        {
            title: 'Solicitações Pendentes',
            value: statusDasReservas.pendentes,
            description: 'Aguardando avaliação do gestor',
            icon: Clock,
            iconBg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
            badge: statusDasReservas.pendentes > 0 ? 'Ação necessária' : undefined,
            badgeVariant: 'destructive' as const,
        },
        {
            title: 'Avaliadas Hoje',
            value: statusDasReservas.avaliadas_hoje,
            description: 'Decisões registradas no dia de hoje',
            icon: CheckCircle2,
            iconBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
        },
        {
            title: 'Espaços sob Gestão',
            value: statusDasReservas.total_espacos,
            description: 'Espaços vinculados à sua agenda',
            icon: Building2,
            iconBg: 'bg-primary/10 text-primary',
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-4 sm:p-6">
                {/* Banner de Boas-Vindas com Gradiente Catppuccin */}
                <div className="border-border/70 from-primary/15 via-primary/5 to-card relative overflow-hidden rounded-2xl border bg-gradient-to-br p-6 shadow-xs sm:p-8">
                    <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="space-y-2">
                            <div className="inline-flex items-center gap-2">
                                <Badge variant="secondary" className="bg-background/80 text-xs font-medium backdrop-blur-xs">
                                    <ShieldCheck className="text-primary mr-1 h-3 w-3" />
                                    Painel do Gestor de Espaços
                                </Badge>
                            </div>
                            <h1 className="text-foreground text-2xl font-bold tracking-tight sm:text-3xl">Olá, {user.name}!</h1>
                            <p className="text-muted-foreground max-w-xl text-sm sm:text-base">
                                Gerencie as solicitações de reserva e acompanhe os indicadores dos espaços sob sua responsabilidade.
                            </p>
                        </div>
                        {statusDasReservas.pendentes > 0 && (
                            <Button
                                size="lg"
                                onClick={() => {
                                    router.get(route('gestor.reservas.index'));
                                }}
                                className="shadow-md transition-all hover:scale-[1.02] active:scale-[0.98]"
                            >
                                <Eye className="mr-2 h-5 w-5" />
                                Avaliar {String(statusDasReservas.pendentes)} {statusDasReservas.pendentes === 1 ? 'pendência' : 'pendências'}
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        )}
                    </div>
                </div>

                {/* Grid de Indicadores de Gestão (Shadcn UI Blocks) */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    {kpiCards.map((kpi) => {
                        const Icon = kpi.icon;
                        return (
                            <Card
                                key={kpi.title}
                                className="border-border/70 bg-card hover:border-primary/40 transition-all duration-200 hover:shadow-xs"
                            >
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 p-5 pb-2">
                                    <div className="space-y-1">
                                        <CardTitle className="text-muted-foreground text-sm font-medium">{kpi.title}</CardTitle>
                                    </div>
                                    <div className={`rounded-xl p-2.5 ${kpi.iconBg}`}>
                                        <Icon className="h-4 w-4" />
                                    </div>
                                </CardHeader>
                                <CardContent className="px-5 pt-0 pb-5">
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-foreground text-3xl font-bold tracking-tight">{kpi.value}</span>
                                        {kpi.badge && (
                                            <Badge variant={kpi.badgeVariant} className="text-xs">
                                                {kpi.badge}
                                            </Badge>
                                        )}
                                    </div>
                                    <p className="text-muted-foreground mt-1 text-xs">{kpi.description}</p>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>

                {/* Atalhos Rápidos */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    {atalhos.map(({ label, descricao, Icone, href, badge, highlight }) => (
                        <Card
                            key={label}
                            role="button"
                            tabIndex={0}
                            onClick={() => {
                                router.get(href);
                            }}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    router.get(href);
                                }
                            }}
                            className={`border-border/70 group cursor-pointer transition-all duration-200 hover:shadow-sm ${
                                highlight ? 'hover:border-primary/60 border-primary/30 bg-primary/5' : 'hover:border-primary/50'
                            }`}
                        >
                            <CardContent className="flex items-center justify-between p-5">
                                <div className="flex items-center gap-4">
                                    <div className="bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground rounded-xl p-3 transition-colors">
                                        <Icone className="h-5 w-5" />
                                    </div>
                                    <div className="min-w-0">
                                        <div className="flex items-center gap-2">
                                            <p className="text-foreground text-sm font-semibold sm:text-base">{label}</p>
                                            {badge && (
                                                <Badge variant="secondary" className="bg-primary/15 text-primary text-xs font-semibold">
                                                    {badge}
                                                </Badge>
                                            )}
                                        </div>
                                        <p className="text-muted-foreground truncate text-xs">{descricao}</p>
                                    </div>
                                </div>
                                <ArrowRight className="text-muted-foreground group-hover:text-primary h-4 w-4 shrink-0 transition-transform group-hover:translate-x-0.5" />
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Solicitações Prioritárias Pendentes */}
                {reservasPendentes.length > 0 && (
                    <Card className="border-border/70">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 p-5">
                            <div>
                                <CardTitle className="text-base font-semibold">Solicitações Pendentes de Avaliação</CardTitle>
                                <CardDescription className="text-xs">Reservas que aguardam seu deferimento ou indeferimento</CardDescription>
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                    router.get(route('gestor.reservas.index'));
                                }}
                                className="text-primary hover:text-primary"
                            >
                                Ver todas ({String(statusDasReservas.pendentes)})
                                <ArrowRight className="ml-1.5 h-4 w-4" />
                            </Button>
                        </CardHeader>
                        <CardContent className="px-5 pt-0 pb-5">
                            <div className="divide-border/60 divide-y">
                                {reservasPendentes.map((reserva) => (
                                    <div
                                        key={reserva.id}
                                        className="flex flex-col gap-2 py-3.5 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between"
                                    >
                                        <div className="min-w-0 space-y-1">
                                            <p className="text-foreground truncate text-sm font-medium">{reserva.titulo}</p>
                                            <p className="text-muted-foreground text-xs">
                                                Solicitante: {reserva.user?.name ?? 'Usuário'}{' '}
                                                {reserva.user?.setor ? `• ${reserva.user.setor.nome}` : ''}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <SituacaoBadge situacao={reserva.situacao} />
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => {
                                                    router.get(route('gestor.reservas.index', { reserva: reserva.id }));
                                                }}
                                                className="h-8 text-xs"
                                            >
                                                Avaliar
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Visão Geral com Gráfico Carregado Sob Demanda */}
                {podeVerRelatorios && (
                    <Card className="border-border/70">
                        <CardHeader className="flex flex-row items-start justify-between gap-2 space-y-0 p-5">
                            <div>
                                <CardTitle className="text-base font-semibold">Visão Geral das Reservas</CardTitle>
                                <CardDescription className="text-xs">Distribuição nos últimos 30 dias</CardDescription>
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                    router.get(route('gestor.relatorios.index'));
                                }}
                            >
                                <BarChart3 className="mr-2 h-4 w-4" />
                                Relatório completo
                            </Button>
                        </CardHeader>
                        <CardContent className="px-5 pt-0 pb-5">
                            {status === 'loading' && <Skeleton className="h-[260px] w-full rounded-xl" />}
                            {status === 'error' && (
                                <Alert variant="destructive">
                                    <AlertDescription>Não foi possível carregar os dados do período.</AlertDescription>
                                </Alert>
                            )}
                            {status === 'empty' && (
                                <p className="text-muted-foreground py-10 text-center text-sm">Nenhuma reserva registrada nos últimos 30 dias.</p>
                            )}
                            {status === 'success' && dados && (
                                <Suspense fallback={<Skeleton className="h-[260px] w-full rounded-xl" />}>
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
