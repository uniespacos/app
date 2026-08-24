import { useIsMobile } from '@/hooks/use-mobile';
import { useReservasFilters } from '@/hooks/use-reservas-filters';
import GenericHeader from '@/presentation/molecules/GenericHeader';
import { ReservasEmpty } from '@/presentation/molecules/ReservasEmpty';
import { ReservasFilters } from '@/presentation/molecules/ReservasFilters';
import { ReservasLoading } from '@/presentation/molecules/ReservasLoading';
import { ViewMode } from '@/presentation/molecules/ViewModeToggle';
import { ReservasList } from '@/presentation/organisms/ReservasList';
import AppLayout from '@/presentation/templates/AppLayout';
import { Paginator, Reserva, User, type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { PlusCircle } from 'lucide-react';
import { Suspense, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Minhas Reservas',
        href: '/reservas',
    },
];

declare function route(name: string, params?: unknown): string;

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
    const isMobile = useIsMobile();
    const [viewMode, setViewMode] = useState<ViewMode>(isMobile ? 'grid' : 'table');

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
    } = useReservasFilters({
        routeName: 'reservas.index',
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
                    viewMode={viewMode}
                    onViewModeChange={setViewMode}
                />
                <Suspense fallback={<ReservasLoading />}>
                    <ReservasList
                        fallback={<ReservasEmpty />}
                        paginator={paginator}
                        isGestor={false}
                        reservaToShow={reservaToShow}
                        routeName={'reservas.index'}
                        viewMode={viewMode}
                    />
                </Suspense>
            </div>
        </AppLayout>
    );
}
