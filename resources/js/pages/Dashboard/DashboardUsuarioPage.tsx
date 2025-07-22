import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { formatDate } from '@/lib/utils';
import { DashboardStatusReservasType, Espaco, Reserva, User, type BreadcrumbItem } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import { CalendarClock, Clock, History, Plus } from 'lucide-react';
import { SituacaoBadge } from '../Reservas/fragments/ReservasList';
const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Painel Inicial',
        href: '/dashboard',
    },
];

export default function Dashboard() {
    const { props } = usePage<{
        user: User;
        statusDasReservas: DashboardStatusReservasType;
        proximaReserva: Reserva;
        espacoDaProximaReserva: Espaco;
        reservas: Reserva[];
    }>();
    const { statusDasReservas, proximaReserva, espacoDaProximaReserva, reservas } = props;
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Home" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {proximaReserva != null ? (
                        <Card className="col-span-1 sm:col-span-1">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Próxima Reserva</CardTitle>
                                <CalendarClock className="text-muted-foreground h-4 w-4" />
                            </CardHeader>
                            <CardContent>
                                <div className="truncate text-xl font-bold md:text-2xl">{espacoDaProximaReserva.nome}</div>
                                <p className="text-muted-foreground text-xs">
                                    {formatDate(proximaReserva.data_inicial)} • {proximaReserva.horarios[0].horario_inicio} às
                                    {formatDate(proximaReserva.data_final)}
                                </p>
                            </CardContent>
                            <CardFooter>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="w-full"
                                    onClick={() => router.get(route('reservas.index', { reserva: proximaReserva.id }))}
                                >
                                    Ver detalhes
                                </Button>
                            </CardFooter>
                        </Card>
                    ) : (
                        <Card className="col-span-1 sm:col-span-1">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Sem reservas proximas</CardTitle>
                                <CalendarClock className="text-muted-foreground h-4 w-4" />
                            </CardHeader>
                            <CardContent></CardContent>
                            <CardFooter></CardFooter>
                        </Card>
                    )}

                    <Card className="col-span-1 sm:col-span-1">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Status das Minhas Reservas</CardTitle>
                            <Clock className="text-muted-foreground h-4 w-4" />
                        </CardHeader>
                        <CardContent>
                            <div className="flex justify-between">
                                <div className="text-center">
                                    <div className="text-xl font-bold md:text-2xl">{statusDasReservas.em_analise}</div>
                                    <p className="text-muted-foreground text-xs">Aguardando</p>
                                </div>
                                <div className="text-center">
                                    <div className="text-xl font-bold md:text-2xl">{statusDasReservas.parcialmente_deferida}</div>
                                    <p className="text-muted-foreground text-xs">Parcialmente deferida</p>
                                </div>
                                <div className="text-center">
                                    <div className="text-xl font-bold md:text-2xl">{statusDasReservas.deferida}</div>
                                    <p className="text-muted-foreground text-xs">deferida</p>
                                </div>
                                <div className="text-center">
                                    <div className="text-xl font-bold md:text-2xl">{statusDasReservas.indeferida}</div>
                                    <p className="text-muted-foreground text-xs">indeferida</p>
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button variant="outline" size="sm" className="w-full">
                                Ver todas
                            </Button>
                        </CardFooter>
                    </Card>

                    <Card className="col-span-1 sm:col-span-2 lg:col-span-1">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Solicitar Nova Reserva</CardTitle>
                            <Plus className="text-muted-foreground h-4 w-4" />
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground text-sm">
                                Crie uma nova solicitação de reserva para salas, laboratórios ou auditórios.
                            </p>
                        </CardContent>
                        <CardFooter>
                            <Button className="w-full">Nova Reserva</Button>
                        </CardFooter>
                    </Card>

                    <Card className="col-span-1 sm:col-span-2 lg:col-span-3">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Histórico de Reservas</CardTitle>
                            <History className="text-muted-foreground h-4 w-4" />
                        </CardHeader>
                        <CardContent className="overflow-auto">
                            <div className="w-full overflow-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Espaço</TableHead>
                                            <TableHead className="hidden sm:table-cell">Data</TableHead>
                                            <TableHead className="hidden md:table-cell">Horário</TableHead>
                                            <TableHead>Status</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {reservas.map((reserva) => (
                                            <TableRow key={reserva.id}>
                                                <TableCell className="font-medium">{reserva.horarios[0].agenda?.espaco?.nome}</TableCell>
                                                <TableCell className="hidden sm:table-cell">{formatDate(reserva.data_inicial)}</TableCell>
                                                <TableCell className="hidden md:table-cell">{reserva.horarios[0].horario_inicio}</TableCell>
                                                <TableCell>
                                                    <SituacaoBadge situacao={reserva.situacao} />
                                                </TableCell>
                                                <TableCell>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="w-full"
                                                        onClick={() => router.get(route('reservas.index', { reserva: reserva.id }))}
                                                    >
                                                        Ver detalhes
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button variant="outline" size="sm" className="w-full">
                                Ver histórico completo
                            </Button>
                        </CardFooter>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
