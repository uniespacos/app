import GenericHeader from '@/components/generic-header';
import AppLayout from '@/layouts/app-layout';
import { Paginator, Reserva, User, type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { Suspense } from 'react';
import { ReservasEmpty } from '../fragments/ReservasEmpty';
import { ReservasFilters } from '../fragments/ReservasFilters';
import { ReservasList } from '../fragments/ReservasList';
import { ReservasLoading } from '../fragments/reservasLoading';

import { InertiaHttpGateway } from '@/infrastructure/shared/inertia-http-gateway';
import { InertiaReservasRepository } from '@/infrastructure/reservas/inertia-reservas-repository';
import { useReservasGestorUseCase } from '@/application/reservas/use-cases/use-reservas-gestor-usecase';

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
    filters: { search?: string; situacao?: string };
    reservaToShow?: Reserva;
    semana: { referencia: string };
}) {
    const {
        searchTerm,
        setSearchTerm,
        selectedSituacao,
        setSelectedSituacao,
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
                <div className="container mx-auto space-y-6 py-6">
                    <div className="container mx-auto space-y-6 p-6">
                        <GenericHeader titulo="Gerenciar reservas" descricao="Avalie as solicitações de reserva dos espaços que voce gere" />
                        <ReservasFilters
                            searchTerm={searchTerm}
                            onSearchTermChange={setSearchTerm}
                            selectedSituacao={selectedSituacao}
                            onSituacaoChange={setSelectedSituacao}
                            selectedDate={selectedDate}
                            onDateChange={setSelectedDate}
                            isGestor={true}
                        />
                        <Suspense fallback={<ReservasLoading />}>
                            <ReservasList
                                fallback={<ReservasEmpty />}
                                paginator={paginator}
                                isGestor={true}
                                user={user}
                                reservaToShow={reservaToShow}
                                routeName="gestor.reservas.index"
                            />
                        </Suspense>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
