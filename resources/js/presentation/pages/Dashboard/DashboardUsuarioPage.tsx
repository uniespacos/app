import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import TabsItemEspacosFavoritos from '@/presentation/molecules/TabsItemEspacosFavoritos';
import TabsItemReserva from '@/presentation/molecules/TabsItemReserva';
import AppLayout from '@/presentation/templates/AppLayout';
import { Espaco, Reserva, User, type BreadcrumbItem } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import { AlertCircle, ArrowRight, CalendarPlus, CheckCircle2, Clock, ListChecks, Sparkles, Star, XCircle } from 'lucide-react';
import { useMemo, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Painel Inicial',
        href: '/dashboard',
    },
];

interface DashboardUsuarioProps {
    user?: User;
    espacosFavoritos?: Espaco[];
    statusDasReservas?: {
        em_analise: number;
        parcialmente_deferida: number;
        deferida: number;
        indeferida: number;
    };
    reservas?: Reserva[];
}

export default function DashboardUsuarioPage(props: DashboardUsuarioProps) {
    const pageProps = usePage<{
        user: User;
        espacosFavoritos?: Espaco[];
        statusDasReservas?: {
            em_analise: number;
            parcialmente_deferida: number;
            deferida: number;
            indeferida: number;
        };
        reservas?: Reserva[];
    }>().props;

    const user = props.user ?? pageProps.user;
    const rawFavoritos = props.espacosFavoritos ?? pageProps.espacosFavoritos;
    const espacosFavoritos = useMemo(() => rawFavoritos ?? [], [rawFavoritos]);

    const statusDasReservas = props.statusDasReservas ??
        pageProps.statusDasReservas ?? {
            em_analise: 0,
            parcialmente_deferida: 0,
            deferida: 0,
            indeferida: 0,
        };
    const reservas = props.reservas ?? pageProps.reservas ?? [];

    const [searchTermFavoritos, setSearchTermFavoritos] = useState('');

    const filteredEspacosFavoritos = useMemo(() => {
        if (!searchTermFavoritos.trim()) return espacosFavoritos;
        const term = searchTermFavoritos.toLowerCase();
        return espacosFavoritos.filter(
            (espaco) =>
                espaco.nome.toLowerCase().includes(term) ||
                (espaco.andar?.nome.toLowerCase().includes(term) ?? false) ||
                (espaco.andar?.modulo?.nome.toLowerCase().includes(term) ?? false),
        );
    }, [espacosFavoritos, searchTermFavoritos]);

    const kpiCards = [
        {
            title: 'Em Análise',
            value: statusDasReservas.em_analise,
            description: 'Aguardando avaliação do gestor',
            icon: Clock,
            iconBg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
        },
        {
            title: 'Deferidas',
            value: statusDasReservas.deferida,
            description: 'Aprovadas para utilização',
            icon: CheckCircle2,
            iconBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
        },
        {
            title: 'Parciais',
            value: statusDasReservas.parcialmente_deferida,
            description: 'Com horários aprovados',
            icon: AlertCircle,
            iconBg: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
        },
        {
            title: 'Indeferidas',
            value: statusDasReservas.indeferida,
            description: 'Recusadas ou indisponíveis',
            icon: XCircle,
            iconBg: 'bg-rose-500/10 text-rose-600 dark:text-rose-400',
        },
    ];

    const atalhosSecundarios = [
        {
            label: 'Minhas Reservas',
            descricao: 'Acompanhe o andamento das suas solicitações',
            Icone: ListChecks,
            href: route('reservas.index'),
        },
        {
            label: 'Espaços Favoritos',
            descricao: 'Acesse rapidamente os espaços salvos',
            Icone: Star,
            href: route('espacos.favoritos'),
        },
    ] as const;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-4 sm:p-6">
                {/* Banner de Boas-Vindas com Gradiente Catppuccin */}
                <div className="border-border/70 from-primary/15 via-primary/5 to-card relative overflow-hidden rounded-2xl border bg-gradient-to-br p-6 shadow-xs sm:p-8">
                    <div className="relative z-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                        <div className="space-y-2">
                            <div className="inline-flex items-center gap-2">
                                <Badge variant="secondary" className="bg-background/80 text-xs font-medium backdrop-blur-xs">
                                    <Sparkles className="text-primary mr-1 h-3 w-3" />
                                    Painel do Solicitante
                                </Badge>
                            </div>
                            <h1 className="text-foreground text-2xl font-bold tracking-tight sm:text-3xl">Olá, {user.name}!</h1>
                            <p className="text-muted-foreground max-w-xl text-sm sm:text-base">
                                {user.setor
                                    ? `${user.setor.nome} (${user.setor.sigla}) • Bem-vindo ao UniEspaços`
                                    : 'Bem-vindo ao UniEspaços! Consulte a disponibilidade e reserve espaços com facilidade.'}
                            </p>
                        </div>
                        <div className="flex flex-col gap-2.5 sm:flex-row">
                            <Button
                                size="lg"
                                onClick={() => {
                                    router.get(route('espacos.index'));
                                }}
                                className="shadow-md transition-all hover:scale-[1.02] active:scale-[0.98]"
                            >
                                <CalendarPlus className="mr-2 h-5 w-5" />
                                Reservar um Espaço
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Grid de Indicadores de KPIs (Shadcn UI Blocks) */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {kpiCards.map((kpi) => {
                        const Icon = kpi.icon;
                        return (
                            <Card
                                key={kpi.title}
                                className="border-border/70 bg-card hover:border-primary/40 transition-all duration-200 hover:shadow-xs"
                            >
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 p-5 pb-2">
                                    <CardTitle className="text-muted-foreground text-sm font-medium">{kpi.title}</CardTitle>
                                    <div className={`rounded-xl p-2.5 ${kpi.iconBg}`}>
                                        <Icon className="h-4 w-4" />
                                    </div>
                                </CardHeader>
                                <CardContent className="px-5 pt-0 pb-5">
                                    <div className="text-foreground text-3xl font-bold tracking-tight">{kpi.value}</div>
                                    <p className="text-muted-foreground mt-1 text-xs">{kpi.description}</p>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>

                {/* Atalhos Rápidos */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {atalhosSecundarios.map(({ label, descricao, Icone, href }) => (
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
                            className="border-border/70 group hover:border-primary/50 cursor-pointer transition-all duration-200 hover:shadow-sm"
                        >
                            <CardContent className="flex items-center justify-between p-5">
                                <div className="flex items-center gap-4">
                                    <div className="bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground rounded-xl p-3 transition-colors">
                                        <Icone className="h-5 w-5" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-foreground text-sm font-semibold sm:text-base">{label}</p>
                                        <p className="text-muted-foreground truncate text-xs">{descricao}</p>
                                    </div>
                                </div>
                                <ArrowRight className="text-muted-foreground group-hover:text-primary h-4 w-4 shrink-0 transition-transform group-hover:translate-x-0.5" />
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Seção com Abas de Reservas Recentes e Favoritos */}
                {(reservas.length > 0 || espacosFavoritos.length > 0) && (
                    <Tabs defaultValue="reservas" className="w-full space-y-4">
                        <TabsList className="grid w-full grid-cols-2 sm:w-[400px]">
                            <TabsTrigger value="reservas">
                                <ListChecks className="mr-2 h-4 w-4" />
                                Reservas Recentes
                            </TabsTrigger>
                            <TabsTrigger value="favoritos">
                                <Star className="mr-2 h-4 w-4" />
                                Espaços Favoritos ({String(espacosFavoritos.length)})
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="reservas" className="mt-0">
                            {reservas.length > 0 ? (
                                <TabsItemReserva reservas={reservas} />
                            ) : (
                                <Card>
                                    <CardContent className="text-muted-foreground py-12 text-center text-sm">
                                        Você ainda não possui reservas cadastradas.
                                    </CardContent>
                                </Card>
                            )}
                        </TabsContent>

                        <TabsContent value="favoritos" className="mt-0">
                            {espacosFavoritos.length > 0 ? (
                                <TabsItemEspacosFavoritos
                                    user={user}
                                    espacosFiltrados={filteredEspacosFavoritos}
                                    searchTerm={searchTermFavoritos}
                                    setSearchTerm={setSearchTermFavoritos}
                                />
                            ) : (
                                <Card>
                                    <CardContent className="text-muted-foreground py-12 text-center text-sm">
                                        Você ainda não favoritou nenhum espaço.
                                    </CardContent>
                                </Card>
                            )}
                        </TabsContent>
                    </Tabs>
                )}
            </div>
        </AppLayout>
    );
}
