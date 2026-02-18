import GenericHeader from '@/components/generic-header';
import AppLayout from '@/layouts/app-layout';
import { useDebounce } from '@/lib/utils';
import { Paginator, Reserva, User, type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { format } from 'date-fns';
import { PlusCircle } from 'lucide-react';
import { Suspense, useEffect, useRef, useState } from 'react';
import { ReservasEmpty } from './fragments/ReservasEmpty';
import { ReservasFilters } from './fragments/ReservasFilters';
import { ReservasList } from './fragments/ReservasList';
import { ReservasLoading } from './fragments/reservasLoading';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Minhas Reservas',
        href: '/reservas',
    },
];

export default function MinhasReservas({
    reservas: paginator,
    filters,
    reservaToShow,
    semana,
}: {
    user: User;
    reservas: Paginator<Reserva>;
    filters: { search?: string; situacao?: string };
    reservaToShow?: Reserva;
    semana: { referencia: string };
}) {
    // 2. O estado dos filtros agora "mora" aqui, no componente pai
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [selectedSituacao, setSelectedSituacao] = useState(filters.situacao || '');
    const [data, setData] = useState<Date | undefined>(new Date(semana.referencia + 'T12:00:00'));
    const isInitialMount = useRef(true);
    // 3. Debounce para o campo de busca
    const [debouncedSearch] = useDebounce(searchTerm, 500);

    // 4. useEffect para buscar os dados quando os filtros mudam
    useEffect(() => {
        // 3. Verifique se é a montagem inicial. Se for, pule a execução.
        if (isInitialMount.current) {
            isInitialMount.current = false;
            return;
        }
        const params: { search?: string; situacao?: string; semana?: string } = {
            // <-- Tipagem dos params
            search: debouncedSearch || undefined,
            situacao: selectedSituacao || undefined,
            // Adiciona o parâmetro 'semana' à requisição!
            semana: data ? format(data, 'yyyy-MM-dd') : undefined,
        };

        router.get(route('reservas.index'), params, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    }, [data, debouncedSearch, selectedSituacao]);
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Minhas Reservas" />
            <div className="flex">
                <div className="container mx-auto w-[100vh] flex-1 space-y-6 py-6">
                    <div className="space-y-6 p-6">
                        <GenericHeader
                            titulo="Minhas Reservas"
                            descricao="Gerencie suas solicitações de reservas de espaços acadêmicos"
                            canSeeButton={true}
                            buttonText="Nova Reserva"
                            buttonLink={route('espacos.index')}
                            ButtonIcon={PlusCircle} // Você pode definir um ícone aqui se necessário
                        />
                        <ReservasFilters
                            searchTerm={searchTerm}
                            onSearchTermChange={setSearchTerm}
                            selectedSituacao={selectedSituacao}
                            onSituacaoChange={setSelectedSituacao}
                            selectedDate={data}
                            onDateChange={setData}
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
