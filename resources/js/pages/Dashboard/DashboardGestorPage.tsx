import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { Espaco, Reserva, User, type BreadcrumbItem } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import { Bell, Clock, History, Home, Plus } from 'lucide-react';
import { SituacaoBadge } from '../Reservas/fragments/ReservasList';
const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Painel Inicial',
        href: '/dashboard',
    },
];

// Dados de exemplo
const pendingRequests = 8;

const scheduledUnavailability = [
    {
        id: '1',
        spaceName: 'Laboratório de Informática 3',
        startDate: '20/05/2023',
        endDate: '25/05/2023',
        reason: 'Manutenção de Equipamentos',
    },
    {
        id: '2',
        spaceName: 'Sala de Videoconferência',
        startDate: '15/05/2023',
        endDate: '16/05/2023',
        reason: 'Atualização de Software',
    },
];

export default function Dashboard() {
    const { espacos, reservas } = usePage<{ user: User; espacos: Espaco[]; reservas: Reserva[] }>().props;
    // const { user } = props;
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Home" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <Card className="col-span-1">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Solicitações Pendentes</CardTitle>
                            <Bell className="text-muted-foreground h-4 w-4" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-xl font-bold md:text-2xl">{pendingRequests} solicitações</div>
                            <p className="text-muted-foreground text-xs">Aguardando sua análise</p>
                        </CardContent>
                        <CardFooter>
                            <Button className="w-full">Ver Solicitações</Button>
                        </CardFooter>
                    </Card>

                    <Card className="col-span-1 sm:col-span-1 lg:col-span-2">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Espaços que Gerencio</CardTitle>
                            <Home className="text-muted-foreground h-4 w-4" />
                        </CardHeader>
                        <CardContent>
                            <div className="flex-col space-y-2">
                                {espacos.map((espaco, index) =>
                                    index < 4 ? (
                                        <div key={espaco.id} className="flex items-center justify-between gap-2 rounded-lg border p-2">
                                            <div className="mr-2 truncate font-medium">{espaco.nome}</div>
                                            <Badge className={'bg-yellow-500 hover:bg-yellow-600'}>
                                                {espaco.agendas?.filter((a) => a.horarios?.filter((h) => h.pivot?.situacao === 'em_analise'))
                                                    .length || 0}{' '}
                                                Em analise
                                            </Badge>
                                            <Badge className={'bg-green-500 hover:bg-green-600'}>
                                                {espaco.agendas?.filter((a) => a.horarios?.filter((h) => h.pivot?.situacao === 'deferida')).length ||
                                                    0}{' '}
                                                Deferidas
                                            </Badge>
                                            <Badge className={'bg-red-500 hover:bg-red-600'}>
                                                {espaco.agendas?.filter((a) => a.horarios?.filter((h) => h.pivot?.situacao === 'indeferida'))
                                                    .length || 0}{' '}
                                                indeferidas
                                            </Badge>
                                        </div>
                                    ) : null,
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="col-span-1">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Indisponibilidades Agendadas</CardTitle>
                            <Clock className="text-muted-foreground h-4 w-4" />
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                {scheduledUnavailability.map((unavailability) => (
                                    <div key={unavailability.id} className="rounded-lg border p-2">
                                        <div className="truncate font-medium">{unavailability.spaceName}</div>
                                        <div className="text-muted-foreground text-xs">
                                            {unavailability.startDate} até {unavailability.endDate}
                                        </div>
                                        <div className="text-xs">{unavailability.reason}</div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                        <CardFooter className="flex justify-between">
                            <Button variant="outline" size="sm">
                                Ver Todas
                            </Button>
                            <Button size="sm">
                                <Plus className="mr-1 h-4 w-4" /> Nova
                            </Button>
                        </CardFooter>
                    </Card>

                    <Card className="col-span-1 sm:col-span-2 lg:col-span-4">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Histórico de Decisões</CardTitle>
                            <History className="text-muted-foreground h-4 w-4" />
                        </CardHeader>
                        <CardContent className="overflow-auto">
                            <div className="w-full overflow-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Espaço</TableHead>
                                            <TableHead className="hidden sm:table-cell">Solicitante</TableHead>
                                            <TableHead className="hidden md:table-cell">Data</TableHead>
                                            <TableHead className="hidden lg:table-cell">Horário</TableHead>
                                            <TableHead>Decisão</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {reservas.map((reserva, index) =>
                                            index < 6 ? (
                                                <TableRow key={reserva.id}>
                                                    <TableCell className="font-medium">
                                                        {reserva.horarios.find((h) => h.agenda?.espaco != undefined)?.agenda?.espaco?.nome}
                                                    </TableCell>
                                                    <TableCell className="hidden sm:table-cell"> {reserva.user?.name}</TableCell>
                                                    <TableCell className="hidden md:table-cell">
                                                        {new Date(reserva.data_inicial).toISOString()}
                                                    </TableCell>
                                                    <TableCell className="hidden lg:table-cell">
                                                        {reserva.horarios.find((h) => h.horario_inicio != undefined)?.horario_inicio}
                                                    </TableCell>
                                                    <TableCell>
                                                        <SituacaoBadge situacao={reserva.situacao} />
                                                    </TableCell>
                                                    <TableCell>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            className="w-full"
                                                            onClick={() => router.get(route('gestor.reservas.index', { reserva: reserva.id }))}
                                                        >
                                                            Ver detalhes
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ) : null,
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button variant="outline" size="sm" className="w-full" onClick={() => router.get(route('gestor.reservas.index'))}>
                                Ver histórico completo
                            </Button>
                        </CardFooter>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
