import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getTurnoText } from '@/lib/utils';
import TabsItemEspacosFavoritos from '@/presentation/molecules/tabs-item-espacos-favoritos';
import TabsItemReserva from '@/presentation/molecules/tabs-item-reserva';
import AppLayout from '@/presentation/templates/app-layout';
import { Espaco, Reserva, Unidade, User, type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { BarChart3, Building, Calendar, Plus, Settings, UserCheck, Users } from 'lucide-react';
import { useMemo, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Painel Inicial',
        href: '/dashboard',
    },
];

export default function Dashboard({
    estatisticasPainel,
    espacos,
    user,
    gestores,
    unidades,
    espacosFavoritos,
    reservas,
}: {
    user: User;
    users: User[];
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
}) {
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

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Painel Institucional</h1>
                        <p className="text-muted-foreground">Olá, {user.name} - Bem-vindo ao UniEspaços</p>
                    </div>
                    <Button
                        onClick={() => {
                            router.get(route('institucional.espacos.create'));
                        }}
                    >
                        <Plus className="mr-2 h-4 w-4" />
                        Cadastrar Espaço
                    </Button>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total de Espaços</CardTitle>
                            <Building className="text-muted-foreground h-4 w-4" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{estatisticasPainel.total_espacos}</div>
                            <p className="text-muted-foreground text-xs">Espaços cadastrados</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Gestores Ativos</CardTitle>
                            <Users className="text-muted-foreground h-4 w-4" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{estatisticasPainel.total_gestores}</div>
                            <p className="text-muted-foreground text-xs">Com delegações ativas</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Reservas do Mês</CardTitle>
                            <Calendar className="text-muted-foreground h-4 w-4" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{estatisticasPainel.reservas_mes}</div>
                            <p className="text-muted-foreground text-xs">Agendamentos realizados</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Taxa de Ocupação</CardTitle>
                            <BarChart3 className="text-muted-foreground h-4 w-4" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">78%</div>
                            <p className="text-muted-foreground text-xs">Média geral</p>
                        </CardContent>
                    </Card>
                </div>

                <Tabs defaultValue="overview" className="space-y-4">
                    <TabsList>
                        <TabsTrigger value="overview">Visão Geral</TabsTrigger>
                        <TabsTrigger value="espacos">Espaços</TabsTrigger>
                        <TabsTrigger value="gestores">Gestores</TabsTrigger>
                        <TabsTrigger value="relatorios">Relatórios</TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview" className="space-y-4">
                        <TabsItemEspacosFavoritos
                            user={user}
                            espacosFiltrados={filteredEspacosFavoritos}
                            searchTerm={searchTerm}
                            setSearchTerm={setSearchTerm}
                        />
                        <TabsItemReserva reservas={reservas} />
                    </TabsContent>

                    <TabsContent value="espacos" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Gerenciamento de Espaços</CardTitle>
                                <CardDescription>Visualize e gerencie todos os espaços da instituição</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                    {espacos.map((espaco) => (
                                        <div key={espaco.id} className="space-y-3 rounded-lg border p-4">
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <h4 className="font-semibold">{espaco.nome}</h4>
                                                    <p className="text-muted-foreground text-sm">
                                                        {espaco.andar?.modulo?.unidade?.sigla || espaco.andar?.modulo?.unidade?.nome} -{' '}
                                                        {espaco.andar?.modulo?.nome} - {espaco.andar?.nome}
                                                    </p>
                                                    <p className="text-muted-foreground text-xs">Capacidade: {espaco.capacidade_pessoas} pessoas</p>
                                                </div>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="bg-transparent"
                                                    onClick={() => {
                                                        router.get(route('institucional.espacos.index'));
                                                    }}
                                                >
                                                    <Settings className="h-4 w-4" />
                                                </Button>
                                            </div>
                                            <div className="space-y-2">
                                                <h5 className="text-sm font-medium">Gestores por turno:</h5>
                                                <div className="flex flex-wrap gap-2">
                                                    {espaco.agendas?.map((agenda) => (
                                                        <div key={agenda.id} className="flex items-center gap-2">
                                                            <Badge variant="outline">{getTurnoText(agenda.turno)}</Badge>
                                                            {agenda.user ? (
                                                                <span className="text-muted-foreground text-sm">{agenda.user.name}</span>
                                                            ) : (
                                                                <Button
                                                                    size="sm"
                                                                    variant="ghost"
                                                                    onClick={() => {
                                                                        router.get(route('institucional.espacos.index'));
                                                                    }}
                                                                >
                                                                    <UserCheck className="mr-1 h-3 w-3" />
                                                                    Delegar
                                                                </Button>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="gestores" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Gestores Cadastrados</CardTitle>
                                <CardDescription>Visualize todos os gestores e suas delegações</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                    {gestores.map((gestor) => (
                                        <Card key={gestor.id}>
                                            <CardContent className="p-4">
                                                <div className="space-y-2">
                                                    <h4 className="font-medium">{gestor.name}</h4>
                                                    <p className="text-muted-foreground text-sm">{gestor.email}</p>
                                                    <p className="text-muted-foreground text-xs">{gestor.setor?.nome}</p>
                                                    <Badge variant="secondary">
                                                        <Users className="mr-1 h-3 w-3" />
                                                        Gestor
                                                    </Badge>
                                                </div>
                                                <Button
                                                    size="sm"
                                                    className="mt-3 w-full bg-transparent"
                                                    variant="outline"
                                                    onClick={() => {
                                                        router.get(route('institucional.usuarios.index'));
                                                    }}
                                                >
                                                    <Calendar className="mr-2 h-4 w-4" />
                                                    Ver Delegações
                                                </Button>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="relatorios" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Relatórios e Estatísticas</CardTitle>
                                <CardDescription>Visualize dados e métricas do sistema</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid gap-4 md:grid-cols-2">
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="text-lg">Ocupação por Unidade</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="space-y-2">
                                                {unidades.map((unidade) => (
                                                    <div key={unidade.id} className="flex items-center justify-between">
                                                        <span className="text-sm">{unidade.nome}</span>
                                                        <Badge variant="outline">{Math.floor(Math.random() * 40 + 60)}%</Badge>
                                                    </div>
                                                ))}
                                            </div>
                                        </CardContent>
                                    </Card>

                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="text-lg">Reservas por Período</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="space-y-2">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm">Manhã</span>
                                                    <Badge variant="outline">45%</Badge>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm">Tarde</span>
                                                    <Badge variant="outline">35%</Badge>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm">Noite</span>
                                                    <Badge variant="outline">20%</Badge>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </AppLayout>
    );
}
