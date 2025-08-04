import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription,  CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { Agenda, Espaco, Reserva, User, type BreadcrumbItem } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import {  Calendar, CheckCircle, Clock,    Users } from 'lucide-react';
import { SituacaoBadge } from '../Reservas/fragments/ReservasList';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Painel Inicial',
        href: '/dashboard',
    },
];



export default function Dashboard() {
    const { user, reservasPendentes, statusDasReservas, agendas } = usePage<{
        user: User; espacos: Espaco[]; reservasPendentes: Reserva[], statusDasReservas: {
            pendentes: number
            avaliadas_hoje: number
            total_espacos: number
        }, agendas: Agenda[]
    }>().props;
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
                            <TabsTrigger value="pendentes">Reservas Pendentes</TabsTrigger>
                            <TabsTrigger value="espacos">Meus Espaços</TabsTrigger>
                        </TabsList>

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
                            <Card>
                                <CardHeader>
                                    <CardTitle>Espaços Sob Sua Gestão</CardTitle>
                                    <CardDescription>Espaços que você gerencia por turno</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                        {agendas.map((agenda) => (
                                            <Card key={agenda.id}>
                                                <CardContent className="p-4">
                                                    <div className="space-y-2">
                                                        <h4 className="font-medium">{agenda.espaco?.nome}</h4>
                                                        <p className="text-sm text-muted-foreground">
                                                            {agenda.espaco?.andar?.nome} - {agenda.espaco?.andar?.modulo?.nome}
                                                        </p>
                                                        <Badge variant="secondary">{getTurnoLabel(agenda.turno)}</Badge>
                                                    </div>
                                                    <Button size="sm" className="w-full mt-3 bg-transparent" variant="outline" onClick={() => {
                                                        router.get(route('espacos.show', agenda.espaco?.id))
                                                    }}>
                                                        <Calendar className="mr-2 h-4 w-4" />
                                                        Ver Agenda
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
            </div>
        </AppLayout>
    )
}