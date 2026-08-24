import GenericHeader from '@/presentation/molecules/GenericHeader';
import PaginacaoListas from '@/presentation/molecules/PaginacaoListas';
import EspacoCard from '@/presentation/organisms/EspacoCard';
import EspacoFiltroBusca from '@/presentation/organisms/EspacoFiltroBusca';
import AppLayout from '@/presentation/templates/AppLayout';
import { Andar, Espaco, Modulo, Unidade, User } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
const breadcrumbs = [
    {
        title: 'Consultar Espaços',
        href: '/espacos',
    },
];

export default function EspacosPage() {
    const {
        andares,
        modulos,
        unidades,
        user,
        espacos: { data: espacos, links },
        filters,
        capacidadeEspacos,
    } = usePage<{
        espacos: {
            data: Espaco[];
            links: { url: string | null; label: string; active: boolean }[];
            meta: object;
        };
        unidades: Unidade[];
        modulos: Modulo[];
        andares: Andar[];
        filters: {
            search?: string;
            unidade?: string;
            modulo?: string;
            andar?: string;
            capacidade?: string;
        };
        user: User;
        capacidadeEspacos: number[];
    }>().props;
    const handleSolicitarReserva = (espacoId: string) => {
        router.get(`/espacos/${espacoId}`);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Espacos" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <GenericHeader titulo="Consultar espaços" descricao="Veja os espaços disponíveis e solicite sua reserva" />

                <EspacoFiltroBusca
                    route={route('espacos.index')}
                    unidades={unidades}
                    modulos={modulos}
                    andares={andares}
                    filters={filters}
                    capacidadeEspacos={capacidadeEspacos}
                />
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
                    {espacos.map((espaco) => (
                        <EspacoCard key={espaco.id} espaco={espaco} user={user} handleSolicitarReserva={handleSolicitarReserva} />
                    ))}
                </div>

                <PaginacaoListas links={links} />
            </div>
        </AppLayout>
    );
}
