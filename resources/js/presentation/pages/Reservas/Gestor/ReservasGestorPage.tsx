import GenericHeader from '@/presentation/molecules/generic-header';
import { ReservasEmpty } from '@/presentation/molecules/ReservasEmpty';
import { ReservasFilters } from '@/presentation/molecules/ReservasFilters';
import { ReservasLoading } from '@/presentation/molecules/ReservasLoading';
import { ReservasList } from '@/presentation/organisms/ReservasList';
import AppLayout from '@/presentation/templates/app-layout';
import { Paginator, Reserva, User, type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { ShieldCheck } from 'lucide-react';
import { Suspense } from 'react';

import { useReservasGestorUseCase } from '@/application/reservas/use-cases/use-reservas-gestor-usecase';
import { InertiaReservasRepository } from '@/infrastructure/reservas/inertia-reservas-repository';
import { InertiaHttpGateway } from '@/infrastructure/shared/inertia-http-gateway';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Gerenciar Reservas',
        href: '/gestor/reservas',
    },
];

const httpGateway = new InertiaHttpGateway();
const reservasRepository = new InertiaReservasRepository(httpGateway);

export default function MinhasReservas({
    reservas: paginator,
    filters,
    user,
    reservaToShow,
    semana,
}: {
    user: User;
    reservas: Paginator<Reserva>;
    filters: { search?: string; situacao?: string; arquivo?: string; ordenar?: string };
    reservaToShow?: Reserva;
    semana: { referencia: string };
}) {
    const {
        searchTerm,
        setSearchTerm,
        selectedSituacao,
        setSelectedSituacao,
        selectedArquivo,
        setSelectedArquivo,
        selectedOrdenar,
        setSelectedOrdenar,
        selectedDate,
        setSelectedDate,
    } = useReservasGestorUseCase({
        repository: reservasRepository,
        initialFilters: filters,
        initialSemana: semana,
    });

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Home" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <GenericHeader
                    titulo="Gerenciar reservas"
                    descricao="Avalie as solicitações de reserva dos espaços que voce gere"
                    badge="Modo gestor"
                    BadgeIcon={ShieldCheck}
                />
                <ReservasFilters
                    searchTerm={searchTerm}
                    onSearchTermChange={setSearchTerm}
                    selectedSituacao={selectedSituacao}
                    onSituacaoChange={setSelectedSituacao}
                    selectedArquivo={selectedArquivo}
                    onArquivoChange={setSelectedArquivo}
                    selectedOrdenar={selectedOrdenar}
                    onOrdenarChange={setSelectedOrdenar}
                    selectedDate={selectedDate}
                    onDateChange={setSelectedDate}
                />
                <Suspense fallback={<ReservasLoading />}>
                    <ReservasList
                        fallback={<ReservasEmpty isGestor />}
                        paginator={paginator}
                        isGestor={true}
                        user={user}
                        reservaToShow={reservaToShow}
                        routeName="gestor.reservas.index"
                    />
                </Suspense>
            </div>
        </AppLayout>
    );
}
