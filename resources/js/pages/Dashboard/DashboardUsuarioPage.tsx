import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { DashboardStatusReservasType, Espaco, Reserva, User, type BreadcrumbItem } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import { Calendar, Clock, Heart, MapPin, Plus, Search, Star } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
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
    const getStatusColor = (status: string) => {
        switch (status) {
            case "deferida":
                return "bg-green-100 text-green-800"
            case "indeferida":
                return "bg-red-100 text-red-800"
            case "em_analise":
                return "bg-yellow-100 text-yellow-800"
            case "parcialmente_deferida":
                return "bg-blue-100 text-blue-800"
            default:
                return "bg-gray-100 text-gray-800"
        }
    }

    const getStatusLabel = (status: string) => {
        switch (status) {
            case "deferida":
                return "Aprovada"
            case "indeferida":
                return "Rejeitada"
            case "em_analise":
                return "Em Análise"
            case "parcialmente_deferida":
                return "Parcialmente Aprovada"
            default:
                return status
        }
    }

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
                        <TabsTrigger value="reservas">Minhas Reservas</TabsTrigger>
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
                                                <Badge className={getStatusColor(reserva.situacao)}>{getStatusLabel(reserva.situacao)}</Badge>
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
                                    {espacosFavoritos.map((espaco) => (
                                        <Card key={espaco.id} className="cursor-pointer hover:shadow-md transition-shadow">
                                            <CardContent className="p-4">
                                                <div className="flex items-start justify-between mb-2">
                                                    <h4 className="font-medium">{espaco.nome}</h4>
                                                    <Heart className="h-4 w-4 text-red-500 fill-current" />
                                                </div>
                                                <p className="text-sm text-muted-foreground mb-2">
                                                    Capacidade: {espaco.capacidade_pessoas} pessoas
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {espaco.andar?.nome} - {espaco.andar?.modulo?.nome}
                                                </p>
                                                <Button size="sm" className="w-full mt-3">
                                                    Reservar
                                                </Button>
                                            </CardContent>
                                        </Card>
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