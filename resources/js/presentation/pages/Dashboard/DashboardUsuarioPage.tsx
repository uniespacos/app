import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import AppLayout from '@/presentation/templates/app-layout';
import { User, type BreadcrumbItem } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import { ArrowRight, CalendarSearch, ListChecks, Star } from 'lucide-react';
const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Painel Inicial',
        href: '/dashboard',
    },
];

export default function Dashboard() {
    const { user } = usePage<{ user: User }>().props;

    const atalhosSecundarios = [
        { label: 'Minhas Reservas', descricao: 'Acompanhe todas as suas reservas', Icone: ListChecks, href: route('reservas.index') },
        { label: 'Espaços Favoritos', descricao: 'Acesso rápido aos que você marcou', Icone: Star, href: route('espacos.favoritos') },
    ] as const;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Olá, {user.name}!</h1>
                    <p className="text-muted-foreground">{user.setor ? `${user.setor.nome} (${user.setor.sigla})` : 'Bem-vindo ao UniEspaços!'}</p>
                </div>

                <Card
                    role="button"
                    tabIndex={0}
                    onClick={() => {
                        router.get(route('espacos.index'));
                    }}
                    onKeyDown={(e) => e.key === 'Enter' && router.get(route('espacos.index'))}
                    className="bg-primary text-primary-foreground cursor-pointer border-none transition-opacity hover:opacity-90"
                >
                    <CardContent className="flex flex-col items-start justify-between gap-4 p-6 sm:flex-row sm:items-center">
                        <div className="flex items-center gap-4">
                            <div className="bg-primary-foreground/15 rounded-full p-3">
                                <CalendarSearch className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-lg font-semibold">Reservar um espaço</p>
                                <p className="text-primary-foreground/80 text-sm">Veja a disponibilidade dos espaços e faça sua solicitação</p>
                            </div>
                        </div>
                        <Button variant="secondary" className="w-full shrink-0 sm:w-auto">
                            Consultar espaços
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    </CardContent>
                </Card>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {atalhosSecundarios.map(({ label, descricao, Icone, href }) => (
                        <Card
                            key={label}
                            role="button"
                            tabIndex={0}
                            onClick={() => {
                                router.get(href);
                            }}
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
