import GenericHeader from '@/components/generic-header';
import AppLayout from '@/layouts/app-layout';
import { useDebounce } from '@/lib/utils';
import { Paginator, Reserva, User, type BreadcrumbItem } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import { Suspense, useEffect, useRef, useState } from 'react';
import { ReservasEmpty } from '../fragments/ReservasEmpty';
import { ReservasFilters } from '../fragments/ReservasFilters';
import { ReservasList } from '../fragments/ReservasList';
import { ReservasLoading } from '../fragments/reservasLoading';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Gerenciar Reservas',
        href: '/gestor/reservas',
    },
];

export default function MinhasReservas({ reservas: paginator, filters, user, reservaToShow }: {
    user: User;
    reservas: Paginator<Reserva>;
    filters: { search?: string; situacao?: string };
    reservaToShow?: Reserva;
}) {
    // 2. O estado dos filtros agora "mora" aqui, no componente pai
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [selectedSituacao, setSelectedSituacao] = useState(filters.situacao || '');
    const [data, setData] = useState<Date | undefined>(undefined);
    // 3. Debounce para o campo de busca
    const [debouncedSearch] = useDebounce(searchTerm, 500);
    // 4. useEffect para buscar os dados quando os filtros mudam
    const isInitialMount = useRef(true);

    useEffect(() => {
        if (isInitialMount.current) {
            isInitialMount.current = false;
            return;
        }
        const params = {
            search: debouncedSearch || undefined,
            situacao: selectedSituacao || undefined,
        };

        router.get(route('gestor.reservas.index'), params, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    }, [debouncedSearch, selectedSituacao]);

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
                            selectedDate={data}
                            onDateChange={setData}
                            isGestor={true}
                        />
                        <Suspense fallback={<ReservasLoading />}>
                            <ReservasList
                                fallback={<ReservasEmpty />}
                                paginator={paginator}
                                isGestor={true}
                                user={user}
                                reservaToShow={reservaToShow}
                            />
                        </Suspense>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
