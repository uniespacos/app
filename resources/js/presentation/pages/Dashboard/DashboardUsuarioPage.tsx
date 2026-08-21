import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/presentation/templates/app-layout';
import { DashboardStatusReservasType, User, type BreadcrumbItem } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import { Calendar, CalendarSearch, CheckCircle2, Clock, ListChecks, Star, XCircle } from 'lucide-react';
const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Painel Inicial',
        href: '/dashboard',
    },
];

export default function Dashboard() {
    const { user, statusDasReservas } = usePage<{
        user: User;
        statusDasReservas: DashboardStatusReservasType;
    }>().props;

    // Cada card decide seu próprio filtro em Minhas Reservas — antes eram só
    // números sem nenhuma ação, o card mais clicado do painel não levava a
    // lugar nenhum.
    const statCards = [
        {
            label: 'Em Análise',
            valor: statusDasReservas.em_analise,
            descricao: 'Aguardando aprovação',
            Icone: Clock,
            situacao: 'em_analise',
        },
        {
            label: 'Aprovadas',
            valor: statusDasReservas.deferida,
            descricao: 'Reservas confirmadas',
            Icone: CheckCircle2,
            situacao: 'deferida',
        },
        {
            label: 'Parciais',
            valor: statusDasReservas.parcialmente_deferida,
            descricao: 'Parcialmente aprovadas',
            Icone: Calendar,
            situacao: 'parcialmente_deferida',
        },
        {
            label: 'Rejeitadas',
            valor: statusDasReservas.indeferida,
            descricao: 'Não aprovadas',
            Icone: XCircle,
            situacao: 'indeferida',
        },
    ] as const;

    // Consultar Espaços é a própria ação de "Nova Reserva" — não faz sentido
    // ter os dois: um botão de destaque no topo e um card idêntico aqui
    // embaixo. O botão saiu, o card do atalho assume o papel de CTA principal.
    const atalhos = [
        { label: 'Consultar Espaços', descricao: 'Veja a disponibilidade e reserve', Icone: CalendarSearch, href: route('espacos.index') },
        { label: 'Minhas Reservas', descricao: 'Acompanhe todas as suas reservas', Icone: ListChecks, href: route('reservas.index') },
        { label: 'Espaços Favoritos', descricao: 'Acesso rápido aos que você marcou', Icone: Star, href: route('espacos.favoritos') },
    ] as const;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div>
                    <h1 className="text-2xl font-bold sm:text-3xl">Olá, {user.name}!</h1>
                    <p className="text-muted-foreground">
                        {user.setor ? `${user.setor.nome} (${user.setor.sigla})` : 'Bem-vindo ao UniEspaços!'}
                    </p>
                </div>

                <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                    {statCards.map(({ label, valor, descricao, Icone, situacao }) => (
                        <Card
                            key={label}
                            role="button"
                            tabIndex={0}
                            onClick={() => router.get(route('reservas.index', { situacao }))}
                            onKeyDown={(e) => e.key === 'Enter' && router.get(route('reservas.index', { situacao }))}
                            className="hover:border-primary/40 cursor-pointer transition-colors hover:shadow-sm"
                        >
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">{label}</CardTitle>
                                <Icone className="text-muted-foreground h-4 w-4" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{valor}</div>
                                <p className="text-muted-foreground text-xs">{descricao}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    {atalhos.map(({ label, descricao, Icone, href }) => (
                        <Card
                            key={label}
                            role="button"
                            tabIndex={0}
                            onClick={() => router.get(href)}
                            onKeyDown={(e) => e.key === 'Enter' && router.get(href)}
                            className="hover:border-primary/40 cursor-pointer transition-colors hover:shadow-sm"
                        >
                            <CardContent className="flex items-center gap-3 p-4">
                                <div className="bg-primary/10 text-primary rounded-full p-2">
                                    <Icone className="h-5 w-5" />
                                </div>
                                <div className="min-w-0">
                                    <p className="truncate font-medium">{label}</p>
                                    <p className="text-muted-foreground truncate text-xs">{descricao}</p>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </AppLayout>
    );
}
