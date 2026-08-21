import GenericHeader from '@/presentation/molecules/generic-header';
import AppLayout from '@/presentation/templates/app-layout';
import { Paginator, Reserva, User, type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { PlusCircle } from 'lucide-react';
import { Suspense } from 'react';
import { ReservasEmpty } from '@/presentation/molecules/ReservasEmpty';
import { ReservasFilters } from '@/presentation/molecules/ReservasFilters';
import { ReservasList } from '@/presentation/organisms/ReservasList';
import { ReservasLoading } from '@/presentation/molecules/ReservasLoading';

import { InertiaHttpGateway } from '@/infrastructure/shared/inertia-http-gateway';
import { InertiaReservasRepository } from '@/infrastructure/reservas/inertia-reservas-repository';
import { useReservasListUseCase } from '@/application/reservas/use-cases/use-reservas-list-usecase';

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
    filters: { search?: string; situacao?: string; arquivo?: string };
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
            <div className="flex">
                {/* `w-[100vh]` aqui usava a ALTURA da viewport como largura: num
                    celular de 390px o container ficava com 844px e a página
                    inteira rolava lateralmente. */}
                <div className="container mx-auto w-full flex-1 space-y-6 py-6">
                    <div className="space-y-6 p-6">
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
                </div>
            </div>
        </AppLayout>
    );
}
