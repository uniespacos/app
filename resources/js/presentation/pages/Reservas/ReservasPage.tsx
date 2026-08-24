import GenericHeader from '@/presentation/molecules/generic-header';
import { ReservasEmpty } from '@/presentation/molecules/ReservasEmpty';
import { ReservasFilters } from '@/presentation/molecules/ReservasFilters';
import { ReservasLoading } from '@/presentation/molecules/ReservasLoading';
import { ReservasList } from '@/presentation/organisms/ReservasList';
import AppLayout from '@/presentation/templates/app-layout';
import { Paginator, Reserva, User, type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { PlusCircle } from 'lucide-react';
import { Suspense } from 'react';

import { useReservasListUseCase } from '@/application/reservas/use-cases/use-reservas-list-usecase';
import { InertiaReservasRepository } from '@/infrastructure/reservas/inertia-reservas-repository';
import { InertiaHttpGateway } from '@/infrastructure/shared/inertia-http-gateway';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Minhas Reservas',
        href: '/reservas',
    },
];

declare function route(name: string, params?: unknown): string;

const httpGateway = new InertiaHttpGateway();
const reservasRepository = new InertiaReservasRepository(httpGateway);

export default function MinhasReservas({
    filters,
    reservas: paginator,
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
    } = useReservasListUseCase({
        repository: reservasRepository,
        initialFilters: filters,
        initialSemana: semana,
    });

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Minhas Reservas" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <GenericHeader
                    titulo="Minhas Reservas"
                    descricao="Gerencie suas solicitações de reservas de espaços acadêmicos"
                    canSeeButton={true}
                    buttonText="Nova Reserva"
                    buttonLink={route('espacos.index')}
                    ButtonIcon={PlusCircle}
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
                        fallback={<ReservasEmpty />}
                        paginator={paginator}
                        isGestor={false}
                        reservaToShow={reservaToShow}
                        routeName={'reservas.index'}
                    />
                </Suspense>
            </div>
        </AppLayout>
    );
}
