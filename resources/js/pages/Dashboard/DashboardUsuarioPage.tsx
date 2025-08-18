import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { DashboardStatusReservasType, Espaco, Reserva, User, type BreadcrumbItem } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import { Calendar, Clock, MapPin, Plus, Star } from 'lucide-react';
import TabsContentDashboard, { TabsItens } from '@/components/tabs-contents-dashboard';
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
    const itens: TabsItens[] = [{
        tabHeader: {
            value: 'reservas',
            textDescription: ' Ultimas 5 reservas solicitadas',
        },
        tabContent: {
            title: 'Minhas Reservas',
            description: 'Gerencie suas reservas aqui.',
        }
    },
    {
        tabHeader: {
            value: 'favoritos',
            textDescription: 'Espaços Favoritos',
        },
        tabContent: {
            title: 'Espaços Favoritos',
            description: 'Veja seus espaços favoritos.',
        }
    }]

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
                    <Button className="w-fit" onClick={() => router.get(route('espacos.index'))}>
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

                <TabsContentDashboard reservas={reservas} espacosFavoritos={espacosFavoritos} user={user} itens={itens} />
            </div>
        </AppLayout >
    )
}
