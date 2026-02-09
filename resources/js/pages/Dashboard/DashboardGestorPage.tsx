import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { Agenda, Espaco, Reserva, User, type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import {  CheckCircle, Clock, Users } from 'lucide-react';
import { SituacaoBadge } from '../Reservas/fragments/ReservasList';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useEffect, useState } from 'react';
import TabsItemEspacosFavoritos from '@/components/tabs-item-espacos-favoritos';
import TabsItemReserva from '@/components/tabs-item-reserva';
import TabsItemEspacosGerenciados from '@/components/tabs-item-espacos-gerenciados';
const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Painel Inicial',
        href: '/dashboard',
    },
];



export default function Dashboard({ user, reservasPendentes, statusDasReservas, agendas, espacosFavoritos, reservas }: {
    user: User; espacos: Espaco[]; reservasPendentes: Reserva[], statusDasReservas: {
        pendentes: number
        avaliadas_hoje: number
        total_espacos: number
    }, agendas: Agenda[]
    , espacosFavoritos: Espaco[], reservas: Reserva[]
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
    const getUniqueEspacosFromAgendas = (agendas: Agenda[]): Espaco[] => {
        // 1. Cria um Map para armazenar os espaços.
        // A chave será o ID do espaço (number) e o valor será o objeto Espaco.
        const espacosMap = new Map<number, Espaco>();

        // 2. Itera sobre cada agenda da lista.
        for (const agenda of agendas) {
            // Verifica se a agenda realmente tem um espaço associado.
            if (agenda.espaco && agenda.espaco.id) {
                // 3. Adiciona o espaço ao Map usando seu ID como chave.
                // Se um espaço com o mesmo ID já existir no Map,
                // o `set` simplesmente substituirá o valor, resultando
                // na desduplicação automática e eficiente.
                espacosMap.set(agenda.espaco.id, agenda.espaco);
            }
        }

        // 4. Converte os valores do Map (que são os objetos Espaco únicos) em um array.
        return Array.from(espacosMap.values());
    }
    const espacosUnicos = getUniqueEspacosFromAgendas(agendas);


    return (
        <AppLayout breadcrumbs={breadcrumbs}> <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="space-y-6">
                    {/* Header */}
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div>
                            <h1 className="text-3xl font-bold">Painel do Gestor</h1>
                            <p className="text-muted-foreground">Olá, {user.name} - Gerencie as reservas dos seus espaços</p>
                        </div>

                    </div>

                    {/* Stats Cards */}
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
                                <Clock className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{statusDasReservas.pendentes}</div>
                                <p className="text-xs text-muted-foreground">Aguardando sua análise</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Avaliadas Hoje</CardTitle>
                                <CheckCircle className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{statusDasReservas.avaliadas_hoje}</div>
                                <p className="text-xs text-muted-foreground">Reservas Avaliadas hoje</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Espaços Gerenciados</CardTitle>
                                <Users className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{statusDasReservas.total_espacos}</div>
                                <p className="text-xs text-muted-foreground">Sob sua responsabilidade</p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Main Content */}
                    <Tabs defaultValue="pendentes" className="space-y-4">
                        <TabsList>
                            <TabsTrigger value="pendentes">Reservas Pendente Analise</TabsTrigger>
                            <TabsTrigger value="espacos">Espaços que gerencio</TabsTrigger>
                            <TabsTrigger value="reservas" >  Ultimas 5 reservas solicitadas </TabsTrigger>
                            <TabsTrigger value="favoritos" >Espaços Favoritos </TabsTrigger>
                        </TabsList>

                        <TabsContent value="reservas" className="space-y-4">
                            <TabsItemReserva reservas={reservas} />
                        </TabsContent>

                        <TabsContent value="favoritos" className="space-y-4">
                            <TabsItemEspacosFavoritos espacosFiltrados={filteredEspacosFavoritos} user={user} searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
                        </TabsContent>
                        <TabsContent value="pendentes" className="space-y-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Reservas Aguardando Análise</CardTitle>
                                    <CardDescription>Avalie as solicitações de reserva dos seus espaços</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {reservasPendentes.map((reserva) => (
                                            <div key={reserva.id} className="border rounded-lg p-4">
                                                <div className="flex items-start justify-between mb-4">
                                                    <div className="space-y-1">
                                                        <h4 className="font-medium">{reserva.titulo}</h4>
                                                        <p className="text-sm text-muted-foreground">{reserva.descricao}</p>
                                                        <p className="text-xs text-muted-foreground">
                                                            Solicitante: {reserva.user?.name} ({reserva.user?.setor?.nome})
                                                        </p>
                                                    </div>
                                                    <div className="flex-col ">
                                                        <SituacaoBadge situacao={reserva.situacao} />
                                                        <Button
                                                            size="sm"
                                                            onClick={() => router.get(route('gestor.reservas.show', reserva.id))}
                                                            className="bg-blue-600 hover:bg-blue-700 mt-5"
                                                        >
                                                            <CheckCircle className="mr-1 h-4 w-4" />
                                                            Avaliar
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="espacos" className="space-y-4">
                            <TabsItemEspacosGerenciados espacos={espacosUnicos} user={user} />
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </AppLayout>
    )
}