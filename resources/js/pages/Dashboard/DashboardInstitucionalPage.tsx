import TabsItemEspacosFavoritos from '@/components/tabs-item-espacos-favoritos';
import TabsItemReserva from '@/components/tabs-item-reserva';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AppLayout from '@/layouts/app-layout';
import { Espaco, Reserva, Unidade, User, type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { BarChart3, Building, Calendar, Plus, Settings, UserCheck, Users } from 'lucide-react';
import { useEffect, useState } from 'react';
const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Painel Inicial',
        href: '/dashboard',
    },
];

export default function Dashboard({ estatisticasPainel, espacos, user, gestores, unidades, espacosFavoritos, reservas }: {
    user: User;
    users: User[];
    estatisticasPainel: {
        total_espacos: number;
        total_gestores: number;
        reservas_mes: number;
    }; espacos: Espaco[]
    gestores: User[];
    unidades: Unidade[]
    espacosFavoritos: Espaco[];
    reservas: Reserva[];
}) {
    const [filteredEspacosFavoritos, setFilteredEspacosFavoritos] = useState<Espaco[]>(espacosFavoritos);
    const [searchTerm, setSearchTerm] = useState<string>('');
    useEffect(() => {
        if (!searchTerm) {
            setFilteredEspacosFavoritos(espacosFavoritos);
            return;
        }

        const lowerSearchTerm = searchTerm.toLowerCase();
        const filtered = espacosFavoritos.filter((espaco) =>
            espaco.nome.toLowerCase().includes(lowerSearchTerm) ||
            (espaco.andar?.nome?.toLowerCase().includes(lowerSearchTerm) || '') ||
            (espaco.andar?.modulo?.nome?.toLowerCase().includes(lowerSearchTerm) || '')
        );

        setFilteredEspacosFavoritos(filtered);
    }, [espacosFavoritos, searchTerm]);
    const [selectedEspaco, setSelectedEspaco] = useState<any>(null)
    const [selectedGestor, setSelectedGestor] = useState("")
    const [selectedTurno, setSelectedTurno] = useState("")

    const getTurnoLabel = (turno: string) => {
        switch (turno) {
            case "manha":
                return "Manhã"
            case "tarde":
                return "Tarde"
            case "noite":
                return "Noite"
            default:
                return turno
        }
    }

    const handleDelegarGestor = () => {
        // Implementar lógica de delegação
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="space-y-6">
                    {/* Header */}
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div>
                            <h1 className="text-3xl font-bold">Painel Institucional</h1>
                            <p className="text-muted-foreground">Olá, {user.name} bem vindo ao UniEspaços</p>
                        </div>
                        <div className="flex gap-2">
                            <Button onClick={() => router.get(route('institucional.espacos.create'))}>
                                <Plus className="mr-2 h-4 w-4" />
                                Novo Espaço
                            </Button>
                        </div>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total de Espaços</CardTitle>
                                <Building className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{estatisticasPainel.total_espacos}</div>
                                <p className="text-xs text-muted-foreground">Espaços cadastrados</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Gestores Ativos</CardTitle>
                                <Users className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{estatisticasPainel.total_gestores}</div>
                                <p className="text-xs text-muted-foreground">Gestores delegados</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Reservas do Mês</CardTitle>
                                <BarChart3 className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{estatisticasPainel.reservas_mes}</div>
                                <p className="text-xs text-muted-foreground">Total de reservas</p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Main Content */}
                    <Tabs defaultValue="reservas" className="space-y-4">
                        <TabsList>
                            <TabsTrigger value="reservas" > Ultimas 5 reservas solicitadas </TabsTrigger>
                            <TabsTrigger value="favoritos" >Espaços Favoritos </TabsTrigger>
                            <TabsTrigger value="espacos">Gerenciar Espaços</TabsTrigger>
                            <TabsTrigger value="gestores">Delegar Gestores</TabsTrigger>
                            <TabsTrigger value="relatorios">Relatórios</TabsTrigger>
                        </TabsList>

                        <TabsContent value="reservas" className="space-y-4">
                            <TabsItemReserva reservas={reservas} />
                        </TabsContent>

                        <TabsContent value="favoritos" className="space-y-4">
                            <TabsItemEspacosFavoritos espacosFiltrados={filteredEspacosFavoritos} user={user} searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
                        </TabsContent>

                        <TabsContent value="espacos" className="space-y-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Ultimos 5 espaços cadastrados</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {espacos.map((espaco) => (
                                            <div key={espaco.id} className="border rounded-lg p-4">
                                                <div className="flex items-start justify-between mb-4">
                                                    <div className="space-y-1">
                                                        <h4 className="font-medium">{espaco.nome}</h4>
                                                        <p className="text-sm text-muted-foreground">Capacidade: {espaco.capacidade_pessoas} pessoas</p>
                                                        <p className="text-xs text-muted-foreground">
                                                            {espaco.andar?.nome} - {espaco.andar?.modulo?.nome}, {espaco.andar?.modulo?.unidade?.nome}
                                                        </p>
                                                    </div>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => {
                                                            router.get(route('institucional.espacos.index'))
                                                        }}
                                                    >
                                                        <Settings className="mr-1 h-4 w-4" />
                                                        Editar
                                                    </Button>
                                                </div>

                                                <div className="space-y-2">
                                                    <h5 className="text-sm font-medium">Gestores por turno:</h5>
                                                    <div className="flex gap-2 flex-wrap">
                                                        {espaco.agendas?.map((agenda) => (
                                                            <div key={agenda.id} className="flex items-center gap-2">
                                                                <Badge variant="outline">{getTurnoLabel(agenda.turno)}</Badge>
                                                                {agenda.user ? (
                                                                    <span className="text-sm text-muted-foreground">{agenda.user.name}</span>
                                                                ) : (
                                                                    <Button
                                                                        size="sm"
                                                                        variant="ghost"
                                                                        onClick={() => {
                                                                            router.get(route('institucional.espacos.index'))
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
                                                        <p className="text-sm text-muted-foreground">{gestor.email}</p>
                                                        <p className="text-xs text-muted-foreground">{gestor.setor?.nome}</p>
                                                        <Badge variant="secondary">
                                                            <Users className="mr-1 h-3 w-3" />
                                                            Gestor
                                                        </Badge>
                                                    </div>
                                                    <Button size="sm" className="w-full mt-3 bg-transparent" variant="outline" onClick={() => router.get(route('institucional.usuarios.index'))}>
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
                                                        <div key={unidade.id} className="flex justify-between items-center">
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
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-sm">Manhã</span>
                                                        <Badge variant="outline">45%</Badge>
                                                    </div>
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-sm">Tarde</span>
                                                        <Badge variant="outline">35%</Badge>
                                                    </div>
                                                    <div className="flex justify-between items-center">
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
            </div>
        </AppLayout>
    )
}
