import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AppLayout from '@/layouts/app-layout';
import { Espaco, Reserva, User, type BreadcrumbItem } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import { FileText, PieChart, Search, Settings, Users } from 'lucide-react';
import { useState } from 'react';
const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Painel Inicial',
        href: '/dashboard',
    },
];

export default function Dashboard() {
    const { users, reservas, espacos } = usePage<{ user: User; users: User[]; reservas: Reserva[]; espacos: Espaco[] }>().props;
    const [institucional] = useState<User[]>(users.filter((u) => u.permission_type_id === 1));
    const [gestores] = useState<User[]>(users.filter((u) => u.permission_type_id === 2));
    const [comum] = useState<User[]>(users.filter((u) => u.permission_type_id === 3));
    const [reservaEsseMes] = useState<Reserva[]>(reservas.filter((r) => new Date(r.data_inicial).getMonth() === new Date().getMonth()));
    const [reservasPendenteAnalise] = useState<Reserva[]>(
        reservas.filter((r) => r.horarios.filter((h) => h.pivot?.situacao === 'em_analise').length > 0),
    );
    // const { user } = props;
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Home" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <Card className="col-span-1 sm:col-span-2 lg:col-span-2">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Usuários e Permissões</CardTitle>
                            <Users className="text-muted-foreground h-4 w-4" />
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                                <div className="space-y-1">
                                    <p className="text-muted-foreground text-xs">Total de Usuários</p>
                                    <p className="text-xl font-bold md:text-2xl">{users.length}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-muted-foreground text-xs">Administradores</p>
                                    <p className="text-xl font-bold md:text-2xl">{institucional.length}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-muted-foreground text-xs">Gestores</p>
                                    <p className="text-xl font-bold md:text-2xl">{gestores.length}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-muted-foreground text-xs">Comum</p>
                                    <p className="text-xl font-bold md:text-2xl">{comum.length}</p>
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter className="flex flex-wrap justify-between gap-2">
                            <Button variant="outline" size="sm" onClick={() => router.get(route('institucional.usuarios.index'))}>
                                Gerenciar usuarios
                            </Button>
                        </CardFooter>
                    </Card>

                    <Card className="col-span-1 sm:col-span-2 lg:col-span-2">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Espaços e Gestores</CardTitle>
                            <Settings className="text-muted-foreground h-4 w-4" />
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-wrap justify-between gap-2">
                                <div className="space-y-1">
                                    <p className="text-muted-foreground text-xs">Total de Espaços</p>
                                    <p className="text-xl font-bold md:text-2xl">{espacos.length}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-muted-foreground text-xs">Disponíveis</p>
                                    <p className="text-xl font-bold text-green-500 md:text-2xl">{espacos.length - 2} </p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-muted-foreground text-xs">Indisponíveis</p>
                                    <p className="text-xl font-bold text-red-500 md:text-2xl">{2}</p>
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter className="flex flex-wrap justify-between gap-2">
                            <Button variant="outline" size="sm" onClick={() => router.get(route('institucional.espacos.index'))}>
                                Gerenciar Espaços
                            </Button>

                            <Button size="sm" onClick={() => router.get(route('institucional.espacos.create'))}>
                                Adicionar Espaço
                            </Button>
                        </CardFooter>
                    </Card>

                    <Card className="col-span-1 sm:col-span-2 lg:col-span-2">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Relatórios / Visões Gerais</CardTitle>
                            <PieChart className="text-muted-foreground h-4 w-4" />
                        </CardHeader>
                        <CardContent>
                            <Tabs defaultValue="overview">
                                <TabsList className="mb-4 flex flex-wrap">
                                    <TabsTrigger value="overview">Visão Geral</TabsTrigger>
                                    <TabsTrigger value="spaces">Por Espaço</TabsTrigger>
                                </TabsList>
                                <TabsContent value="overview" className="space-y-4">
                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                                        <div className="space-y-1">
                                            <p className="text-muted-foreground text-xs">Total de Reservas</p>
                                            <p className="text-xl font-bold md:text-2xl">{reservas.length}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-muted-foreground text-xs">Este Mês</p>
                                            <p className="text-xl font-bold md:text-2xl">{reservaEsseMes.length}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-muted-foreground text-xs">Pendentes</p>
                                            <p className="text-xl font-bold md:text-2xl">{reservasPendenteAnalise.length}</p>
                                        </div>
                                    </div>
                                    <div className="bg-muted/50 h-[200px] rounded-md border p-4">
                                        <div className="bg-muted/50 flex h-full w-full items-center justify-center rounded-md">
                                            Gráfico de Reservas por Período
                                        </div>
                                    </div>
                                </TabsContent>
                                <TabsContent value="spaces">
                                    <div className="bg-muted/50 h-[250px] rounded-md border p-4">
                                        <div className="bg-muted/50 flex h-full w-full items-center justify-center rounded-md">
                                            Gráfico de Reservas por Espaço
                                        </div>
                                    </div>
                                </TabsContent>
                            </Tabs>
                        </CardContent>
                        <CardFooter>
                            <Button variant="outline" size="sm" className="w-full">
                                <FileText className="mr-2 h-4 w-4" /> Exportar Relatórios
                            </Button>
                        </CardFooter>
                    </Card>

                    <Card className="col-span-1 sm:col-span-2 lg:col-span-2">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Filtros Avançados e Consultas</CardTitle>
                            <Search className="text-muted-foreground h-4 w-4" />
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <label className="text-xs font-medium">Período</label>
                                    <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
                                        <Input type="date" className="w-full" placeholder="Data inicial" />
                                        <Input type="date" className="w-full" placeholder="Data final" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-medium">Filtros</label>
                                    <div className="flex space-x-2">
                                        <Input className="w-full" placeholder="Espaço ou Setor" />
                                        <Button variant="secondary" size="icon">
                                            <Search className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-muted/50 rounded-md border p-4">
                                <div className="bg-muted/50 flex h-[150px] w-full items-center justify-center rounded-md">Resultados da Consulta</div>
                            </div>
                        </CardContent>
                        <CardFooter className="flex flex-wrap justify-between gap-2">
                            <Button variant="outline" size="sm">
                                Limpar Filtros
                            </Button>
                            <Button size="sm">
                                <FileText className="mr-2 h-4 w-4" /> Exportar Dados
                            </Button>
                        </CardFooter>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
