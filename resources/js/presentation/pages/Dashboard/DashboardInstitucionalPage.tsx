import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getTurnoText } from '@/lib/utils';
import TabsItemEspacosFavoritos from '@/presentation/molecules/TabsItemEspacosFavoritos';
import TabsItemReserva from '@/presentation/molecules/TabsItemReserva';
import AppLayout from '@/presentation/templates/AppLayout';
import { Espaco, Reserva, Unidade, User, type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { ArrowRight, Building2, Calendar, CalendarDays, Globe, Layers, ListChecks, Plus, Star, UserCheck, Users } from 'lucide-react';
import { useMemo, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Painel Inicial',
        href: '/dashboard',
    },
];

interface DashboardInstitucionalProps {
    user: User;
    users?: User[];
    estatisticasPainel: {
        total_espacos: number;
        total_gestores: number;
        reservas_mes: number;
    };
    espacos: Espaco[];
    gestores: User[];
    unidades: Unidade[];
    espacosFavoritos: Espaco[];
    reservas: Reserva[];
}

export default function DashboardInstitucionalPage({
    estatisticasPainel,
    espacos,
    user,
    gestores,
    unidades,
    espacosFavoritos,
    reservas,
}: DashboardInstitucionalProps) {
    const [searchTerm, setSearchTerm] = useState<string>('');

    const filteredEspacosFavoritos = useMemo(() => {
        if (!searchTerm.trim()) return espacosFavoritos;
        const lowerSearchTerm = searchTerm.toLowerCase();
        return espacosFavoritos.filter(
            (espaco) =>
                espaco.nome.toLowerCase().includes(lowerSearchTerm) ||
                espaco.andar?.nome.toLowerCase().includes(lowerSearchTerm) ||
                espaco.andar?.modulo?.nome.toLowerCase().includes(lowerSearchTerm),
        );
    }, [espacosFavoritos, searchTerm]);

    const kpiCards = [
        {
            title: 'Total de Espaços',
            value: estatisticasPainel.total_espacos,
            description: 'Espaços cadastrados no sistema',
            icon: Building2,
            iconBg: 'bg-primary/10 text-primary',
        },
        {
            title: 'Gestores Ativos',
            value: estatisticasPainel.total_gestores,
            description: 'Com delegações atribuídas',
            icon: Users,
            iconBg: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400',
        },
        {
            title: 'Reservas do Mês',
            value: estatisticasPainel.reservas_mes,
            description: 'Solicitações no mês corrente',
            icon: CalendarDays,
            iconBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
        },
        {
            title: 'Unidades Integradas',
            value: unidades.length,
            description: 'Campi e módulos operacionais',
            icon: Layers,
            iconBg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-4 sm:p-6">
                {/* Banner Institucional com Gradiente Catppuccin */}
                <div className="border-border/70 from-primary/15 via-primary/5 to-card relative overflow-hidden rounded-2xl border bg-gradient-to-br p-6 shadow-xs sm:p-8">
                    <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="space-y-2">
                            <div className="inline-flex items-center gap-2">
                                <Badge variant="secondary" className="bg-background/80 text-xs font-medium backdrop-blur-xs">
                                    <Globe className="text-primary mr-1 h-3 w-3" />
                                    Painel da Gestão Institucional
                                </Badge>
                            </div>
                            <h1 className="text-foreground text-2xl font-bold tracking-tight sm:text-3xl">Olá, {user.name}!</h1>
                            <p className="text-muted-foreground max-w-xl text-sm sm:text-base">
                                Visão macro de todos os espaços, gestores cadastrados, unidades e volume de reservas da UESB.
                            </p>
                        </div>
                        <Button
                            size="lg"
                            onClick={() => {
                                router.get(route('institucional.espacos.create'));
                            }}
                            className="shadow-md transition-all hover:scale-[1.02] active:scale-[0.98]"
                        >
                            <Plus className="mr-2 h-5 w-5" />
                            Cadastrar Espaço
                        </Button>
                    </div>
                </div>

                {/* Grid de KPIs Institucionais (Shadcn UI Blocks) */}
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

                {/* Abas com Conteúdo Detalhado */}
                <Tabs defaultValue="geral" className="w-full space-y-4">
                    <TabsList className="flex h-auto w-full flex-wrap justify-start gap-1 p-1 sm:w-auto">
                        <TabsTrigger value="geral" className="gap-2">
                            <ListChecks className="h-4 w-4" />
                            Visão Geral
                        </TabsTrigger>
                        <TabsTrigger value="espacos" className="gap-2">
                            <Building2 className="h-4 w-4" />
                            Espaços Recentes ({espacos.length})
                        </TabsTrigger>
                        <TabsTrigger value="gestores" className="gap-2">
                            <Users className="h-4 w-4" />
                            Gestores ({gestores.length})
                        </TabsTrigger>
                        <TabsTrigger value="favoritos" className="gap-2">
                            <Star className="h-4 w-4" />
                            Favoritos ({espacosFavoritos.length})
                        </TabsTrigger>
                    </TabsList>

                    {/* Aba Geral */}
                    <TabsContent value="geral" className="mt-0 space-y-6">
                        {reservas.length > 0 ? (
                            <TabsItemReserva reservas={reservas} />
                        ) : (
                            <Card className="border-border/70">
                                <CardContent className="text-muted-foreground py-12 text-center text-sm">
                                    Nenhuma reserva registrada recentemente.
                                </CardContent>
                            </Card>
                        )}
                    </TabsContent>

                    {/* Aba Espaços */}
                    <TabsContent value="espacos" className="mt-0 space-y-4">
                        <Card className="border-border/70">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 p-5">
                                <div>
                                    <CardTitle className="text-base font-semibold">Espaços Cadastrados Recentemente</CardTitle>
                                    <CardDescription className="text-xs">Distribuição de gestores e turnos por espaço</CardDescription>
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                        router.get(route('institucional.espacos.index'));
                                    }}
                                >
                                    Gerenciar Espaços
                                    <ArrowRight className="ml-1.5 h-4 w-4" />
                                </Button>
                            </CardHeader>
                            <CardContent className="px-5 pt-0 pb-5">
                                <div className="divide-border/60 divide-y">
                                    {espacos.map((espaco) => (
                                        <div key={espaco.id} className="space-y-2 py-4 first:pt-0 last:pb-0">
                                            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                                                <h4 className="text-foreground text-sm font-semibold">{espaco.nome}</h4>
                                                <span className="text-muted-foreground text-xs">
                                                    {espaco.andar?.modulo?.unidade?.nome ?? 'UESB'} • {espaco.andar?.modulo?.nome} •{' '}
                                                    {espaco.capacidade_pessoas} lugares
                                                </span>
                                            </div>
                                            <div className="flex flex-wrap items-center gap-2 pt-1">
                                                <span className="text-muted-foreground text-xs font-medium">Turnos:</span>
                                                {espaco.agendas && espaco.agendas.length > 0 ? (
                                                    espaco.agendas.map((agenda) => (
                                                        <div
                                                            key={agenda.id}
                                                            className="border-border/70 inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-xs"
                                                        >
                                                            <Badge variant="secondary" className="px-1.5 py-0 text-[10px]">
                                                                {getTurnoText(agenda.turno)}
                                                            </Badge>
                                                            <span className="text-muted-foreground">{agenda.user?.name ?? 'Não atribuído'}</span>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <span className="text-muted-foreground text-xs italic">Nenhuma agenda configurada</span>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Aba Gestores */}
                    <TabsContent value="gestores" className="mt-0 space-y-4">
                        <Card className="border-border/70">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 p-5">
                                <div>
                                    <CardTitle className="text-base font-semibold">Gestores de Espaços</CardTitle>
                                    <CardDescription className="text-xs">Usuários com permissões de gestão e delegação de horários</CardDescription>
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                        router.get(route('institucional.usuarios.index'));
                                    }}
                                >
                                    Gerenciar Usuários
                                    <ArrowRight className="ml-1.5 h-4 w-4" />
                                </Button>
                            </CardHeader>
                            <CardContent className="px-5 pt-0 pb-5">
                                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                    {gestores.map((gestor) => (
                                        <Card key={gestor.id} className="border-border/70 bg-card/60">
                                            <CardContent className="space-y-3 p-4">
                                                <div className="space-y-1">
                                                    <div className="flex items-center justify-between">
                                                        <h4 className="truncate text-sm font-semibold">{gestor.name}</h4>
                                                        <Badge variant="secondary" className="text-[10px]">
                                                            <UserCheck className="mr-1 h-3 w-3" />
                                                            Gestor
                                                        </Badge>
                                                    </div>
                                                    <p className="text-muted-foreground truncate text-xs">{gestor.email}</p>
                                                    <p className="text-muted-foreground truncate text-[11px]">
                                                        {gestor.setor?.nome ?? 'Sem setor vinculado'}
                                                    </p>
                                                </div>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="h-8 w-full text-xs"
                                                    onClick={() => {
                                                        router.get(route('institucional.usuarios.index'));
                                                    }}
                                                >
                                                    <Calendar className="mr-1.5 h-3.5 w-3.5" />
                                                    Ver Delegações
                                                </Button>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Aba Favoritos */}
                    <TabsContent value="favoritos" className="mt-0">
                        {espacosFavoritos.length > 0 ? (
                            <TabsItemEspacosFavoritos
                                user={user}
                                espacosFiltrados={filteredEspacosFavoritos}
                                searchTerm={searchTerm}
                                setSearchTerm={setSearchTerm}
                            />
                        ) : (
                            <Card className="border-border/70">
                                <CardContent className="text-muted-foreground py-12 text-center text-sm">
                                    Nenhum espaço marcado como favorito.
                                </CardContent>
                            </Card>
                        )}
                    </TabsContent>
                </Tabs>
            </div>
        </AppLayout>
    );
}
