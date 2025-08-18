import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { DashboardStatusReservasType, Espaco, Reserva, User, type BreadcrumbItem } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import { Calendar, CheckCircle, Clock, Heart, MapPin, Plus, Search, Star } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { useEffect, useState } from 'react';
import { SituacaoBadge } from '../Reservas/fragments/ReservasList';
import EspacoCard from '../Espacos/fragments/EspacoCard';
const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Painel Inicial',
        href: '/dashboard',
    },
];

export default function Dashboard() {
    const { user, statusDasReservas, espacosFavoritos, reservas } = usePage<{
        user: User;
        statusDasReservas: DashboardStatusReservasType;
        espacosFavoritos: Espaco[];
        reservas: Reserva[];
    }>().props;
    const [searchTerm, setSearchTerm] = useState<string>("")

    const [filteredEspacosFavoritos, setFilteredEspacosFavoritos] = useState<Espaco[]>(espacosFavoritos);
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
    }, [searchTerm, espacosFavoritos]);


    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Olá, {user.name}!</h1>
                        <p className="text-muted-foreground">
                            {user.setor ? `${user.setor.nome} (${user.setor.sigla})` : "Bem-vindo ao UESB Reservas!"}
                        </p>
                    </div>
                    <Button className="w-fit">
                        <Plus className="mr-2 h-4 w-4" />
                        Nova Reserva
                    </Button>
                </div>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Em Análise</CardTitle>
                            <Clock className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{statusDasReservas.em_analise}</div>
                            <p className="text-xs text-muted-foreground">Aguardando aprovação</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Aprovadas</CardTitle>
                            <Star className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{statusDasReservas.deferida}</div>
                            <p className="text-xs text-muted-foreground">Reservas confirmadas</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Parciais</CardTitle>
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{statusDasReservas.parcialmente_deferida}</div>
                            <p className="text-xs text-muted-foreground">Parcialmente aprovadas</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Rejeitadas</CardTitle>
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{statusDasReservas.indeferida}</div>
                            <p className="text-xs text-muted-foreground">Não aprovadas</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Content */}
                <Tabs defaultValue="reservas" className="space-y-4">
                    <TabsList>
                        <TabsTrigger value="reservas">Ultimas 5 reservas solicitadas</TabsTrigger>
                        <TabsTrigger value="favoritos">Espaços Favoritos</TabsTrigger>
                    </TabsList>

                    <TabsContent value="reservas" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Reservas Recentes</CardTitle>
                                <CardDescription>Suas últimas solicitações de reserva</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {reservas.map((reserva) => {
                                        const espaco = reserva.horarios[0]?.agenda?.espaco;
                                        return (
                                            <div key={reserva.id} className="flex items-center justify-between p-4 border rounded-lg">
                                                <div className="space-y-1">
                                                    <h4 className="font-medium">{reserva.titulo}</h4>
                                                    <p className="text-sm text-muted-foreground">
                                                        {espaco?.nome} - {espaco?.andar?.nome}, {espaco?.andar?.modulo?.nome}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {new Date(reserva.data_inicial).toLocaleDateString("pt-BR")}
                                                    </p>
                                                </div>
                                                <div className="flex-col ">
                                                    <SituacaoBadge situacao={reserva.situacao} />
                                                    <Button
                                                        size="sm"
                                                        onClick={() => router.get(route('reservas.index', { reserva: reserva.id }))}
                                                        className="bg-blue-600 hover:bg-blue-700 mt-5"
                                                    >
                                                        <CheckCircle className="mr-1 h-4 w-4" />
                                                        Ver detalhes
                                                    </Button>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="favoritos" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Espaços Favoritos</CardTitle>
                                <CardDescription>Seus espaços marcados como favoritos</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="mb-4">
                                    <div className="relative">
                                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            placeholder="Buscar espaços favoritos..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="pl-8"
                                        />
                                    </div>
                                </div>
                                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                    {filteredEspacosFavoritos.map((espaco) => (
                                        <EspacoCard espaco={espaco} userType={user.permission_type_id} />
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </AppLayout >
    )
}
